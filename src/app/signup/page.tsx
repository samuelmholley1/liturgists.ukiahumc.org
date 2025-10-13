'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Mock data for now - this will come from a database later
const mockServiceDates = [
  {
    id: '2025-10-20',
    date: '2025-10-20',
    displayDate: 'October 20, 2025',
    isAvailable: true,
    notes: 'First Sunday after Harvest Festival'
  },
  {
    id: '2025-10-27',
    date: '2025-10-27',
    displayDate: 'October 27, 2025',
    isAvailable: true,
    notes: 'Reformation Sunday'
  },
  {
    id: '2025-11-03',
    date: '2025-11-03',
    displayDate: 'November 3, 2025',
    isAvailable: false,
    liturgist: {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      preferredContact: 'email' as const
    }
  },
  {
    id: '2025-11-10',
    date: '2025-11-10',
    displayDate: 'November 10, 2025',
    isAvailable: true,
    notes: 'Veterans Day Weekend'
  },
  {
    id: '2025-11-17',
    date: '2025-11-17',
    displayDate: 'November 17, 2025',
    isAvailable: true
  },
  {
    id: '2025-11-24',
    date: '2025-11-24',
    displayDate: 'November 24, 2025',
    isAvailable: true,
    notes: 'Thanksgiving Sunday'
  }
]

export default function SignupPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: 'email' as 'email' | 'phone',
    notes: ''
  })

  const handleSignup = (dateId: string) => {
    setSelectedDate(dateId)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // This would normally send data to an API
    console.log('Signup request:', { date: selectedDate, ...formData })
    alert('Thank you for signing up! You will receive a confirmation email shortly.')
    setShowForm(false)
    setSelectedDate(null)
    setFormData({ name: '', email: '', phone: '', preferredContact: 'email', notes: '' })
  }

  const selectedDateInfo = selectedDate ? mockServiceDates.find(d => d.id === selectedDate) : null

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
            Liturgist Signup
          </h1>
          <Link 
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </header>

        {!showForm ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Dates</h2>
            <div className="space-y-4">
              {mockServiceDates.map((service) => (
                <div 
                  key={service.id}
                  className={`p-4 border rounded-lg ${
                    service.isAvailable 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {service.displayDate}
                      </h3>
                      {service.notes && (
                        <p className="text-sm text-gray-600 mt-1">{service.notes}</p>
                      )}
                      {!service.isAvailable && service.liturgist && (
                        <p className="text-sm text-gray-600 mt-1">
                          Liturgist: {service.liturgist.name}
                        </p>
                      )}
                    </div>
                    <div>
                      {service.isAvailable ? (
                        <button
                          onClick={() => handleSignup(service.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Sign Up
                        </button>
                      ) : (
                        <span className="text-gray-500 font-medium">Filled</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Sign Up for {selectedDateInfo?.displayDate}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Contact Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="email"
                      checked={formData.preferredContact === 'email'}
                      onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as 'email' | 'phone' })}
                      className="mr-2"
                    />
                    Email
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="preferredContact"
                      value="phone"
                      checked={formData.preferredContact === 'phone'}
                      onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as 'email' | 'phone' })}
                      className="mr-2"
                    />
                    Phone
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requests or information..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Signup
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}