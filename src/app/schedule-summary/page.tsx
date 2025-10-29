'use client'

import { useState, useEffect } from 'react'
import PasswordGate from '@/components/PasswordGate'

interface Service {
  id: string
  date: string
  displayDate: string
  liturgist: any | null
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
    const quarters = ['Q3-2025', 'Q4-2025', 'Q1-2026']
    const currentIndex = quarters.indexOf(currentQuarter)
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentQuarter(quarters[currentIndex - 1])
    } else if (direction === 'next' && currentIndex < quarters.length - 1) {
      setCurrentQuarter(quarters[currentIndex + 1])
    }
  }

  if (loading) {
    return (
      <PasswordGate>
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </PasswordGate>
    )
  }

  return (
    <PasswordGate>
      <main className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Liturgist Schedule - {currentQuarter}</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuarterChange('prev')}
                disabled={currentQuarter === 'Q3-2025'}
                className={`px-3 py-1 text-sm rounded ${
                  currentQuarter === 'Q3-2025'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                ← Prev
              </button>
              <button
                onClick={() => handleQuarterChange('next')}
                disabled={currentQuarter === 'Q1-2026'}
                className={`px-3 py-1 text-sm rounded ${
                  currentQuarter === 'Q1-2026'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Simple Spreadsheet Table */}
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2 text-left font-semibold text-gray-900">Date</th>
                <th className="border border-gray-400 px-4 py-2 text-left font-semibold text-gray-900">Liturgist</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr key={service.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-400 px-4 py-2 text-gray-900">
                    {service.displayDate}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 text-gray-900">
                    {service.liturgist ? service.liturgist.name : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </PasswordGate>
  )
}