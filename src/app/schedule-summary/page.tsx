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

  const handleQuarterChange = (direction: 'prev' | 'next') => {
    if (direction === 'next' && currentQuarter === 'Q4-2025') {
      setCurrentQuarter('Q1-2026')
    } else if (direction === 'prev' && currentQuarter === 'Q1-2026') {
      setCurrentQuarter('Q4-2025')
    } else if (direction === 'prev' && currentQuarter === 'Q4-2025') {
      setCurrentQuarter('Q3-2025')
    } else if (direction === 'next' && currentQuarter === 'Q3-2025') {
      setCurrentQuarter('Q4-2025')
    }
  }

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
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Church Logo at Top */}
          <div className="flex justify-center mb-6">
            <img
              src="/logo-for-church-larger.jpg"
              alt="Ukiah United Methodist Church"
              className="w-64 md:w-80 h-auto rounded-lg shadow-lg"
            />
          </div>

          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Liturgist Schedule Summary</h1>
                <p className="text-gray-600 mt-1">Overview of liturgist positions for {currentQuarter.replace('-', ' ')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuarterChange('prev')}
                  disabled={currentQuarter === 'Q3-2025'}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    currentQuarter === 'Q3-2025'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={() => handleQuarterChange('next')}
                  disabled={currentQuarter === 'Q1-2026'}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    currentQuarter === 'Q1-2026'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{services.length}</div>
                <div className="text-sm text-blue-800">Total Services</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.liturgist).length}
                </div>
                <div className="text-sm text-green-800">Liturgists Filled</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {services.filter(s => !s.liturgist).length}
                </div>
                <div className="text-sm text-red-800">Liturgists Needed</div>
              </div>
            </div>
          </div>

          {/* Schedule List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Schedule</h2>

            <div className="space-y-3">
              {services.map((service: Service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Date */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {service.displayDate}
                    </h3>
                    {service.notes && (
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        {service.notes.includes('Christmas Eve') ? '🎄 Christmas Eve' :
                         service.notes.includes('Advent') ? '🕯️ Advent' : 'Special Service'}
                      </span>
                    )}
                  </div>

                  {/* Liturgist Positions */}
                  <div className="space-y-2">
                    {/* Main Liturgist */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Main Liturgist:</span>
                      {service.liturgist ? (
                        <span className="text-green-700 font-semibold">
                          ✅ {service.liturgist.name}
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          ❌ OPEN
                        </span>
                      )}
                    </div>

                    {/* Second Liturgist (Christmas Eve only) */}
                    {service.displayDate?.includes('Christmas Eve') && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Second Liturgist:</span>
                        {service.liturgist2 ? (
                          <span className="text-green-700 font-semibold">
                            ✅ {service.liturgist2.name}
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            ❌ OPEN
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {services.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No services found for this quarter.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="text-center text-gray-600 mt-8 text-sm">
            <p className="mb-1">
              <strong>Ukiah United Methodist Church</strong>
            </p>
            <p className="mb-1">
              270 N. Pine St., Ukiah, CA 95482 | 707.462.3360
            </p>
            <p className="text-xs">
              <a
                href="https://ukiahumc.org"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
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