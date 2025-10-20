'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Service {
  id: string
  date: string
  displayDate: string
  liturgist: any | null
  backup: any | null
  attendance: any[]
  notes?: string
}

export default function ArchivePage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArchiveServices()
  }, [])

  const fetchArchiveServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      if (data.success) {
        // Filter to only show services older than the most recent 2 Sundays
        const today = new Date()
        let mostRecentSunday = new Date(today)
        
        // Find most recent Sunday
        while (mostRecentSunday.getDay() !== 0) {
          mostRecentSunday.setDate(mostRecentSunday.getDate() - 1)
        }
        
        // Go back 2 more Sundays
        mostRecentSunday.setDate(mostRecentSunday.getDate() - 14)
        const cutoffDate = mostRecentSunday.toISOString().split('T')[0]
        
        const archivedServices = data.services.filter((s: Service) => s.date < cutoffDate)
        setServices(archivedServices.reverse()) // Most recent first
      }
    } catch (error) {
      console.error('Error fetching archive:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading archive...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Current Services
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Service Archive</h1>

        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No archived services yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service: Service) => (
              <div 
                key={service.id}
                className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {service.displayDate}
                  </h3>
                  {service.notes && (
                    <p className="text-sm text-gray-600 mt-1">{service.notes}</p>
                  )}
                </div>

                {/* Liturgist Section */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Main Liturgist</h4>
                  {service.liturgist ? (
                    <div>
                      <p className="font-medium text-blue-700">{service.liturgist.name}</p>
                      <p className="text-sm text-blue-600">{service.liturgist.email}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No one signed up</p>
                  )}
                </div>

                {/* Backup Section */}
                <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Backup Liturgist</h4>
                  {service.backup ? (
                    <div>
                      <p className="font-medium text-orange-700">{service.backup.name}</p>
                      <p className="text-sm text-orange-600">{service.backup.email}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No one signed up</p>
                  )}
                </div>

                {/* Attendance Section */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Church Attendance</h4>
                  {service.attendance.length > 0 ? (
                    <ul className="space-y-1">
                      {service.attendance.map((person: any, index: number) => (
                        <li key={index} className="flex items-center text-green-700">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {person.name} ({person.status})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No attendance responses</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
