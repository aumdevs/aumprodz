import { NextRequest, NextResponse } from "next/server";

import {
  buildTrackingFields,
  cleanParam,
} from "@/lib/analytics/public-tracking";
import { getPublicServiceBySlug } from "@/lib/content/services";
import { getWhatsAppNumber } from "@/lib/env";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function normalizeWhatsAppNumber(value: string | undefined) {
  const normalized = value?.replace(/\D/g, "");

  return normalized && normalized.length >= 8 ? normalized : null;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const service = await getPublicServiceBySlug(url.searchParams.get("service"));

  if (!service) {
    return NextResponse.json(
      {
        error: "invalid_service",
        message: "El servicio solicitado no existe.",
      },
      { status: 400 },
    );
  }

  const whatsappNumber = normalizeWhatsAppNumber(getWhatsAppNumber());

  if (!whatsappNumber) {
    return NextResponse.json(
      {
        error: "whatsapp_not_configured",
        message: "AUM_WHATSAPP_NUMBER no está configurado.",
      },
      { status: 503 },
    );
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      {
        error: "tracking_not_configured",
        message: "Supabase service role no está configurado para registrar el CTA.",
      },
      { status: 503 },
    );
  }

  const destination = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    service.whatsappMessage,
  )}`;

  const { error } = await supabase.from("cta_clicks").insert({
    ...buildTrackingFields({
      request,
      service,
      searchParams: url.searchParams,
    }),
    whatsapp_message: service.whatsappMessage,
    redirect_url: destination,
    page_path: cleanParam(url.searchParams.get("page"), 220),
  });

  if (error) {
    return NextResponse.json(
      {
        error: "tracking_failed",
        message: "No se pudo registrar el CTA antes de abrir WhatsApp.",
      },
      { status: 503 },
    );
  }

  return NextResponse.redirect(destination, 302);
}

export const HEAD = GET;
