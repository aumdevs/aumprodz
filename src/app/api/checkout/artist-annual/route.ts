import { NextResponse } from "next/server";

import { createAuditLog } from "@/lib/audit";
import {
  ARTIST_ANNUAL_PRODUCT_KEY,
  ensureArtistAccountForCheckout,
  isUsableArtistAnnualSubscription,
  pickBestArtistAnnualSubscription,
} from "@/lib/artist-billing";
import { getAppBaseUrl, getEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripeClient, stripePriceEnv } from "@/lib/stripe";

export const runtime = "nodejs";

const checkoutPath = "/api/checkout/artist-annual";

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("reason", "auth");
  loginUrl.searchParams.set("next", checkoutPath);

  if (!supabase) {
    loginUrl.searchParams.set("reason", "configuration");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(loginUrl);
  }

  const { data: subscriptions } = await supabase
    .from("artist_subscriptions")
    .select("status,current_period_start,current_period_end,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const currentSubscription = pickBestArtistAnnualSubscription(subscriptions);

  if (isUsableArtistAnnualSubscription(currentSubscription)) {
    const artistUrl = new URL("/artist", request.url);
    artistUrl.searchParams.set("checkout", "already_active");
    return NextResponse.redirect(artistUrl);
  }

  const stripe = getStripeClient();
  const priceId = getEnv(stripePriceEnv.artistAnnual);

  if (!stripe || !priceId) {
    return NextResponse.json(
      {
        error: "Stripe checkout is not configured",
        required: ["STRIPE_SECRET_KEY", stripePriceEnv.artistAnnual],
      },
      { status: 503 },
    );
  }

  const account = await ensureArtistAccountForCheckout({
    userId: user.id,
    email: user.email ?? null,
    fullName:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null,
  });

  if (!account.ok) {
    await createAuditLog({
      actorId: user.id,
      action: "stripe.checkout_session.create",
      entityType: "artist_subscriptions",
      outcome: "failure",
      metadata: {
        product: ARTIST_ANNUAL_PRODUCT_KEY,
        reason: account.reason,
      },
    });

    const artistUrl = new URL("/artista", request.url);
    artistUrl.searchParams.set("checkout", "not_artist_account");
    return NextResponse.redirect(artistUrl);
  }

  const appBaseUrl = getAppBaseUrl();
  const metadata = {
    product: ARTIST_ANNUAL_PRODUCT_KEY,
    user_id: user.id,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata,
    subscription_data: {
      metadata,
    },
    success_url: `${appBaseUrl}/artist?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appBaseUrl}/artista?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  await createAuditLog({
    actorId: user.id,
    action: "stripe.checkout_session.create",
    entityType: "artist_subscriptions",
    entityId: session.id,
    outcome: session.url ? "success" : "failure",
    after: {
      mode: session.mode,
      paymentStatus: session.payment_status,
      status: session.status,
    },
    metadata: {
      product: ARTIST_ANNUAL_PRODUCT_KEY,
      priceEnv: stripePriceEnv.artistAnnual,
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a Checkout URL" },
      { status: 502 },
    );
  }

  return NextResponse.redirect(session.url, { status: 303 });
}
