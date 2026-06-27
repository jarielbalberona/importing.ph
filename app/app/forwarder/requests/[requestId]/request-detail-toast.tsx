import { QueryStateToast } from "@/components/query-state-toast";

export function RequestDetailToast({
  quoteSubmitted,
  quoteStatus,
  messageError,
}: {
  quoteSubmitted: boolean;
  quoteStatus?: string | null;
  messageError?: string | null;
}) {
  return (
    <QueryStateToast
      successMessage={
        quoteSubmitted
          ? "Your quote was sent."
          : quoteStatus === "updated"
            ? "Your quote was updated."
            : quoteStatus === "withdrawn"
              ? "Your quote was withdrawn."
              : null
      }
      errorMessage={messageError}
      clearKeys={["quote", "quoteError", "messageError"]}
    />
  );
}
