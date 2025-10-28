'use client'

import { useState, useEffect } from 'react'
import PasswordGate from '@/components/PasswordGate'

interface Service {
  id: string
  date: string
  displayDate: string
  liturgist: any | null
  liturgist2?: any | null
  backup: any | null
  attendance: any[]
  notes?: string
}

export default function ScheduleSummary() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuarter, setCurrentQuarter] = useState('Q4-2025')

  useEffect(() => {
    fetchServices()
  }, [currentQuarter])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/services?quarter=${currentQuarter}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      if (data.success) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group services by month
  const groupServicesByMonth = (services: Service[]) => {
    const months: { [key: string]: Service[] } = {}
    services.forEach(service => {
      const date = new Date(service.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!months[monthKey]) months[monthKey] = []
      months[monthKey].push(service)
    })
    return months
  }

  const handleQuarterChange = (direction: 'prev' | 'next') => {
    const quarters = ['Q3-2025', 'Q4-2025', 'Q1-2026']
    const currentIndex = quarters.indexOf(currentQuarter)
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentQuarter(quarters[currentIndex - 1])
    } else if (direction === 'next' && currentIndex < quarters.length - 1) {
      setCurrentQuarter(quarters[currentIndex + 1])
    }
  }

  const servicesByMonth = groupServicesByMonth(services)

  if (loading) {
    return (
      <PasswordGate>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading schedule summary...</p>
          </div>
        </main>
      </PasswordGate>
    )
  }

  return (
    <PasswordGate>
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header - Compact */}
          <div className="text-center mb-6">
            <img
              src="/logo-for-church-larger.jpg"
              alt="Ukiah United Methodist Church"
              className="w-48 mx-auto mb-4 rounded-lg shadow-sm"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Liturgist Schedule Summary</h1>
            <p className="text-lg text-blue-600 font-medium">{currentQuarter.replace('-', ' ')}</p>
          </div>          {/* Navigation - Compact */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => handleQuarterChange('prev')}
              disabled={currentQuarter === 'Q3-2025'}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentQuarter === 'Q3-2025'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
              aria-label="Previous quarter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={() => handleQuarterChange('next')}
              disabled={currentQuarter === 'Q1-2026'}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                currentQuarter === 'Q1-2026'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
              aria-label="Next quarter"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Summary Stats - Compact */}
          <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-700" aria-label={`${services.length} total services`}>
                {services.length}
              </div>
              <div className="text-xs text-blue-600 font-medium">Services</div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-700" aria-label={`${services.filter(s => s.liturgist).length} liturgists filled`}>
                {services.filter(s => s.liturgist).length}
              </div>
              <div className="text-xs text-green-600 font-medium">Filled</div>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-700" aria-label={`${services.filter(s => !s.liturgist).length} liturgists needed`}>
                {services.filter(s => !s.liturgist).length}
              </div>
              <div className="text-xs text-red-600 font-medium">Needed</div>
            </div>
          </div>

          {/* Monthly Grid Layout - Spreadsheet Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(servicesByMonth).map(([monthKey, monthServices]) => {
              const monthDate = new Date(monthKey + '-01')
              const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

              return (
                <div key={monthKey} className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                  {/* Month Header */}
                  <div className="bg-gray-200 border-b-2 border-gray-300 px-4 py-3">
                    <h2 className="text-lg font-bold text-gray-800 text-center">
                      {monthName}
                    </h2>
                  </div>

                  {/* Table Header */}
                  <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 grid grid-cols-2 gap-4">
                    <div className="text-xs font-bold text-gray-700">Date</div>
                    <div className="text-xs font-bold text-gray-700">Liturgist</div>
                  </div>

                  {/* Service Rows */}
                  <div className="divide-y divide-gray-200">
                    {monthServices.map((service: Service, index: number) => (
                      <div key={service.id}>
                        {/* Main Liturgist Row */}
                        <div
                          className={`px-4 py-3 grid grid-cols-2 gap-4 items-center ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                          role="row"
                          aria-label={`Service on ${service.displayDate}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 text-sm">
                              {new Date(service.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            {service.notes && (
                              <span
                                className="text-xs"
                                aria-label={service.notes}
                                title={service.notes}
                              >
                                {service.notes.includes('Christmas Eve') ? '🎄' :
                                 service.notes.includes('Advent') ? '🕯️' : '⭐'}
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            {service.liturgist ? (
                              <span
                                className="text-gray-700"
                                aria-label={`Filled by ${service.liturgist.name}`}
                              >
                                {service.liturgist.name.split(' ')[0]} {service.liturgist.name.split(' ').slice(-1)[0]}
                              </span>
                            ) : (
                              <span
                                className="text-gray-400 italic"
                                aria-label="Position available"
                              >
                                {/* Empty cell for vacant position */}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Second Liturgist Row for Christmas Eve */}
                        {service.displayDate?.includes('Christmas Eve') && (
                          <div
                            className={`px-4 py-2 grid grid-cols-2 gap-4 items-center border-l-4 border-amber-400 ${
                              index % 2 === 0 ? 'bg-amber-25' : 'bg-amber-50'
                            }`}
                            role="row"
                            aria-label="Second liturgist position"
                          >
                            <div className="text-xs text-gray-600 pl-4">
                              Second Liturgist
                            </div>
                            <div className="text-sm">
                              {service.liturgist2 ? (
                                <span
                                  className="text-gray-700"
                                  aria-label={`Second liturgist: ${service.liturgist2.name}`}
                                >
                                  {service.liturgist2.name.split(' ')[0]} {service.liturgist2.name.split(' ').slice(-1)[0]}
                                </span>
                              ) : (
                                <span
                                  className="text-gray-400 italic"
                                  aria-label="Second liturgist position available"
                                >
                                  {/* Empty cell for vacant second position */}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend - Updated for Spreadsheet Style */}
          <div className="mt-6 bg-gray-100 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-gray-800 mb-2 text-center">Legend</h3>
            <div className="flex justify-center gap-6 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-white border border-gray-300"></div>
                <span className="text-gray-700">Filled</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-50 border border-gray-300"></div>
                <span className="text-gray-700">Empty = Needed</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-amber-700">🕯️</span>
                <span className="text-gray-700">Advent</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-amber-700">🎄</span>
                <span className="text-gray-700">Christmas</span>
              </div>
            </div>
          </div>

          {/* Footer - Compact */}
          <footer className="text-center text-gray-600 mt-6 text-xs">
            <p className="mb-1">
              <strong>Ukiah United Methodist Church</strong>
            </p>
            <p className="mb-1">
              270 N. Pine St., Ukiah, CA 95482 | 707.462.3360
            </p>
            <p>
              <a
                href="https://ukiahumc.org"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit church website"
              >
                ukiahumc.org
              </a>
            </p>
          </footer>
        </div>
      </main>
    </PasswordGate>
  )
}