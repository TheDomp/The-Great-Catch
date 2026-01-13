import { useMemo, useCallback } from 'react';
import { useChaos } from '../context/ChaosContext';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../data/mockData';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    query,
    where
} from 'firebase/firestore';
import { db } from '../firebase';

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

        let q = query(collection(db, 'products'));

        if (category) {
            q = query(q, where('category', '==', category));
        }

        const querySnapshot = await getDocs(q);
        let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        if (sort === 'price-asc') {
            products.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-desc') {
            products.sort((a, b) => b.price - a.price);
        }

        return products;
    }, [simulateDelay]);

    const getProduct = useCallback(async (id: string): Promise<Product> => {
        await simulateDelay();
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        } else {
            throw new Error('Product not found');
        }
    }, [simulateDelay]);

    const checkout = useCallback(async (data: CheckoutData): Promise<{ success: true; orderId: string; total: number }> => {
        await simulateDelay();

        if (stockMismatchMode) {
            throw new Error('Out of Stock: One or more items are unavailable (Chaos Mode)');
        }

        if (!user) {
            throw new Error('You must be logged in to checkout');
        }

        const total = data.items.reduce((acc, item) => acc + (item.quantity * 100), 0); // Simplified total for now

        const orderData = {
            userId: user.id,
            userName: user.name,
            items: data.items,
            total,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            address: data.address
        };

        const docRef = await addDoc(collection(db, 'orders'), orderData);

        return {
            success: true,
            orderId: docRef.id,
            total
        };
    }, [simulateDelay, stockMismatchMode, user]);

    const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<Product> => {
        await simulateDelay();
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, data);
        const updatedSnap = await getDoc(docRef);
        return { id: updatedSnap.id, ...updatedSnap.data() } as Product;
    }, [simulateDelay]);

    const updateUser = useCallback(async (id: string, data: { name?: string; role?: string }): Promise<any> => {
        await simulateDelay();
        const docRef = doc(db, 'users', id);
        await updateDoc(docRef, data);
        return { id, ...data };
    }, [simulateDelay]);

    return useMemo(() => ({
        getProducts,
        getProduct,
        checkout,
        updateProduct,
        updateUser
    }), [getProducts, getProduct, checkout, updateProduct, updateUser]);
}
