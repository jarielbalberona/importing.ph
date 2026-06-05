import { QueryStateToast } from "@/components/query-state-toast";

export function RequestDetailToast({
  quoteSubmitted,
  messageError,
}: {
  quoteSubmitted: boolean;
  messageError?: string | null;
}) {
  return (
    <QueryStateToast
      successMessage={quoteSubmitted ? "Your quote was sent." : null}
      errorMessage={messageError}
      clearKeys={["quote", "messageError"]}
    />
  );
}
