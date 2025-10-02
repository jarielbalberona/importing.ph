import { Ship } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground mb-4">
              <Ship className="h-6 w-6 text-primary" />
              <span>importing.ph</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              The leading B2B marketplace connecting Philippine importers with trusted Chinese cargo forwarders.
              Streamline your logistics with competitive quotes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">For Importers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/role-selection" className="text-muted-foreground hover:text-foreground transition-colors">
                  Post Shipment
                </Link>
              </li>
              <li>
                <Link href="/role-selection" className="text-muted-foreground hover:text-foreground transition-colors">
                  Compare Quotes
                </Link>
              </li>
              <li>
                <Link href="/role-selection" className="text-muted-foreground hover:text-foreground transition-colors">
                  Track Shipments
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">For Forwarders</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/role-selection" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Shipments
                </Link>
              </li>
              <li>
                <Link href="/role-selection" className="text-muted-foreground hover:text-foreground transition-colors">
                  Submit Quotes
                </Link>
              </li>
              <li>
                <Link href="/role-selection" className="text-muted-foreground hover:text-foreground transition-colors">
                  Manage Quotes
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 importing.ph. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
