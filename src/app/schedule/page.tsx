import Image from 'next/image'
import Link from 'next/link'

// Mock data for now - this will come from a database later
const mockScheduleData = [
  {
    id: '2025-10-13',
    date: '2025-10-13',
    displayDate: 'October 13, 2025',
    liturgist: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      preferredContact: 'email' as const
    },
    notes: 'World Communion Sunday'
  },
  {
    id: '2025-10-20',
    date: '2025-10-20',
    displayDate: 'October 20, 2025',
    liturgist: null,
    notes: 'First Sunday after Harvest Festival'
  },
  {
    id: '2025-10-27',
    date: '2025-10-27',
    displayDate: 'October 27, 2025',
    liturgist: null,
    notes: 'Reformation Sunday'
  },
  {
    id: '2025-11-03',
    date: '2025-11-03',
    displayDate: 'November 3, 2025',
    liturgist: {
      id: '2',
      name: 'John Smith',
      email: 'john@example.com',
      preferredContact: 'email' as const
    }
  },
  {
    id: '2025-11-10',
    date: '2025-11-10',
    displayDate: 'November 10, 2025',
    liturgist: null,
    notes: 'Veterans Day Weekend'
  },
  {
    id: '2025-11-17',
    date: '2025-11-17',
    displayDate: 'November 17, 2025',
    liturgist: null
  },
  {
    id: '2025-11-24',
    date: '2025-11-24',
    displayDate: 'November 24, 2025',
    liturgist: {
      id: '3',
      name: 'Mary Davis',
      email: 'mary@example.com',
      preferredContact: 'phone' as const,
      phone: '707-555-0123'
    },
    notes: 'Thanksgiving Sunday'
  }
]

export default function SchedulePage() {
  const today = new Date().toISOString().split('T')[0]
  const upcomingServices = mockScheduleData.filter(service => service.date >= today)
  const pastServices = mockScheduleData.filter(service => service.date < today)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mb-4">
            <Image
              src="/logo-for-church-larger.jpg"
              alt="Ukiah United Methodist Church Logo"
              width={120}
              height={120}
              className="mx-auto rounded-full shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Liturgist Schedule
          </h1>
          <Link 
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </header>

        {/* Upcoming Services */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
            </svg>
            Upcoming Services
          </h2>
          <div className="space-y-4">
            {upcomingServices.map((service) => (
              <div 
                key={service.id}
                className={`p-4 border rounded-lg ${
                  service.liturgist 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {service.displayDate}
                    </h3>
                    {service.notes && (
                      <p className="text-sm text-gray-600 mt-1">{service.notes}</p>
                    )}
                    {service.liturgist ? (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-green-700">
                          Liturgist: {service.liturgist.name}
                        </p>
                        <p className="text-xs text-green-600">
                          Contact: {service.liturgist.email}
                          {service.liturgist.phone && ` | ${service.liturgist.phone}`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-yellow-700 mt-2">
                        No liturgist assigned
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    {service.liturgist ? (
                      <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Filled</span>
                      </div>
                    ) : (
                      <Link
                        href="/signup"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Sign Up
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Services */}
        {pastServices.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Services
            </h2>
            <div className="space-y-3">
              {pastServices.slice(-5).reverse().map((service) => (
                <div 
                  key={service.id}
                  className="p-3 border border-gray-200 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {service.displayDate}
                      </h3>
                      {service.notes && (
                        <p className="text-xs text-gray-600 mt-1">{service.notes}</p>
                      )}
                      {service.liturgist && (
                        <p className="text-sm text-gray-600 mt-1">
                          Liturgist: {service.liturgist.name}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Past
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}