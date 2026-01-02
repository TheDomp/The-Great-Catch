import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export function LoginPage() {
    const { login, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If already logged in, redirect away from login page
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            if (isAdmin) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, isAdmin, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError(null);
        setIsSubmitting(true);

        try {
            const success = await login(email, password);
            if (!success) {
                setError('Invalid email or password. Please try again.');
                setIsSubmitting(false);
            }
            // useEffect will handle navigation on success
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-secondary mb-4" />
                <p className="text-muted">Loading authentication...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-12 animate-fade-in">
            <div className="bg-surface rounded-xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary" />

                <h1 className="text-3xl font-bold mb-2 text-center text-white">The Great Catch</h1>
                <p className="text-muted text-center mb-8 text-sm">Sign in to manage your gear</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3 text-sm animate-shake" data-testid="login-error">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 focus:border-transparent outline-none transition-all"
                                placeholder="admin@test.se"
                                required
                                data-testid="input-email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                                data-testid="input-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-secondary/20"
                        data-testid="login-submit-btn"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                    <p className="text-center text-xs text-muted font-bold tracking-widest uppercase">Demo Access</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 cursor-pointer hover:border-white/20 transition-colors" onClick={() => { setEmail('admin@test.se'); setPassword('Password123!'); }}>
                            <p className="text-[10px] text-muted">Admin</p>
                            <p className="text-[11px] font-mono text-secondary">admin@test.se</p>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 cursor-pointer hover:border-white/20 transition-colors" onClick={() => { setEmail('customer@test.se'); setPassword('Password123!'); }}>
                            <p className="text-[10px] text-muted">Customer</p>
                            <p className="text-[11px] font-mono text-secondary">customer@test.se</p>
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-slate-500 italic">Password for all: Password123!</p>
                </div>
            </div>
        </div>
    );
}
