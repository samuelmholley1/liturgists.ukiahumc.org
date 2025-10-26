'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import PasswordGate from '@/components/PasswordGate'
import { getAllLiturgists } from '@/admin/liturgists'
import { reportError } from '@/lib/errorReporting'

// App version for cache busting - increment when you make changes
const APP_VERSION = '2.2.0'

interface Service {
  id: string
  date: string
  displayDate: string
  liturgist: any | null
  backup: any | null
  attendance: any[]
  notes?: string
}

// Generate calendar data for a specific month
const generateCalendarData = (services: Service[], mainServiceDate: string, month: number, year: number) => {
  // Use Pacific Time for today check
  const now = new Date()
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const todayString = pacificTime.toISOString().split('T')[0]
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()
  
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null)
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateString = date.toISOString().split('T')[0]
    const hasService = services.find((s: Service) => s.date === dateString)
    
    calendarDays.push({
      day,
      date: dateString,
      isToday: dateString === todayString,
      isMainService: dateString === mainServiceDate,
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
  const [selectedSignup, setSelectedSignup] = useState<{serviceId: string} | null>(null)
  const [signupForm, setSignupForm] = useState({
    selectedPerson: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'liturgist' as 'liturgist' | 'backup'
  })
  const [isClient, setIsClient] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(true)
  const [currentQuarter, setCurrentQuarter] = useState('Q4-2025')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return { month: today.getMonth(), year: today.getFullYear() }
  })
  
  // Calculate current quarter dynamically
  const getCurrentQuarter = () => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    
    if (month >= 0 && month <= 2) return `Q1-${year}`
    if (month >= 3 && month <= 5) return `Q2-${year}`
    if (month >= 6 && month <= 8) return `Q3-${year}`
    return `Q4-${year}`
  }
  
  const CURRENT_QUARTER = getCurrentQuarter()
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'confirm'
    title: string
    message: string
    onConfirm?: () => void
  } | null>(null)
  
  const liturgists = getAllLiturgists()
  
  // Check if viewing a locked future quarter
  const isLockedQuarter = currentQuarter === 'Q1-2026'

  useEffect(() => {
    setIsClient(true)
    
    // Check version and force reload if outdated
    const storedVersion = localStorage.getItem('appVersion')
    if (storedVersion && storedVersion !== APP_VERSION) {
      console.log('New version detected, clearing cache and reloading...')
      localStorage.setItem('appVersion', APP_VERSION)
      // Unregister service worker and reload
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister())
        }).then(() => {
          window.location.reload()
        })
      } else {
        window.location.reload()
      }
      return
    } else if (!storedVersion) {
      localStorage.setItem('appVersion', APP_VERSION)
    }
    
    fetchServices()
    
    // Auto-refresh every 5 seconds for real-time updates (only for current unlocked quarter)
    const intervalId = setInterval(() => {
      if (!isLockedQuarter) {
        fetchServices(true) // Silent refresh
      }
    }, 5000) // 5 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [currentQuarter, isLockedQuarter])

  const fetchServices = async (silent = false) => {
    if (!silent) {
      setRefreshing(true)
    }
    
    try {
      const response = await fetch(`/api/services?quarter=${currentQuarter}`, {
        cache: 'no-store', // Prevent caching
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      if (data.success) {
        setServices(data.services)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      
      // Report error to admin
      await reportError(error, {
        action: 'Fetch Services',
        serviceDate: currentQuarter
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  const handleQuarterChange = (direction: 'prev' | 'next') => {
    // Close any open signup modal when changing quarters (prevent state leak)
    setSelectedSignup(null)
    setSignupForm({
      selectedPerson: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'liturgist'
    })
    
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
  
  const handleCalendarMonthChange = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      if (direction === 'next') {
        if (prev.month === 11) {
          return { month: 0, year: prev.year + 1 }
        }
        return { month: prev.month + 1, year: prev.year }
      } else {
        if (prev.month === 0) {
          return { month: 11, year: prev.year - 1 }
        }
        return { month: prev.month - 1, year: prev.year }
      }
    })
  }

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

  const today = new Date().toISOString().split('T')[0]
  
  // Determine the "main" service based on Pacific Time
  // If before 6am Monday PT, highlight last Sunday. Otherwise, highlight next Sunday.
  const getMainServiceDate = () => {
    const now = new Date()
    // Convert to Pacific Time
    const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const dayOfWeek = pacificTime.getDay()
    const hour = pacificTime.getHours()
    
    // If it's Monday (1) and before 6am, use yesterday (Sunday)
    if (dayOfWeek === 1 && hour < 6) {
      const yesterday = new Date(pacificTime)
      yesterday.setDate(yesterday.getDate() - 1)
      const year = yesterday.getFullYear()
      const month = String(yesterday.getMonth() + 1).padStart(2, '0')
      const day = String(yesterday.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    // Otherwise find the next Sunday
    let nextSunday = new Date(pacificTime)
    while (nextSunday.getDay() !== 0) {
      nextSunday.setDate(nextSunday.getDate() + 1)
    }
    const year = nextSunday.getFullYear()
    const month = String(nextSunday.getMonth() + 1).padStart(2, '0')
    const day = String(nextSunday.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const mainServiceDate = getMainServiceDate()
  const calendarData = generateCalendarData(services, mainServiceDate, calendarMonth.month, calendarMonth.year)

  const handleSignup = (serviceId: string, preferredRole?: 'liturgist' | 'backup') => {
    const service = services.find(s => s.id === serviceId)
    
    // Determine which role to sign up for
    let roleToSignup: 'liturgist' | 'backup' = preferredRole || 'liturgist'
    
    // If preferred role is already taken, switch to the other
    if (roleToSignup === 'liturgist' && service?.liturgist) {
      roleToSignup = 'backup'
    } else if (roleToSignup === 'backup' && service?.backup) {
      roleToSignup = 'liturgist'
    }
    
    // Check if both roles are taken
    if (service?.liturgist && service?.backup) {
      setModalState({
        isOpen: true,
        type: 'warning',
        title: 'Service Full',
        message: 'Both the Main Liturgist and Backup positions are filled for this service. Please choose a different Sunday.'
      })
      return
    }
    
    setSignupForm(prev => ({ ...prev, role: roleToSignup }))
    setSelectedSignup({ serviceId })
  }

  const handleCancelSignup = async (recordId: string, personName: string, displayDate: string, role: string) => {
    // Show confirmation modal with person's name
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Cancel Signup',
      message: `Are you sure you want to cancel ${personName}'s ${role} signup for ${displayDate}?`,
      onConfirm: async () => {
        setModalState(null)
        
        try {
          const response = await fetch(`/api/signup?recordId=${recordId}`, {
            method: 'DELETE',
          })

          const data = await response.json()

          if (response.ok) {
            setModalState({
              isOpen: true,
              type: 'success',
              title: 'Cancelled Successfully',
              message: `${personName}'s signup has been cancelled.`
            })
            // Refresh services to show updated availability
            await fetchServices()
          } else {
            setModalState({
              isOpen: true,
              type: 'error',
              title: 'Cancellation Failed',
              message: data.error || 'Failed to cancel signup. Please try again.'
            })
          }
        } catch (error) {
          console.error('Error cancelling signup:', error)
          
          // Report error to admin
          await reportError(error, {
            userName: personName,
            serviceDate: displayDate,
            action: 'Cancel Signup'
          })
          
          setModalState({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'An error occurred while cancelling the signup. Please try again.'
          })
        }
      }
    })
  }
  
  // Handle person selection from dropdown
  const handlePersonSelect = (personName: string) => {
    setSignupForm(prev => ({ ...prev, selectedPerson: personName }))
    
    if (personName !== 'other') {
      const liturgist = liturgists.find(l => l.name === personName)
      if (liturgist) {
        setSignupForm(prev => ({
          ...prev,
          email: liturgist.email,
          phone: '', // We don't have phone in the liturgist data
          firstName: '',
          lastName: ''
        }))
      }
    } else {
      // Clear fields for "other"
      setSignupForm(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      }))
    }
  }

    const handleSubmitSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSignup || isSubmitting) return

    const service = services.find((s: Service) => s.id === selectedSignup.serviceId)
    if (!service) return
    
    // Determine the name based on selection
    let fullName = ''
    if (signupForm.selectedPerson === 'other') {
      fullName = `${signupForm.firstName} ${signupForm.lastName}`.trim()
    } else {
      fullName = signupForm.selectedPerson
    }

    // Validate name is not empty (CRITICAL: prevents spaces-only names)
    if (!fullName || fullName.trim().length === 0) {
      setModalState({
        isOpen: true,
        type: 'warning',
        title: 'Name Required',
        message: 'Please enter a valid name before submitting.'
      })
      return
    }

    // Enhanced email validation (reject trailing dots, invalid domains)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRegex.test(signupForm.email) || signupForm.email.endsWith('.')) {
      setModalState({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Email',
        message: 'Please enter a valid email address before submitting.'
      })
      return
    }

    // Phone number validation (optional field, but must be valid format if provided)
    if (signupForm.phone && signupForm.phone.trim().length > 0) {
      const phoneRegex = /^[\d\s\-\(\)\+\.]+$/
      if (!phoneRegex.test(signupForm.phone)) {
        setModalState({
          isOpen: true,
          type: 'warning',
          title: 'Invalid Phone Number',
          message: 'Please enter a valid phone number (digits, spaces, dashes, and parentheses only).'
        })
        return
      }
      // Ensure at least 10 digits for US phone numbers
      const digitsOnly = signupForm.phone.replace(/\D/g, '')
      if (digitsOnly.length < 10) {
        setModalState({
          isOpen: true,
          type: 'warning',
          title: 'Incomplete Phone Number',
          message: 'Please enter a complete phone number with at least 10 digits.'
        })
        return
      }
    }

    // Prevent double submission
    setIsSubmitting(true)

    // Submit to Airtable via API
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceDate: service.date,
          displayDate: service.displayDate,
          name: fullName,
          email: signupForm.email,
          phone: signupForm.phone || '',
          role: signupForm.role === 'liturgist' ? 'Liturgist' : 'Backup',
          attendanceStatus: '', // No longer used
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Success message includes role and date, and any special notes
        const roleLabel = signupForm.role === 'liturgist' ? 'Main Liturgist' : 'Backup'
        const specialNote = service.notes ? `\n\n${service.notes}` : ''
        
        // Close modal first
        setSelectedSignup(null)
        setSignupForm({
          selectedPerson: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'liturgist'
        })
        
        // Show success modal
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Signup Successful!',
          message: `Thank you! You are signed up as ${roleLabel} for ${service.displayDate}.${specialNote}`
        })
        
        // Force immediate refresh to show updated data
        await fetchServices()
        
        // Refresh again after 1 second to ensure Airtable sync
        setTimeout(() => {
          fetchServices(true)
        }, 1000)
      } else {
        console.error('Signup failed:', data)
        
        // Report error to admin
        await reportError(new Error(data.error || 'Signup failed'), {
          userName: fullName,
          userEmail: signupForm.email,
          serviceDate: service.displayDate,
          action: 'Submit Signup'
        })
        
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Signup Failed',
          message: `${data.error}\n\n${data.details || 'Please try again or contact the church office.'}`
        })
      }
    } catch (error) {
      console.error('Signup error:', error)
      
      // Report error to admin
      await reportError(error, {
        userName: fullName,
        userEmail: signupForm.email,
        serviceDate: service.displayDate,
        action: 'Submit Signup'
      })
      
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Signup Error',
        message: `An error occurred: ${error}\n\nPlease try again or contact the church office.`
      })
    } finally {
      // Re-enable submit button after request completes
      setIsSubmitting(false)
    }
  }

  const selectedService = selectedSignup ? services.find((s: Service) => s.id === selectedSignup.serviceId) : null

  if (loading) {
    return (
      <PasswordGate>
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading services...</p>
          </div>
        </main>
      </PasswordGate>
    )
  }

  return (
    <PasswordGate>
      {/* Custom Modal for Alerts/Confirmations */}
      {modalState?.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
            {/* Church Logo */}
            <div className="flex justify-center mb-3">
              <Image 
                src="/logo-for-church-larger.jpg" 
                alt="Church Logo" 
                width={180} 
                height={180} 
                quality={100}
                unoptimized
                className="rounded-lg shadow-lg object-contain"
              />
            </div>
            
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              {modalState.type === 'success' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {modalState.type === 'error' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {modalState.type === 'warning' && (
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              {modalState.type === 'confirm' && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
              {modalState.title}
            </h3>
            
            {/* Message */}
            <p className="text-gray-700 text-center mb-6 whitespace-pre-line">
              {modalState.message}
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              {modalState.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => setModalState(null)}
                    className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={modalState.onConfirm}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModalState(null)}
                  className={`px-8 py-2.5 rounded-lg font-medium transition-colors ${
                    modalState.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    modalState.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Live Update Indicator */}
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-1 text-xs">
          <span className="animate-pulse">● Updating...</span>
        </div>
      )}
      
      {/* Pinned Calendar - Collapsible (Hidden on mobile) */}
      {calendarOpen ? (
        <div className="hidden md:block fixed top-4 left-4 z-50 bg-white shadow-xl rounded-lg border-2 border-gray-200 w-80">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Image
                  src="/logo-for-church-larger.jpg"
                  alt="Ukiah United Methodist Church Logo"
                  width={48}
                  height={48}
                  quality={100}
                  unoptimized
                  className="rounded-md shadow-sm object-contain"
                />
                <div className="flex-1">
                  <h1 className="text-sm font-bold text-gray-800">Liturgist Schedule</h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCalendarMonthChange('prev')}
                      className="text-blue-600 hover:text-blue-800 p-0.5"
                      title="Previous month"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <p className="text-xs text-blue-600 font-medium">{calendarData.monthName}</p>
                    <button
                      onClick={() => handleCalendarMonthChange('next')}
                      className="text-blue-600 hover:text-blue-800 p-0.5"
                      title="Next month"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCalendarOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Close calendar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center font-medium text-gray-600 py-1">
                  {day}
                </div>
              ))}
              {calendarData.days.map((day, index) => (
                <div
                  key={index}
                  className={`text-center py-2 rounded text-xs transition-colors ${
                    !day ? '' :
                    day.isMainService ? 'bg-purple-600 text-white font-bold cursor-pointer hover:bg-purple-700' :
                    day.isToday ? 'bg-blue-600 text-white font-bold' :
                    day.isSunday && day.hasService ? (
                      hoveredService === day.serviceData?.id ? 'bg-yellow-300 font-bold border border-yellow-500' : 'bg-green-100 font-medium cursor-pointer hover:bg-green-200'
                    ) :
                    day.isSunday ? 'bg-orange-100 font-medium' :
                    'text-gray-600'
                  }`}
                  title={
                    day?.isMainService ? `Next Service: ${day.serviceData?.displayDate}` :
                    day?.serviceData?.notes ? `${day.serviceData?.notes}` :
                    day?.isSunday && day?.hasService ? `Service on ${day.serviceData?.displayDate}` : ''
                  }
                  onClick={day?.hasService && isClient ? () => scrollToService(day.serviceData!.id) : undefined}
                >
                  {day?.day || ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCalendarOpen(true)}
          className="hidden md:block fixed top-4 left-4 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
          title="Open calendar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Signup Modal */}
        {selectedSignup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Sign up for {selectedService?.displayDate}
              </h3>
              
              {/* Status Info Box */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Main Liturgist:</span>
                    {selectedService?.liturgist ? (
                      <span className="text-green-700 font-semibold">✓ Filled by {selectedService.liturgist.name}</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Available</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Backup:</span>
                    {selectedService?.backup ? (
                      <span className="text-orange-700 font-semibold">✓ Filled by {selectedService.backup.name}</span>
                    ) : (
                      <span className="text-gray-500">Available</span>
                    )}
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSubmitSignup} className="space-y-4">
                {/* Person Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Your Name *
                  </label>
                  <select
                    required
                    value={signupForm.selectedPerson}
                    onChange={(e) => handlePersonSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select --</option>
                    {liturgists.map((liturgist) => (
                      <option key={liturgist.email} value={liturgist.name}>
                        {liturgist.name}
                      </option>
                    ))}
                    <option value="other">Other (not listed)</option>
                  </select>
                </div>

                {/* Show First/Last Name fields if Other selected */}
                {signupForm.selectedPerson === 'other' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Role Selection */}
                {signupForm.selectedPerson && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sign up as: *
                    </label>
                    <div className="space-y-2">
                      <label className={`flex items-center ${selectedService?.liturgist ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="radio"
                          name="role"
                          value="liturgist"
                          checked={signupForm.role === 'liturgist'}
                          onChange={(e) => setSignupForm({ ...signupForm, role: 'liturgist' })}
                          disabled={!!selectedService?.liturgist}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          Main Liturgist
                          {selectedService?.liturgist && (
                            <span className="ml-2 text-xs text-red-600 font-medium">
                              (Taken by {selectedService.liturgist.name})
                            </span>
                          )}
                        </span>
                      </label>
                      <label className={`flex items-center ${selectedService?.backup ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="radio"
                          name="role"
                          value="backup"
                          checked={signupForm.role === 'backup'}
                          onChange={(e) => setSignupForm({ ...signupForm, role: 'backup' })}
                          disabled={!!selectedService?.backup}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          Backup Liturgist
                          {selectedService?.backup && (
                            <span className="ml-2 text-xs text-orange-600 font-medium">
                              (Taken by {selectedService.backup.name})
                            </span>
                          )}
                        </span>
                      </label>
                    </div>
                    
                    {/* Explanation text */}
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <strong>Note:</strong> Positions update every 5 seconds. Grayed out options have already been filled. If your preferred role is unavailable, choose a different Sunday or select the available role.
                    </div>
                    
                    {selectedService?.liturgist && selectedService?.backup && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <strong>⚠️ Both positions are filled.</strong> Please choose a different Sunday.
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Info (populated or editable) */}
                {signupForm.selectedPerson && (
                  <>
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
                        readOnly={signupForm.selectedPerson !== 'other'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone {signupForm.selectedPerson === 'other' ? '*' : '(optional)'}
                      </label>
                      <input
                        type="tel"
                        required={signupForm.selectedPerson === 'other'}
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || (selectedService?.liturgist && selectedService?.backup)}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      isSubmitting || (selectedService?.liturgist && selectedService?.backup)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSignup(null)
                      setSignupForm({
                        selectedPerson: '',
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        role: 'liturgist'
                      })
                    }}
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
                Liturgist Services - {currentQuarter.replace('-', ' ')}
              </h2>
              {lastUpdated && !isLockedQuarter && (
                <p className="text-xs text-gray-500 ml-8 mt-1">
                  Live updates • Last refreshed: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleQuarterChange('prev')}
                disabled={currentQuarter === CURRENT_QUARTER}
                className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                  currentQuarter === CURRENT_QUARTER
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Quarter
              </button>
              <button
                onClick={() => handleQuarterChange('next')}
                disabled={currentQuarter === 'Q1-2026'}
                className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                  currentQuarter === 'Q1-2026'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next Quarter
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Locked Quarter Notice */}
          {isLockedQuarter && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h3 className="font-bold text-amber-900 text-lg mb-1">Sign-ups Open in December</h3>
                  <p className="text-sm text-amber-800">
                    Q1 2026 sign-ups will open in the month before the quarter begins. 
                    Check back in December 2025 to sign up for services in January-March 2026.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {services.map((service: Service) => {
              const isMainService = service.date === mainServiceDate
              
              return (
                <div 
                  key={service.id}
                  id={`service-${service.id}`}
                  className={`border rounded-lg p-3 transition-all ${
                    isLockedQuarter 
                      ? 'border-gray-300 bg-gray-100 opacity-60'
                      : isMainService
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : hoveredService === service.id 
                          ? 'border-yellow-400 bg-yellow-50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onMouseEnter={() => !isLockedQuarter && setHoveredService(service.id)}
                  onMouseLeave={() => !isLockedQuarter && setHoveredService(null)}
                >
                  {/* Date and Special Badges */}
                  <div className="flex items-center space-x-2 mb-3">
                    <p className="font-semibold text-gray-800 text-sm">
                      {service.displayDate.replace(/, \d{4}/, '')}
                    </p>
                    {isMainService && (
                      <span className="text-xs font-bold text-purple-600 bg-purple-200 px-2 py-0.5 rounded">NEXT SERVICE</span>
                    )}
                    {service.notes && (() => {
                      // Check if it's Christmas Eve
                      if (service.notes.includes('Christmas Eve')) {
                        return (
                          <span className="text-xs font-semibold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                            🕯️ CHRISTMAS EVE • Liturgist lights 5 candles
                          </span>
                        )
                      }
                      
                      // Extract info from Advent notes
                      const weekMatch = service.notes.match(/Advent Week (\d)/)
                      const countMatch = service.notes.match(/\((\d) candles?\)/)
                      
                      if (weekMatch && countMatch) {
                        const week = weekMatch[1]
                        const count = countMatch[1]
                        const candleText = count === '1' ? '1 candle' : `${count} candles`
                        
                        return (
                          <span className="text-xs font-semibold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                            🕯️ ADVENT WEEK {week} • Liturgist lights {candleText}
                          </span>
                        )
                      }
                      
                      return null
                    })()}
                  </div>
                  
                  {/* Two Rows: Liturgist and Backup - Always Visible */}
                  <div className="space-y-2 text-sm">
                    {/* Liturgist Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium text-gray-700 whitespace-nowrap">Liturgist:</span>
                        {service.liturgist ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0 flex-1">
                            <span className="font-semibold text-green-900 truncate" title={service.liturgist.name}>
                              {service.liturgist.name}
                            </span>
                            {service.liturgist.email && (
                              <span className="text-green-700 text-xs truncate" title={service.liturgist.email}>
                                {service.liturgist.email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSignup(service.id, 'liturgist')}
                            disabled={isLockedQuarter}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            Sign Up
                          </button>
                        )}
                      </div>
                      
                      {/* Cancel Button - Right Side (only if filled) */}
                      {service.liturgist && (
                        <div className="flex-shrink-0 sm:ml-2">
                          <button
                            onClick={() => handleCancelSignup(service.liturgist!.id, service.liturgist!.name, service.displayDate, 'Liturgist')}
                            disabled={isLockedQuarter}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Backup Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium text-gray-700 whitespace-nowrap">Backup:</span>
                        {service.backup ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0 flex-1">
                            <span className="font-semibold text-blue-900 truncate" title={service.backup.name}>
                              {service.backup.name}
                            </span>
                            {service.backup.email && (
                              <span className="text-blue-700 text-xs truncate" title={service.backup.email}>
                                {service.backup.email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSignup(service.id, 'backup')}
                            disabled={isLockedQuarter}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            Sign Up
                          </button>
                        )}
                      </div>
                      
                      {/* Cancel Button - Right Side (only if filled) */}
                      {service.backup && (
                        <div className="flex-shrink-0 sm:ml-2">
                          <button
                            onClick={() => handleCancelSignup(service.backup!.id, service.backup!.name, service.displayDate, 'Backup')}
                            disabled={isLockedQuarter}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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
    </PasswordGate>
  )
}