import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

type Role = 'USER' | 'ADMIN';

export interface User extends FirebaseUser {
    role?: Role;
    name?: string;
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch additional user data from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({ ...firebaseUser, ...userData } as User);
                    } else {
                        setUser(firebaseUser as User);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(firebaseUser as User);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { user: newUser } = userCredential;

            // Create user document in Firestore
            await setDoc(doc(db, 'users', newUser.uid), {
                email: newUser.email,
                name: name,
                role: 'USER',
                createdAt: new Date().toISOString()
            });

            return { success: true };
        } catch (error: any) {
            console.error('Register error:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const deleteAccount = async (): Promise<boolean> => {
        if (!auth.currentUser) return false;
        try {
            // Delete user document from Firestore
            await deleteDoc(doc(db, 'users', auth.currentUser.uid));
            // Delete user from Auth
            await deleteUser(auth.currentUser);
            return true;
        } catch (error) {
            console.error('Delete account error:', error);
            return false;
        }
    };

    const value = useMemo(() => ({
        user,
        login,
        register,
        deleteAccount,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading
    }), [user, loading]);

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
