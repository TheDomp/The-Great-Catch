import { ShoppingCart, Search, Menu, User, LogOut, Trash2, Waves } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
    const { user, logout, isAdmin, deleteAccount } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        if (window.confirm('WARNING: This will permanently delete your account and all order history. Are you sure?')) {
            const success = await deleteAccount();
            if (success) {
                alert('Account deleted. Sailing back to shore...');
                navigate('/');
            } else {
                alert('The anchor is stuck. Could not delete account.');
            }
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full px-4 pt-4 pb-2 bg-gradient-to-b from-[#020c1b]/80 to-transparent backdrop-blur-md">
            <div className="max-w-7xl mx-auto glass-card rounded-2xl border border-white/5 p-4 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 font-bold text-2xl tracking-tighter hover:opacity-90 transition-opacity group">
                    <div className="p-2 bg-cyan-950/30 rounded-xl border border-cyan-500/20 group-hover:neon-border transition-all">
                        <Waves className="w-7 h-7 text-cyan-400" />
                    </div>
                    <span className="hidden sm:inline bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent text-glow" data-testid="logo-text">
                        THE GREAT CATCH
                    </span>
                </Link>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-md relative group mx-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search premium gear..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:bg-white/10 transition-all text-slate-200"
                        data-testid="search-input"
                        aria-label="Search premium gear"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <Link to="/admin" className="text-[10px] font-black text-cyan-400 hover:text-white tracking-widest uppercase px-3 py-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20" data-testid="nav-admin">
                                    Admin
                                </Link>
                            )}
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest leading-none mb-1">Crew Member</span>
                                <span className="text-sm font-bold text-white leading-none" data-testid="user-name">{user.name}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={handleDeleteAccount} className="p-2 hover:bg-red-500/10 rounded-xl group transition-colors" title="Delete Account">
                                    <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-500" />
                                </button>
                                <button onClick={logout} className="p-2 hover:bg-white/5 rounded-xl transition-all" title="Logout" data-testid="nav-logout">
                                    <LogOut className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mr-2">
                            <Link to="/login" className="flex items-center gap-2 text-[11px] font-black text-cyan-400 hover:text-white transition-all tracking-widest uppercase bg-cyan-500/5 px-4 py-2.5 rounded-xl border border-cyan-500/20" data-testid="nav-login">
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Portal</span>
                            </Link>
                        </div>
                    )}

                    <Link to="/cart" className="p-2.5 hover:bg-cyan-500/10 rounded-xl relative transition-all border border-transparent hover:border-cyan-500/30" data-testid="cart-btn" aria-label="Shopping Cart">
                        <ShoppingCart className="w-5 h-5 text-slate-200" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-cyan-500 text-black text-[9px] font-black px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-scale-in shadow-[0_0_10px_rgba(34,211,238,0.5)]" data-testid="cart-badge">
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    <button className="md:hidden p-2.5 hover:bg-cyan-500/10 rounded-xl border border-transparent hover:border-cyan-500/30 transition-all text-slate-200" aria-label="Open menu">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
