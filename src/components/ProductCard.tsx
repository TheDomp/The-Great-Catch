import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../data/mockData';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();

    return (
        <div
            className="group bg-surface rounded-xl border border-white/5 overflow-hidden transition-all hover:border-secondary/30 hover:shadow-2xl hover:shadow-secondary/5 hover:-translate-y-1"
            data-testid={`product-card-${product.id}`}
        >
            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-900">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                {product.stock < 5 && (
                    <div className="absolute top-2 right-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse-slow">
                        LOW STOCK
                    </div>
                )}
            </Link>

            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{product.category}</span>
                    <span className="text-sm font-bold text-primary-foreground">${product.price}</span>
                </div>

                <Link to={`/product/${product.id}`} className="block mb-4">
                    <h3 className="font-bold text-white group-hover:text-secondary transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                    }}
                    className="w-full bg-slate-800 hover:bg-secondary text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                    data-testid="add-to-cart-quick"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
