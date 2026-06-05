"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type QueryStateToastProps = {
  successMessage?: string | null;
  errorMessage?: string | null;
  clearKeys: string[];
};

export function QueryStateToast({
  successMessage,
  errorMessage,
  clearKeys,
}: QueryStateToastProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current || (!successMessage && !errorMessage)) {
      return;
    }

    shownRef.current = true;

    if (successMessage) {
      toast.success(successMessage);
    }

    if (errorMessage) {
      toast.error(errorMessage);
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    for (const key of clearKeys) {
      nextSearchParams.delete(key);
    }

    const nextQuery = nextSearchParams.toString();

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [
    clearKeys,
    errorMessage,
    pathname,
    router,
    searchParams,
    successMessage,
  ]);

  return null;
}
