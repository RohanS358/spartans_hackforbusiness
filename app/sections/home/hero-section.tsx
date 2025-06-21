import { Button } from "@/components/ui/button"
import { MapPin, Smartphone, Shield } from "lucide-react"
import RotatingMap from "./rotating-map"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
      {/* Rotating Map Background */}
      <div className="absolute inset-0 opacity-10">
        <RotatingMap />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Discover Local
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}
                Businesses
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Connect with verified local shops, cafes, and service providers through our innovative map-based platform.
              Build real relationships while earning exclusive rewards and benefits.
            </p>
          </div>

          {/* Key Features Pills */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Map-Based Discovery</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span className="font-medium">PWA Support</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="font-medium">Blockchain Secured</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Start Exploring
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/80 backdrop-blur-sm">
              For Businesses
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8">
            <p className="text-sm text-gray-500 mb-4">Trusted by local communities</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">50K+</div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-2xl font-bold text-gray-400">1.2K+</div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-2xl font-bold text-gray-400">25+</div>
            </div>
            <div className="flex justify-center items-center gap-8 text-xs text-gray-400 mt-2">
              <span>Active Users</span>
              <span>Businesses</span>
              <span>Cities</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
