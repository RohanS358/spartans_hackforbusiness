'use client'

export default function FeaturesSection() {
  const features = [
    {
      icon: '🗺️',
      title: 'Map-Based Discovery',
      description: 'Find local businesses around you with our interactive map. Each business appears as a verified spot with real-time information.'
    },
    {
      icon: '🎯',
      title: 'Business-Specific Credits',
      description: 'Each business has its own credit system. Buy credits at your favorite coffee shop and use them for exclusive perks and discounts.'
    },
    {
      icon: '🏆',
      title: 'Loyalty Rewards',
      description: 'Earn membership levels (Bronze, Silver, Gold, Platinum) at each business. The more you engage, the better the rewards.'
    },
    {
      icon: '⛓️',
      title: 'Blockchain Security',
      description: 'All transactions are recorded on blockchain for transparency, security, and trust between users and businesses.'
    },
    {
      icon: '📱',
      title: 'PWA Experience',
      description: 'Use our app across all devices with offline support. Even make transactions at the business location without internet.'
    },
    {
      icon: '💳',
      title: 'Seamless Payments',
      description: 'Direct wallet payments or credit spending. QR code transactions make in-store purchases quick and secure.'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose LocalConnect?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing how communities connect with local businesses through 
            personalized credit systems and blockchain-powered trust.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
