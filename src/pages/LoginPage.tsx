import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, Anchor } from 'lucide-react';

export function LoginPage() {
    const { login, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                setError('Access denied. Check your credentials.');
                setIsSubmitting(false);
            }
        } catch (err) {
            setError('The deep sea is turbulent. Try again later.');
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-muted">Analyzing credentials...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-12 animate-fade-in px-4">
            <div className="glass-card rounded-3xl p-8 md:p-10 shadow-cyan-glow/10 relative overflow-hidden">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                        <Anchor className="w-8 h-8 text-primary" />
                    </div>
                </div>

                <h1 className="text-3xl font-black mb-2 text-center text-white tracking-tighter">SURFACE AGAIN</h1>
                <p className="text-muted text-center mb-10 text-sm">Log in to access your dashboard</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm" data-testid="login-error">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest ml-1 text-slate-400">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600"
                                placeholder="captain@vessel.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-widest ml-1 text-slate-400">Secure Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? 'VERIFYING...' : 'SIGN IN'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        New to the fleet?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline">
                            Request Access
                        </Link>
                    </p>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
                    <p className="text-center text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase">Quick Access (Beta)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="bg-white/5 p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-all text-left" onClick={() => { setEmail('admin_v2@test.se'); setPassword('123qwe'); }}>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Admin</p>
                            <p className="text-xs text-primary font-mono truncate">admin_v2@test.se</p>
                        </button>
                        <button className="bg-white/5 p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-all text-left" onClick={() => { setEmail('customer_v2@test.se'); setPassword('123qwe'); }}>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Test User</p>
                            <p className="text-xs text-primary font-mono truncate">customer_v2@test.se</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
