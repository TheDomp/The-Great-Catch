import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const testProfile = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'test-profile.json'), 'utf-8'));

test.describe('Authentication Flow', () => {
    test('should login successfully as a customer', async ({ page }) => {
        await page.goto('/login');

        await page.fill('[data-testid="login-email"]', testProfile.customer.email);
        await page.fill('[data-testid="login-password"]', testProfile.customer.password);
        await page.click('button[type="submit"]');

        // Should redirect to home page (or dashboard depending on app logic)
        await expect(page).toHaveURL('/');

        // Verify navigation changes (e.g., login button becomes profile or logout)
        const cartBtn = page.locator('[data-testid="cart-btn"]');
        await expect(cartBtn).toBeVisible();
    });

    test('should login as an admin', async ({ page }) => {
        await page.goto('/login');

        await page.fill('[data-testid="login-email"]', testProfile.admin.email);
        await page.fill('[data-testid="login-password"]', testProfile.admin.password);
        await page.click('button[type="submit"]');

        // Should redirect to admin dashboard
        await expect(page).toHaveURL(/\/admin/);

        await page.goto('/admin');
        await expect(page).toHaveURL('/admin');
        await expect(page.locator('h1')).toContainText(/ADMIRALTY|Admin/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', 'wrong@test.se');
        await page.fill('input[type="password"]', 'WrongPassword123!');
        await page.click('button[type="submit"]');

        const errorMsg = page.locator('[data-testid="login-error"]');
        await expect(errorMsg).toBeVisible();
    });
});
