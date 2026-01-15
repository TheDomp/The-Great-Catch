import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const testProfile = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'test-profile.json'), 'utf-8'));

test.describe('Chaos Engine Handling', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Expand Chaos Control Panel
        await page.click('[data-testid="chaos-toggle-btn"]');
    });

    test('should show error when server error mode is enabled', async ({ page }) => {
        // Enable 500 Error
        await page.click('[data-testid="toggle-500"]');

        // Wait for UI to register the toggle
        await page.waitForTimeout(500);

        // Trigger a fetch (e.g., click a category)
        // We use a try-catch or check visibility because the error might already have triggered
        const categoryBtn = page.locator('[data-testid="filter-category-rod"]');
        if (await categoryBtn.isVisible()) {
            await categoryBtn.click();
        }

        // Check for error state in UI
        const errorIndicator = page.locator('text=/Failed to fetch|Error|Something went wrong/i');
        await expect(errorIndicator.first()).toBeVisible({ timeout: 5000 });
    });

    test('should apply latency when latency mode is enabled', async ({ page }) => {
        // Enable Latency
        const toggle = page.locator('[data-testid="toggle-latency"]');
        await toggle.click();

        // Wait for UI to settle
        await page.waitForTimeout(500);

        const productCount = page.locator('[data-testid="product-count"]');
        const categoryBtn = page.locator('[data-testid="filter-category-rod"]');

        const startTime = Date.now();
        await categoryBtn.click();

        // Wait for it to enter loading state ("...") and then finish
        await expect(productCount).toHaveText('...', { timeout: 2000 });
        await expect(productCount).not.toHaveText('...', { timeout: 15000 });

        const duration = Date.now() - startTime;
        console.log(`Manual fetch duration with latency: ${duration}ms`);

        // With 2000ms delay in code, we expect at least 1400ms (accounting for jitter)
        expect(duration).toBeGreaterThan(1400);
    });

    test('should fail checkout when stock mismatch mode is enabled', async ({ page }) => {
        // Enable Stock Mismatch (replaces validation fail which wasn't fully implemented in useApi)
        await page.click('[data-testid="toggle-stock"]');
        await page.waitForTimeout(500);

        // Add item and go to checkout
        await page.locator('[data-testid^="add-to-cart-"]').first().click();
        await page.locator('[data-testid="cart-btn"]').click();

        // Wait for cart drawer/page to be ready
        const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
        await expect(checkoutBtn).toBeVisible();
        await checkoutBtn.click();

        // Handle possible Login redirect
        try {
            await Promise.race([
                page.waitForSelector('[data-testid="input-street"]', { timeout: 5000 }),
                page.waitForSelector('[data-testid="login-email"]', { timeout: 5000 })
            ]);
        } catch (e) {
            // Might already be on a page, proceed
        }

        if (await page.locator('[data-testid="login-email"]').isVisible()) {
            await page.fill('[data-testid="login-email"]', testProfile.customer.email);
            await page.fill('[data-testid="login-password"]', testProfile.customer.password);
            await Promise.all([
                page.waitForURL(/checkout/),
                page.click('button[type="submit"]')
            ]);
            await page.waitForSelector('[data-testid="input-street"]', { timeout: 10000 });
        }

        // Fill data and try to submit
        await page.fill('[data-testid="input-street"]', 'Test Way 1');
        await page.fill('[data-testid="input-city"]', 'Test City');
        await page.fill('[data-testid="input-zip"]', '12345');
        await page.click('[data-testid="next-to-payment"]');

        await page.fill('[data-testid="input-card"]', '1234567812345678');
        await page.fill('[data-testid="input-expiry"]', '12/26');
        await page.fill('[data-testid="input-cvc"]', '123');

        // Submit order
        await page.click('[data-testid="submit-order-btn"]');

        // Verify error message (thematic message from useApi)
        const errorMsg = page.locator('text=/Mission Aborted|Critical stock depletion/i');
        await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });
    });
});
