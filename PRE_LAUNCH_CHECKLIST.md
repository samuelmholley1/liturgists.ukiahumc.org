# 🚨 PRE-LAUNCH TESTING CHECKLIST - Liturgist App

**Last Updated:** October 25, 2025  
**Status:** 🔴 CRITICAL BUGS FOUND - DO NOT LAUNCH WITHOUT FIXES

---

## 🚨 RED TEAM FINDINGS - BLOCKING ISSUES

### **CRITICAL SEVERITY** ⛔ (Fix Before ANY Launch)

#### 1. **Empty Name Validation - CRITICAL BUG**
- **Issue:** User selects "Other", enters only spaces in name fields
- **Bug:** `fullName = ${firstName} ${lastName}.trim()` → Results in empty string
- **Impact:** Invalid records in Airtable with no name
- **File:** `src/app/page.tsx` line ~279
- **Status:** ❌ NOT FIXED
- **Priority:** FIX IMMEDIATELY

#### 2. **Race Condition - Duplicate Signups**
- **Issue:** No server-side duplicate prevention
- **Bug:** Two users can sign up for same role simultaneously (within ~5 second window)
- **Impact:** Airtable gets duplicate signups, page shows only one, confusion ensues
- **File:** `src/app/api/signup/route.ts` - missing duplicate check
- **Status:** ❌ NOT FIXED
- **Priority:** FIX IMMEDIATELY

