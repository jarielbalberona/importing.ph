"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
}

function LoadingOverlay({ isOpen, message = "Processing..." }: LoadingOverlayProps) {
  // Force the dialog to stay open until isOpen is set to false programmatically
  const preventClose = (event: any) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {}} // No-op function to prevent closing by clicking outside
    >
      <DialogContent
        className="border-none shadow-lg sm:max-w-md bg-background/80 backdrop-blur-sm dark:bg-background/90 dark:border-border"
        onEscapeKeyDown={preventClose} // Prevent closing with Escape key
        onInteractOutside={preventClose} // Prevent closing by clicking outside
        onPointerDownOutside={preventClose} // Additional prevention for pointer events
      >
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-lg font-medium text-center text-foreground">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LoadingOverlay;
