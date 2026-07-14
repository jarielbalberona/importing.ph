import { NextResponse } from "next/server";

import { RateLimitError } from "@/lib/rate-limit";

export type ApiErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "invalid_request"
  | "rate_limited"
  | "internal_error";

export function apiError(
  status: number,
  error: ApiErrorCode,
  message: string,
  retryAfter?: number,
) {
  return NextResponse.json(
    {
      error,
      message,
      ...(retryAfter === undefined ? {} : { retryAfter }),
    },
    {
      status,
      headers:
        retryAfter === undefined
          ? undefined
          : { "Retry-After": String(retryAfter) },
    },
  );
}

export function rateLimitResponse(error: RateLimitError) {
  return apiError(
    429,
    "rate_limited",
    "Too many requests. Try again later.",
    error.retryAfterSeconds,
  );
}
