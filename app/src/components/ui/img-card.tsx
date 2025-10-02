import * as React from "react"

import { cn } from "@/utils/ui"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className={cn("rounded-md  bg-card text-card-foreground", className)} ref={ref} {...props} />
))
Card.displayName = "Card"

export { Card }

