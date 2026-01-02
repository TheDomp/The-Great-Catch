import { ShoppingCart, Search, Menu, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
    const { user, logout, isAdmin } = useAuth();
    const { itemCount } = useCart();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-foreground">
                    <span className="text-secondary" data-testid="logo-icon">🎣</span>
                    <span className="hidden sm:inline" data-testid="logo-text">The Great Catch</span>
                </Link>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search for gear..."
                        className="w-full bg-surface border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        data-testid="search-input"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {isAdmin && (
                                <Link to="/admin" className="text-sm font-bold text-secondary hover:underline" data-testid="nav-admin">
                                    Admin
                                </Link>
                            )}
                            <span className="text-sm text-muted hidden sm:inline" data-testid="user-name">{user.name}</span>
                            <button onClick={logout} className="p-2 hover:bg-white/5 rounded-full" title="Logout" data-testid="nav-logout">
                                <LogOut className="w-5 h-5 text-slate-200" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center gap-2 text-sm font-bold hover:text-white transition-colors" data-testid="nav-login">
                            <User className="w-5 h-5" />
                            <span className="hidden sm:inline">Login</span>
                        </Link>
                    )}

                    <Link to="/cart" className="p-2 hover:bg-white/5 rounded-full relative" data-testid="cart-btn">
                        <ShoppingCart className="w-6 h-6 text-slate-200" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-scale-in" data-testid="cart-badge">
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
