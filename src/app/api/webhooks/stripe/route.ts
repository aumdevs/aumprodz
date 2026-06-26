import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { createAuditLog } from "@/lib/audit";
import {
  ARTIST_ANNUAL_PRODUCT_KEY,
  ensureArtistAccountForCheckout,
  findArtistPaymentByStripePayment,
  findUserIdByStripePayment,
  findUserIdByStripeSubscription,
  getStripeObjectId,
  getStripeSubscriptionPeriod,
  isActiveStripeSubscriptionStatus,
  isArtistPaymentProductKey,
  mapCheckoutPaymentStatus,
  syncArtistPaymentFromStripe,
  syncArtistSubscriptionFromStripe,
} from "@/lib/artist-billing";
import { getAppBaseUrl } from "@/lib/env";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { logWebhookEvent } from "@/lib/webhook-logs";

export const runtime = "nodejs";

type StripeProcessingResult = {
  status: "received" | "processed" | "failed";
  errorMessage?: string | null;
};

const publicArtistSignupFlow = "artist_public_signup";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 },
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid Stripe webhook signature",
      },
      { status: 400 },
    );
  }

  await logWebhookEvent({
    provider: "stripe",
    providerEventId: event.id,
    eventType: event.type,
    payload: event,
    status: "received",
  });

  try {
    const result = await processStripeEvent(event, stripe);

    await logWebhookEvent({
      provider: "stripe",
      providerEventId: event.id,
      eventType: event.type,
      payload: event,
      status: result.status,
      errorMessage: result.errorMessage,
    });
  } catch (error) {
    await logWebhookEvent({
      provider: "stripe",
      providerEventId: event.id,
      eventType: event.type,
      payload: event,
      status: "failed",
      errorMessage:
        error instanceof Error ? error.message : "Stripe webhook failed",
    });

    return NextResponse.json(
      { error: "Stripe webhook processing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

async function processStripeEvent(
  event: Stripe.Event,
  stripe: Stripe,
): Promise<StripeProcessingResult> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      return handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
        stripe,
        event.type,
      );
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return handleSubscriptionEvent(event.data.object as Stripe.Subscription);
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
    case "payment_intent.succeeded":
      return handlePaymentIntentEvent(
        event.data.object as Stripe.PaymentIntent,
        "paid",
      );
    case "payment_intent.payment_failed":
      return handlePaymentIntentEvent(
        event.data.object as Stripe.PaymentIntent,
        "failed",
      );
    case "charge.refunded":
      return handleChargeRefunded(event.data.object as Stripe.Charge);
    default:
      return { status: "received" };
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  eventType: string,
): Promise<StripeProcessingResult> {
  if (session.mode === "payment") {
    return handlePaymentCheckoutSession(session);
  }

  if (session.mode !== "subscription") {
    return { status: "received" };
  }

  const sessionProduct = session.metadata?.product;

  if (sessionProduct && sessionProduct !== ARTIST_ANNUAL_PRODUCT_KEY) {
    return { status: "received" };
  }

  const isPublicPaidSignup = isPublicArtistSignupMetadata(session.metadata);
  const paymentConfirmed =
    eventType === "checkout.session.async_payment_succeeded" ||
    (eventType === "checkout.session.completed" &&
      session.payment_status === "paid");

  if (isPublicPaidSignup && !paymentConfirmed) {
    return { status: "received" };
  }

  const subscriptionId = getStripeObjectId(session.subscription);
  const subscription = subscriptionId
    ? await stripe.subscriptions.retrieve(subscriptionId)
    : null;
  const customerId =
    getStripeObjectId(session.customer) ??
    getStripeObjectId(subscription?.customer);
  let userId =
    session.metadata?.user_id ??
    subscription?.metadata?.user_id ??
    (await findUserIdByStripeSubscription({ customerId, subscriptionId })) ??
    null;

  if (!userId && isPublicPaidSignup) {
    userId = await ensurePaidPublicArtistSignupAccount({
      metadata: session.metadata,
      checkoutSessionId: session.id,
      customerId,
      subscriptionId,
    });
  }

  if (!userId && !isPublicPaidSignup) {
    userId = session.client_reference_id ?? null;
  }

  if (!userId) {
    return {
      status: "failed",
      errorMessage: "Stripe checkout session is missing user mapping",
    };
  }

  const { currentPeriodStart, currentPeriodEnd } =
    getStripeSubscriptionPeriod(subscription);
  const syncResult = await syncArtistSubscriptionFromStripe({
    userId,
    email: session.customer_details?.email ?? session.customer_email ?? null,
    customerId,
    subscriptionId,
    status:
      subscription?.status ??
      (session.payment_status === "paid" ? "active" : "pending_payment"),
    currentPeriodStart,
    currentPeriodEnd,
  });

  if (!syncResult.synced) {
    throw new Error(syncResult.reason);
  }

  return { status: "processed" };
}

async function handlePaymentCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<StripeProcessingResult> {
  const productKey = session.metadata?.product;

  if (!isArtistPaymentProductKey(productKey)) {
    return { status: "received" };
  }

  const paymentIntentId = getStripeObjectId(session.payment_intent);
  const userId =
    session.metadata?.user_id ??
    session.client_reference_id ??
    (await findUserIdByStripePayment({
      checkoutSessionId: session.id,
      paymentIntentId,
    }));

  if (!userId) {
    return {
      status: "failed",
      errorMessage: "Stripe payment session is missing user mapping",
    };
  }

  const syncResult = await syncArtistPaymentFromStripe({
    userId,
    productKey,
    releaseId: session.metadata?.release_id ?? null,
    customerId: getStripeObjectId(session.customer),
    checkoutSessionId: session.id,
    paymentIntentId,
    amountTotal: session.amount_total,
    currency: session.currency,
    status:
      session.status === "expired"
        ? "canceled"
        : mapCheckoutPaymentStatus(session.payment_status),
    paymentStatus: session.payment_status,
  });

  if (!syncResult.synced) {
    throw new Error(syncResult.reason);
  }

  return { status: "processed" };
}

async function handleSubscriptionEvent(
  subscription: Stripe.Subscription,
): Promise<StripeProcessingResult> {
  const subscriptionId = subscription.id;
  const customerId = getStripeObjectId(subscription.customer);
  const isPublicPaidSignup = isPublicArtistSignupMetadata(subscription.metadata);
  let userId =
    subscription.metadata?.user_id ??
    (await findUserIdByStripeSubscription({ customerId, subscriptionId }));

  if (
    !userId &&
    isPublicPaidSignup &&
    isActiveStripeSubscriptionStatus(subscription.status)
  ) {
    userId = await ensurePaidPublicArtistSignupAccount({
      metadata: subscription.metadata,
      customerId,
      subscriptionId,
    });
  }

  if (!userId) {
    if (!subscription.metadata?.product || isPublicPaidSignup) {
      return { status: "received" };
    }

    return {
      status: "failed",
      errorMessage: "Stripe subscription is missing user mapping",
    };
  }

  const { currentPeriodStart, currentPeriodEnd } =
    getStripeSubscriptionPeriod(subscription);
  const syncResult = await syncArtistSubscriptionFromStripe({
    userId,
    customerId,
    subscriptionId,
    status: subscription.status,
    currentPeriodStart,
    currentPeriodEnd,
  });

  if (!syncResult.synced) {
    throw new Error(syncResult.reason);
  }

  return { status: "processed" };
}

function isPublicArtistSignupMetadata(metadata?: Stripe.Metadata | null) {
  return (
    metadata?.product === ARTIST_ANNUAL_PRODUCT_KEY &&
    metadata.signup_flow === publicArtistSignupFlow &&
    Boolean(metadata.signup_email)
  );
}

async function ensurePaidPublicArtistSignupAccount({
  metadata,
  checkoutSessionId,
  customerId,
  subscriptionId,
}: {
  metadata?: Stripe.Metadata | null;
  checkoutSessionId?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
}) {
  const email = metadata?.signup_email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Stripe paid signup is missing a valid email");
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase service role is not configured");
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("id,user_type")
    .eq("email", email)
    .maybeSingle();

  if (existingProfileError) {
    throw new Error(`Could not verify paid signup email: ${existingProfileError.message}`);
  }

  if (existingProfile?.id) {
    if (existingProfile.user_type !== "artist") {
      throw new Error("Paid signup email belongs to a non-artist account");
    }

    return existingProfile.id as string;
  }

  const legalName = getMetadataText(metadata, "legal_name") ?? email;
  const artistName = getMetadataText(metadata, "artist_name") ?? legalName;
  const phone = getMetadataText(metadata, "phone");
  const country = getMetadataText(metadata, "country");
  const genre = getMetadataText(metadata, "genre");
  const bio = getMetadataText(metadata, "bio");
  const temporaryPassword = createTemporaryPassword();

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: legalName,
        artist_name: artistName,
        user_type: "artist",
        phone,
        country,
        password_setup_required: true,
      },
    });

  let userId = created.user?.id ?? null;

  if (createError || !userId) {
    const existingUser = await findAuthUserByEmail(supabase, email);

    if (!existingUser?.id) {
      throw new Error(createError?.message ?? "Paid signup account could not be created");
    }

    userId = existingUser.id;
  }

  const account = await ensureArtistAccountForCheckout({
    userId,
    email,
    fullName: legalName,
  });

  if (!account.ok) {
    throw new Error(`Paid signup account could not be prepared: ${account.reason}`);
  }

  const profilePayload = {
    id: userId,
    email,
    full_name: legalName,
    user_type: "artist",
    status: "active",
  };
  const artistProfilePayload = {
    user_id: userId,
    legal_name: legalName,
    artist_name: artistName,
    country,
    phone,
    bio,
    genre,
    status: "active_pending_verification",
  };

  const [{ error: profileError }, { error: artistProfileError }] =
    await Promise.all([
      supabase.from("profiles").upsert(profilePayload, { onConflict: "id" }),
      supabase.from("artist_profiles").upsert(artistProfilePayload, {
        onConflict: "user_id",
      }),
    ]);

  if (profileError || artistProfileError) {
    throw new Error(
      profileError?.message ??
        artistProfileError?.message ??
        "Paid signup profile could not be saved",
    );
  }

  const passwordEmailSent = await sendPasswordSetupEmail(supabase, email);

  await createAuditLog({
    actorId: userId,
    action: "artist_signup.paid_account_create",
    entityType: "artist_profiles",
    entityId: userId,
    outcome: "success",
    after: artistProfilePayload,
    metadata: {
      source: "stripe_webhook",
      checkoutSessionId,
      customerId,
      subscriptionId,
      passwordEmailSent,
    },
  });

  return userId;
}

