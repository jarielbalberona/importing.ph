import { z } from "zod";

export const publicShareTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{16}$/);

export function publicRequestPath(token: string) {
  return `/r/${publicShareTokenSchema.parse(token)}`;
}

export function absolutePublicRequestUrl(origin: string, token: string) {
  return new URL(publicRequestPath(token), origin).toString();
}