#### 3. **Email Validation Edge Cases**
- **Issue:** Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` accepts invalid emails
- **Examples:** "test@test." (trailing dot), "a@b.c" (invalid TLD)
- **Impact:** Invalid emails in database, bounce emails
- **File:** `src/app/page.tsx` line ~287
- **Status:** ⚠️ PARTIAL (has validation but weak)
- **Priority:** FIX IMMEDIATELY

---

### **HIGH SEVERITY** ⚠️ (Very Likely to Cause Problems)

#### 4. **Airtable Rate Limit Bomb**
- **Issue:** 5-second polling × 50+ concurrent users = rate limit breach
- **Calculation:** Airtable allows 5 req/sec, app does 1 req/5sec per user
- **Impact:** With 25+ simultaneous users, API returns 429 errors, app breaks
- **Status:** ❌ NO RATE LIMIT HANDLING
- **Priority:** HIGH

#### 5. **Date Format Mismatch (Resolved but Document)**
- **Issue:** API generates `toLocaleDateString()`, Airtable stores ISO timestamps
- **Status:** ✅ VERIFIED WORKING (October 25 testing)
- **Note:** Both use 'YYYY-MM-DD' for Service Date field, matching confirmed
- **Priority:** MONITOR

#### 6. **Advent Hardcoded Year (2026 Will Break)**
- **Issue:** Advent dates hardcoded as '2025-11-30', '2025-12-07', etc.
- **Impact:** System silently fails in 2026, no Advent annotations appear
- **File:** `src/app/api/services/route.ts` lines 149-159
- **Status:** ❌ WILL BREAK JAN 1, 2026
- **Priority:** HIGH (but not blocking for Nov 2025 launch)

---

### **MEDIUM SEVERITY** 🟡 (Should Fix Before Full Launch)

#### 7. **Phone Number Validation - None**
- **Issue:** No validation, accepts anything: "asdf", "call me", emoji
- **Impact:** Messy data, hard to use for actual calls
- **Status:** ❌ NO VALIDATION
- **Priority:** MEDIUM

#### 8. **Service Worker Cache Issues**
- **Issue:** Network-first strategy, but fallback to stale cache on network fail
- **Impact:** Users see old data if API temporarily down
- **Status:** ⚠️ MITIGATED (v2 with network-first, but not perfect)
- **Priority:** MEDIUM

#### 9. **Modal State Leak**
- **Issue:** User opens signup modal, navigates quarters, submits
- **Bug:** Modal might submit wrong date if service context changes
- **Status:** ❌ NOT TESTED
- **Priority:** MEDIUM

#### 10. **Timezone Issues**
- **Issue:** Date generation uses local timezone
- **Impact:** Hawaii user (UTC-10) might see off-by-one day errors
- **Status:** ⚠️ POTENTIAL BUG (not tested with non-PST users)
- **Priority:** MEDIUM (low impact for Ukiah congregation)

---

### **LOW SEVERITY** 🟢 (Document and Monitor)

11. **Long Name Overflow** - No CSS truncation for very long names
12. **No Loading Spinner** - Users might double-click submit button
13. **Alert Instead of Toast** - Poor UX for success messages
14. **Password Weakness** - "lovewins" is public, anyone can access
15. **Browser Compatibility** - No fallback for old browsers without service workers

---

---

## ✅ IMMEDIATE FIXES APPLIED (October 25, 2025)

### Fixed Issue #1: Empty Name Validation ✅
- Added validation: `if (!fullName || fullName.trim().length === 0)`
- Prevents submission with blank/spaces-only names
- File: `src/app/page.tsx`

### Fixed Issue #2: Server-Side Duplicate Prevention ✅
- Added duplicate check in API route before Airtable submission
- Returns 409 Conflict error if role already taken
- File: `src/app/api/signup/route.ts`

### Fixed Issue #3: Enhanced Email Validation ✅
- Improved regex to reject trailing dots and invalid formats
- Added domain validation check
- File: `src/app/page.tsx`

---

## CRITICAL ISSUES TO TEST BEFORE EMAILING

### 1. **VERIFY AIRTABLE INTEGRATION** ⚠️ HIGHEST PRIORITY

**Previous Issue:** "signed Linda up for oct 12 but still not updating despite appearing in Airtable"

**Tests:**
```bash
1. Sign up for Oct 27, 2025 (upcoming Sunday)
2. Check Airtable - verify record appears
3. Hard refresh page - does the signup show?
4. Wait 5 seconds - does it auto-refresh and show?
```

**Potential Bug:** The quarterly view generates dates like `2025-10-27`, but Airtable might be storing them differently. Need to verify the `serviceDate` field in Airtable matches EXACTLY what we're generating.

**How to Debug:**
- Open browser console → Network tab
- Look at `/api/services` response
- Compare `date` field with Airtable's `Service Date` field
- They MUST match character-for-character

---

### 2. **TEST ALL Q4 2025 SUNDAYS APPEAR**

**Expected Sundays:**
```
October:   6, 13, 20, 27  (4 Sundays)
November:  3, 10, 17, 24  (4 Sundays)  
December:  1, 8, 15, 22, 29 (5 Sundays)
TOTAL: 13 Sundays
```

**Test:** Scroll through the list - verify all 13 are visible

**Potential Bug:** October 6 might not show if quarter generation has off-by-one error.

---

### 3. **TEST CACHING FIXES** ⚠️

**Previous Issue:** "no matter how much I clear cache hard refresh etc, it shows previous versions"

**Tests:**
1. Make a signup
2. Open in incognito/private window - does it show?
3. Open on phone - does it show?
4. Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on PC) - does it show?
5. Close browser completely, reopen - does it show?

**What to Check:**
- Open DevTools → Application tab → Service Workers
- Should see `uumc-liturgist-v2` as active
- Open DevTools → Network tab → Disable cache checkbox
- Refresh and verify `Cache-Control: no-store` headers on API calls

---

### 4. **TEST DUPLICATE PREVENTION**

**Tests:**
1. Sign up as Main Liturgist for Oct 27
2. Open in another browser/device/incognito
3. Try to sign up for same service
4. Verify "Main Liturgist" is grayed out with "(Taken by [name])"
5. Verify only "Backup" is selectable
6. Submit as Backup - verify both names show

**Potential Bug:** Race condition if two people click submit at exact same millisecond

---

### 5. **TEST QUARTERLY NAVIGATION**

**Tests:**
1. Default view should show Q4 2025 (Oct-Dec)
2. Click "Next Quarter" → Should show Q1 2026 (Jan-Mar)
3. Verify amber warning box appears: "Sign-ups Open in December"
4. Verify all services are grayed out and non-clickable
5. Verify buttons say "Sign-ups Not Open Yet"
6. Click "Previous Quarter" → Should go back to Q4 2025
7. Click "Previous Quarter" again → Should show Q3 2025 (Jul-Sep)

**Potential Bug:** Q3 2025 is in the past - will it show services? Or just empty? Does it break?

---

### 6. **TEST MOBILE EXPERIENCE** 📱

**Critical Tests:**
1. Open on iPhone/Android (actual device, not simulator)
2. Password entry works? (doesn't auto-capitalize?)
3. Calendar widget doesn't block content?
4. Modal scrolls properly?
5. Touch targets are big enough? (buttons at least 44x44px)
6. Landscape orientation works?
7. Zoom in/out works?
8. Can type in text fields without keyboard covering them?

---

### 7. **TEST PASSWORD BEHAVIOR**

**Tests:**
1. Close all browser windows/tabs
2. Reopen liturgists.ukiahumc.org
3. Should show password screen
4. Enter wrong password → Should reject with error
5. Enter "lovewins" → Should enter successfully
6. Refresh page → Should stay logged in (sessionStorage)
7. Open in new tab → Should also be logged in
8. Close browser, reopen → Should ask for password again

---

### 8. **TEST EDGE CASES**

**Tests:**
1. **Long names:** Sign up as "Christopher Alexander Montgomery III" - does it display properly?
2. **Invalid email:** Try entering "notanemail" - does it accept it? (it will - no validation!)
3. **Empty phone:** Leave phone blank - does it work?
4. **Special characters:** Sign up as "José María" or "O'Brien" - works?
5. **Switching selections:** Select "Other", fill in name, then switch back to dropdown person - does it clear?
6. **Both roles filled:** Try to sign up when both Main and Backup are taken - does it block properly?

---

## 🐛 KNOWN/LIKELY BUGS

### Bug #1: **Date Matching Between Airtable and Generated Services**
- **Symptom:** Signups appear in Airtable but not on the page
- **Root Cause:** Format mismatch between what we generate (`2025-10-27`) and what Airtable stores
- **Priority:** 🔴 CRITICAL
- **Test:** Compare Airtable's "Service Date" field format with browser console logs

### Bug #2: **No Email Validation**
- **Symptom:** Can enter "notanemail" as email address
- **Impact:** Invalid emails get stored in Airtable
- **Priority:** 🟡 MEDIUM
- **Fix Needed:** Add regex validation before submit

### Bug #3: **Race Condition on Signups**
- **Symptom:** Two people might sign up for same role simultaneously
- **Impact:** Airtable would have two records for same role, page only shows one
- **Priority:** 🟡 MEDIUM
- **Test:** Use two devices, both click "Sign Up" at same exact moment

### Bug #4: **Service Worker Might Cache Old Version**
- **Symptom:** After code deploy, users see old version
- **Our Fix:** Changed cache name to v2, added `skipWaiting()`, network-first for HTML/API
- **Priority:** 🟡 MEDIUM
- **Test:** Deploy new version, check if users auto-update

### Bug #5: **No Confirmation After Signup**
- **Symptom:** User clicks submit, modal closes, no feedback
- **Impact:** User doesn't know if it worked
- **Priority:** 🟡 MEDIUM
- **Fix Needed:** Add success message/toast

### Bug #6: **Quarter Boundary Issues**
- **Symptom:** On Jan 1, 2026, what quarter shows? Q4 2025 or Q1 2026?
- **Impact:** Confusion, might show wrong data
- **Priority:** 🟢 LOW (not until Jan 1)
- **Test:** Change system date to Dec 31, 2025 / Jan 1, 2026

---

## ⚠️ MISSING FEATURES

### Critical (needed before launch):
- ❌ **No way to cancel/delete a signup** - If someone makes a mistake, they can't fix it
- ❌ **No email validation** - Could accept "notanemail" as valid
- ❌ **No confirmation message** - User doesn't know if signup succeeded
- ❌ **No error message if signup fails** - Silent failure

### Important (nice to have):
- ❌ No way to edit contact info after signup
- ❌ No email confirmation sent to user
- ❌ No admin dashboard to see all signups at once
- ❌ No ability to add notes (e.g., "I'll be 10 minutes late")
- ❌ No print-friendly view for printing schedules

### Enhancement (future):
- ❌ No calendar export (iCal/Google Calendar)
- ❌ No SMS reminders before service
- ❌ No "contact liturgist" button to email them
- ❌ No swap functionality (trade dates with someone)
- ❌ No history view (see what dates I served in past)

---

## ✅ RECOMMENDED PRE-LAUNCH ACTIONS

### Action 1: **Test the Complete Flow RIGHT NOW** ⚡
```
1. Visit liturgists.ukiahumc.org
2. Enter password: lovewins
3. Verify all 13 Q4 Sundays appear
4. Sign up for next Sunday (Oct 27) as Main Liturgist
5. Open Airtable - verify record is there with correct date format
6. Hard refresh page (Cmd+Shift+R) - does signup show?
7. Wait 10 seconds - does it auto-refresh?
8. Open on phone - does it show there too?
9. In another browser, try to sign up for same role - is it blocked/grayed out?
10. Sign up as Backup - does it allow you?
```

### Action 2: **Add Email Validation** (5 minutes)
Would you like me to add this now? Quick fix:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(signupForm.email)) {
  alert('Please enter a valid email address')
  return
}
```

