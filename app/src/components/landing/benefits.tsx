import { Shield, Clock, DollarSign, Users } from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Verified Forwarders",
    description: "All cargo forwarders are vetted and verified for reliability and quality service.",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "Post once and receive multiple quotes instead of contacting forwarders individually.",
  },
  {
    icon: DollarSign,
    title: "Competitive Pricing",
    description: "Compare quotes side-by-side to find the best rates for your shipment needs.",
  },
  {
    icon: Users,
    title: "Trusted Network",
    description: "Join hundreds of Philippine importers who trust our platform for their logistics.",
  },
]

export function Benefits() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl mb-4">
            Why Choose importing.ph
          </h2>
          <p className="text-lg text-muted-foreground">The most efficient way to connect with cargo forwarders</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
