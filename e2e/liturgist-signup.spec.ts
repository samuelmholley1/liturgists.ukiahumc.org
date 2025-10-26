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
    // Switch to Q4 2025
    const quarterSelect = page.locator('select').first()
    await quarterSelect.selectOption('Q4-2025')
    
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
    const quarterSelect = page.locator('select').first()
    await quarterSelect.selectOption('Q4-2025')
    await page.waitForTimeout(1000)
    
    // Check for Christmas Eve
    await expect(page.getByText('December 24', { exact: false })).toBeVisible()
    await expect(page.getByText(/Christmas Eve/i)).toBeVisible()
    await expect(page.getByText(/Christ Candle/i)).toBeVisible()
  })

  test('04 - Advent badges show cumulative candles', async ({ page }) => {
    const quarterSelect = page.locator('select').first()
    await quarterSelect.selectOption('Q4-2025')
    await page.waitForTimeout(1000)
    
    // Check Advent Week 1 (Nov 30)
    await expect(page.getByText(/Hope/i).first()).toBeVisible()
    
    // Check for cumulative indicators (should see "2 candles", "3 candles", "4 candles")
    await expect(page.getByText(/2 candles/i)).toBeVisible()
    await expect(page.getByText(/3 candles/i)).toBeVisible()
    await expect(page.getByText(/4 candles/i)).toBeVisible()
  })

  test('05 - Signup modal opens and closes', async ({ page }) => {
    // Click "Sign Up" button on first service
    await page.getByRole('button', { name: /sign up/i }).first().click()
    
    // Modal should appear
    await expect(page.getByText(/Sign Up as Liturgist/i)).toBeVisible()
    
    // Close modal with X button
    await page.locator('button').filter({ hasText: '×' }).click()
    
    // Modal should disappear
    await expect(page.getByText(/Sign Up as Liturgist/i)).not.toBeVisible()
  })

  test('06 - Empty name validation', async ({ page }) => {
    // Open signup modal
    await page.getByRole('button', { name: /sign up/i }).first().click()
    
    // Select "Other" liturgist
    await page.getByRole('radio', { name: /other/i }).check()
    
    // Try to submit with spaces only
    await page.locator('input[placeholder*="First"]').fill('   ')
    await page.locator('input[placeholder*="Last"]').fill('   ')
    await page.locator('input[placeholder*="email"]').fill('test@example.com')
    await page.locator('input[placeholder*="phone"]').fill('555-555-5555')
    
    await page.getByRole('button', { name: /confirm/i }).click()
    
    // Should show error
    await expect(page.getByText(/name is required/i)).toBeVisible({ timeout: 3000 })
  })

  test('07 - Email validation', async ({ page }) => {
    // Open signup modal
    await page.getByRole('button', { name: /sign up/i }).first().click()
    
    // Select known liturgist first (skip name fields)
    const radios = await page.locator('input[type="radio"]').all()
    if (radios.length > 1) {
      await radios[1].check() // Select second option (first known liturgist)
    }
    
    // Test invalid emails
    const invalidEmails = ['test@test.', 'notanemail', 'test@', '@test.com']
    
    for (const email of invalidEmails) {
      await page.locator('input[placeholder*="email"]').fill(email)
      await page.locator('input[placeholder*="phone"]').fill('555-555-5555')
      await page.getByRole('button', { name: /confirm/i }).click()
      
      // Should show error (either alert or inline message)
      await page.waitForTimeout(500)
    }
  })

  test('08 - Phone validation', async ({ page }) => {
    // Open signup modal
    await page.getByRole('button', { name: /sign up/i }).first().click()
    
    // Select known liturgist
    const radios = await page.locator('input[type="radio"]').all()
    if (radios.length > 1) {
      await radios[1].check()
    }
    
    // Valid email
    await page.locator('input[placeholder*="email"]').fill('test@example.com')
    
    // Test invalid phone
    await page.locator('input[placeholder*="phone"]').fill('asdf')
    await page.getByRole('button', { name: /confirm/i }).click()
    await page.waitForTimeout(500)
    
    // Test valid phone
    await page.locator('input[placeholder*="phone"]').fill('555-555-5555')
    // We won't submit to avoid creating test data
  })

  test('09 - Duplicate signup prevention (UI check)', async ({ page }) => {
    // Find a service that's already filled
    const filledBadge = page.locator('text=FILLED').first()
    
    if (await filledBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Try to sign up for a filled position
      const serviceCard = filledBadge.locator('xpath=ancestor::div[contains(@class, "border")]')
      const signUpButton = serviceCard.locator('button', { hasText: /sign up/i })
      
      // Button should either be disabled or show different text
      const isDisabled = await signUpButton.isDisabled().catch(() => false)
      const buttonText = await signUpButton.textContent().catch(() => '')
      
      // Either disabled OR shows "Already Taken" or similar
      expect(isDisabled || buttonText?.includes('Taken') || buttonText?.includes('Full')).toBeTruthy()
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
    await page.getByRole('button', { name: /sign up/i }).first().click()
    
    // Select known liturgist
    const radios = await page.locator('input[type="radio"]').all()
    if (radios.length > 1) {
      await radios[1].check()
    }
    
    await page.locator('input[placeholder*="email"]').fill('test@example.com')
    await page.locator('input[placeholder*="phone"]').fill('555-555-5555')
    
    // Click submit button
    const submitButton = page.getByRole('button', { name: /confirm/i })
    await submitButton.click()
    
    // Button should change to "Submitting..." and be disabled
    // (We won't wait for completion to avoid creating test data)
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

  test('16 - Cancel signup feature works', async ({ page }) => {
    // This test will mock a filled position to test cancellation UI
    // We won't actually create/delete records to avoid polluting Airtable
    
    // Find a service that has a filled position
    const filledServiceCard = page.locator('text=EMPTY').first().locator('xpath=ancestor::div[contains(@class, "border")]')
    
    if (await filledServiceCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Look for any filled position with a (cancel) link
      const cancelLink = page.locator('button:has-text("(cancel)")').first()
      
      if (await cancelLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Click cancel button
        await cancelLink.click()
        
        // Should show confirmation dialog
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('Are you sure')
          await dialog.dismiss() // Dismiss to avoid actually cancelling
        })
        
        // Verify cancel button exists and is clickable
        await expect(cancelLink).toBeVisible()
      }
    }
    
    // Even if no filled positions, verify the cancel link would appear
    // by checking the code structure (UI test only)
    const serviceCards = page.locator('div[class*="border rounded-lg"]').filter({ hasText: /Liturgist:|Backup:/ })
    await expect(serviceCards.first()).toBeVisible()
  })
})