### Action 3: **Add Success Confirmation** (5 minutes)
Would you like me to add this now? 
```typescript
// After successful signup
alert('✅ Success! You\'re signed up as ' + role + ' for ' + displayDate + 
      '\n\nYou should see your name appear within a few seconds.')
```

### Action 4: **Test on Actual Devices**
**Must test on:**
- [ ] iPhone Safari (actual phone, not simulator)
- [ ] Android Chrome (actual phone)
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Desktop Firefox

**Why:** Mobile browsers behave differently than desktop, especially with:
- Fixed positioning (calendar widget)
- Keyboard behavior
- Touch targets
- Viewport height calculations

### Action 5: **Verify Airtable Field Names** ⚠️ CRITICAL
Open your Airtable base and verify these field names match EXACTLY (case-sensitive):
- [ ] `Service Date`
- [ ] `Display Date`
- [ ] `Name`
- [ ] `Email`
- [ ] `Phone`
- [ ] `Role`
- [ ] `Submitted At`

If ANY field name is different, the app will break silently.

---

## 🎯 GO/NO-GO DECISION CRITERIA

### ✅ SAFE TO LAUNCH IF:
- [ ] You can sign up and it appears on the page within 5 seconds
- [ ] Hard refresh shows the signup
- [ ] Mobile works (tested on actual phone)
- [ ] Duplicate prevention works (grayed out options)
- [ ] All 13 Q4 2025 Sundays are visible
- [ ] Password gate works and persists in session
- [ ] Opening in incognito/new device shows signups

