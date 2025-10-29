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
      <div className="fixed inset-0 bg-white overflow-auto">
        <main className="min-h-screen p-8">
          <div className="max-w-[1400px] mx-auto">
          {/* Minimal Header */}
          <div className="flex items-center justify-between mb-8 print:mb-6">
            <div className="flex items-center gap-4">
              <img
                src="/logo-for-church-larger.jpg"
                alt="Ukiah United Methodist Church"
                className="w-20 h-20 rounded"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Liturgist Schedule</h1>
                <p className="text-lg text-gray-600">{currentQuarter.replace('-', ' ')}</p>
              </div>
            </div>

            {/* Compact Navigation */}
            <div className="flex gap-2 print:hidden">
              <button
                onClick={() => handleQuarterChange('prev')}
                disabled={currentQuarter === 'Q3-2025'}
                className={`p-2 rounded ${
                  currentQuarter === 'Q3-2025'
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                ←
              </button>
              <button
                onClick={() => handleQuarterChange('next')}
                disabled={currentQuarter === 'Q1-2026'}
                className={`p-2 rounded ${
                  currentQuarter === 'Q1-2026'
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                →
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center gap-8 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-blue-600">{services.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Filled:</span>
              <span className="text-2xl font-bold text-green-600">{services.filter(s => s.liturgist).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Needed:</span>
              <span className="text-2xl font-bold text-red-600">{services.filter(s => !s.liturgist).length}</span>
            </div>
          </div>

          {/* Spreadsheet Grid */}
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(servicesByMonth).map(([monthKey, monthServices]) => {
              const monthDate = new Date(monthKey + '-01')
              const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

              return (
                <div key={monthKey} className="border-2 border-gray-400">
                  {/* Month Header */}
                  <div className="bg-gray-800 text-white px-3 py-2 border-b-2 border-gray-400">
                    <h2 className="text-center font-bold text-base">{monthName}</h2>
                  </div>

                  {/* Column Headers */}
                  <div className="bg-gray-300 border-b-2 border-gray-400 grid grid-cols-[100px_1fr] font-bold text-xs">
                    <div className="px-3 py-2 border-r-2 border-gray-400">DATE</div>
                    <div className="px-3 py-2">LITURGIST</div>
                  </div>

                  {/* Data Rows */}
                  {monthServices.map((service: Service, index: number) => (
                    <div key={service.id}>
                      {/* Main Row */}
                      <div
                        className={`grid grid-cols-[100px_1fr] border-b border-gray-300 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                        }`}
                      >
                        <div className="px-3 py-2 border-r border-gray-300 font-medium text-sm flex items-center gap-1">
                          {new Date(service.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                          {service.notes && (
                            <span className="text-xs" title={service.notes}>
                              {service.notes.includes('Christmas Eve') ? '🎄' :
                               service.notes.includes('Advent') ? '🕯️' : ''}
                            </span>
                          )}
                        </div>
                        <div className="px-3 py-2 text-sm">
                          {service.liturgist ? (
                            <span className="font-medium text-gray-900">
                              {service.liturgist.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-xs">—</span>
                          )}
                        </div>
                      </div>

                      {/* Second Liturgist Row (Christmas Eve) */}
                      {service.displayDate?.includes('Christmas Eve') && (
                        <div
                          className={`grid grid-cols-[100px_1fr] border-b border-gray-300 ${
                            index % 2 === 0 ? 'bg-amber-50' : 'bg-amber-100'
                          }`}
                        >
                          <div className="px-3 py-1.5 border-r border-gray-300 text-xs text-gray-600 italic">
                            (2nd Lit.)
                          </div>
                          <div className="px-3 py-1.5 text-sm">
                            {service.liturgist2 ? (
                              <span className="font-medium text-gray-900">
                                {service.liturgist2.name}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-xs">—</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t-2 border-gray-300 flex justify-between items-center text-xs text-gray-600">
            <div>
              <strong>Ukiah United Methodist Church</strong> • 270 N. Pine St., Ukiah, CA 95482 • 707.462.3360
            </div>
            <div>
              "—" = Help Needed
            </div>
          </div>
        </div>
        </main>
      </div>
    </PasswordGate>
  )
}