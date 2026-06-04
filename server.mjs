import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

import { config } from "dotenv";
import next from "next";
import postgres from "postgres";
import { WebSocketServer } from "ws";

config({ path: ".env.local", quiet: true });
config({ path: ".env", override: false, quiet: true });

const dev = process.env.NODE_ENV !== "production";
const port = Number.parseInt(process.env.PORT || "3001", 10);
const realtimePath = "/api/realtime/ws";
const app = next({ dev });
const handle = app.getRequestHandler();

const connectionBySocket = new Map();
const subscriptionsByConversationId = new Map();

let sql;

function getSql() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    sql = postgres(process.env.DATABASE_URL, {
      max: 1,
      prepare: false,
    });
  }

  return sql;
}

function getRealtimeSecret() {
  const secret = process.env.REALTIME_TOKEN_SECRET || process.env.CLERK_SECRET_KEY;

  if (!secret) {
    throw new Error("REALTIME_TOKEN_SECRET or CLERK_SECRET_KEY is required");
  }

  return secret;
}

function sign(payload) {
  return createHmac("sha256", getRealtimeSecret())
    .update(payload)
    .digest("base64url");
}

function verifyToken(token) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return undefined;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return undefined;
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  );

  if (
    payload.version !== 1 ||
    !payload.clerkUserId ||
    !payload.userProfileId ||
    !payload.role ||
    payload.expiresAt <= Date.now()
  ) {
    return undefined;
  }

  return payload;
}

async function authenticateUpgrade(requestUrl) {
  const token = requestUrl.searchParams.get("token");

  if (!token) {
    return undefined;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return undefined;
  }

  const rows = await getSql()`
    select id, clerk_user_id, role
    from user_profiles
    where id = ${payload.userProfileId}
      and clerk_user_id = ${payload.clerkUserId}
      and role = ${payload.role}
    limit 1
  `;

  const profile = rows[0];

  if (!profile) {
    return undefined;
  }

  return {
    clerkUserId: profile.clerk_user_id,
    userProfileId: profile.id,
    role: profile.role,
  };
}

async function canAccessConversation(connection, conversationId) {
  if (connection.role === "importer") {
    const rows = await getSql()`
      select c.id
      from conversations c
      inner join importer_profiles ip
        on c.importer_profile_id = ip.id
      where c.id = ${conversationId}
        and ip.user_profile_id = ${connection.userProfileId}
      limit 1
    `;

    return rows.length > 0;
  }

  if (connection.role === "forwarder") {
    const rows = await getSql()`
      select c.id
      from conversations c
      inner join forwarder_members fm
        on c.forwarder_company_id = fm.forwarder_company_id
      where c.id = ${conversationId}
        and fm.user_profile_id = ${connection.userProfileId}
      limit 1
    `;

    return rows.length > 0;
  }

  return false;
}

function sendJson(ws, payload) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function sendError(ws, input) {
  sendJson(ws, {
    type: "realtime.error",
    version: 1,
    eventId: randomUUID(),
    occurredAt: new Date().toISOString(),
    requestId: input.requestId ?? null,
    code: input.code,
    message: input.message,
  });
}

function subscribe(ws, connection, conversationId) {
  connection.subscriptions.add(conversationId);

  let subscribers = subscriptionsByConversationId.get(conversationId);
  if (!subscribers) {
    subscribers = new Set();
    subscriptionsByConversationId.set(conversationId, subscribers);
  }

  subscribers.add(ws);
}

function unsubscribe(ws, connection, conversationId) {
  connection.subscriptions.delete(conversationId);
  const subscribers = subscriptionsByConversationId.get(conversationId);
  subscribers?.delete(ws);

  if (subscribers?.size === 0) {
    subscriptionsByConversationId.delete(conversationId);
  }
}

function cleanup(ws) {
  const connection = connectionBySocket.get(ws);

  if (!connection) {
    return;
  }

  for (const conversationId of connection.subscriptions) {
    unsubscribe(ws, connection, conversationId);
  }

  connectionBySocket.delete(ws);
}

