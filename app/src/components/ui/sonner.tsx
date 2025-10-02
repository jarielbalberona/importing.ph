"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium",
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-4 h-4 text-green-500" />,
        error: <XCircle className="w-4 h-4 text-red-500" />,
        warning: <AlertCircle className="w-4 h-4 text-yellow-500" />,
        info: <Info className="w-4 h-4 text-blue-500" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
