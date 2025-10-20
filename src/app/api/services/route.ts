import { NextRequest, NextResponse } from 'next/server'
import { getSignups } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    // Generate next 8 Sundays as base
    const upcomingSundays = generateUpcomingSundays()
    
    // Get all signups from Airtable
    const signups = await getSignups()

    // Create a map of services starting with upcoming Sundays
    const serviceMap = new Map()
    
    // Add all upcoming Sundays first
    upcomingSundays.forEach(service => {
      serviceMap.set(service.date, service)
    })

    // Merge in signups from Airtable
    signups.forEach((signup: any) => {
      const serviceDate = signup.serviceDate
      
      if (!serviceMap.has(serviceDate)) {
        serviceMap.set(serviceDate, {
          id: serviceDate,
          date: serviceDate,
          displayDate: signup.displayDate,
          liturgist: null,
          backup: null,
          attendance: [],
          notes: undefined
        })
      }

      const service = serviceMap.get(serviceDate)

      // Organize by role
      if (signup.role === 'Liturgist') {
        service.liturgist = {
          id: signup.id,
          name: signup.name,
          email: signup.email,
          phone: signup.phone,
          preferredContact: 'email' as const
        }
      } else if (signup.role === 'Backup') {
        service.backup = {
          id: signup.id,
          name: signup.name,
          email: signup.email,
          phone: signup.phone,
          preferredContact: 'email' as const
        }
      } else if (signup.role === 'Attendance') {
        service.attendance.push({
          name: signup.name,
          status: signup.attendanceStatus?.toLowerCase() || 'yes'
        })
      }
    })

    // Convert map to array and sort by date
    const services = Array.from(serviceMap.values()).sort((a, b) => 
      a.date.localeCompare(b.date)
    )

    return NextResponse.json({ success: true, services })
  } catch (error) {
    console.error('API Error:', error)
    // Return upcoming Sundays even on error
    return NextResponse.json({ 
      success: true, 
      services: generateUpcomingSundays() 
    })
  }
}

// Generate next 8 Sundays
function generateUpcomingSundays() {
  const sundays = []
  const today = new Date()
  let currentDate = new Date(today)
  
  // Find next Sunday
  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Generate 8 Sundays
  for (let i = 0; i < 8; i++) {
    const dateString = currentDate.toISOString().split('T')[0]
    const displayDate = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    sundays.push({
      id: dateString,
      date: dateString,
      displayDate,
      liturgist: null,
      backup: null,
      attendance: [],
      notes: undefined
    })
    
    currentDate.setDate(currentDate.getDate() + 7) // Next Sunday
  }
  
  return sundays
}
