import { createHash, createHmac } from "node:crypto";

type R2Config = {
  endpoint: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  readUrlExpiresSeconds: number;
};

type PutObjectInput = {
  objectKey: string;
  body: Buffer;
  contentType: string;
  sizeBytes: number;
};

const service = "s3";

export function getR2Config(): R2Config {
  const endpoint = process.env.R2_ENDPOINT || endpointFromAccountId();
  const bucketName = process.env.R2_BUCKET_NAME;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint) {
    throw new Error("R2_ENDPOINT or R2_ACCOUNT_ID is required");
  }
  if (!bucketName) {
    throw new Error("R2_BUCKET_NAME is required");
  }
  if (!accessKeyId) {
    throw new Error("R2_ACCESS_KEY_ID is required");
  }
  if (!secretAccessKey) {
    throw new Error("R2_SECRET_ACCESS_KEY is required");
  }

  return {
    endpoint: endpoint.replace(/\/+$/, ""),
    bucketName,
    accessKeyId,
    secretAccessKey,
    region: process.env.R2_REGION || "auto",
    readUrlExpiresSeconds: readExpiry(),
  };
}

export async function putR2Object(input: PutObjectInput) {
  const config = getR2Config();
  const url = objectUrl(config, input.objectKey);
  const now = new Date();
  const payloadHash = createHash("sha256").update(input.body).digest("hex");
  const headers = {
    "content-length": String(input.sizeBytes),
    "content-type": input.contentType,
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate(now),
  };
  const authorization = authorizationHeader({
    config,
    method: "PUT",
    url,
    headers,
    payloadHash,
    now,
  });

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...headers,
      authorization,
    },
    body: new Uint8Array(input.body),
  });

  if (!response.ok) {
    throw new Error(`R2 put failed with ${response.status}`);
  }
}

export function createSignedR2ReadUrl(objectKey: string) {
  const config = getR2Config();
  const url = objectUrl(config, objectKey);
  const now = new Date();
  const date = amzDate(now);
  const shortDate = date.slice(0, 8);
  const credentialScope = `${shortDate}/${config.region}/${service}/aws4_request`;
  const signedHeaders = "host";

  url.searchParams.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  url.searchParams.set(
    "X-Amz-Credential",
    `${config.accessKeyId}/${credentialScope}`,
  );
  url.searchParams.set("X-Amz-Date", date);
  url.searchParams.set("X-Amz-Expires", String(config.readUrlExpiresSeconds));
  url.searchParams.set("X-Amz-SignedHeaders", signedHeaders);

  const canonicalRequest = [
    "GET",
    encodePath(url.pathname),
    canonicalQueryString(url.searchParams),
    `host:${url.host}\n`,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    date,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");
  const signature = hmacHex(signingKey(config.secretAccessKey, shortDate, config.region), stringToSign);

  url.searchParams.set("X-Amz-Signature", signature);

  return {
    url: url.toString(),
    expiresInSeconds: config.readUrlExpiresSeconds,
  };
}

function endpointFromAccountId() {
  const accountId = process.env.R2_ACCOUNT_ID;
  return accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined;
}

function readExpiry() {
  const parsed = Number.parseInt(process.env.R2_READ_URL_EXPIRES_SECONDS || "900", 10);

  if (!Number.isFinite(parsed) || parsed < 60 || parsed > 3600) {
    return 900;
  }

  return parsed;
}

function objectUrl(config: R2Config, objectKey: string) {
  if (objectKey.includes("..") || objectKey.startsWith("/")) {
    throw new Error("Invalid object key");
  }

  return new URL(
    `/${encodeURIComponent(config.bucketName)}/${objectKey
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`,
    config.endpoint,
  );
}

function authorizationHeader({
  config,
  method,
  url,
  headers,
  payloadHash,
  now,
}: {
  config: R2Config;
  method: string;
  url: URL;
  headers: Record<string, string>;
  payloadHash: string;
  now: Date;
}) {
  const date = amzDate(now);
  const shortDate = date.slice(0, 8);
  const credentialScope = `${shortDate}/${config.region}/${service}/aws4_request`;
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key}:${headers[key].trim()}\n`)
    .join("");
  const canonicalRequest = [
    method,
    encodePath(url.pathname),
    canonicalQueryString(url.searchParams),
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    date,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");
  const signature = hmacHex(signingKey(config.secretAccessKey, shortDate, config.region), stringToSign);

  return `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

function canonicalQueryString(params: URLSearchParams) {
  return Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");
}

function encodePath(pathname: string) {
  return pathname
    .split("/")
    .map((part) => encodeRfc3986(decodeURIComponent(part)))
    .join("/");
}

function encodeRfc3986(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function amzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function signingKey(secret: string, shortDate: string, region: string) {
  const dateKey = hmacBuffer(`AWS4${secret}`, shortDate);
  const regionKey = hmacBuffer(dateKey, region);
  const serviceKey = hmacBuffer(regionKey, service);
  return hmacBuffer(serviceKey, "aws4_request");
}

function hmacBuffer(key: string | Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function hmacHex(key: Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
