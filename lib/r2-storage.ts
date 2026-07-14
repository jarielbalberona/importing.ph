import { createHash, createHmac } from "node:crypto";

type R2Config = {
  endpoint: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
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

export async function getR2Object(objectKey: string) {
  const config = getR2Config();
  const url = objectUrl(config, objectKey);
  const now = new Date();
  const payloadHash = sha256Hex("");
  const headers = signedHeaders(url, now, payloadHash);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...headers,
      authorization: authorizationHeader({
        config,
        method: "GET",
        url,
        headers,
        payloadHash,
        now,
      }),
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`R2 get failed with ${response.status}`);
  }
  return response;
}

export async function deleteR2Object(objectKey: string) {
  const config = getR2Config();
  const url = objectUrl(config, objectKey);
  const now = new Date();
  const payloadHash = sha256Hex("");
  const headers = signedHeaders(url, now, payloadHash);
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      ...headers,
      authorization: authorizationHeader({
        config,
        method: "DELETE",
        url,
        headers,
        payloadHash,
        now,
      }),
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`R2 delete failed with ${response.status}`);
  }
}

function signedHeaders(url: URL, now: Date, payloadHash: string) {
  return {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate(now),
  };
}

function endpointFromAccountId() {
  const accountId = process.env.R2_ACCOUNT_ID;
  return accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined;
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
