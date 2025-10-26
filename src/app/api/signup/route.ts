import { NextRequest, NextResponse } from 'next/server'
import { submitSignup, getSignups, deleteSignup, getSignupById } from '@/lib/airtable'
import { sendEmail, generateSignupEmail, generateCancellationEmail, generateErrorEmail } from '@/lib/email'

// Disable all caching for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Received signup request:', body)
    
    // Validate required fields
    if (!body.serviceDate || !body.displayDate || !body.name || !body.email || !body.role) {
      console.error('Missing required fields:', { 
        hasServiceDate: !!body.serviceDate,
        hasDisplayDate: !!body.displayDate,
        hasName: !!body.name,
        hasEmail: !!body.email,
        hasRole: !!body.role
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check environment variables
    if (!process.env.AIRTABLE_PAT_TOKEN || !process.env.AIRTABLE_BASE_ID) {
      console.error('Missing Airtable credentials:', {
        hasPAT: !!process.env.AIRTABLE_PAT_TOKEN,
        hasBaseID: !!process.env.AIRTABLE_BASE_ID,
        hasTableName: !!process.env.AIRTABLE_TABLE_NAME
      })
      return NextResponse.json(
        { error: 'Server configuration error - missing Airtable credentials' },
        { status: 500 }
      )
    }

    // CRITICAL: Server-side duplicate prevention (race condition fix)
    const existingSignups = await getSignups()
    const duplicate = existingSignups.find(
      (s: any) => s.serviceDate === body.serviceDate && s.role === body.role
    )
    
    if (duplicate) {
      console.warn('Duplicate signup attempt blocked:', {
        serviceDate: body.serviceDate,
        role: body.role,
        existingName: duplicate.name,
        attemptedName: body.name
      })
      return NextResponse.json(
        { 
          error: `This role is already taken by ${duplicate.name}. Please refresh the page to see updated availability.`,
          isDuplicate: true
        },
        { status: 409 } // 409 Conflict
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
      console.log('Signup successful:', result.record?.id)
      
      // Send email notifications
      try {
        const emailHtml = generateSignupEmail({
          name: body.name,
          email: body.email,
          phone: body.phone || '',
          role: body.role,
          displayDate: body.displayDate,
          notes: body.notes
        })
        
        await sendEmail({
          to: 'sam@samuelholley.com',
          cc: body.email,
          subject: `✅ Liturgist Signup: ${body.name} - ${body.displayDate}`,
          html: emailHtml
        })
        
        console.log('Email notification sent successfully')
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Don't fail the signup if email fails
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Signup submitted successfully!',
        recordId: result.record?.id
      })
    } else {
      console.error('Airtable submission failed:', result.error)
      
      // Send error notification email
      try {
        const errorEmailHtml = generateErrorEmail({
          errorType: 'Airtable Submission Failed',
          errorMessage: String(result.error),
          userName: body.name,
          userEmail: body.email,
          serviceDate: body.displayDate,
          stackTrace: result.error instanceof Error ? result.error.stack : undefined
        })
        
        await sendEmail({
          to: 'sam@samuelholley.com',
          subject: '🚨 ERROR: Liturgist Signup Failed',
          html: errorEmailHtml
        })
      } catch (emailError) {
        console.error('Failed to send error notification email:', emailError)
      }
      
      return NextResponse.json(
        { error: 'Failed to submit signup', details: String(result.error) },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API Error:', error)
    
    // Send error notification email
    try {
      const errorEmailHtml = generateErrorEmail({
        errorType: 'API Internal Server Error',
        errorMessage: String(error),
        stackTrace: error instanceof Error ? error.stack : undefined
      })
      
      await sendEmail({
        to: 'sam@samuelholley.com',
        subject: '🚨 ERROR: Liturgist Signup System Error',
        html: errorEmailHtml
      })
    } catch (emailError) {
      console.error('Failed to send error notification email:', emailError)
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('recordId')
    
    if (!recordId) {
      return NextResponse.json(
        { error: 'Missing recordId parameter' },
        { status: 400 }
      )
    }

    // Get record info before deleting (for email notification)
    const recordData = await getSignupById(recordId)
    
    // Delete from Airtable
    const result = await deleteSignup(recordId)

    if (result.success) {
      console.log('Signup cancelled successfully:', recordId)
      
      // Send cancellation email notifications
      if (recordData.success && recordData.record) {
        try {
          const emailHtml = generateCancellationEmail({
            name: recordData.record.name as string,
            role: recordData.record.role as string,
            displayDate: recordData.record.displayDate as string
          })
          
          await sendEmail({
            to: 'sam@samuelholley.com',
            cc: recordData.record.email as string,
            subject: `❌ Liturgist Cancellation: ${recordData.record.name} - ${recordData.record.displayDate}`,
            html: emailHtml
          })
          
          console.log('Cancellation email notification sent successfully')
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError)
          // Don't fail the cancellation if email fails
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Signup cancelled successfully'
      })
    } else {
      console.error('Airtable deletion failed:', result.error)
      
      // Send error notification email
      try {
        const errorEmailHtml = generateErrorEmail({
          errorType: 'Cancellation Failed',
          errorMessage: String(result.error),
          stackTrace: result.error instanceof Error ? result.error.stack : undefined
        })
        
        await sendEmail({
          to: 'sam@samuelholley.com',
          subject: '🚨 ERROR: Liturgist Cancellation Failed',
          html: errorEmailHtml
        })
      } catch (emailError) {
        console.error('Failed to send error notification email:', emailError)
      }
      
      return NextResponse.json(
        { error: 'Failed to cancel signup', details: String(result.error) },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API Error:', error)
    
    // Send error notification email
    try {
      const errorEmailHtml = generateErrorEmail({
        errorType: 'Cancellation API Error',
        errorMessage: String(error),
        stackTrace: error instanceof Error ? error.stack : undefined
      })
      
      await sendEmail({
        to: 'sam@samuelholley.com',
        subject: '🚨 ERROR: Liturgist Cancellation System Error',
        html: errorEmailHtml
      })
    } catch (emailError) {
      console.error('Failed to send error notification email:', emailError)
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
