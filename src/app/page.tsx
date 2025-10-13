'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

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
    backup: null,
    attendance: [
      { name: 'John Doe', status: 'yes' },
      { name: 'Mary Smith', status: 'maybe' }
    ],
    notes: 'World Communion Sunday'
  },
  {
    id: '2025-10-20',
    date: '2025-10-20',
    displayDate: 'October 20, 2025',
    liturgist: null,
    backup: null,
    attendance: [],
    notes: 'First Sunday after Harvest Festival'
  },
  {
    id: '2025-10-27',
    date: '2025-10-27',
    displayDate: 'October 27, 2025',
    liturgist: null,
    backup: null,
    attendance: [],
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
    },
    backup: {
      id: '3',
      name: 'Alice Brown',
      email: 'alice@example.com',
      preferredContact: 'email' as const
    },
    attendance: [
      { name: 'Bob Wilson', status: 'yes' },
      { name: 'Carol Davis', status: 'no' }
    ]
  },
  {
    id: '2025-11-10',
    date: '2025-11-10',
    displayDate: 'November 10, 2025',
    liturgist: null,
    backup: null,
    attendance: [],
    notes: 'Veterans Day Weekend'
  },
  {
    id: '2025-11-17',
    date: '2025-11-17',
    displayDate: 'November 17, 2025',
    liturgist: null,
    backup: null,
    attendance: []
  },
  {
    id: '2025-11-24',
    date: '2025-11-24',
    displayDate: 'November 24, 2025',
    liturgist: {
      id: '4',
      name: 'Mary Davis',
      email: 'mary@example.com',
      preferredContact: 'phone' as const,
      phone: '707-555-0123'
    },
    backup: null,
    attendance: [],
    notes: 'Thanksgiving Sunday'
  }
]

// Generate calendar data for the current and next month
const generateCalendarData = () => {
  // Use a fixed date to avoid server/client hydration mismatches
  const today = new Date('2025-10-13') // Current date from context
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()
  
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    const dateString = date.toISOString().split('T')[0]
    const hasService = mockScheduleData.find(s => s.date === dateString)
    
    calendarDays.push({
      day,
      date: dateString,
      isToday: dateString === '2025-10-13', // Fixed today date
      isSunday: date.getDay() === 0,
      hasService: !!hasService,
      serviceData: hasService
    })
  }
  
  return {
    monthName: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    days: calendarDays
  }
}