async function handleClientMessage(ws, rawData) {
  const connection = connectionBySocket.get(ws);

  if (!connection) {
    return;
  }

  let message;
  try {
    message = JSON.parse(rawData.toString());
  } catch {
    sendError(ws, {
      code: "invalid_payload",
      message: "Invalid realtime message.",
    });
    return;
  }

  if (message.type === "conversation.subscribe") {
    if (typeof message.conversationId !== "string") {
      sendError(ws, {
        requestId: message.requestId,
        code: "invalid_payload",
        message: "Invalid subscription request.",
      });
      return;
    }

    const allowed = await canAccessConversation(connection, message.conversationId);

    if (!allowed) {
      sendError(ws, {
        requestId: message.requestId,
        code: "forbidden",
        message: "Conversation is not available.",
      });
      return;
    }

    subscribe(ws, connection, message.conversationId);
    sendJson(ws, {
      type: "conversation.subscribed",
      version: 1,
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      requestId: message.requestId,
      conversationId: message.conversationId,
    });
    return;
  }

  if (message.type === "conversation.unsubscribe") {
    if (typeof message.conversationId === "string") {
      unsubscribe(ws, connection, message.conversationId);
      sendJson(ws, {
        type: "conversation.unsubscribed",
        version: 1,
        eventId: randomUUID(),
        occurredAt: new Date().toISOString(),
        requestId: message.requestId,
        conversationId: message.conversationId,
      });
    }
    return;
  }

  sendError(ws, {
    requestId: message.requestId,
    code: "invalid_payload",
    message: "Unsupported realtime message.",
  });
}

function publishRealtimeEvent(event) {
  const subscribers = subscriptionsByConversationId.get(event.conversationId);

  if (!subscribers) {
    return;
  }

  const payload = JSON.stringify(event);

  for (const ws of subscribers) {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload);
    }
  }
}

await app.prepare();

const server = createServer((req, res) => {
  handle(req, res);
});
const wss = new WebSocketServer({ noServer: true });

globalThis.__importingPhRealtime = {
  publish: publishRealtimeEvent,
};

wss.on("connection", (ws, _request, profile) => {
  const connection = {
    connectionId: randomUUID(),
    userProfileId: profile.userProfileId,
    clerkUserId: profile.clerkUserId,
    role: profile.role,
    subscriptions: new Set(),
    isAlive: true,
  };

  connectionBySocket.set(ws, connection);

  sendJson(ws, {
    type: "realtime.connected",
    version: 1,
    eventId: randomUUID(),
    occurredAt: new Date().toISOString(),
    connectionId: connection.connectionId,
    userProfileId: connection.userProfileId,
  });

  ws.on("pong", () => {
    connection.isAlive = true;
  });
  ws.on("message", (data) => {
    void handleClientMessage(ws, data);
  });
  ws.on("close", () => cleanup(ws));
  ws.on("error", () => cleanup(ws));
});

server.on("upgrade", (request, socket, head) => {
  const requestUrl = new URL(request.url || "", `http://${request.headers.host}`);

  if (requestUrl.pathname !== realtimePath) {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }

  authenticateUpgrade(requestUrl)
    .then((profile) => {
      if (!profile) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request, profile);
      });
    })
    .catch((error) => {
      console.error("realtime upgrade failed", error);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    });
});

const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    const connection = connectionBySocket.get(ws);

    if (!connection) {
      continue;
    }

    if (!connection.isAlive) {
      cleanup(ws);
      ws.terminate();
      continue;
    }

    connection.isAlive = false;
    ws.ping();
  }
}, 30_000);

async function shutdown() {
  clearInterval(heartbeat);
  globalThis.__importingPhRealtime = undefined;

  for (const ws of wss.clients) {
    ws.close(1001, "Server shutting down");
  }

  wss.close();
  await sql?.end({ timeout: 1 });
  server.close();
}

process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});
process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});

server.listen(port, () => {
  console.log(`> Server listening at http://localhost:${port}`);
  console.log(`> WebSocket endpoint ready at ${realtimePath}`);
});
