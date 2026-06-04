"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  type ClientRealtimeEvent,
  useRealtime,
} from "@/components/realtime-provider";

export function ForwarderMessagesRealtime({
  conversationIds,
  children,
}: {
  conversationIds: string[];
  children: ReactNode;
}) {
  const router = useRouter();
  const realtime = useRealtime();
  const handleRealtimeEvent = useCallback(
    (event: ClientRealtimeEvent) => {
      if (
        event.type === "conversation.updated" &&
        conversationIds.includes(event.conversationId)
      ) {
        router.refresh();
      }
    },
    [conversationIds, router],
  );

  useEffect(() => {
    for (const conversationId of conversationIds) {
      realtime.subscribe(conversationId);
    }

    return () => {
      for (const conversationId of conversationIds) {
        realtime.unsubscribe(conversationId);
      }
    };
  }, [conversationIds, realtime]);

  useEffect(
    () => realtime.addListener(handleRealtimeEvent),
    [handleRealtimeEvent, realtime],
  );

  return children;
}
