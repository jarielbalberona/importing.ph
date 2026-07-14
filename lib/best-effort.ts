import { logServerError } from "@/lib/server-log";

export async function runBestEffort(
  event: string,
  operation: () => Promise<unknown>,
  context: Record<string, string | number | boolean | null | undefined> = {},
) {
  try {
    await operation();
    return true;
  } catch (error) {
    logServerError(event, error, context);
    return false;
  }
}
