import { Package, TrendingDown, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

const features = [
  {
    number: "1",
    icon: Package,
    title: "Post Your Shipment",
    description:
      "Share your cargo details once — origin, destination, volume, and delivery requirements. Simple and fast.",
  },
  {
    number: "2",
    icon: TrendingDown,
    title: "Get Multiple Quotes",
    description:
      "Receive competitive quotes from verified cargo forwarders. Compare pricing, delivery times, and services.",
  },
  {
    number: "3",
    icon: CheckCircle,
    title: "Choose the Best",
    description: "Select the forwarder that fits your needs and budget. Track your shipment from China to Philippines.",
  },
]

export function Features() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to streamline your cargo forwarding process
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.number} className="relative p-8 hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {feature.number}
                </div>
                <div className="mt-8 mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
