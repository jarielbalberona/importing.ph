"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

type PendingSubmitButtonProps = ButtonProps & {
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
