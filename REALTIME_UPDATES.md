# Real-Time Updates with Airtable Webhooks + SSE

This application uses a modern real-time architecture instead of polling:

## Architecture

```
Airtable Data Change
  ↓
Airtable Webhook → POST /api/webhook/airtable
  ↓
Server Cache Invalidation
  ↓
SSE Broadcast → All Connected Clients
  ↓
Clients Auto-Refresh Data
```

## Components

### 1. Server-Side Cache (`/src/lib/cache.ts`)
- In-memory cache for Airtable service data
- 1-hour TTL as fallback
- Organized by quarter (Q3-2025, Q4-2025, Q1-2026)
- Invalidated when webhooks arrive

### 2. SSE Manager (`/src/lib/sse.ts`)
- Manages persistent SSE connections with clients
- Broadcasts updates when data changes
- Tracks clients by quarter
- Automatic reconnection on errors

### 3. Webhook Endpoint (`/api/webhook/airtable`)
- **URL**: `https://yourdomain.com/api/webhook/airtable`
- Receives POST requests from Airtable
- Invalidates cache
- Broadcasts to all SSE clients
- Returns stats about notified clients

### 4. SSE Endpoint (`/api/sse`)
- Clients connect via `EventSource`
- Sends updates when webhooks arrive
- Keep-alive pings every 30 seconds
- Automatic cleanup on disconnect

### 5. Updated Services API (`/api/services`)
- Checks cache first
- Falls back to Airtable on cache miss
- Stores fresh data in cache

### 6. Client Implementation
- Replaces 5-second polling with SSE
- Automatic reconnection on errors
- Silent background refresh when updates arrive

## Setup Instructions

### 1. Configure Airtable Webhook

1. Go to Airtable Automations
2. Create a new Automation
3. Trigger: "When a record matches conditions"
   - Table: Your Services/Signups table
   - Conditions: Any record created, updated, or deleted
4. Action: "Send to webhook"
   - **URL**: `https://your-domain.com/api/webhook/airtable`
   - **Method**: POST
   - **Body**: JSON with any relevant data (optional)

### 2. Environment Variables (Optional)

Add to `.env.local` if you want signature verification:

```env
AIRTABLE_WEBHOOK_SECRET=your-secret-key-here
```

### 3. Test the Setup

#### Test webhook endpoint:
```bash
curl https://your-domain.com/api/webhook/airtable
```

#### Test manual broadcast:
```bash
curl -X POST "https://your-domain.com/api/sse?quarter=Q4-2025&message=test"
```

#### Monitor SSE connection:
Open browser console and watch for:
- `[SSE Client] Connection established`
- `[SSE Client] Connected successfully`
- `[SSE Client] Received update`

## Benefits Over Polling

### Before (Polling every 5 seconds)
- ❌ Unnecessary API calls every 5s
- ❌ High Airtable API usage
- ❌ 5-second delay before updates appear
- ❌ Battery drain on mobile
- ❌ Network bandwidth waste

### After (Webhooks + SSE)
- ✅ Updates in real-time (< 1 second)
- ✅ Minimal API calls (only when data changes)
- ✅ Server-side caching reduces load
- ✅ Efficient persistent connections
- ✅ Battery-friendly
- ✅ Scales to many users

## Monitoring

### Cache Stats
```bash
curl https://your-domain.com/api/webhook/airtable | jq .stats.cache
```

### SSE Stats
```bash
curl https://your-domain.com/api/webhook/airtable | jq .stats.sse
```

### Server Logs
Watch for:
- `[Cache] HIT` / `[Cache] MISS`
- `[SSE] Client connected`
- `[Webhook] Received Airtable webhook notification`
- `[SSE] Broadcasting update`

## Troubleshooting

### SSE not connecting
- Check browser console for errors
- Verify `/api/sse` endpoint is accessible
- Check for CORS issues (should be same-domain)

### Updates not appearing
- Verify Airtable webhook is configured correctly
- Check webhook endpoint logs
- Test manual broadcast via POST to `/api/sse`

### Cache not invalidating
- Check webhook is hitting `/api/webhook/airtable`
- Verify cache invalidation in server logs
- Test cache manually via API calls

## Future Enhancements

- [ ] Add HMAC signature verification for webhooks
- [ ] Implement Redis cache for multi-instance deployments
- [ ] Add WebSocket fallback for browsers without SSE
- [ ] Track cache hit rates and optimize TTL
- [ ] Add admin dashboard for SSE connection monitoring
