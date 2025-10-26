// Global error reporting utility
// Sends user errors to admin via email

export async function reportError(error: Error | unknown, context?: {
  userName?: string
  userEmail?: string
  serviceDate?: string
  action?: string
}) {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Prepare error context
    const errorContext = {
      userName: context?.userName,
      userEmail: context?.userEmail,
      serviceDate: context?.serviceDate,
      action: context?.action,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
    }
    
    // Send to error reporting endpoint
    await fetch('/api/report-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: {
          message: errorMessage,
          stack: errorStack,
        },
        context: errorContext,
      }),
    })
    
    console.log('Error reported to admin')
  } catch (reportingError) {
    // Fail silently - don't let error reporting break the app
    console.error('Failed to report error:', reportingError)
  }
}
