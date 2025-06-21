import { Card, CardContent } from "@/components/ui/card"
import { MapPin, CreditCard, Gift, Repeat } from "lucide-react"

export default function HowItWorksSection() {
  const steps = [
    {
      icon: MapPin,
      title: "Discover",
      description:
        "Browse the map to find verified local businesses near you. Each business shows its unique offerings and credit system.",
    },
    {
      icon: CreditCard,
      title: "Purchase Credits",
      description:
        "Buy credits specific to businesses you want to support. Each shop has its own credit system with customized offers.",
    },
    {
      icon: Gift,
      title: "Earn Rewards",
      description:
        "Use credits for check-ins, purchases, and special offers. Earn loyalty points and unlock exclusive benefits.",
    },
    {
      icon: Repeat,
      title: "Build Relationships",
      description:
        "The more you engage, the more benefits you unlock. Build lasting relationships with your favorite local businesses.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started is simple. Follow these four steps to begin building meaningful relationships with local
            businesses in your community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="text-center border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6 relative">
                    <step.icon className="w-8 h-8 text-blue-600" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>

              {/* Connecting Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-purple-300 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
