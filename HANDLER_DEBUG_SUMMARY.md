# Handler Debugging - Irrefutable Stamps Deployed

## What Was Added (Commit 5ef7655)

### 1. Handler Identification Stamp Function
Every handler now uses a `stamp()` function that creates:
```typescript
{
  tag: 'signup.DELETE',  // or .GET or .POST
  sha: 'abc1234',        // Git commit SHA
  region: 'iad1',        // Vercel region
  url: 'your-app.vercel.app',
  at: '2025-10-26T...'   // ISO timestamp
}
```

### 2. HTTP Response Headers
**Every response now includes:**
- `X-Handler` header with full stamp JSON
- Handler stamp in JSON response body

**Example:**
```
X-Handler: {"tag":"signup.DELETE","sha":"5ef7655","region":"iad1",...}
```

### 3. Enhanced MAIL-STAMP in Emails
The email footer now includes:
```
MAIL-STAMP {
  "sender": "sendEmail",
  "sha": "5ef7655",
  "region": "iad1",
  "url": "your-app.vercel.app",
  "at": "2025-10-26T...",
  "importUrl": "file:///vercel/path0/src/lib/email.ts"
}
```

Plus logs to console:
```
🔍 MAIL-STAMP {...} { subject: '...', to: '...', cc: '...' }
```

### 4. Console Logs Added
- **POST handler**: `🔍 HANDLER STAMP: {"tag":"signup.POST",...}`
- **GET handler**: `🚨🚨🚨 GET HANDLER CALLED - IS THIS HANDLING DELETES??`
- **DELETE handler**: `🚨🚨🚨 DELETE HANDLER CALLED - THIS SHOULD ALWAYS APPEAR!`

---

## How to Test

### Option 1: Use the UI (Current Method)
1. Sign up as Test User for backup role on December 28
2. Click the Cancel button in the calendar
3. Check Vercel logs for:
   - Which 🚨 log appears (GET or DELETE?)
   - The `X-Handler` in the response
   - The MAIL-STAMP showing subject and cc values

### Option 2: Use curl (Direct Method)
Run the test script:
```bash
./test-handlers.sh
```

Or manually:
```bash
# Test DELETE method
curl -i -X DELETE "https://liturgists.ukiahumc.org/api/signup?recordId=TEST"

# Test GET method  
curl -i "https://liturgists.ukiahumc.org/api/signup?action=cancel&recordId=TEST"

# Test POST method
curl -i -X POST "https://liturgists.ukiahumc.org/api/signup" \
  -H "content-type: application/json" \
  --data '{"action":"cancel","recordId":"TEST"}'
```

**Look for the `X-Handler` header** - the `tag` field tells you which handler ran!

---

## What We'll Learn

### From UI Cancel Test:
1. **Which handler processes DELETE requests from the UI?**
   - If you see `🚨 DELETE HANDLER CALLED` → DELETE handler is working correctly
   - If you see `🚨 GET HANDLER CALLED` → GET is intercepting DELETEs (routing bug)
   - If you see neither → Different route/code is handling it

2. **What subject line is being passed to sendEmail?**
   - The MAIL-STAMP log shows: `{ subject: '...', to: '...', cc: '...' }`
   - This proves whether the handler is building the subject correctly

3. **What handler info is in the HTTP response?**
   - The `X-Handler` header reveals the actual execution path
   - Response body includes `handler: {...}` with full stamp

### From Email Received:
1. **The email footer** shows exactly:
   - Which build/SHA sent it
   - Which region processed it
   - Which file path (importUrl) was used
   - Timestamp of sending

2. **The subject line** includes `[debug 5ef7655]` suffix
   - Confirms latest deployment is live

---

## Expected Outcomes

### If DELETE handler IS working:
- Vercel logs show: `🚨 DELETE HANDLER CALLED`
- X-Handler header: `{"tag":"signup.DELETE",...}`
- Email subject should be: `❌ Backup Cancelled: Test - December 28, 2025 [debug 5ef7655]`
- Email cc should be: `sam@samuelholley.com`
- MAIL-STAMP should show correct subject/cc values

### If GET handler IS intercepting:
- Vercel logs show: `🚨 GET HANDLER CALLED`
- X-Handler header: `{"tag":"signup.GET",...}`
- This reveals the routing conflict
- Need to investigate why DELETE → GET

### If neither handler runs:
- No 🚨 logs appear at all
- This means a completely different route/code is handling it
- Possible causes:
  - Duplicate route file (Pages Router vs App Router)
  - Vercel rewrite rule
  - Edge function override
  - External service (Airtable automation, etc.)

---

## Next Steps After Testing

### Scenario A: DELETE handler runs, but email is still wrong
**Root cause:** Bug in the DELETE handler's cancellation email logic  
**Fix:** Update the specific lines in DELETE handler that build subject/cc

### Scenario B: GET handler is intercepting DELETE requests
**Root cause:** Next.js routing issue or middleware converting methods  
**Fix:** 
- Check middleware.ts for method conversion
- Check for duplicate routes
- May need to use a different route pattern

### Scenario C: Neither handler runs
**Root cause:** External sender (Airtable, Zapier, etc.) or routing to different file  
**Fix:**
- Search for all sendEmail calls: `rg -n "sendEmail\("`
- Check Airtable automations
- Check Vercel function logs for different routes
- Review vercel.json for rewrites

---

## Files Modified

- `src/app/api/signup/route.ts` - Added stamp() function and stamps to all handlers
- `src/lib/email.ts` - Enhanced MAIL-STAMP with more detail

## Test Files Added

- `test-handlers.sh` - Script to test each handler with curl

---

## Checklist From User's Instructions

- [x] **0) Add irrefutable stamps** - ✅ Done
- [ ] **1) Prove which handler runs** - Ready to test
- [ ] **2) Eliminate routing conflicts** - Will check based on test results
- [ ] **3) Check email provider** - Zoho SMTP, no templates
- [ ] **4) Confirm Gmail threading** - Will verify in raw headers
- [ ] **5) Ensure UI issues DELETE** - Already verified in page.tsx
- [ ] **6) Guard against second senders** - Will search if needed
- [ ] **7) Build/source skew** - MAIL-STAMP includes importUrl
- [ ] **8) Region/multi-deploy skew** - MAIL-STAMP includes region + SHA

---

## Important Notes

1. **The MAIL-STAMP is in the email footer** - check the bottom of the HTML email
2. **Check Vercel logs immediately after testing** - logs are time-sensitive
3. **The X-Handler header proves which handler ran** - this is definitive
4. **The [debug SHA] in subject proves deployment is live** - look for `5ef7655`

---

## Ready to Deploy? ✅

The code has been deployed (commit 5ef7655). 

**Next action:** Test a cancellation and check:
1. Vercel logs for 🚨 messages
2. HTTP response X-Handler header
3. Email footer MAIL-STAMP
4. Console log showing subject/cc values

The truth will reveal itself! 🔍
