import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';

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

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) return false;

            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }, []);

    const register = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error };

            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            return { success: true };
        } catch (error: any) {
            console.error('Register error:', error);
            return { success: false, error: 'The sea is too rough. Try again later.' };
        }
    }, []);

    const logout = useCallback(async () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }, []);

    const deleteAccount = useCallback(async (): Promise<boolean> => {
        if (!user) return false;
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                await logout();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Delete account error:', error);
            return false;
        }
    }, [user, logout]);

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
