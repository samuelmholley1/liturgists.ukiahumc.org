import { NextRequest, NextResponse } from 'next/server'
import { getSignups } from '@/lib/airtable'

// Disable all caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Get quarter from query params (format: "Q4-2025" or "Q1-2026")
    const { searchParams } = new URL(request.url)
    const quarter = searchParams.get('quarter') || 'Q4-2025' // Default to Q4 2025
    
    // Generate Sundays for the requested quarter
    const allSundays = generateSundaysForQuarter(quarter)
    
    // Get all signups from Airtable
    const signups = await getSignups()

    // Create a map of services starting with all Sundays
    const serviceMap = new Map()
    
    // Add all Sundays first (past and upcoming)
    allSundays.forEach(service => {
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

    return NextResponse.json(
      { success: true, services },
      { 
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  } catch (error) {
    console.error('API Error:', error)
    // Return all Sundays even on error
    return NextResponse.json(
      { 
        success: true, 
        services: generateSundaysForQuarter('Q4-2025') 
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    )
  }
}

// Generate Sundays for a specific quarter (e.g., "Q4-2025" or "Q1-2026")
function generateSundaysForQuarter(quarterString: string) {
  const sundays = []
  const [quarter, year] = quarterString.split('-')
  const yearNum = parseInt(year)
  
  // Determine month range for quarter
  let startMonth: number, endMonth: number
  if (quarter === 'Q1') {
    startMonth = 0  // January
    endMonth = 2    // March
  } else if (quarter === 'Q2') {
    startMonth = 3  // April
    endMonth = 5    // June
  } else if (quarter === 'Q3') {
    startMonth = 6  // July
    endMonth = 8    // September
  } else { // Q4
    startMonth = 9  // October
    endMonth = 11   // December
  }
  
  // Start from first day of first month in quarter
  let currentDate = new Date(yearNum, startMonth, 1)
  
  // Find first Sunday
  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // End of last month in quarter
  const endDate = new Date(yearNum, endMonth + 1, 0) // Last day of endMonth
  
  // Generate all Sundays in the quarter
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0]
    const displayDate = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    // Special notes for certain dates (e.g., Advent candle lighting)
    const notes = dateString === '2025-11-30' ? 'Advent Week 1 — Liturgist lights the Advent candle.' : undefined

    sundays.push({
      id: dateString,
      date: dateString,
      displayDate,
      liturgist: null,
      backup: null,
      attendance: [],
      notes
    })
    
    currentDate.setDate(currentDate.getDate() + 7) // Next Sunday
  }
  
  return sundays
}

// DEPRECATED - Keep for backward compatibility
function generateRecentAndUpcomingSundays() {
  const sundays = []
  const today = new Date()
  const currentYear = today.getFullYear()
  const endOfYear = new Date(currentYear, 11, 31) // December 31
  
  // Find the most recent Sunday (today if Sunday, otherwise go back)
  let currentDate = new Date(today)
  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() - 1)
  }
  
  // Go back 4 more Sundays to include previous 4 weeks
  currentDate.setDate(currentDate.getDate() - 28)
  
  // Generate all Sundays from 2 weeks ago through end of year
  while (currentDate <= endOfYear) {
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

// DEPRECATED: Keep for backward compatibility but not used
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
