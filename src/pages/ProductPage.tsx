import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import type { Product } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, ArrowLeft, AlertTriangle } from 'lucide-react';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { CatchWhisperer } from '../components/CatchWhisperer';

export function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');
    const { getProduct } = useApi();
    const { addToCart } = useCart();

    useEffect(() => {
        if (!id) return;
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await getProduct(id);
                setProduct(data);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="max-w-4xl mx-auto"><ProductCardSkeleton /></div>;

    if (!product) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <Link to="/" className="text-secondary hover:underline">Back to Shop</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-white mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="rounded-2xl overflow-hidden border border-white/5 bg-surface shadow-2xl">
                    <img src={product.image} alt={product.name} className="w-full h-auto object-cover" />
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {product.category}
                            </span>
                            <div className="flex items-center text-yellow-400 gap-1">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-bold">4.8</span>
                                <span className="text-muted text-xs">(124 reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2" data-testid="product-title">{product.name}</h1>
                        <p className="text-3xl font-bold text-primary-foreground" data-testid="product-price">€{product.price}</p>
                    </div>

                    <div className="p-4 bg-surface rounded-lg border border-white/5 flex items-center justify-between">
                        <div>
                            <span className={`font-bold flex items-center gap-2 ${product.stock < 5 ? 'text-orange-500' : 'text-green-400'}`}>
                                {product.stock < 5 && <AlertTriangle className="w-4 h-4" />}
                                {product.stock > 0 ? (product.stock < 5 ? `Low Stock: Only ${product.stock} left!` : 'In Stock') : 'Out of Stock'}
                            </span>
                            <p className="text-xs text-muted mt-1">Ready to ship today</p>
                        </div>
                        <button
                            onClick={() => addToCart(product)}
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                            data-testid="add-to-cart-btn"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Add to Vessel
                        </button>
                    </div>

                    <CatchWhisperer product={product} />

                    <div className="mt-8">
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('desc')}
                                className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'desc' ? 'text-white' : 'text-muted hover:text-slate-300'}`}
                            >
                                Description
                                {activeTab === 'desc' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-white' : 'text-muted hover:text-slate-300'}`}
                                data-testid="reviews-tab"
                            >
                                Reviews ({product.reviews.length})
                                {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary" />}
                            </button>
                        </div>

                        <div className="py-6 min-h-[200px]">
                            {activeTab === 'desc' ? (
                                <div className="prose prose-invert max-w-none text-slate-300">
                                    <p>{product.description}</p>
                                    <ul className="mt-4 list-disc pl-5 space-y-2">
                                        <li>High quality materials</li>
                                        <li>Designed for professional use</li>
                                        <li>1 year warranty included</li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {product.reviews.length === 0 ? (
                                        <p className="text-muted italic">No reviews yet.</p>
                                    ) : (
                                        product.reviews.map(review => (
                                            <div key={review.id} className="bg-surface p-4 rounded-lg border border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-white">{review.user}</span>
                                                    <div className="flex text-yellow-400">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-600'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-300">{review.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
