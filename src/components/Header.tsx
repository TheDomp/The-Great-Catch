import { ShoppingCart, Search, Menu, User, LogOut, Trash2 } from 'lucide-react';
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
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 font-bold text-2xl tracking-tighter hover:opacity-90 transition-opacity">
                    <img src="/images/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                    <span className="hidden sm:inline bg-gradient-to-r from-white to-primary bg-clip-text text-transparent" data-testid="logo-text">
                        THE GREAT CATCH
                    </span>
                </Link>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-md relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search premium gear..."
                        className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                        data-testid="search-input"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <Link to="/admin" className="text-sm font-black text-primary hover:text-white tracking-widest uppercase" data-testid="nav-admin">
                                    Admin
                                </Link>
                            )}
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-[10px] font-black text-primary-dark uppercase tracking-widest leading-none mb-1">Active User</span>
                                <span className="text-sm font-bold text-white leading-none" data-testid="user-name">{user.name}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={handleDeleteAccount} className="p-2 hover:bg-red-500/10 rounded-full group transition-colors" title="Delete Account">
                                    <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-500" />
                                </button>
                                <button onClick={logout} className="p-2 hover:bg-white/5 rounded-full" title="Logout" data-testid="nav-logout">
                                    <LogOut className="w-5 h-5 text-slate-200" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/register" className="text-sm font-black text-slate-400 hover:text-white transition-colors tracking-widest uppercase hidden sm:block">
                                Sign Up
                            </Link>
                            <Link to="/login" className="flex items-center gap-2 text-sm font-black text-primary hover:text-white transition-colors tracking-widest uppercase" data-testid="nav-login">
                                <User className="w-5 h-5" />
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                        </div>
                    )}

                    <Link to="/cart" className="p-2 hover:bg-white/5 rounded-full relative" data-testid="cart-btn">
                        <ShoppingCart className="w-6 h-6 text-slate-200" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-scale-in" data-testid="cart-badge">
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    <button className="md:hidden p-2 hover:bg-white/5 rounded-full">
                        <Menu className="w-6 h-6 text-slate-200" />
                    </button>
                </div>
            </div>
        </header>
    );
}
