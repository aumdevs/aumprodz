import { ARTIST_EP_RELEASE_PRODUCT_KEY } from "@/lib/artist-billing";
import { createArtistReleaseCheckoutHandler } from "@/lib/artist-release-checkout";
import { stripePriceEnv } from "@/lib/stripe";

export const runtime = "nodejs";

export const GET = createArtistReleaseCheckoutHandler({
  checkoutPath: "/api/checkout/ep-release",
  productKey: ARTIST_EP_RELEASE_PRODUCT_KEY,
  priceEnv: stripePriceEnv.epRelease,
  label: "EP Release",
});
