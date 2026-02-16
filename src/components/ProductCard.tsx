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
            className="group relative rounded-3xl overflow-hidden premium-transition hover:-translate-y-2 h-[500px] w-full"
            data-testid={`product-card-${product.id}`}
        >
            {/* Background Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />

            {/* Main Card Content */}
            <div className="relative h-full w-full bg-[#0a192f] rounded-3xl overflow-hidden border border-white/10 flex flex-col">

                {/* Image Section */}
                <Link to={`/product/${product.id}`} className="relative h-[60%] w-full block overflow-hidden bg-black">
                    {/* Radial gradient background for image pop */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-700" />

                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        loading="lazy"
                    />

                    {product.stock < 5 && (
                        <div className="absolute top-4 right-4 animate-pulse-slow">
                            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/50 text-red-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                Limited Stock
                            </div>
                        </div>
                    )}
                </Link>

                {/* Content Section */}
                <div className="relative h-[40%] p-6 flex flex-col justify-between bg-white/[0.02] backdrop-blur-xl border-t border-white/5">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="inline-block px-2 py-1 rounded bg-cyan-900/30 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 uppercase tracking-[0.2em] mb-3">
                                {product.category}
                            </span>
                            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                €{product.price}
                            </span>
                        </div>

                        <Link to={`/product/${product.id}`} className="block group/title">
                            <h2 className="font-bold text-lg text-slate-200 group-hover/title:text-cyan-400 transition-colors duration-300 line-clamp-2 leading-tight">
                                {product.name}
                            </h2>
                        </Link>
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        className="w-full relative overflow-hidden group/btn bg-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] active:scale-[0.98]"
                        data-testid={`add-to-cart-${product.id}`}
                        aria-label={`Add ${product.name} to Vessel`}
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                        <div className="relative flex items-center justify-center gap-2">
                            <ShoppingCart className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                            <span>Add to Vessel</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
