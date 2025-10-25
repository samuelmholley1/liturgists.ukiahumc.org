# E2E Testing Guide - Playwright

## Quick Start

### Run All Tests (Headless)
```bash
npm run test:e2e
```

### Run Tests with UI (Visual Mode)
```bash
npm run test:e2e:ui
```

### Run Tests in Browser (See what's happening)
```bash
npm run test:e2e:headed
```

### View Last Test Report
```bash
npm run test:e2e:report
```

---

## What Gets Tested (15 Tests Total)

### ✅ **Authentication**
1. Password gate works (wrong password fails, correct succeeds)

### ✅ **Service Display**
2. All Q4 2025 Sundays appear (13 Sundays)
3. Christmas Eve appears with Christ Candle instructions
4. Advent badges show cumulative candles (1, 2, 3, 4 candles)

### ✅ **UI Behavior**
5. Signup modal opens and closes
6. Quarterly navigation works (Q3, Q4, Q1-locked)
7. Modal state doesn't leak between quarters
8. Real-time updates indicator shows
9. Mobile viewport renders correctly

### ✅ **Validation (Critical Bugs)**
10. Empty name validation prevents blank submissions
11. Email validation rejects invalid formats
12. Phone validation checks format and length
13. Loading state prevents double submission

### ✅ **Data Integrity**
14. Duplicate signup prevention UI check
15. Service worker registration

---

## Test Results Interpretation

### ✅ **All Pass** → Ready to launch!
- All critical bugs fixed
- UI works as expected
- Validation in place

### ⚠️ **Some Fail** → Check these first:
- **Password gate fail**: Check sessionStorage clearing
- **Services missing**: API route issue or date logic
- **Validation fails**: Regex or validation logic broken
- **Modal leak**: State management issue

### ❌ **Many Fail** → Don't launch
- Something major is broken
- Check browser console for errors
- Run in headed mode to see what's happening

---

## Running Tests Before Each Deploy

**Pre-Launch Checklist:**
```bash
# 1. Start dev server (if not already running)
npm run dev

# 2. Run E2E tests in separate terminal
npm run test:e2e

# 3. If all pass, deploy
npm run build
```

**After Deploy to Production:**
```bash
# Test against live site
BASE_URL=https://liturgists.ukiahumc.org npm run test:e2e
```

---

## What Tests DON'T Cover (Manual Testing Still Needed)

### ❌ **Not Automated:**
1. **Airtable Integration** - Tests don't create real signups (would pollute data)
2. **Real-time Sync** - Can't verify Airtable → App updates without real data
3. **Multi-User Race Conditions** - Need multiple browsers simultaneously
4. **Email Sending** - No email testing included
5. **Actual Phone Calls** - Phone numbers aren't dialed

### 🔄 **Manual Testing Required:**
- Sign up for a real service (Nov 3) as yourself
- Verify it appears in Airtable immediately
- Refresh page, verify signup shows
- Have someone else try to sign up for same role (should be blocked)
- Test on actual mobile device (iPhone/Android)

---

## Troubleshooting

### "Error: Browser not found"
```bash
npx playwright install chromium
```

### "Port 3000 already in use"
Kill existing dev server:
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Tests timeout
- Increase timeout in `playwright.config.ts`
- Check if API routes are responding
- Run in headed mode to see where it hangs

### Tests fail inconsistently
- Network issues (Airtable API slow)
- Rate limiting triggered
- Service worker cache issues

---

## Understanding Test Output

### ✅ Green = Pass
Test executed and passed all assertions

### ❌ Red = Fail
Test failed - see error message and screenshot

### ⏭️ Skipped
Test was skipped (optional tests)

### 🔄 Flaky
Test passed on retry (investigate why)

---

## CI/CD Integration (Future)

To run tests on GitHub Actions:
```yaml
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright
  run: npx playwright install --with-deps chromium
  
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Upload test report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

---

## Test Maintenance

### When to Update Tests:

1. **New Feature Added** → Add new test
2. **UI Change** → Update selectors (e.g., button text changed)
3. **Validation Change** → Update validation tests
4. **New Quarter** → Update date expectations
5. **Airtable Schema Change** → Tests might break if field names change

### Quick Test Updates:

**Change password:**
```typescript
const PASSWORD = 'newpassword' // Line 3 in spec file
```

**Change expected dates:**
```typescript
const expectedDates = [ /* new dates */ ] // Line 44
```

**Add new test:**
```typescript
test('16 - My new feature', async ({ page }) => {
  // Test logic here
})
```

---

## Performance Benchmarks

**Typical Test Run Times:**
- All 15 tests: ~60-90 seconds
- Single test: ~3-5 seconds
- With headed mode: +30% slower

**If tests take longer:**
- Airtable API slow (network issue)
- Heavy load on dev server
- Service worker caching delays

---

## Summary

### ✅ **Tests Automate 80% of Manual Work**
- Password checking
- UI rendering
- Form validation
- Navigation logic
- Mobile responsiveness

### ❌ **Still Need Manual Testing for:**
- Real Airtable signups
- Multi-user scenarios
- Email functionality
- Production environment

### 🎯 **Recommended Workflow:**
1. **Before every commit**: Run `npm run test:e2e`
2. **Before soft launch**: Manual test on real phone
3. **Before full launch**: Soft launch with 2-3 people
4. **After launch**: Monitor for issues, run tests weekly

---

**TLDR:** Run `npm run test:e2e` before each deploy. If all pass, you're 80% confident. Then do one manual signup test to verify Airtable integration, and you're good to go! 🚀
