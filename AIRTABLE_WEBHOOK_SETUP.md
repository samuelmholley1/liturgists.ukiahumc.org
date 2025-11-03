# Airtable Webhook Setup Guide

Follow these steps to configure the webhook in Airtable:

## Steps

### 1. Open Airtable Automations
1. Go to your Airtable base: https://airtable.com
2. Click on "Automations" in the top menu
3. Click "+ Create automation"

### 2. Configure the Trigger
1. **Trigger type**: "When a record matches conditions"
2. **Table**: Select your table that contains liturgist signups
3. **Conditions**: 
   - Any of these conditions:
     - Record created
     - Record updated
     - Record deleted
4. **Test**: Click "Test trigger" to verify it works

### 3. Configure the Action
1. Click "+ Add action"
2. Select "Send a request to a webhook"
3. **Method**: `POST`
4. **URL**: `https://liturgists-ukiahumc-org.vercel.app/api/webhook/airtable`
   - Replace with your actual domain if different
5. **Headers** (optional):
   ```json
   {
     "Content-Type": "application/json"
   }
   ```
6. **Body** (optional - you can send data if needed):
   ```json
   {
     "table": "Signups",
     "action": "updated",
     "timestamp": "{{CREATED_TIME}}"
   }
   ```
7. **Test**: Click "Test action" to verify it works

### 4. Name and Turn On
1. Name your automation: "Real-time Updates Webhook"
2. Toggle "On" to activate
3. Click "Done"

## Verification

### Test the webhook manually:
```bash
curl -X POST https://your-domain.com/api/webhook/airtable \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Expected response:
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "clientsNotified": 0,
  "timestamp": "2025-11-03T..."
}
```

### Monitor in browser:
1. Open your app: https://your-domain.com
2. Open browser console (F12)
3. Look for these messages:
   - `[SSE Client] Connection established`
   - `[SSE Client] Connected successfully`
4. Make a change in Airtable
5. Watch for:
   - `[SSE Client] Received update: {type: "data-update"}`
   - `[SSE Client] Data updated, refreshing services`
6. The page should update automatically!

## Troubleshooting

### Webhook not firing
- Verify automation is turned "On"
- Check automation run history in Airtable
- Verify trigger conditions match your use case

### Webhook firing but no updates
- Check server logs for webhook receipt
- Verify webhook URL is correct
- Test webhook endpoint with curl command above

### SSE not connecting
- Open browser console and check for connection errors
- Verify you're on the same domain (no CORS issues)
- Check Network tab for `/api/sse` connection

## Success!
Once configured, changes in Airtable will:
1. Trigger the automation (< 1 second)
2. POST to your webhook endpoint
3. Invalidate server cache
4. Broadcast to all connected clients
5. Clients auto-refresh data
6. **Total time: < 2 seconds from Airtable edit to user seeing change!**

Compare to old system: 0-5 second delay with constant polling! 🎉
