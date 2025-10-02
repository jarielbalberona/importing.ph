import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-12 md:p-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl mb-6">
              Ready to streamline your logistics?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join importing.ph today and connect with trusted cargo forwarders. Whether you're an importer or
              forwarder, we've got you covered.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8 py-6 rounded-xl">
                <Link href="/role-selection">
                  I'm an Importer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8 py-6 rounded-xl bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Link href="/role-selection">
                  I'm a Forwarder
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
