import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';

type Role = 'GUEST' | 'USER' | 'ADMIN';

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
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('tgc_user');
        if (saved) {
            try {
                setUser(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved user', e);
            }
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

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('tgc_user', JSON.stringify(data.user));
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

            if (!response.ok) {
                return { success: false, error: data.error || 'Registration failed' };
            }

            setUser(data.user);
            localStorage.setItem('tgc_user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, error: 'Network error or server down' };
        }
    }, []);

    const deleteAccount = useCallback(async (): Promise<boolean> => {
        if (!user) return false;
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                logout();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Delete account error:', error);
            return false;
        }
    }, [user]);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('tgc_user');
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
