import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Download, Store } from "lucide-react"

export default function CTASection() {
  return (
    <section id="businesses" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Discover Your Local Community?</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Join thousands of users who are already building meaningful relationships with local businesses and earning
            exclusive rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* For Users */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Users</h3>
              <p className="text-lg opacity-90 mb-6">
                Start exploring local businesses, earning credits, and unlocking exclusive rewards today.
              </p>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* For Businesses */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">For Businesses</h3>
              <p className="text-lg opacity-90 mb-6">
                Join our platform to create your own credit system and build lasting customer relationships.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Partner With Us
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* App Download */}
        <div className="text-center">
          <p className="text-white/80 mb-6">Available as a Progressive Web App (PWA)</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Download className="w-5 h-5 mr-2" />
              Install PWA
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
