import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import type { Product } from '../data/mockData';
import { Package, Edit, Trash2, Plus, AlertTriangle, Search } from 'lucide-react';

export function AdminDashboard() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const { getProducts } = useApi();
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Only redirect if auth is finished loading and user is definitely not admin
        if (!authLoading) {
            if (!isAdmin) {
                navigate('/');
                return;
            }

            const fetchProducts = async () => {
                setLoading(true);
                try {
                    const data = await getProducts();
                    setProducts(data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            fetchProducts();
        }
    }, [isAdmin, authLoading, navigate, getProducts]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.includes(searchTerm.toLowerCase())
    );

    if (authLoading) return <div className="p-20 text-center">Checking credentials...</div>;
    if (!isAdmin) return null;

    return (
        <div className="max-w-6xl mx-auto p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Package className="w-8 h-8 text-secondary" /> Admin Dashboard
                    </h1>
                    <p className="text-muted mt-1">Welcome back, {user?.name}</p>
                </div>
                <button
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    onClick={() => alert('Add Product Modal - Mock')}
                    data-testid="add-product-btn"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-secondary/50 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-muted uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted">Loading inventory...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted">No products found.</td></tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={product.image} alt="" className="w-10 h-10 rounded object-cover" />
                                                <div>
                                                    <p className="font-bold text-white">{product.name}</p>
                                                    <p className="text-xs text-muted font-mono">{product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 capitalize">
                                            <span className="bg-slate-700 px-2 py-1 rounded text-xs">{product.category}</span>
                                        </td>
                                        <td className="p-4">${product.price}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {product.stock < 5 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                                                <span className={product.stock < 5 ? 'text-orange-400 font-bold' : 'text-green-400'}>
                                                    {product.stock}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:text-white text-muted transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:text-red-400 text-muted transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
