import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, Coffee, Wrench, ShoppingBag, Utensils, Car } from "lucide-react"

export default function ServicesSection() {
  const services = [
    {
      icon: Store,
      title: "Retail Shops",
      description: "Discover local boutiques, bookstores, and specialty retailers",
      benefits: ["Exclusive discounts", "Early access", "Member pricing"],
    },
    {
      icon: Coffee,
      title: "Cafes & Restaurants",
      description: "Find the best local dining and coffee experiences",
      benefits: ["Loyalty points", "Free items", "VIP seating"],
    },
    {
      icon: Wrench,
      title: "Service Providers",
      description: "Connect with trusted local professionals and contractors",
      benefits: ["Priority booking", "Service credits", "Referral rewards"],
    },
    {
      icon: ShoppingBag,
      title: "Markets & Grocers",
      description: "Support local farmers markets and independent grocers",
      benefits: ["Fresh deals", "Bulk discounts", "Seasonal offers"],
    },
    {
      icon: Utensils,
      title: "Food Trucks",
      description: "Track and support mobile food vendors in your area",
      benefits: ["Location alerts", "Pre-orders", "Combo deals"],
    },
    {
      icon: Car,
      title: "Automotive Services",
      description: "Find reliable local mechanics and car service providers",
      benefits: ["Service history", "Maintenance credits", "Emergency priority"],
    },
  ]

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Supporting Every Type of Local Business</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform serves a diverse ecosystem of local businesses, each with customized credit systems and unique
            rewards programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                    <service.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">{service.title}</CardTitle>
                </div>
                <p className="text-gray-600">{service.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">Available Benefits:</p>
                  <div className="flex flex-wrap gap-2">
                    {service.benefits.map((benefit, benefitIndex) => (
                      <Badge key={benefitIndex} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
