const forbiddenContextKey = /body|email|file(name)?|secret|token|signed|url/i;

type SafeLogValue = string | number | boolean | null | undefined;
type SafeLogContext = Record<string, SafeLogValue>;

function redactMessage(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted]")
    .replace(/https?:\/\/\S+/gi, "[redacted]")
    .replace(/\b\S+\.(?:csv|docx?|xlsx?|pdf|png|jpe?g|webp)\b/gi, "[redacted]")
    .replace(/(?:bearer\s+|token[=:]\s*)\S+/gi, "[redacted]");
}

export function serializeServerLog(
  event: string,
  error: unknown,
  context: SafeLogContext = {},
) {
  const safeContext = Object.fromEntries(
    Object.entries(context).filter(
      ([key, value]) => !forbiddenContextKey.test(key) && value !== undefined,
    ),
  );
  const normalized =
    error instanceof Error
      ? { errorClass: error.name, errorMessage: redactMessage(error.message) }
      : { errorClass: "UnknownError", errorMessage: redactMessage(String(error)) };

  return {
    timestamp: new Date().toISOString(),
    level: "error" as const,
    event,
    ...normalized,
    ...safeContext,
  };
}

export function logServerError(
  event: string,
  error: unknown,
  context: SafeLogContext = {},
) {
  console.error(JSON.stringify(serializeServerLog(event, error, context)));
}
