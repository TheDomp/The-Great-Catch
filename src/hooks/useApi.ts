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
    const API_BASE = import.meta.env.VITE_API_URL || '/api';

    const simulateDelay = useCallback(async () => {
        const delay = latencyMode ? 2000 : 0;
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }, [latencyMode]);

    const handleResponse = useCallback(async (response: Response) => {
        if (serverErrorMode) {
            throw new Error('500 Internal Server Error (Chaos Mode)');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'An unexpected error occurred' }));
            throw new Error(error.error || 'Request failed');
        }
        return response.json();
    }, [serverErrorMode]);

    const getProducts = useCallback(async (category?: string, sort?: string): Promise<Product[]> => {
        await simulateDelay();

        const url = new URL(`${API_BASE}/products`, window.location.origin);
        if (category) url.searchParams.append('category', category);

        const response = await fetch(url.toString());
        let products = await handleResponse(response);

        if (sort === 'price-asc') {
            products.sort((a: Product, b: Product) => a.price - b.price);
        } else if (sort === 'price-desc') {
            products.sort((a: Product, b: Product) => b.price - a.price);
        }

        return products;
    }, [simulateDelay, handleResponse]);

    const getProduct = useCallback(async (id: string): Promise<Product> => {
        await simulateDelay();
        const response = await fetch(`${API_BASE}/products/${id}`);
        return handleResponse(response);
    }, [simulateDelay, handleResponse]);

    const checkout = useCallback(async (data: CheckoutData): Promise<{ success: true; orderId: string; total: number }> => {
        await simulateDelay();

        if (stockMismatchMode) {
            throw new Error('Out of Stock: One or more items are unavailable (Chaos Mode)');
        }

        if (!user) {
            throw new Error('You must be logged in to checkout');
        }

        const backendData = {
            userId: user.id,
            items: data.items.map(item => ({
                productId: item.id,
                quantity: item.quantity
            })),
            discountCode: data.discountCode
        };

        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backendData)
        });

        const order = await handleResponse(response);

        return {
            success: true,
            orderId: order.id,
            total: order.total
        };
    }, [simulateDelay, handleResponse, stockMismatchMode, user]);

    const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<Product> => {
        await simulateDelay();
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    }, [simulateDelay, handleResponse]);

    const updateUser = useCallback(async (id: string, data: { name?: string; role?: string }): Promise<any> => {
        await simulateDelay();
        const response = await fetch(`${API_BASE}/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    }, [simulateDelay, handleResponse]);

    return useMemo(() => ({
        getProducts,
        getProduct,
        checkout,
        updateProduct,
        updateUser
    }), [getProducts, getProduct, checkout, updateProduct, updateUser]);
}
