'use client'

interface StatsSectionProps {
  stats: {
    totalUsers: number
    totalBusinesses: number
    totalTransactions: number
    totalCreditsIssued: number
  }
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Growing Local Community
          </h2>
          <p className="text-xl text-gray-600">
            Real numbers from our thriving LocalConnect ecosystem
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-8 mb-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-gray-700">Active Users</div>
              <div className="text-sm text-gray-500 mt-2">
                Discovering local businesses daily
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-green-50 rounded-lg p-8 mb-4">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {stats.totalBusinesses.toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-gray-700">Local Businesses</div>
              <div className="text-sm text-gray-500 mt-2">
                Cafes, restaurants, and shops
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-50 rounded-lg p-8 mb-4">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.totalTransactions.toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-gray-700">Transactions</div>
              <div className="text-sm text-gray-500 mt-2">
                Secure blockchain payments
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-50 rounded-lg p-8 mb-4">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                ${(stats.totalCreditsIssued / 1000).toFixed(0)}K
              </div>
              <div className="text-lg font-semibold text-gray-700">Credits Issued</div>
              <div className="text-sm text-gray-500 mt-2">
                In business-specific rewards
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
