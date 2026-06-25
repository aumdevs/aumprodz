import { NextResponse } from "next/server";

import { createAuditLog } from "@/lib/audit";
import {
  type ArtistPaymentProductKey,
  ensureArtistAccountForCheckout,
} from "@/lib/artist-billing";
import { getAppBaseUrl, getEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";

type ArtistReleaseCheckoutConfig = {
  checkoutPath: string;
  productKey: ArtistPaymentProductKey;
  priceEnv: string;
  label: string;
};

export function createArtistReleaseCheckoutHandler({
  checkoutPath,
  productKey,
  priceEnv,
  label,
}: ArtistReleaseCheckoutConfig) {
  return async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const releaseId = requestUrl.searchParams.get("releaseId")?.trim() || null;
    const forceCheckout = requestUrl.searchParams.get("force") === "1";
    const requestedNextPath = normalizeArtistNextPath(
      requestUrl.searchParams.get("next"),
    );
    const nextPath = releaseId
      ? `${checkoutPath}?releaseId=${encodeURIComponent(releaseId)}`
      : requestedNextPath
        ? `${checkoutPath}?next=${encodeURIComponent(requestedNextPath)}`
        : checkoutPath;
    const supabase = await createServerSupabaseClient();
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("reason", "auth");
    loginUrl.searchParams.set("next", nextPath);

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

    if (releaseId) {
      const { data: release } = await supabase
        .from("releases")
        .select("id,status,user_id")
        .eq("id", releaseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!release) {
        const releasesUrl = new URL("/artist/releases", request.url);
        releasesUrl.searchParams.set("status", "not_found");
        return NextResponse.redirect(releasesUrl);
      }

      if (
        release.status !== "draft" &&
        release.status !== "needs_changes" &&
        release.status !== "submitted"
      ) {
        const releaseUrl = new URL(`/artist/releases/${releaseId}`, request.url);
        releaseUrl.searchParams.set("status", "locked");
        return NextResponse.redirect(releaseUrl);
      }
    }

    const { data: linkedPayment } = releaseId
      ? await supabase
          .from("artist_payments")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_key", productKey)
          .eq("status", "paid")
          .eq("release_id", releaseId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle()
      : { data: null };

    if (linkedPayment && releaseId) {
      const releaseUrl = new URL(`/artist/releases/${releaseId}`, request.url);
      releaseUrl.searchParams.set("checkout", `${productKey}_already_paid`);
      return NextResponse.redirect(releaseUrl);
    }

    const { data: availablePayment } = await supabase
      .from("artist_payments")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_key", productKey)
      .eq("status", "paid")
      .is("release_id", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (availablePayment && !forceCheckout) {
      const returnUrl = releaseId
        ? new URL(`/artist/releases/${releaseId}`, request.url)
        : new URL(requestedNextPath ?? "/artist/billing", request.url);
      returnUrl.searchParams.set("checkout", `${productKey}_credit_available`);
      return NextResponse.redirect(returnUrl);
    }

    const stripe = getStripeClient();
    const priceId = getEnv(priceEnv);

    if (!stripe || !priceId) {
      return NextResponse.json(
        {
          error: "Stripe checkout is not configured",
          required: ["STRIPE_SECRET_KEY", priceEnv],
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
        entityType: "artist_payments",
        outcome: "failure",
        metadata: {
          product: productKey,
          reason: account.reason,
        },
      });

      const artistUrl = new URL("/artist", request.url);
      artistUrl.searchParams.set("checkout", "not_artist_account");
      return NextResponse.redirect(artistUrl);
    }

    const appBaseUrl = getAppBaseUrl();
    const metadata = {
      product: productKey,
      user_id: user.id,
      ...(releaseId ? { release_id: releaseId } : {}),
    };
    const successPath = releaseId
      ? `/artist/releases/${releaseId}`
      : requestedNextPath ?? "/artist/billing";
    const cancelPath = releaseId
      ? `/artist/releases/${releaseId}`
      : requestedNextPath ?? "/artist/billing";
    const successUrl = releaseId
      ? `${appBaseUrl}${successPath}?checkout=${productKey}_success&autoSubmit=1&session_id={CHECKOUT_SESSION_ID}`
      : `${appBaseUrl}${successPath}?checkout=${productKey}_success&session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata,
      payment_intent_data: {
        metadata,
      },
      success_url: successUrl,
      cancel_url: `${appBaseUrl}${cancelPath}?checkout=${productKey}_cancelled`,
      allow_promotion_codes: true,
    });

    await createAuditLog({
      actorId: user.id,
      action: "stripe.checkout_session.create",
      entityType: "artist_payments",
      entityId: session.id,
      outcome: session.url ? "success" : "failure",
      after: {
        amountTotal: session.amount_total,
        currency: session.currency,
        mode: session.mode,
        paymentStatus: session.payment_status,
        status: session.status,
      },
      metadata: {
        label,
        product: productKey,
        priceEnv,
        releaseId,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a Checkout URL" },
        { status: 502 },
      );
    }

    return NextResponse.redirect(session.url, { status: 303 });
  };
}

function normalizeArtistNextPath(value?: string | null) {
  if (!value?.startsWith("/artist")) {
    return null;
  }

  if (value.startsWith("//") || value.includes("://")) {
    return null;
  }

  return value;
}
