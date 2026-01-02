import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import type { Product } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton';
import { FilterSidebar } from '../components/FilterSidebar';
import { AlertTriangle } from 'lucide-react';

export function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { getProducts } = useApi();

    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'featured';

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getProducts(category, sort);
                setProducts(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category, sort]);

    const handleCategoryChange = (cat: string) => {
        setSearchParams(prev => {
            if (cat) prev.set('category', cat);
            else prev.delete('category');
            return prev;
        });
    };

    const handleSortChange = (newSort: string) => {
        setSearchParams(prev => {
            prev.set('sort', newSort);
            return prev;
        });
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <AlertTriangle className="w-16 h-16 text-red-500" />
                <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
                <p className="text-muted max-w-md">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <FilterSidebar
                selectedCategory={category}
                onSelectCategory={handleCategoryChange}
                sortOption={sort}
                onSortChange={handleSortChange}
            />

            <div className="flex-1">
                <div className="mb-6 pb-4 border-b border-white/10 flex justify-between items-end">
                    <h1 className="text-3xl font-bold text-white">
                        {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Gear'}
                    </h1>
                    <span className="text-muted text-sm" data-testid="product-count">
                        {loading ? '...' : `${products.length} products`}
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
