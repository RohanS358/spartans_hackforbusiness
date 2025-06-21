import { Card, CardContent } from "@/components/ui/card"
import { Users, MapPin, CreditCard, Award } from "lucide-react"

export default function StatsSection() {
  const stats = [
    {
      icon: Users,
      number: "50,000+",
      label: "Active Users",
      description: "Growing community of local explorers",
    },
    {
      icon: MapPin,
      number: "1,200+",
      label: "Verified Businesses",
      description: "Trusted local shops and services",
    },
    {
      icon: CreditCard,
      number: "2.5M+",
      label: "Credits Earned",
      description: "Total rewards distributed to users",
    },
    {
      icon: Award,
      number: "25+",
      label: "Cities",
      description: "Expanding across major metropolitan areas",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Connecting Communities Nationwide</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform is rapidly growing, creating meaningful connections between users and local businesses across
            the country.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
