import { Button } from "@/components/ui/button"
import { ArrowRight, Ship } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/30">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            <Ship className="h-4 w-4" />
            <span>Trusted by Philippine importers</span>
          </div>

          {/* Main heading */}
          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Find trusted cargo forwarders from China to Philippines
          </h1>

          {/* Subheading */}
          <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl lg:text-2xl">
            Post your shipment once — get multiple quotes, compare, and choose the best. Streamline your logistics with
            competitive pricing.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl">
              <Link href="/role-selection">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-base px-8 py-6 rounded-xl bg-transparent"
            >
              <Link href="#how-it-works">How It Works</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8">
            <div>
              <div className="text-3xl font-bold text-primary md:text-4xl">500+</div>
              <div className="mt-1 text-sm text-muted-foreground">Active Shipments</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary md:text-4xl">200+</div>
              <div className="mt-1 text-sm text-muted-foreground">Forwarders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary md:text-4xl">98%</div>
              <div className="mt-1 text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
