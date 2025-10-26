// Global error reporting utility
// Sends user errors to admin via email

// Translate technical errors to layperson explanations
function getLaypersonExplanation(errorMessage: string, action?: string): string {
  const msg = errorMessage.toLowerCase()
  
  // Network/fetch errors
  if (msg.includes('load failed') || msg.includes('failed to fetch') || msg.includes('network')) {
    return `📱 Brief WiFi/cellular connection issue. The user's device lost internet for a moment while ${action || 'loading data'}.`
  }
  
  // Timeout errors
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return `⏱️ Request took too long (slow internet or server busy). ${action ? `The user was trying to ${action}.` : ''}`
  }
  
  // Airtable/API errors
  if (msg.includes('airtable') || msg.includes('rate limit')) {
    return `🗄️ Database issue. Either too many requests at once or Airtable hiccupped. ${action ? `Action: ${action}` : ''}`
  }
  
  // CORS errors
  if (msg.includes('cors')) {
    return `🔒 Security/configuration issue. Browser blocked the request for security reasons.`
  }
  
  // Generic message
  return `❓ Unexpected error during ${action || 'operation'}: ${errorMessage}`
}

export async function reportError(error: Error | unknown, context?: {
  userName?: string
  userEmail?: string
  serviceDate?: string
  action?: string
}) {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Generate layperson explanation
    const explanation = getLaypersonExplanation(errorMessage, context?.action)
    
    // Prepare error context
    const errorContext = {
      userName: context?.userName,
      userEmail: context?.userEmail,
      serviceDate: context?.serviceDate,
      action: context?.action,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
      explanation, // Add layperson explanation
    }
    
    // Wait 2 seconds to see if error self-resolves (skip brief glitches)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
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
