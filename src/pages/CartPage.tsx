import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export function CartPage() {
    const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

    if (items.length === 0) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-muted mb-8">Time to gear up!</p>
                <Link to="/" className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                    Go to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                Shopping Cart <span className="text-lg text-muted font-normal">({items.length} items)</span>
            </h1>

            <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/10">
                    {items.map(item => (
                        <div key={item.id} className="p-6 flex flex-col md:flex-row items-center gap-6" data-testid={`cart-item-${item.id}`}>
                            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />

                            <div className="flex-1 text-center md:text-left">
                                <Link to={`/product/${item.id}`} className="font-bold text-lg hover:text-secondary">{item.name}</Link>
                                <p className="text-muted text-sm capitalize">{item.category}</p>
                                <span className="font-bold text-primary-foreground md:hidden mt-2 block">${item.price}</span>
                            </div>

                            <div className="flex items-center gap-4 bg-background/50 p-2 rounded-lg">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1 hover:text-secondary transition-colors"
                                    data-testid={`qty-minus-${item.id}`}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold w-8 text-center" data-testid={`qty-val-${item.id}`}>{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1 hover:text-secondary transition-colors"
                                    data-testid={`qty-plus-${item.id}`}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="text-right hidden md:block min-w-[80px]">
                                <p className="font-bold text-lg text-primary-foreground">${item.price * item.quantity}</p>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-muted hover:text-red-400 transition-colors"
                                data-testid={`remove-${item.id}`}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-900/50 border-t border-white/10 flex flex-col items-end gap-4">
                    <div className="flex items-center gap-8 text-xl">
                        <span className="text-muted">Total:</span>
                        <span className="font-bold text-3xl text-primary-foreground" data-testid="cart-total">${cartTotal}</span>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={clearCart}
                            className="flex-1 md:flex-none px-6 py-3 text-muted hover:text-white transition-colors"
                        >
                            Clear Cart
                        </button>
                        <Link
                            to="/checkout"
                            className="flex-1 md:flex-none bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105"
                            data-testid="checkout-btn"
                        >
                            Proceed to Checkout <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