export default function Home() {
  const [hoveredService, setHoveredService] = useState<string | null>(null)
  const [selectedSignup, setSelectedSignup] = useState<{serviceId: string, type: 'liturgist' | 'backup' | 'attendance'} | null>(null)
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    attendanceStatus: 'yes'
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Add scroll behavior to highlight service when scrolling
  const scrollToService = (serviceId: string) => {
    // Only run on client side
    if (isClient && typeof window !== 'undefined') {
      const element = document.getElementById(`service-${serviceId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHoveredService(serviceId)
        setTimeout(() => setHoveredService(null), 2000)
      }
    }
  }

  const today = '2025-10-13' // Fixed date to avoid hydration issues
  const upcomingServices = mockScheduleData.filter(service => service.date >= today)
  const calendarData = generateCalendarData()

  const handleSignup = (serviceId: string, type: 'liturgist' | 'backup' | 'attendance') => {
    setSelectedSignup({ serviceId, type })
  }

  const handleSubmitSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // This would normally send data to an API
    console.log('Signup request:', { ...selectedSignup, ...signupForm })
    alert('Thank you for signing up! You will receive a confirmation email shortly.')
    setSelectedSignup(null)
    setSignupForm({ name: '', email: '', phone: '', attendanceStatus: 'yes' })
  }

  const selectedService = selectedSignup ? mockScheduleData.find(s => s.id === selectedSignup.serviceId) : null

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Pinned Calendar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo-for-church-larger.jpg"
                alt="Ukiah United Methodist Church Logo"
                width={60}
                height={60}
                className="rounded-full shadow-sm"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Liturgist Schedule</h1>
                <p className="text-sm text-blue-600">{calendarData.monthName}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium text-gray-600 py-1">
                {day}
              </div>
            ))}
            {calendarData.days.map((day, index) => (
              <div
                key={index}
                className={`text-center py-1 rounded transition-colors ${
                  !day ? '' :
                  day.isToday ? 'bg-blue-600 text-white font-bold' :
                  day.isSunday && day.hasService ? (
                    hoveredService === day.serviceData?.id ? 'bg-yellow-300 font-bold border border-yellow-500' : 'bg-green-100 font-medium cursor-pointer hover:bg-green-200'
                  ) :
                  day.isSunday ? 'bg-orange-100 font-medium' :
                  'text-gray-600'
                }`}
                title={day?.isSunday && day?.hasService ? `Service on ${day.serviceData?.displayDate}` : ''}
                onClick={day?.hasService && isClient ? () => scrollToService(day.serviceData!.id) : undefined}
              >
                {day?.day || ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-40 container mx-auto px-4 py-8 max-w-4xl">
        {/* Signup Modal */}
        {selectedSignup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Sign up for {selectedService?.displayDate}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedSignup.type === 'liturgist' && 'Sign up to be the main liturgist'}
                {selectedSignup.type === 'backup' && 'Sign up to be the backup liturgist'}
                {selectedSignup.type === 'attendance' && 'Let us know if you plan to be in church'}
              </p>
              
              <form onSubmit={handleSubmitSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedSignup.type === 'attendance' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Will you be in church this Sunday?
                    </label>
                    <select
                      value={signupForm.attendanceStatus}
                      onChange={(e) => setSignupForm({ ...signupForm, attendanceStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="maybe">I don't know</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSignup(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upcoming Services */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
            </svg>
            Upcoming Services
          </h2>
          <div className="space-y-6">
            {upcomingServices.map((service) => (
              <div 
                key={service.id}
                id={`service-${service.id}`}
                className={`p-6 border rounded-lg transition-all duration-300 ${
                  hoveredService === service.id 
                    ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
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
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-blue-700">{service.liturgist.name}</p>
                        <p className="text-sm text-blue-600">{service.liturgist.email}</p>
                      </div>
                      <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Filled</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignup(service.id, 'liturgist')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign Up to be Main Liturgist
                    </button>
                  )}
                </div>

                {/* Backup Section */}
                <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Backup Liturgist</h4>
                  {service.backup ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-orange-700">{service.backup.name}</p>
                        <p className="text-sm text-orange-600">{service.backup.email}</p>
                      </div>
                      <div className="flex items-center text-green-600">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Filled</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignup(service.id, 'backup')}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Sign Up to be Backup Liturgist
                    </button>
                  )}
                </div>

                {/* Attendance Section */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">Church Attendance</h4>
                    <button
                      onClick={() => handleSignup(service.id, 'attendance')}
                      className="bg-green-600 text-white py-1 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Update Status
                    </button>
                  </div>
                  {service.attendance.length > 0 ? (
                    <div className="text-sm space-y-1">
                      {service.attendance.map((person, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-green-700">{person.name}</span>
                          <span className={`capitalize ${
                            person.status === 'yes' ? 'text-green-600' :
                            person.status === 'no' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {person.status === 'maybe' ? 'unsure' : person.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No attendance responses yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">What Does a Liturgist Do?</h3>
          <div className="prose prose-blue max-w-none text-sm">
            <p className="text-gray-600 mb-4">
              As a liturgist, you'll help lead our congregation in worship by:
            </p>
            <ul className="text-gray-600 space-y-1 mb-4 text-sm">
              <li>• Reading the Call to Worship</li>
              <li>• Leading the Responsive Reading</li>
              <li>• Reading the Scripture lesson(s)</li>
              <li>• Assisting with other liturgical elements as needed</li>
            </ul>
            <p className="text-gray-600 text-sm">
              The bulletin and readings will be provided to you in advance. 
              If you have any questions, please contact the church office.
            </p>
          </div>
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
  )
}