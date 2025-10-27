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

    // Merge in signups from Airtable (only for dates within this quarter)
    signups.forEach((signup: any) => {
      const serviceDate = signup.serviceDate
      
      // Skip signups that are not in this quarter's date range
      if (!serviceMap.has(serviceDate)) {
        // Don't add services from outside the requested quarter
        return
      }

      const service = serviceMap.get(serviceDate)

      // Normalize role for comparison (handle both capitalized and lowercase variants)
      const normalizedRole = signup.role?.toLowerCase().trim()

      // Organize by role - check for all variants (old, new, and lowercase)
      if (signup.role === 'Liturgist' || normalizedRole === 'liturgist') {
        service.liturgist = {
          id: signup.id,
          name: signup.name,
          email: signup.email,
          phone: signup.phone,
          preferredContact: 'email' as const
        }
      } else if (signup.role === 'Second Liturgist' || signup.role === 'liturgist2' || normalizedRole === 'liturgist2' || normalizedRole === 'second liturgist') {
        service.liturgist2 = {
          id: signup.id,
          name: signup.name,
          email: signup.email,
          phone: signup.phone,
          preferredContact: 'email' as const
        }
      } else if (signup.role === 'Backup Liturgist' || signup.role === 'Backup' || normalizedRole === 'backup' || normalizedRole === 'backup liturgist') {
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

// Calculate the 4 Advent Sundays for a given year
// Advent starts on the 4th Sunday before Christmas (Dec 25)
function calculateAdventSundays(year: number): string[] {
  // Christmas is always December 25
  const christmas = new Date(year, 11, 25) // Month is 0-indexed, so 11 = December
  
  // Find what day of the week Christmas falls on (0 = Sunday, 6 = Saturday)
  const christmasDay = christmas.getDay()
  
  // Calculate how many days back to the previous Sunday from Christmas
  // If Christmas is Sunday (0), we go back 0 days
  // If Christmas is Monday (1), we go back 1 day to Sunday
  // etc.
  const daysToSunday = christmasDay === 0 ? 7 : christmasDay
  
  // Find the Sunday before (or on) Christmas
  const sundayBeforeChristmas = new Date(year, 11, 25 - daysToSunday)
  
  // Count back 4 Sundays (including the one we just found)
  // This gives us the 4 Advent Sundays
  const adventSundays: string[] = []
  
  for (let i = 3; i >= 0; i--) {
    const adventSunday = new Date(sundayBeforeChristmas)
    adventSunday.setDate(sundayBeforeChristmas.getDate() - (i * 7))
    adventSundays.push(adventSunday.toISOString().split('T')[0])
  }
  
  return adventSundays
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
  
  // TIMEZONE NOTE: Date generation uses local server timezone (PDT/PST for Ukiah, CA)
  // All users are in same timezone, so this works correctly for the congregation.
  // If deploying for multi-timezone use, dates should be normalized to UTC.
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
    
    // Dynamic Advent date calculation - works for any year
    // Advent starts on the 4th Sunday before Christmas (Dec 25)
    let notes: string | undefined = undefined
    const adventDates = calculateAdventSundays(yearNum)
    
    // Advent candles are lit cumulatively each week
    if (dateString === adventDates[0]) {
      notes = 'Advent Week 1 — Light the Hope candle (1 candle)'
    } else if (dateString === adventDates[1]) {
      notes = 'Advent Week 2 — Light the Hope and Peace candles (2 candles)'
    } else if (dateString === adventDates[2]) {
      notes = 'Advent Week 3 — Light the Hope, Peace, and Joy candles (3 candles)'
    } else if (dateString === adventDates[3]) {
      notes = 'Advent Week 4 — Light the Hope, Peace, Joy, and Love candles (4 candles)'
    }

    sundays.push({
      id: dateString,
      date: dateString,
      displayDate,
      liturgist: null,
      liturgist2: null,
      backup: null,
      attendance: [],
      notes
    })
    
    currentDate.setDate(currentDate.getDate() + 7) // Next Sunday
  }
  
  // Add Christmas Eve service if it falls in this quarter
  const christmasEve = new Date(yearNum, 11, 24) // December 24
  if (christmasEve.getMonth() >= startMonth && christmasEve.getMonth() <= endMonth) {
    const christmasEveDate = christmasEve.toISOString().split('T')[0]
    const christmasEveDisplay = christmasEve.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    sundays.push({
      id: christmasEveDate,
      date: christmasEveDate,
      displayDate: christmasEveDisplay + ' (Christmas Eve)',
      liturgist: null,
      liturgist2: null,
      backup: null,
      attendance: [],
      notes: 'Christmas Eve Service — Light the Christ Candle (white center candle) + all 4 Advent candles'
    })
  }
  
  // Sort all services by date (Christmas Eve might not be chronological)
  sundays.sort((a, b) => a.date.localeCompare(b.date))
  
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
