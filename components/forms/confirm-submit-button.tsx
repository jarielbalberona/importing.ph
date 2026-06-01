"use client";

import { useId, useRef, useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

type ConfirmSubmitButtonProps = ButtonProps & {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ConfirmSubmitButton({
  children,
  message,
  title = "Confirm this action?",
  confirmLabel,
  cancelLabel = "Cancel",
  onClick,
  ...props
}: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  function submitClosestForm() {
    const form = buttonRef.current?.closest("form");

    setOpen(false);
    form?.requestSubmit();
  }

  return (
    <>
      <Button
        {...props}
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          onClick?.(event);

          if (!event.defaultPrevented) {
            setOpen(true);
          }
        }}
      >
        {children}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4 py-6"
          role="presentation"
        >
          <div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            aria-modal="true"
            className="w-full max-w-md rounded-lg border bg-background p-5 shadow-lg"
            role="alertdialog"
          >
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-2 text-sm leading-6 text-muted-foreground"
            >
              {message}
            </p>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={submitClosestForm}
              >
                {confirmLabel ?? children}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setOpen(false)}
              >
                {cancelLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
