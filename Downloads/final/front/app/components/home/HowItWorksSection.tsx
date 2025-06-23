'use client'

import { MapPin, CreditCard, Gift, Users } from 'lucide-react'

export default function HowItWorksSection() {
  const steps = [
    {
      icon: MapPin,
      title: "Discover Local Businesses",
      description: "Use our interactive map to find businesses near you. Each business has its own unique credit system and rewards program.",
      color: "text-blue-600"
    },
    {
      icon: CreditCard,
      title: "Earn Business Credits",
      description: "Make purchases and interact with businesses to earn their specific credits. Each business sets its own credit value and earning rules.",
      color: "text-green-600"
    },
    {
      icon: Gift,
      title: "Redeem Exclusive Rewards",
      description: "Use your earned credits to unlock exclusive deals, discounts, and special offers from your favorite local businesses.",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "Build Community",
      description: "Connect with other locals, share experiences, and help build a stronger community through meaningful business relationships.",
      color: "text-orange-600"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform makes it simple to discover, engage with, and support local businesses 
            while earning rewards for your loyalty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                {/* Step Number */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Powered by Blockchain Technology
          </h3>
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
            All transactions and credit systems are secured by blockchain technology, ensuring 
            transparency, security, and trust between businesses and customers.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="bg-white px-4 py-2 rounded-full">🔒 Secure Transactions</span>
            <span className="bg-white px-4 py-2 rounded-full">🌐 Decentralized</span>
            <span className="bg-white px-4 py-2 rounded-full">📊 Transparent</span>
            <span className="bg-white px-4 py-2 rounded-full">⚡ Fast Payments</span>
          </div>
        </div>
      </div>
    </section>
  )
}
