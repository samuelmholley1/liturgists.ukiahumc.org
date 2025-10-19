import { NextRequest, NextResponse } from 'next/server'
import { getSignups } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    // Get all signups from Airtable
    const signups = await getSignups()

    // Group signups by service date
    const serviceMap = new Map()

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
    return NextResponse.json(
      { error: 'Failed to fetch services', services: [] },
      { status: 500 }
    )
  }
}
