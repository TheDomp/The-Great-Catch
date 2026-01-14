import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Accessibility Scans', () => {
    test('homepage should not have detectable a11y issues', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('[data-testid="logo-text"]');

        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

        // We expect no violations. If there are any, they will be listed in the report.
        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('shop filtered by category should not have issues', async ({ page }) => {
        await page.goto('/?category=rod');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('[data-testid="logo-text"]');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('login page should be accessible', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('[data-testid="code-version-marker"]');
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
