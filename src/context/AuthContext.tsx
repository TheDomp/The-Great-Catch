import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

type Role = 'USER' | 'ADMIN';

interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
    deleteAccount: () => Promise<boolean>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = useCallback(async (uid: string, email: string) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
                id: uid,
                email: email,
                name: data.name || 'Unknown',
                role: data.role || 'USER'
            });
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await fetchUserData(firebaseUser.uid, firebaseUser.email!);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [fetchUserData]);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }, []);

    const register = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            const userRole: Role = email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';
            const userData = {
                name,
                role: userRole,
                createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);

            setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name,
                role: userRole
            });

            return { success: true };
        } catch (error: any) {
            console.error('Register error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
    }, []);

    const deleteAccount = useCallback(async (): Promise<boolean> => {
        if (!auth.currentUser) return false;
        try {
            await deleteUser(auth.currentUser);
            setUser(null);
            return true;
        } catch (error) {
            console.error('Delete account error:', error);
            return false;
        }
    }, []);

    const value = useMemo(() => ({
        user,
        login,
        register,
        deleteAccount,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading
    }), [user, loading, login, register, deleteAccount, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
