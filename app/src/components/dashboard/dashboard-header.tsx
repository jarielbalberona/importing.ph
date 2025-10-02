import { Button } from "@/components/ui/button"
import { Ship } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  role: "importer" | "forwarder"
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <Ship className="h-6 w-6 text-primary" />
          <span>importing.ph</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={`/${role}/dashboard`}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href={`/${role}/shipments`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {role === "importer" ? "My Shipments" : "Browse Shipments"}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Profile
          </Button>
        </div>
      </div>
    </header>
  )
}
