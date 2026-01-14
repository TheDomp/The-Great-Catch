import { useMemo, useCallback } from 'react';
import { useChaos } from '../context/ChaosContext';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../data/mockData';

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

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch products');

        let products = await response.json();

        // Sort remains client-side if not supported by backend exactly as requested
        if (sort === 'price-asc') {
            products.sort((a: Product, b: Product) => a.price - b.price);
        } else if (sort === 'price-desc') {
            products.sort((a: Product, b: Product) => b.price - a.price);
        }

        return products;
    }, [simulateDelay]);

    const getProduct = useCallback(async (id: string): Promise<Product> => {
        await simulateDelay();
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        return await response.json();
    }, [simulateDelay]);

    const checkout = useCallback(async (data: CheckoutData): Promise<{ success: true; orderId: string; total: number }> => {
        await simulateDelay();

        if (stockMismatchMode) {
            throw new Error('Mission Aborted: Critical stock depletion detected in designated sector.');
        }

        if (!user) {
            throw new Error('You must be logged in to checkout');
        }

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
            const err = await response.json();
            throw new Error(err.error || 'Checkout failed');
        }

        const order = await response.json();

        return {
            success: true,
            orderId: order.id,
            total: order.total
        };
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
