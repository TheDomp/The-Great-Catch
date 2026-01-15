import { test, expect } from '@playwright/test';

test.describe('Shop Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display all v0.8.0 handcrafted products', async ({ page }) => {
        // Check if products are visible
        const productCards = page.locator('[data-testid^="product-card-"]');
        await expect(productCards.first()).toBeVisible();

        // Verify exact v0.8.0 product count
        const productCount = await productCards.count();
        expect(productCount).toBe(14);

        // Verify premium handcrafted items are present
        await expect(page.locator('text=Carbon-Elite Caster')).toBeVisible();
        await expect(page.locator('text=Storm-Shield Chest Waders')).toBeVisible();
        await expect(page.locator('text=Cyber-Byte Robotic Frog')).toBeVisible();
    });

    test('should filter by specific v0.8.0 categories', async ({ page }) => {
        // Filter by 'rod'
        const rodFilter = page.locator('[data-testid="filter-category-rod"]');
        await rodFilter.click();

        // Verify filtered results - expect 3 rods in v0.8.0
        const filteredCards = page.locator('[data-testid^="product-card-rod-"]');
        await expect(filteredCards).toHaveCount(3);
        await expect(page.locator('text=Carbon-Elite Caster')).toBeVisible();
        await expect(page.locator('text=Ocean-Blue Deep Sea')).toBeVisible();
        await expect(page.locator('text=Trout-Whisperer Lite')).toBeVisible();

        // Verify that other categories are NOT visible
        const reelCards = page.locator('[data-testid^="product-card-reel-"]');
        await expect(reelCards).toHaveCount(0);
    });

    test('should add a product to the cart', async ({ page }) => {
        // Find first product and click 'Add to Cart'
        const firstProduct = page.locator('[data-testid^="product-card-"]').first();
        const productId = await firstProduct.getAttribute('data-testid');
        const id = productId?.replace('product-card-', '');

        const addToCartBtn = page.locator(`[data-testid="add-to-cart-${id}"]`);
        await addToCartBtn.click();

        // Verify cart badge update
        const cartBadge = page.locator('[data-testid="cart-badge"]');
        await expect(cartBadge).toHaveText('1');

        // Go to cart and verify item
        await page.locator('[data-testid="cart-btn"]').click();
        await expect(page).toHaveURL('/cart');
        await expect(page.locator(`[data-testid="cart-item-${id}"]`)).toBeVisible();
    });
});
