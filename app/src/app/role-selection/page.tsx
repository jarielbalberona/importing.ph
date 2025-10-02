import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Package, Ship, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl mb-4">Choose Your Role</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select how you want to use importing.ph to get started with the right dashboard for your needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Importer Card */}
            <Card className="p-8 hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-primary">
              <div className="flex flex-col h-full">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">I'm an Importer</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                  Post your shipment requirements and receive competitive quotes from multiple verified cargo
                  forwarders. Compare and choose the best option for your business.
                </p>
                <ul className="space-y-2 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Post shipment requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Receive multiple quotes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Compare and select forwarders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Track shipment status</span>
                  </li>
                </ul>
                <Button asChild size="lg" className="w-full rounded-xl">
                  <Link href="/importer/dashboard">
                    Continue as Importer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Forwarder Card */}
            <Card className="p-8 hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-primary">
              <div className="flex flex-col h-full">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Ship className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">I'm a Forwarder</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                  Browse available shipment requests from Philippine importers and submit competitive quotes. Grow your
                  business by connecting with new clients.
                </p>
                <ul className="space-y-2 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Browse open shipments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Submit competitive quotes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Manage your proposals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Track accepted quotes</span>
                  </li>
                </ul>
                <Button asChild size="lg" className="w-full rounded-xl">
                  <Link href="/forwarder/dashboard">
                    Continue as Forwarder
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Not sure which role to choose?{" "}
            <Link href="/" className="text-primary hover:underline">
              Learn more about importing.ph
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
