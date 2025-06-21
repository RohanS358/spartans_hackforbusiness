import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, CreditCard, Shield, Smartphone, Gift, Users } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: MapPin,
      title: "Map-Based Discovery",
      description:
        "Explore verified local businesses through an intuitive map interface. Find nearby shops, cafes, and services with ease.",
    },
    {
      icon: CreditCard,
      title: "Individual Credit Systems",
      description:
        "Each business has its own credit system. Purchase and use credits for check-ins, discounts, and direct payments.",
    },
    {
      icon: Shield,
      title: "Blockchain Security",
      description:
        "All transactions are recorded on blockchain for complete transparency, security, and trust between users and businesses.",
    },
    {
      icon: Smartphone,
      title: "PWA Support",
      description:
        "Enjoy an app-like experience across all devices with offline capabilities and seamless performance.",
    },
    {
      icon: Gift,
      title: "Loyalty Rewards",
      description:
        "Earn exclusive rewards, bonus credits, and VIP perks the more you engage with your favorite businesses.",
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Build real relationships with local businesses while supporting your community's economic growth.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our innovative approach combines cutting-edge technology with community-focused features to create
            meaningful connections between users and local businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4 mx-auto">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
