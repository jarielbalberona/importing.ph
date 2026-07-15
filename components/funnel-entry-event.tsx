"use client";

import { useEffect } from "react";

import type { AuthRedirectIntent } from "@/lib/auth-redirect";
import type { FunnelEventName } from "@/lib/funnel-events";

export function FunnelEntryEvent({
  eventName,
  role,
  authIntent,
  entityType,
  entityId,
}: {
  eventName: Extract<FunnelEventName, "auth_started" | "request_started" | "quote_started">;
  role?: "importer" | "forwarder";
  authIntent?: AuthRedirectIntent;
  entityType?: "shipment_request";
  entityId?: string;
}) {
  useEffect(() => {
    const key = [eventName, role, authIntent, entityType, entityId]
      .filter(Boolean)
      .join(":");
    const storageKey = `iph:funnel:${key}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, "1");
    void fetch("/api/funnel-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, role, authIntent, entityType, entityId }),
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Funnel event was not recorded.");
        }
      })
      .catch(() => {
        sessionStorage.removeItem(storageKey);
      });
  }, [authIntent, entityId, entityType, eventName, role]);

  return null;
}
