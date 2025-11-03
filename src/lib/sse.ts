/**
 * Server-Sent Events (SSE) manager for broadcasting real-time updates to clients
 * Clients connect via EventSource and receive updates when webhooks trigger
 */

type SSEClient = {
  id: string
  response: any // Next.js response object
  quarter: string
  connectedAt: number
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map()

  /**
   * Add a new SSE client connection
   */
  addClient(id: string, response: any, quarter: string): void {
    console.log(`[SSE] Client connected: ${id} (quarter: ${quarter})`)
    this.clients.set(id, {
      id,
      response,
      quarter,
      connectedAt: Date.now()
    })
  }

  /**
   * Remove a client connection
   */
  removeClient(id: string): void {
    const client = this.clients.get(id)
    if (client) {
      console.log(`[SSE] Client disconnected: ${id} (quarter: ${client.quarter})`)
      this.clients.delete(id)
    }
  }

  /**
   * Broadcast update to all clients watching a specific quarter
   */
  broadcast(quarter: string, data: any): void {
    console.log(`[SSE] Broadcasting update to clients watching quarter: ${quarter}`)
    let successCount = 0
    let failCount = 0

    this.clients.forEach((client) => {
      if (client.quarter === quarter) {
        try {
          // Send SSE event
          const eventData = JSON.stringify(data)
          client.response.write(`data: ${eventData}\n\n`)
          successCount++
        } catch (error) {
          console.error(`[SSE] Failed to send to client ${client.id}:`, error)
          this.removeClient(client.id)
          failCount++
        }
      }
    })

    console.log(`[SSE] Broadcast complete: ${successCount} sent, ${failCount} failed`)
  }

  /**
   * Broadcast to all connected clients regardless of quarter
   */
  broadcastAll(data: any): void {
    console.log(`[SSE] Broadcasting update to ALL clients`)
    let successCount = 0
    let failCount = 0

    this.clients.forEach((client) => {
      try {
        const eventData = JSON.stringify(data)
        client.response.write(`data: ${eventData}\n\n`)
        successCount++
      } catch (error) {
        console.error(`[SSE] Failed to send to client ${client.id}:`, error)
        this.removeClient(client.id)
        failCount++
      }
    })

    console.log(`[SSE] Broadcast complete: ${successCount} sent, ${failCount} failed`)
  }

  /**
   * Get count of connected clients
   */
  getClientCount(): number {
    return this.clients.size
  }

  /**
   * Get clients by quarter
   */
  getClientsByQuarter(quarter: string): SSEClient[] {
    return Array.from(this.clients.values()).filter(c => c.quarter === quarter)
  }

  /**
   * Get SSE manager stats
   */
  getStats() {
    const now = Date.now()
    return {
      totalClients: this.clients.size,
      clients: Array.from(this.clients.values()).map(c => ({
        id: c.id,
        quarter: c.quarter,
        connectedAt: new Date(c.connectedAt).toISOString(),
        duration: Math.floor((now - c.connectedAt) / 1000) + 's'
      })),
      byQuarter: this.getQuarterDistribution()
    }
  }

  /**
   * Get distribution of clients by quarter
   */
  private getQuarterDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {}
    this.clients.forEach(client => {
      distribution[client.quarter] = (distribution[client.quarter] || 0) + 1
    })
    return distribution
  }

  /**
   * Cleanup stale connections (optional, for maintenance)
   */
  cleanupStaleConnections(maxAge: number = 30 * 60 * 1000): void {
    const now = Date.now()
    const staleClients: string[] = []

    this.clients.forEach((client, id) => {
      if (now - client.connectedAt > maxAge) {
        staleClients.push(id)
      }
    })

    staleClients.forEach(id => this.removeClient(id))
    
    if (staleClients.length > 0) {
      console.log(`[SSE] Cleaned up ${staleClients.length} stale connections`)
    }
  }
}

// Export a singleton instance
export const sseManager = new SSEManager()
