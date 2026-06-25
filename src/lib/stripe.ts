import Stripe from "stripe";

import { getEnv } from "@/lib/env";

export function getStripeClient() {
  const secretKey = getEnv("STRIPE_SECRET_KEY");

  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

export function getStripeWebhookSecret() {
  return getEnv("STRIPE_WEBHOOK_SECRET");
}

export const stripePriceEnv = {
  artistAnnual: "STRIPE_PRICE_ARTIST_ANNUAL",
  epRelease: "STRIPE_PRICE_EP_RELEASE",
  albumRelease: "STRIPE_PRICE_ALBUM_RELEASE",
} as const;
