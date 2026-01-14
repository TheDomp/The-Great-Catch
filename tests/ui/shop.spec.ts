import { test, expect } from '@playwright/test';

test.describe('Shop Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display products and filter by category', async ({ page }) => {
        // Check if products are visible
        const productCards = page.locator('[data-testid^="product-card-"]');
        await expect(productCards.first()).toBeVisible();

        // Get initial product count
        const initialCount = await productCards.count();
        expect(initialCount).toBeGreaterThan(0);

        // Filter by 'rod'
        const rodFilter = page.locator('[data-testid="filter-category-rod"]');
        await rodFilter.click();

        // Verify filtered results
        const filteredCards = page.locator('[data-testid^="product-card-rod-"]');
        await expect(filteredCards.first()).toBeVisible();

        // Verify that other categories are NOT visible (or at least rods are prominent)
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
