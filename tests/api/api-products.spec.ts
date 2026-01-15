import { test, expect } from '@playwright/test';

test.describe('Products API', () => {
    test('should fetch all v0.8.0 handcrafted products', async ({ request }) => {
        const response = await request.get('/api/products');
        expect(response.ok()).toBeTruthy();

        const products = await response.json();
        expect(Array.isArray(products)).toBeTruthy();
        expect(products).toHaveLength(14);

        // Check for specific handcrafted products
        const rod1 = products.find((p: any) => p.id === 'rod-1');
        expect(rod1).toBeDefined();
        expect(rod1.name).toBe('Carbon-Elite Caster');
        expect(rod1.description).toContain('Ultra-high modulus carbon fiber');

        const lure5 = products.find((p: any) => p.id === 'lure-5');
        expect(lure5).toBeDefined();
        expect(lure5.name).toBe('Cyber-Byte Robotic Frog');
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
