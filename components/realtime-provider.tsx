"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import type { ServerRealtimeEvent } from "@/lib/realtime-events";

type RealtimeStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

export type ClientRealtimeEvent =
  | ServerRealtimeEvent
  | {
      type: "realtime.connected";
      version: 1;
      eventId: string;
      occurredAt: string;
      connectionId: string;
      userProfileId: string;
    }
  | {
      type: "realtime.error";
      version: 1;
      eventId: string;
      occurredAt: string;
      requestId: string | null;
      code: string;
      message: string;
    }
  | {
      type: "conversation.subscribed" | "conversation.unsubscribed";
      version: 1;
      eventId: string;
      occurredAt: string;
      requestId?: string;
      conversationId: string;
    };

type Listener = (event: ClientRealtimeEvent) => void;

type RealtimeContextValue = {
  status: RealtimeStatus;
  subscribe: (conversationId: string) => void;
  unsubscribe: (conversationId: string) => void;
  addListener: (listener: Listener) => () => void;
  emitLocal: (event: ClientRealtimeEvent) => void;
};

const RealtimeContext = createContext<RealtimeContextValue | undefined>(
  undefined,
);

function requestId() {
  return crypto.randomUUID();
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const hadConnectedRef = useRef(false);
  const closedByUnmountRef = useRef(false);
  const connectRef = useRef<() => void>(() => {});
  const subscriptionsRef = useRef(new Set<string>());
  const listenersRef = useRef(new Set<Listener>());
  const [status, setStatus] = useState<RealtimeStatus>("connecting");

  const emit = useCallback((event: ClientRealtimeEvent) => {
    for (const listener of listenersRef.current) {
      listener(event);
    }
  }, []);

  const send = useCallback((payload: unknown) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify(payload));
  }, []);

  const sendSubscribe = useCallback(
    (conversationId: string) => {
      send({
        type: "conversation.subscribe",
        version: 1,
        requestId: requestId(),
        conversationId,
      });
    },
    [send],
  );

  const scheduleReconnect = useCallback(() => {
    setStatus("reconnecting");
    const attempt = reconnectAttemptRef.current + 1;
    reconnectAttemptRef.current = attempt;
    const delay = Math.min(20_000, 500 * 2 ** attempt);

    reconnectTimerRef.current = setTimeout(() => {
      connectRef.current();
    }, delay);
  }, []);

  const connect = useCallback(async () => {
    if (closedByUnmountRef.current) {
      return;
    }

    setStatus(hadConnectedRef.current ? "reconnecting" : "connecting");

    try {
      const response = await fetch("/api/realtime/token", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("token_failed");
      }

      const payload = (await response.json()) as { token: string };
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const socket = new WebSocket(
        `${protocol}://${window.location.host}/api/realtime/ws?token=${encodeURIComponent(
          payload.token,
        )}`,
      );

      socketRef.current = socket;

      socket.addEventListener("open", () => {
        reconnectAttemptRef.current = 0;
        setStatus("connected");

        if (hadConnectedRef.current) {
          router.refresh();
        }

        hadConnectedRef.current = true;

        for (const conversationId of subscriptionsRef.current) {
          sendSubscribe(conversationId);
        }
      });

      socket.addEventListener("message", (message) => {
        try {
          emit(JSON.parse(message.data) as ClientRealtimeEvent);
        } catch {
          // Ignore malformed realtime payloads; REST recovery remains canonical.
        }
      });

      socket.addEventListener("close", () => {
        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        if (closedByUnmountRef.current) {
          setStatus("disconnected");
          return;
        }

        scheduleReconnect();
      });

      socket.addEventListener("error", () => {
        socket.close();
      });
    } catch {
      if (closedByUnmountRef.current) {
        return;
      }

      scheduleReconnect();
    }
  }, [emit, router, scheduleReconnect, sendSubscribe]);

  useEffect(() => {
    connectRef.current = () => {
      void connect();
    };
  }, [connect]);

  useEffect(() => {
    closedByUnmountRef.current = false;
    void connect();

    return () => {
      closedByUnmountRef.current = true;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [connect]);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      status,
      subscribe(conversationId) {
        subscriptionsRef.current.add(conversationId);
        sendSubscribe(conversationId);
      },
      unsubscribe(conversationId) {
        subscriptionsRef.current.delete(conversationId);
        send({
          type: "conversation.unsubscribe",
          version: 1,
          requestId: requestId(),
          conversationId,
        });
      },
      addListener(listener) {
        listenersRef.current.add(listener);

        return () => {
          listenersRef.current.delete(listener);
        };
      },
      emitLocal: emit,
    }),
    [emit, send, sendSubscribe, status],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtime must be used inside RealtimeProvider");
  }

  return context;
}

export function useConversationRealtime(
  conversationId: string | undefined,
  onEvent: (event: ClientRealtimeEvent) => void,
) {
  const realtime = useRealtime();

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    realtime.subscribe(conversationId);

    return () => {
      realtime.unsubscribe(conversationId);
    };
  }, [conversationId, realtime]);

  useEffect(() => realtime.addListener(onEvent), [onEvent, realtime]);

  return realtime.status;
}
