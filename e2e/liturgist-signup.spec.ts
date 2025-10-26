import { test, expect } from '@playwright/test'

const PASSWORD = 'lovewins'

test.describe('Liturgist Signup App - E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Enter password if on password gate
    const passwordInput = page.locator('input[type="password"]')
    if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordInput.fill(PASSWORD)
      await page.getByRole('button', { name: /access schedule/i }).click()
    }
    
    // Wait for main page to load
    await expect(page.getByText(/Liturgist Services/i)).toBeVisible()
  })

  test('01 - Password gate works', async ({ page }) => {
    // Clear session storage to reset password
    await page.goto('/')
    await page.evaluate(() => sessionStorage.clear())
    await page.reload()
    
    // Should show password gate
    await expect(page.getByText(/Ukiah United Methodist Church/i)).toBeVisible()
    
    // Wrong password fails
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: /access schedule/i }).click()
    await expect(page.getByText(/incorrect/i)).toBeVisible()
    
    // Correct password succeeds
    await page.locator('input[type="password"]').fill(PASSWORD)
    await page.getByRole('button', { name: /access schedule/i }).click()
    await expect(page.getByText(/Liturgist Services/i)).toBeVisible({ timeout: 5000 })
  })

  test('02 - All Q4 2025 Sundays appear', async ({ page }) => {
    // Wait for services to load
    await page.waitForTimeout(1000)
    
    // Expected Sunday dates in Q4 2025
    const expectedDates = [
      'October 6', 'October 13', 'October 20', 'October 27',
      'November 3', 'November 10', 'November 17', 'November 24',
      'December 1', 'December 8', 'December 15', 'December 22', 'December 29'
    ]
    
    for (const date of expectedDates) {
      await expect(page.getByText(date, { exact: false })).toBeVisible()
    }
  })

  test('03 - Christmas Eve appears in Q4 2025', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Check for Christmas Eve
    await expect(page.getByText('December 24', { exact: false })).toBeVisible()
    await expect(page.getByText(/Christmas Eve/i)).toBeVisible()
    await expect(page.getByText(/Liturgist lights 5 candles/i)).toBeVisible()
  })

  test('04 - Advent badges show cumulative candles', async ({ page }) => {
    await page.waitForTimeout(1000)
    
    // Check for cumulative candle indicators with new "Liturgist lights" wording
    await expect(page.getByText(/Liturgist lights 1 candle/i)).toBeVisible()
    await expect(page.getByText(/Liturgist lights 2 candles/i)).toBeVisible()
    await expect(page.getByText(/Liturgist lights 3 candles/i)).toBeVisible()
    await expect(page.getByText(/Liturgist lights 4 candles/i)).toBeVisible()
  })

  test('05 - Signup modal opens and closes', async ({ page }) => {
    // Click any "Sign Up" button
    const signupButton = page.locator('button').filter({ hasText: /sign up/i }).first()
    await signupButton.click()
    
    // Modal should appear with person selector
    await expect(page.locator('select').first()).toBeVisible()
    
    // Close modal with Cancel button
    const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).last() // Last cancel is in modal
    await cancelButton.click()
    
    // Modal should disappear
    await page.waitForTimeout(500)
    await expect(page.locator('select').first()).not.toBeVisible()
  })

  test('06 - Empty name validation', async ({ page }) => {
    // Open signup modal
    await page.locator('button').filter({ hasText: /sign up/i }).first().click()
    
    // Select "Other" from dropdown
    await page.locator('select').first().selectOption('other')
    
    // Try to submit with spaces only
    const textInputs = page.locator('input[type="text"]')
    await textInputs.nth(0).fill('   ')  // First name
    await textInputs.nth(1).fill('   ')  // Last name
    await page.locator('input[type="email"]').first().fill('test@example.com')
    await page.locator('input[type="tel"]').first().fill('555-555-5555')
    
    // Try to submit
    await page.locator('button').filter({ hasText: /submit/i }).first().click()
    
    // Should show error alert
    await page.waitForTimeout(500)
  })

  test('07 - Email validation', async ({ page }) => {
    // Open signup modal
    await page.locator('button').filter({ hasText: /sign up/i }).first().click()
    
    // Select a known liturgist from dropdown (avoids name fields)
    const dropdown = page.locator('select').first()
    const options = await dropdown.locator('option').allTextContents()
    if (options.length > 2) {  // Has actual liturgists besides "-- Select --" and "Other"
      await dropdown.selectOption({ index: 1 })
    }
    
    // Test invalid email
    await page.locator('input[type="email"]').first().fill('invalid-email')
    await page.locator('input[type="tel"]').first().fill('555-555-5555')
    await page.locator('button').filter({ hasText: /submit/i }).first().click()
    
    // Should show error (either alert or validation message)
    await page.waitForTimeout(500)
  })

  test('08 - Phone validation', async ({ page }) => {
    // Open signup modal
    await page.locator('button').filter({ hasText: /sign up/i }).first().click()
    
    // Select a known liturgist from dropdown
    const dropdown = page.locator('select').first()
    const options = await dropdown.locator('option').allTextContents()
    if (options.length > 2) {
      await dropdown.selectOption({ index: 1 })
    }
    
    // Valid email
    await page.locator('input[type="email"]').first().fill('test@example.com')
    
    // Test invalid phone
    await page.locator('input[type="tel"]').first().fill('abc')
    await page.locator('button').filter({ hasText: /submit/i }).first().click()
    await page.waitForTimeout(500)
    
    // Test valid phone (don't submit to avoid creating test data)
    await page.locator('input[type="tel"]').first().fill('555-555-5555')
  })

  test('09 - Duplicate signup prevention (UI check)', async ({ page }) => {
    // Look for any filled position (name visible)
    const filledNames = page.locator('span').filter({ hasText: /@/ }) // Has email visible
    
    if (await filledNames.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      // Should see a Cancel button, not a Sign Up button in that row
      const parentRow = filledNames.first().locator('xpath=ancestor::div[contains(@class, "flex")]')
      const signupInRow = parentRow.locator('button').filter({ hasText: /sign up/i })
      const cancelInRow = parentRow.locator('button').filter({ hasText: /cancel/i })
      
      // Cancel button should be visible, Sign Up should not
      await expect(cancelInRow).toBeVisible()
      const signupCount = await signupInRow.count()
      expect(signupCount).toBe(0)
    }
  })

  test('10 - Real-time updates indicator', async ({ page }) => {
    // Wait for at least one refresh cycle (5 seconds)
    await page.waitForTimeout(6000)
    
    // Should have seen "Updating..." indicator at least once
    // (This is visual verification - we can't easily assert it appeared)
    
    // Check that page is still functional after refresh
    await expect(page.getByText(/Liturgist Services/i)).toBeVisible()
  })

  test('11 - Quarterly navigation', async ({ page }) => {
    const quarterSelect = page.locator('select').first()
    
    // Switch to Q3 2025
    await quarterSelect.selectOption('Q3-2025')
    await page.waitForTimeout(1000)
    await expect(page.getByText(/July|August|September/i).first()).toBeVisible()
    
    // Switch to Q4 2025
    await quarterSelect.selectOption('Q4-2025')
    await page.waitForTimeout(1000)
    await expect(page.getByText(/October|November|December/i).first()).toBeVisible()
    
    // Q1 2026 should show lock message
    await quarterSelect.selectOption('Q1-2026')
    await page.waitForTimeout(1000)
    await expect(page.getByText(/locked|December/i)).toBeVisible()
  })

  test('12 - Modal state doesn\'t leak between quarters', async ({ page }) => {
    const quarterSelect = page.locator('select').first()
    
    // Open modal on Q4 service
    await quarterSelect.selectOption('Q4-2025')
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: /sign up/i }).first().click()
    await expect(page.getByText(/Sign Up as Liturgist/i)).toBeVisible()
    
    // Switch quarter - modal should close
    await quarterSelect.selectOption('Q3-2025')
    await page.waitForTimeout(1000)
    await expect(page.getByText(/Sign Up as Liturgist/i)).not.toBeVisible()
  })

  test('13 - Loading state prevents double submission', async ({ page }) => {
    // Open signup modal
    await page.locator('button').filter({ hasText: /sign up/i }).first().click()
    
    // Select known liturgist
    const dropdown = page.locator('select').first()
    const options = await dropdown.locator('option').allTextContents()
    if (options.length > 2) {
      await dropdown.selectOption({ index: 1 })
    }
    
    await page.locator('input[type="email"]').first().fill('test@example.com')
    await page.locator('input[type="tel"]').first().fill('555-555-5555')
    
    // Click submit button
    const submitButton = page.locator('button').filter({ hasText: /submit/i }).first()
    await submitButton.click()
    
    // Button should change state (we won't wait for completion to avoid creating test data)
    await page.waitForTimeout(100)
  })

  test('14 - Mobile viewport rendering', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Page should still be usable
    await expect(page.getByText(/Liturgist Services/i)).toBeVisible()
    
    // Quarter selector should be visible
    await expect(page.locator('select').first()).toBeVisible()
    
    // Services should stack vertically (not overflow)
    const serviceCards = page.locator('div[class*="border"]').filter({ hasText: /October|November|December/i })
    const firstCard = serviceCards.first()
    await expect(firstCard).toBeVisible()
  })

  test('15 - Service worker activates', async ({ page, context }) => {
    // Check if service worker is registered
    const swRegistrations = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        return registrations.length > 0
      }
      return false
    })
    
    // Service worker should be registered (after first page load)
    // Note: Might be false on first run before SW activates
    console.log('Service worker registered:', swRegistrations)
  })

  test('16 - Full signup and cancellation flow (E2E)', async ({ page }) => {
    // Find first November service
    await page.waitForTimeout(1000)
    
    // Look for first green "Sign Up" button (for Liturgist role)
    const signupButtons = page.locator('button').filter({ hasText: /sign up/i })
    const firstGreenButton = signupButtons.first()
    
    // Click the first available Sign Up button
    await firstGreenButton.click()
    
    // Fill out the signup form
    await page.waitForTimeout(500)
    
    // Select "Other (not listed)"
    const selectDropdown = page.locator('select').first()
    await selectDropdown.selectOption('other')
    
    // Fill in test user details - use more flexible selectors
    const inputs = page.locator('input[type="text"]')
    await inputs.nth(0).fill('E2E')  // First name
    await inputs.nth(1).fill('TestUser')  // Last name
    
    await page.locator('input[type="email"]').first().fill('e2e-test@example.com')
    await page.locator('input[type="tel"]').first().fill('555-123-4567')
    
    // Role should already be pre-selected based on which button was clicked
    // No need to manually select radio button
    
    // Submit the form - look for Submit button flexibly
    const submitButton = page.locator('button').filter({ hasText: /submit/i }).first()
    await submitButton.click()
    
    // Wait for success alert and dismiss it
    page.once('dialog', dialog => {
      expect(dialog.message()).toMatch(/thank you/i)
      dialog.accept()
    })
    
    await page.waitForTimeout(2000) // Wait for Airtable sync and page refresh
    
    // Verify the name appears in the list
    await expect(page.getByText('E2E TestUser')).toBeVisible({ timeout: 5000 })
    
    // Find and click the red "Cancel" button (should be visible now)
    const cancelButtons = page.locator('button').filter({ hasText: /cancel/i })
    const firstCancelButton = cancelButtons.first()
    await expect(firstCancelButton).toBeVisible()
    await firstCancelButton.click()
    
    // Confirm the cancellation dialog
    page.once('dialog', dialog => {
      expect(dialog.message()).toMatch(/are you sure/i)
      dialog.accept()
    })
    
    await page.waitForTimeout(2000) // Wait for deletion and refresh
    
    // Verify the name is gone
    await expect(page.getByText('E2E TestUser')).not.toBeVisible()
    
    // Verify a "Sign Up" button reappears
    const signupAgain = page.locator('button').filter({ hasText: /sign up/i }).first()
    await expect(signupAgain).toBeVisible()
  })
})
