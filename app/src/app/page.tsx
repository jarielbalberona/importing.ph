import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { Benefits } from "@/components/landing/benefits"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <div id="how-it-works">
          <Features />
        </div>
        <div id="benefits">
          <Benefits />
        </div>
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
