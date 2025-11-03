import { NextRequest } from 'next/server'
import { sseManager } from '@/lib/sse'

/**
 * Server-Sent Events (SSE) Endpoint
 * Clients connect here to receive real-time updates
 * GET /api/sse?quarter=Q4-2025
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const quarter = searchParams.get('quarter') || 'Q4-2025'
  const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  console.log(`[SSE] New client connection: ${clientId} for quarter: ${quarter}`)

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const encoder = new TextEncoder()
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        message: 'SSE connection established',
        quarter,
        clientId,
        timestamp: new Date().toISOString()
      })}\n\n`
      controller.enqueue(encoder.encode(initialMessage))

      // Create a response writer that the SSE manager can use
      const responseWriter = {
        write: (data: string) => {
          try {
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.error(`[SSE] Error writing to stream for client ${clientId}:`, error)
          }
        }
      }

      // Add client to SSE manager
      sseManager.addClient(clientId, responseWriter, quarter)

      // Send keep-alive pings every 30 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          const keepAlive = `: keep-alive ${Date.now()}\n\n`
          controller.enqueue(encoder.encode(keepAlive))
        } catch (error) {
          console.error(`[SSE] Keep-alive failed for client ${clientId}:`, error)
          clearInterval(keepAliveInterval)
          sseManager.removeClient(clientId)
        }
      }, 30000)

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client ${clientId} disconnected (abort signal)`)
        clearInterval(keepAliveInterval)
        sseManager.removeClient(clientId)
        try {
          controller.close()
        } catch (error) {
          // Stream might already be closed
        }
      })
    },
    cancel() {
      console.log(`[SSE] Stream cancelled for client ${clientId}`)
      sseManager.removeClient(clientId)
    }
  })

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}

/**
 * Test endpoint to trigger a manual broadcast
 * POST /api/sse?quarter=Q4-2025&message=test
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const quarter = searchParams.get('quarter')
  const message = searchParams.get('message') || 'Manual test broadcast'

  if (quarter) {
    sseManager.broadcast(quarter, {
      type: 'test',
      message,
      timestamp: new Date().toISOString()
    })
    return Response.json({
      success: true,
      message: `Broadcast sent to clients watching ${quarter}`,
      clientCount: sseManager.getClientsByQuarter(quarter).length
    })
  } else {
    sseManager.broadcastAll({
      type: 'test',
      message,
      timestamp: new Date().toISOString()
    })
    return Response.json({
      success: true,
      message: 'Broadcast sent to all clients',
      clientCount: sseManager.getClientCount()
    })
  }
}
