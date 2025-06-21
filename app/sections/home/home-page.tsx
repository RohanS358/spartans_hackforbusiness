import HeroSection from "./hero-section"
import StatsSection from "./stats-section"
import FeaturesSection from "./features-section"
import ServicesSection from "./services-section"
import HowItWorksSection from "./how-it-works-section"
import CTASection from "./cta-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ServicesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  )
}
