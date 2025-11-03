import { NextRequest, NextResponse } from 'next/server'
import { serviceCache } from '@/lib/cache'
import { sseManager } from '@/lib/sse'

/**
 * Airtable Webhook Endpoint
 * Receives notifications when Airtable data changes
 * POST /api/webhook/airtable
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Webhook] Received Airtable webhook notification')
    
    // Get webhook payload
    const body = await request.json()
    console.log('[Webhook] Payload:', JSON.stringify(body, null, 2))

    // Verify webhook authenticity (optional but recommended)
    const webhookSecret = process.env.AIRTABLE_WEBHOOK_SECRET
    const signature = request.headers.get('x-airtable-webhook-signature')
    
    if (webhookSecret && signature) {
      // Add HMAC verification here if needed
      console.log('[Webhook] Signature verification skipped (not implemented)')
    }

    // Invalidate all cached quarters since we don't know which quarter was affected
    // In production, you might parse the webhook payload to determine the specific quarter
    console.log('[Webhook] Invalidating all cache entries')
    serviceCache.invalidate()

    // Notify all connected SSE clients that data has changed
    console.log('[Webhook] Broadcasting update to all SSE clients')
    sseManager.broadcastAll({
      type: 'data-update',
      message: 'Service data has been updated',
      timestamp: new Date().toISOString()
    })

    // Log stats
    console.log('[Webhook] Cache stats after invalidation:', serviceCache.getStats())
    console.log('[Webhook] SSE stats:', sseManager.getStats())

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      clientsNotified: sseManager.getClientCount(),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for testing webhook endpoint
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/webhook/airtable',
    method: 'POST',
    description: 'Receives Airtable webhook notifications',
    stats: {
      cache: serviceCache.getStats(),
      sse: sseManager.getStats()
    }
  })
}
