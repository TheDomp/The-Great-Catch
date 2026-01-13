import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, Ship } from 'lucide-react';

export function CartPage() {
    const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

    if (items.length === 0) {
        return (
            <div className="text-center py-32 animate-fade-in flex flex-col items-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                    <Ship className="w-12 h-12 text-primary/40" />
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tighter text-white uppercase">Vessel Empty</h2>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-10">No premium gear currently loaded.</p>
                <Link to="/" className="inline-block bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20">
                    Sails to the Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-20">
            <h1 className="text-4xl font-black mb-10 flex items-center gap-4 tracking-tighter text-white uppercase">
                Loaded Gear <span className="text-xs font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">{items.length} Units</span>
            </h1>

            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-cyan-glow/5">
                <div className="divide-y divide-white/5">
                    {items.map(item => (
                        <div key={item.id} className="p-8 flex flex-col md:flex-row items-center gap-8 group" data-testid={`cart-item-${item.id}`}>
                            <div className="relative">
                                <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-2xl border border-white/10 shadow-xl group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <Link to={`/product/${item.id}`} className="font-black text-xl hover:text-primary transition-colors tracking-tight text-white block mb-1">{item.name}</Link>
                                <p className="text-primary-dark font-black text-[10px] uppercase tracking-widest">{item.category}</p>
                                <span className="font-black text-white md:hidden mt-4 block text-2xl">${item.price}</span>
                            </div>

                            <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-2 rounded-2xl">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-3 hover:text-primary transition-colors text-slate-500"
                                    data-testid={`qty-minus-${item.id}`}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-black text-lg w-6 text-center text-white" data-testid={`qty-val-${item.id}`}>{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-3 hover:text-primary transition-colors text-slate-500"
                                    data-testid={`qty-plus-${item.id}`}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="text-right hidden md:block min-w-[120px]">
                                <p className="font-black text-2xl text-white tracking-tighter">${item.price * item.quantity}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Valuation</p>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-4 text-slate-600 hover:text-red-500 transition-colors bg-white/5 hover:bg-red-500/5 rounded-xl border border-white/5 hover:border-red-500/20"
                                data-testid={`remove-${item.id}`}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-white/10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col items-center md:items-start">
                        <span className="text-primary-dark font-black text-[10px] uppercase tracking-[0.3em] mb-1">Fleet Total</span>
                        <span className="font-black text-5xl text-white tracking-tighter shadow-primary/20 drop-shadow-lg" data-testid="cart-total">${cartTotal}</span>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={clearCart}
                            className="flex-1 md:flex-none px-8 py-4 text-slate-400 hover:text-white font-black uppercase tracking-widest text-xs transition-colors"
                        >
                            Jettison All
                        </button>
                        <Link
                            to="/checkout"
                            className="flex-1 md:flex-none bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-primary/30"
                            data-testid="checkout-btn"
                        >
                            Proceed to Garrison <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
