import { ARTIST_ALBUM_RELEASE_PRODUCT_KEY } from "@/lib/artist-billing";
import { createArtistReleaseCheckoutHandler } from "@/lib/artist-release-checkout";
import { stripePriceEnv } from "@/lib/stripe";

export const runtime = "nodejs";

export const GET = createArtistReleaseCheckoutHandler({
  checkoutPath: "/api/checkout/album-release",
  productKey: ARTIST_ALBUM_RELEASE_PRODUCT_KEY,
  priceEnv: stripePriceEnv.albumRelease,
  label: "Album Release",
});
