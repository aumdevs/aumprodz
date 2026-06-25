"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useEffect } from "react";

import type { PublicEventName } from "@/lib/analytics/public-tracking";

type EventPayload = {
  eventName: PublicEventName;
  page: string;
  service?: string | null;
  source?: string | null;
  placement?: string | null;
  metadata?: Record<string, unknown> | null;
};

type PublicEventTrackerProps = EventPayload;

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  EventPayload & {
    href: string;
    children: ReactNode;
  };

function getUtmParams() {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
}

function sendPublicEvent(payload: EventPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const body = JSON.stringify({
    ...payload,
    ...getUtmParams(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/events/public",
      new Blob([body], { type: "application/json" }),
    );
    return;
  }

  void fetch("/api/events/public", {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
    },
    keepalive: true,
  });
}

export function PublicEventTracker({
  eventName,
  page,
  service,
  source,
  placement,
  metadata,
}: PublicEventTrackerProps) {
  const metadataKey = JSON.stringify(metadata ?? null);

  useEffect(() => {
    sendPublicEvent({
      eventName,
      page,
      service,
      source,
      placement,
      metadata,
    });
  }, [eventName, page, placement, service, source, metadataKey, metadata]);

  return null;
}

export function TrackedLink({
  eventName,
  page,
  service,
  source,
  placement,
  metadata,
  onClick,
  children,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        sendPublicEvent({
          eventName,
          page,
          service,
          source,
          placement,
          metadata,
        });
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
