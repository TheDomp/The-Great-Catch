import { useMemo, useCallback } from 'react';
import { useChaos } from '../context/ChaosContext';
import { useAuth } from '../context/AuthContext';
import { type Product } from '../data/mockData';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc
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

        try {
            let q = collection(db, 'products');

            // Note: Firestore requires composite indexes for multiple where/orderBy clauses.
            // For simplicity, we will fetch all or category and sort client-side if needed, 
            // or perform simple queries.

            const querySnapshot = await getDocs(q);
            let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

            if (category) {
                products = products.filter(p => p.category === category);
            }

            if (sort === 'price-asc') {
                products.sort((a, b) => a.price - b.price);
            } else if (sort === 'price-desc') {
                products.sort((a, b) => b.price - a.price);
            }

            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }, [simulateDelay]);

    const getProduct = useCallback(async (id: string): Promise<Product> => {
        await simulateDelay();
        try {
            const docRef = doc(db, 'products', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Product;
            } else {
                throw new Error('Product not found');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
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
            // Calculate total (server-side usually, but here client-side with Firestore check)
            let total = 0;
            const orderItems = [];

            for (const item of data.items) {
                const pDoc = await getDoc(doc(db, 'products', item.id));
                if (pDoc.exists()) {
                    const pData = pDoc.data() as Product;
                    total += pData.price * item.quantity;
                    orderItems.push({
                        productId: item.id,
                        quantity: item.quantity,
                        price: pData.price,
                        product: { name: pData.name }
                    });

                    // Optional: Update stock
                    // await updateDoc(doc(db, 'products', item.id), { stock: pData.stock - item.quantity });
                }
            }

            const orderData = {
                userId: user.uid, // Use uid from Firebase Auth
                user: {
                    name: user.name || user.email,
                    email: user.email
                },
                items: orderItems,
                total: total,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                shippingAddress: data.address
            };

            const docRef = await addDoc(collection(db, 'orders'), orderData);

            return {
                success: true,
                orderId: docRef.id,
                total: total
            };
        } catch (error: any) {
            console.error('Checkout error:', error);
            throw new Error(error.message || 'Checkout failed');
        }
    }, [simulateDelay, stockMismatchMode, user]);

    const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<Product> => {
        await simulateDelay();
        try {
            const docRef = doc(db, 'products', id);
            await updateDoc(docRef, data);

            const updatedSnap = await getDoc(docRef);
            return { id: updatedSnap.id, ...updatedSnap.data() } as Product;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }, [simulateDelay]);

    const updateUser = useCallback(async (id: string, data: { name?: string; role?: string }): Promise<any> => {
        await simulateDelay();
        try {
            const docRef = doc(db, 'users', id);
            await updateDoc(docRef, data);
            return { id, ...data };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }, [simulateDelay]);

    return useMemo(() => ({
        getProducts,
        getProduct,
        checkout,
        updateProduct,
        updateUser
    }), [getProducts, getProduct, checkout, updateProduct, updateUser]);
}
