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
            className="group glass-card rounded-2xl overflow-hidden premium-transition hover:shadow-cyan-glow hover:-translate-y-2"
            data-testid={`product-card-${product.id}`}
        >
            <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-slate-900/50">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />
                {product.stock < 5 && (
                    <div className="absolute top-3 left-3 bg-red-700 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                        LIMITED STOCK
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <div className="p-5 relative bg-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-sky-300 uppercase tracking-widest leading-none">{product.category}</span>
                    <span className="text-xl font-black text-white px-2 py-1 bg-white/10 rounded-lg">€{product.price}</span>
                </div>

                <Link to={`/product/${product.id}`} className="block mb-5">
                    <h2 className="font-bold text-lg text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-1 leading-tight">
                        {product.name}
                    </h2>
                </Link>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                    }}
                    className="w-full bg-[#075985] hover:bg-[#0369A1] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg group-hover:shadow-cyan-glow/50"
                    data-testid={`add-to-cart-${product.id}`}
                    aria-label={`Add ${product.name} to Vessel`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Add to Vessel
                    </div>
                </button>
            </div>
        </div>
    );
}
