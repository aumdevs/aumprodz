import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  ARTIST_ANNUAL_PRODUCT_KEY,
  findArtistPaymentByStripePayment,
  findUserIdByStripePayment,
  findUserIdByStripeSubscription,
  getStripeObjectId,
  getStripeSubscriptionPeriod,
  isArtistPaymentProductKey,
  mapCheckoutPaymentStatus,
  syncArtistPaymentFromStripe,
  syncArtistSubscriptionFromStripe,
} from "@/lib/artist-billing";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { logWebhookEvent } from "@/lib/webhook-logs";

export const runtime = "nodejs";

type StripeProcessingResult = {
  status: "received" | "processed" | "failed";
  errorMessage?: string | null;
};

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

  const subscriptionId = getStripeObjectId(session.subscription);
  const subscription = subscriptionId
    ? await stripe.subscriptions.retrieve(subscriptionId)
    : null;
  const customerId =
    getStripeObjectId(session.customer) ??
    getStripeObjectId(subscription?.customer);
  const userId =
    session.metadata?.user_id ??
    subscription?.metadata?.user_id ??
    session.client_reference_id ??
    (await findUserIdByStripeSubscription({ customerId, subscriptionId }));

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
  const userId =
    subscription.metadata?.user_id ??
    (await findUserIdByStripeSubscription({ customerId, subscriptionId }));

  if (!userId) {
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
