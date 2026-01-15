import { useMemo, useCallback } from 'react';
import { useChaos } from '../context/ChaosContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS, type Product } from '../data/mockData';

export interface CheckoutData {
    items: { id: string; quantity: number }[];
    address: { street: string; city: string; zip: string };
    payment: { cardNumber: string; expiry: string; cvc: string };
    discountCode?: string;
}

export function useApi() {
    const { latencyMode, serverErrorMode, stockMismatchMode } = useChaos();
    const { user } = useAuth();

    const simulateDelay = useCallback(async () => {
        const delay = latencyMode ? 2000 : 0;
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        if (serverErrorMode) {
            throw new Error('500 Internal Server Error (Chaos Mode)');
        }
    }, [latencyMode, serverErrorMode]);

    const getProducts = useCallback(async (category?: string, sort?: string): Promise<Product[]> => {
        await simulateDelay();

        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);

        try {
            const response = await fetch(`/api/products?${params.toString()}`);
            if (!response.ok) throw new Error('API Unavailable');

            const text = await response.text();
            // If it returns HTML (Vite fallback), it's not our API
            if (text.trim().startsWith('<!doctype html>')) throw new Error('API Missing');

            let products = JSON.parse(text);

            // Sort remains client-side if not supported by backend exactly as requested
            if (sort === 'price-asc') {
                products.sort((a: Product, b: Product) => a.price - b.price);
            } else if (sort === 'price-desc') {
                products.sort((a: Product, b: Product) => b.price - a.price);
            }

            return products;
        } catch (error) {
            console.log('API Fallback to Mock Data:', error);
            // Fallback to local data
            let products = [...PRODUCTS];
            if (category) {
                products = products.filter(p => p.category === category);
            }
            if (sort === 'price-asc') {
                products.sort((a, b) => a.price - b.price);
            } else if (sort === 'price-desc') {
                products.sort((a, b) => b.price - a.price);
            }
            return products;
        }
    }, [simulateDelay]);

    const getProduct = useCallback(async (id: string): Promise<Product> => {
        await simulateDelay();
        try {
            const response = await fetch(`/api/products/${id}`);
            if (!response.ok) throw new Error('API Unavailable');
            const text = await response.text();
            if (text.trim().startsWith('<!doctype html>')) throw new Error('API Missing');
            return JSON.parse(text);
        } catch (error) {
            const product = PRODUCTS.find(p => p.id === id);
            if (!product) throw new Error('Product not found (Mock)');
            return product;
        }
    }, [simulateDelay]);

    const checkout = useCallback(async (data: CheckoutData): Promise<{ success: true; orderId: string; total: number }> => {
        await simulateDelay();

        if (stockMismatchMode) {
            throw new Error('Mission Aborted: Critical stock depletion detected in designated sector.');
        }

        if (!user) {
            throw new Error('You must be logged in to checkout');
        }

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    items: data.items.map(item => ({ productId: item.id, quantity: item.quantity })),
                    discountCode: data.discountCode
                })
            });

            if (!response.ok) {
                const text = await response.text();
                if (text.trim().startsWith('<!doctype html>')) throw new Error('API Missing');
                const err = JSON.parse(text);
                throw new Error(err.error || 'Checkout failed');
            }

            const order = await response.json();

            return {
                success: true,
                orderId: order.id,
                total: order.total
            };
        } catch (error) {
            console.log('Checkout Fallback to Mock:', error);
            // Simulate local success
            return {
                success: true,
                orderId: `MOCK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                total: data.items.reduce((acc, item) => {
                    const p = PRODUCTS.find(prod => prod.id === item.id);
                    return acc + (p ? p.price * item.quantity : 0);
                }, 0)
            };
        }
    }, [simulateDelay, stockMismatchMode, user]);

    const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<Product> => {
        await simulateDelay();
        const response = await fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update product');
        return await response.json();
    }, [simulateDelay]);

    const updateUser = useCallback(async (id: string, data: { name?: string; role?: string }): Promise<any> => {
        await simulateDelay();
        const response = await fetch(`/api/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update user');
        return await response.json();
    }, [simulateDelay]);

    return useMemo(() => ({
        getProducts,
        getProduct,
        checkout,
        updateProduct,
        updateUser
    }), [getProducts, getProduct, checkout, updateProduct, updateUser]);
}
