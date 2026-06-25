import { NextRequest, NextResponse } from "next/server";

import {
  buildTrackingFields,
  cleanParam,
  isPublicEventName,
} from "@/lib/analytics/public-tracking";
import { getPublicServiceBySlug } from "@/lib/content/services";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type PublicEventPayload = {
  eventName?: string;
  page?: string;
  service?: string | null;
  source?: string | null;
  placement?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  metadata?: Record<string, unknown> | null;
};

function toSearchParams(payload: PublicEventPayload) {
  const params = new URLSearchParams();

  for (const key of [
    "source",
    "placement",
    "utm_source",
    "utm_medium",
    "utm_campaign",
  ] as const) {
    const value = payload[key];

    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  return params;
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as
    | PublicEventPayload
    | null;

  if (!payload?.eventName || !isPublicEventName(payload.eventName)) {
    return NextResponse.json(
      {
        error: "invalid_event",
        message: "El evento público solicitado no es válido.",
      },
      { status: 400 },
    );
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "x-aum-tracking": "skipped",
      },
    });
  }

  const service = await getPublicServiceBySlug(payload.service);
  const { error } = await supabase.from("visitor_events").insert({
    ...buildTrackingFields({
      request,
      service,
      searchParams: toSearchParams(payload),
    }),
    event_name: payload.eventName,
    page_path: cleanParam(payload.page, 220),
    metadata:
      payload.metadata && typeof payload.metadata === "object"
        ? payload.metadata
        : null,
  });

  if (error) {
    return NextResponse.json(
      {
        error: "tracking_failed",
        message: "No se pudo registrar el evento público.",
      },
      { status: 503 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