### 🚨 DO NOT LAUNCH IF:
- [ ] Signups go to Airtable but don't show on page (DATE MISMATCH BUG)
- [ ] Page shows old/cached version after refresh
- [ ] Mobile is completely broken (can't scroll, click, type)
- [ ] Can sign up for same role twice from different devices
- [ ] Services list is empty or shows wrong dates
- [ ] Password doesn't work

---

## 📝 SUGGESTED LAUNCH STRATEGY

### Option A: SOFT LAUNCH (Recommended)
1. **Email 2-3 trusted liturgists** who are tech-savvy
2. Give them password and ask them to test
3. Ask them to:
   - Try signing up
   - Try on phone
   - Report any issues
4. Fix any bugs they find
5. THEN email full list

**Email template for soft launch:**
```
Subject: Help Test New Liturgist Signup System

Hi [Name],

I've built a new online signup system for liturgists. Before I send it to 
everyone, could you help me test it?

Website: liturgists.ukiahumc.org
Password: lovewins

Please try:
1. Signing up for a Sunday
2. Checking that your name appears
3. Opening on your phone

Let me know if anything seems broken or confusing. Thanks!

- Sam
```

### Option B: FULL LAUNCH (Higher Risk)
Send to everyone immediately, but:
1. Monitor Airtable for signups in first hour
2. Have phone ready for support calls
3. Be prepared to fix bugs quickly
4. Send follow-up email if issues found

---

## 🔧 QUICK FIXES TO ADD BEFORE LAUNCH

### Fix #1: Email Validation (2 minutes)
**Problem:** Accepts invalid emails like "notanemail"  
**Solution:** Add regex check  
**Do you want me to add this now?** YES / NO

### Fix #2: Success Message (2 minutes)
**Problem:** No feedback after signup  
**Solution:** Show alert/toast with confirmation  
**Do you want me to add this now?** YES / NO

### Fix #3: Better Error Messages (5 minutes)
**Problem:** Silent failures if API breaks  
**Solution:** Show user-friendly error messages  
**Do you want me to add this now?** YES / NO

---

## 📊 MONITORING AFTER LAUNCH

### What to Watch:
1. **Airtable record count** - Should increase as people sign up
2. **Empty services** - Are people avoiding certain dates?
3. **Support questions** - Track what confuses people
4. **Mobile vs desktop usage** - Check analytics
5. **Error logs** - Check browser console for errors

### Red Flags:
- 🚩 People signing up but not showing on page
- 🚩 Same role filled by multiple people
- 🚩 Services not appearing
- 🚩 Mobile users can't access
- 🚩 Multiple people reporting "broken" or "doesn't work"

---

## 🆘 TROUBLESHOOTING GUIDE FOR USERS

If someone reports an issue:

**"I signed up but don't see my name"**
1. Ask them to hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
2. Check Airtable - is their signup there?
3. Check the date format in Airtable matches exactly
4. If in Airtable but not showing: DATE MISMATCH BUG

**"I can't click the Sign Up button"**
1. Is the service grayed out? → Already filled
2. Are they viewing Q1 2026? → That's locked
3. Try refreshing the page

**"It won't accept my email"**
1. Currently NO validation, should accept anything
2. If seeing error: unexpected bug, report to you

**"I made a mistake and need to cancel"**
1. Currently NO cancel feature
2. You need to manually delete from Airtable
3. Then page will update within 5 seconds

---

## 📞 SUPPORT PLAN

**If you're launching, be prepared for:**
- Phone calls from less tech-savvy people
- Questions about the password
- "How do I...?" questions
- Bug reports

**Have ready:**
- Phone charged and nearby
- Airtable open to manually fix issues
- Laptop ready to deploy fixes
- This checklist for reference

---

## ✨ FINAL THOUGHTS

**The app is 85% ready.** The core functionality works, but there are rough edges:
- No email validation
- No confirmation messages
- No way to cancel/edit
- Caching issues might still exist

**If you need this live TODAY:** Do the soft launch with 2-3 people first.  
**If you can wait 1-2 days:** Let me add email validation and confirmation messages.  
**If you can wait a week:** We can add cancel/edit functionality.

**Most critical test:** Sign up yourself right now, verify it appears in Airtable AND on the page.

---

## 📅 NEXT STEPS

- [ ] Run through complete test flow yourself
- [ ] Test on your phone
- [ ] Decide: soft launch or full launch?
- [ ] Want me to add email validation + confirmation? (10 min)
- [ ] Set a launch date/time
- [ ] Prepare support plan

**Last updated:** October 23, 2025  
**Your call:** What do you want to do first?
