import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const testProfile = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'test-profile.json'), 'utf-8'));

test.describe('Auth API', () => {
    test('should login and return a token', async ({ request }) => {
        const response = await request.post('/api/auth/login', {
            data: {
                email: testProfile.customer.email,
                password: testProfile.customer.password
            }
        });

        expect(response.ok()).toBeTruthy();
        const result = await response.json();
        expect(result).toHaveProperty('token');
        expect(result.user.email).toBe(testProfile.customer.email);
    });

    test('should return 401 for invalid login', async ({ request }) => {
        const response = await request.post('/api/auth/login', {
            data: {
                email: 'attacker@evil.com',
                password: 'wrong'
            }
        });

        expect(response.status()).toBe(401);
    });
});
