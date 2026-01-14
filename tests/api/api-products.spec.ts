import { test, expect } from '@playwright/test';

test.describe('Products API', () => {
    test('should fetch all products', async ({ request }) => {
        const response = await request.get('/api/products');
        expect(response.ok()).toBeTruthy();

        const products = await response.json();
        expect(Array.isArray(products)).toBeTruthy();
        expect(products.length).toBeGreaterThan(0);

        // Check product structure
        const product = products[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
    });

    test('should filter products by category', async ({ request }) => {
        const response = await request.get('/api/products?category=rod');
        expect(response.ok()).toBeTruthy();

        const products = await response.json();
        for (const product of products) {
            expect(product.category).toBe('rod');
        }
    });

    test('should fetch a single product by id', async ({ request }) => {
        // First get all
        const allResponse = await request.get('/api/products');
        const allProducts = await allResponse.json();
        const targetId = allProducts[0].id;

        const response = await request.get(`/api/products/${targetId}`);
        expect(response.ok()).toBeTruthy();

        const product = await response.json();
        expect(product.id).toBe(targetId);
    });
});
