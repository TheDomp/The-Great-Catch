import { useChaos } from '../context/ChaosContext';
import { PRODUCTS } from '../data/mockData';
import type { Product } from '../data/mockData';

export interface CheckoutData {
    items: { id: string; quantity: number }[];
    address: { street: string; city: string; zip: string };
    payment: { cardNumber: string; expiry: string; cvc: string };
    discountCode?: string;
}

export function useApi() {
    const { latencyMode, serverErrorMode, stockMismatchMode } = useChaos();

    const simulateDelay = async () => {
        const delay = latencyMode ? 2000 : 300;
        return new Promise(resolve => setTimeout(resolve, delay));
    };

    const checkChaos = () => {
        if (serverErrorMode) {
            throw new Error('500 Internal Server Error (Chaos Mode)');
        }
    };

    const getProducts = async (category?: string, sort?: string): Promise<Product[]> => {
        await simulateDelay();
        checkChaos();

        let filtered = [...PRODUCTS];
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }

        if (sort === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        }

        return filtered;
    };

    const getProduct = async (id: string): Promise<Product | undefined> => {
        await simulateDelay();
        checkChaos();
        return PRODUCTS.find(p => p.id === id);
    };

    const checkout = async (data: CheckoutData): Promise<{ success: true; orderId: string; total: number }> => {
        await simulateDelay();
        checkChaos();

        // Stock Mismatch Logic
        if (stockMismatchMode) {
            // Simulate that one item is actually out of stock
            throw new Error('Out of Stock: One or more items are unavailable (Chaos Mode)');
        }

        // Basic Validation (Discount Code)
        // Note: Credit card validation is mostly frontend, but backend checks validity too.
        // Here we just accept format.

        let discount = 0;
        if (data.discountCode === 'FISKE20') {
            discount = 0.2;
        }

        // Calculate total (mock calculation based on passed items)
        // In a real app, we'd fetch prices from DB. Here we lookup.
        let subtotal = 0;
        for (const item of data.items) {
            const product = PRODUCTS.find(p => p.id === item.id);
            if (product) {
                subtotal += product.price * item.quantity;
            }
        }

        const total = subtotal * (1 - discount);

        return {
            success: true,
            orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
            total: Math.round(total)
        };
    };

    return {
        getProducts,
        getProduct,
        checkout
    };
}
