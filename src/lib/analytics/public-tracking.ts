import type { NextRequest } from "next/server";

import type { Service } from "@/lib/content/services";

const MAX_SHORT_TEXT = 180;
const MAX_LONG_TEXT = 600;

export type PublicEventName =
  | "page_view"
  | "service_detail_view"
  | "artist_pricing_view"
  | "artist_checkout_click";

export const publicEventNames: PublicEventName[] = [
  "page_view",
  "service_detail_view",
  "artist_pricing_view",
  "artist_checkout_click",
];

export function cleanParam(value: string | null | undefined, max = MAX_SHORT_TEXT) {
  if (!value) {
    return null;
  }

  const cleaned = value.trim();

  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, max);
}

export function getApproxCountry(request: NextRequest) {
  return (
    cleanParam(request.headers.get("x-country"), 12) ??
    cleanParam(request.headers.get("x-nf-country"), 12) ??
    cleanParam(request.headers.get("cf-ipcountry"), 12)
  );
}

export function getRequestContext(request: NextRequest) {
  return {
    country: getApproxCountry(request),
    user_agent: cleanParam(request.headers.get("user-agent"), MAX_LONG_TEXT),
    referer: cleanParam(request.headers.get("referer"), MAX_LONG_TEXT),
  };
}

export function buildTrackingFields({
  request,
  service,
  searchParams,
}: {
  request: NextRequest;
  service?: Service | null;
  searchParams: URLSearchParams;
}) {
  return {
    ...getRequestContext(request),
    service_slug: service?.slug ?? null,
    service_category: service?.category ?? null,
    source: cleanParam(searchParams.get("source")),
    placement: cleanParam(
      searchParams.get("placement") ?? searchParams.get("button"),
    ),
    utm_source: cleanParam(searchParams.get("utm_source")),
    utm_medium: cleanParam(searchParams.get("utm_medium")),
    utm_campaign: cleanParam(searchParams.get("utm_campaign")),
  };
}

export function isPublicEventName(value: string): value is PublicEventName {
  return publicEventNames.includes(value as PublicEventName);
}
