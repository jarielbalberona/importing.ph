"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

type PendingSubmitButtonProps = ComponentProps<typeof Button> & {
  pendingText: string;
};

export function PendingSubmitButton({
  pendingText,
  children,
  disabled,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={disabled || pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