function getMetadataText(metadata: Stripe.Metadata | null | undefined, key: string) {
  const value = metadata?.[key]?.trim();
  return value ? value : null;
}

function createTemporaryPassword() {
  return `${crypto.randomUUID()}-${crypto.randomUUID()}Aa1!`;
}

async function findAuthUserByEmail(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  email: string,
) {
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      return null;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (match) {
      return match;
    }

    if (data.users.length < 1000) {
      break;
    }
  }

  return null;
}

async function sendPasswordSetupEmail(
  supabase: NonNullable<ReturnType<typeof createServiceSupabaseClient>>,
  email: string,
) {
  const redirectTo = `${getAppBaseUrl()}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error("Paid artist signup password setup email failed", {
      email,
      redirectTo,
      status: error.status ?? null,
      code: error.code ?? null,
      message: error.message ?? null,
    });

    return false;
  }

  return true;
}

async function handlePaymentIntentEvent(
  paymentIntent: Stripe.PaymentIntent,
  status: "paid" | "failed",
): Promise<StripeProcessingResult> {
  const productKey = paymentIntent.metadata?.product;

  if (!isArtistPaymentProductKey(productKey)) {
    return { status: "processed" };
  }

  const paymentIntentId = paymentIntent.id;
  const userId =
    paymentIntent.metadata?.user_id ??
    (await findUserIdByStripePayment({ paymentIntentId }));

  if (!userId) {
    return {
      status: "failed",
      errorMessage: "Stripe payment intent is missing user mapping",
    };
  }

  const syncResult = await syncArtistPaymentFromStripe({
    userId,
    productKey,
    releaseId: paymentIntent.metadata?.release_id ?? null,
    customerId: getStripeObjectId(paymentIntent.customer),
    paymentIntentId,
    amountTotal: paymentIntent.amount_received || paymentIntent.amount,
    currency: paymentIntent.currency,
    status,
    paymentStatus: paymentIntent.status,
  });

  if (!syncResult.synced) {
    throw new Error(syncResult.reason);
  }

  return { status: "processed" };
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
): Promise<StripeProcessingResult> {
  const paymentIntentId = getStripeObjectId(charge.payment_intent);

  if (!paymentIntentId) {
    return { status: "processed" };
  }

  const productKey = charge.metadata?.product;
  const storedPayment = await findArtistPaymentByStripePayment({
    paymentIntentId,
  });

  if (!isArtistPaymentProductKey(productKey) && !storedPayment) {
    return { status: "processed" };
  }

  const userId =
    charge.metadata?.user_id ??
    storedPayment?.userId ??
    (await findUserIdByStripePayment({ paymentIntentId }));
  const resolvedProductKey = isArtistPaymentProductKey(productKey)
    ? productKey
    : storedPayment?.productKey;

  if (!userId || !resolvedProductKey) {
    return {
      status: "failed",
      errorMessage: "Stripe refund charge is missing user mapping",
    };
  }

  const syncResult = await syncArtistPaymentFromStripe({
    userId,
    productKey: resolvedProductKey,
    releaseId: storedPayment?.releaseId ?? null,
    customerId: getStripeObjectId(charge.customer),
    paymentIntentId,
    amountTotal: charge.amount_refunded,
    currency: charge.currency,
    status: "refunded",
    paymentStatus: "refunded",
  });

  if (!syncResult.synced) {
    throw new Error(syncResult.reason);
  }

  return { status: "processed" };
}
