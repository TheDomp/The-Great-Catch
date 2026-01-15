import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const testProfile = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'test-profile.json'), 'utf-8'));

test.describe('Checkout Flow', () => {
    test('should complete a full purchase flow with Carbon-Elite Caster', async ({ page }) => {
        // 1. Add 'Carbon-Elite Caster' to cart
        await page.goto('/');
        const premiumRod = page.locator('[data-testid="product-card-rod-1"]');
        await expect(premiumRod).toBeVisible();
        await page.locator('[data-testid="add-to-cart-rod-1"]').click();

        // 2. Go to cart
        await page.locator('[data-testid="cart-btn"]').click();
        await page.click('[data-testid="checkout-btn"]');

        // 3. Handle possible Login redirect
        // Wait for either the address form or the login page
        await Promise.race([
            page.waitForSelector('[data-testid="input-street"]', { timeout: 10000 }),
            page.waitForSelector('[data-testid="login-email"]', { timeout: 10000 })
        ]);

        if (await page.locator('[data-testid="login-email"]').isVisible()) {
            await page.fill('[data-testid="login-email"]', testProfile.customer.email);
            await page.fill('[data-testid="login-password"]', testProfile.customer.password);
            await Promise.all([
                page.waitForURL('**/checkout'),
                page.click('button[type="submit"]')
            ]);
            // Wait for address form to appear after login redirect
            await page.waitForSelector('[data-testid="input-street"]', { timeout: 10000 });
        }

        // 4. Fill Address
        await page.fill('[data-testid="input-street"]', testProfile.customer.address.street);
        await page.fill('[data-testid="input-city"]', testProfile.customer.address.city);
        await page.fill('[data-testid="input-zip"]', testProfile.customer.address.zip);
        await page.click('[data-testid="next-to-payment"]');

        // 5. Fill Payment
        await page.fill('[data-testid="input-card"]', testProfile.customer.payment.cardNumber);
        await page.fill('[data-testid="input-expiry"]', testProfile.customer.payment.expiry);
        await page.fill('[data-testid="input-cvc"]', testProfile.customer.payment.cvc);

        // 6. Apply Discount
        await page.fill('[data-testid="input-discount"]', testProfile.customer.discountCode);
        await expect(page.locator('text=20% Garrison Rebate Authorized')).toBeVisible();

        // 7. Submit Order
        await page.click('[data-testid="submit-order-btn"]');

        // 8. Verify Success or capture error
        const successMsg = page.locator('[data-testid="order-success-msg"]');
        const errorMsg = page.locator('[data-testid="checkout-error"]');

        await Promise.race([
            expect(successMsg).toBeVisible({ timeout: 10000 }),
            expect(errorMsg).toBeVisible({ timeout: 10000 })
        ]).catch(() => { });

        if (await errorMsg.isVisible()) {
            const text = await errorMsg.innerText();
            throw new Error(`Checkout failed with error: ${text}`);
        }

        await expect(successMsg).toBeVisible();
        await expect(page.locator('[data-testid="order-id"]')).not.toBeEmpty();
    });
});
