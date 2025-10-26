import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, generateErrorEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { error, context } = body
    
    // Send error notification email
    try {
      const errorEmailHtml = generateErrorEmail({
        errorType: 'Frontend User Error',
        errorMessage: error.message || String(error),
        userName: context.userName,
        userEmail: context.userEmail,
        serviceDate: context.serviceDate,
        explanation: context.explanation,
        stackTrace: error.stack || `Browser: ${context.userAgent}\nURL: ${context.url}\nTimestamp: ${context.timestamp}`
      })
      
      await sendEmail({
        to: 'sam@samuelholley.com',
        subject: '🚨 USER ERROR: Liturgist Signup System',
        html: errorEmailHtml
      })
      
      console.log('Error report email sent successfully')
      return NextResponse.json({ success: true })
    } catch (emailError) {
      console.error('Failed to send error report email:', emailError)
      return NextResponse.json(
        { success: false, error: 'Failed to send error report' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing error report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process error report' },
      { status: 500 }
    )
  }
}
