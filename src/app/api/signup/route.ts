import { NextRequest, NextResponse } from 'next/server'
import { submitSignup } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.serviceDate || !body.displayDate || !body.name || !body.email || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Submit to Airtable
    const result = await submitSignup({
      serviceDate: body.serviceDate,
      displayDate: body.displayDate,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      attendanceStatus: body.attendanceStatus,
      notes: body.notes,
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Signup submitted successfully!',
        recordId: result.record?.id
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to submit signup' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
