import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import type { Product } from '../data/mockData';
import { Edit, Trash2, Plus, AlertTriangle, Search, Ship, Users, Package, ShoppingCart } from 'lucide-react';
import { EditProductModal } from '../components/EditProductModal';
import { EditUserModal } from '../components/EditUserModal';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PRODUCTS } from '../data/mockData';

interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        name: string;
    };
}

interface OrderData {
    id: string;
    total: number;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    items: OrderItem[];
}

type Tab = 'products' | 'users' | 'orders';

export function AdminDashboard() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const { getProducts, updateProduct, updateUser } = useApi();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<Tab>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [customerCount, setCustomerCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'products') {
                const data = await getProducts();
                setProducts(data);
            } else if (activeTab === 'users') {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
                setUsers(usersList);
                setCustomerCount(usersList.filter(u => u.role !== 'ADMIN').length);
            } else if (activeTab === 'orders') {
                const querySnapshot = await getDocs(collection(db, 'orders'));
                const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderData));
                setOrders(ordersList);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, getProducts]);

    useEffect(() => {
        if (!authLoading) {
            if (!isAdmin) {
                navigate('/');
                return;
            }
            fetchData();
        }
    }, [isAdmin, authLoading, navigate, activeTab, fetchData]);

    const handleSaveProduct = async (data: Partial<Product>) => {
        if (editingProduct) {
            await updateProduct(editingProduct.id, data);
            fetchData();
        }
    };

    const handleSaveUser = async (userId: string, data: { name: string; role: string }) => {
        await updateUser(userId, data);
        fetchData();
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Are you sure you want to discharge ${userName} from the crew? This action is permanent.`)) return;

        try {
            await deleteDoc(doc(db, 'users', userId));
            alert(`${userName} has been removed from the manifest.`);
            fetchData();
        } catch (err) {
            alert('Failed to remove crew member.');
        }
    };

    const handleSeedDatabase = async () => {
        if (!window.confirm('This will restore all default products to the inventory. Continue?')) return;
        setLoading(true);
        try {
            for (const product of PRODUCTS) {
                const { id, ...rest } = product;
                await setDoc(doc(db, 'products', id), rest);
            }
            alert('Inventory restored successfully!');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to restore inventory.');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredOrders = orders.filter(o =>
        (o.user && o.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading) return <div className="p-20 text-center text-primary font-black animate-pulse">SCANNING NAVAL RECORDS...</div>;
    if (!isAdmin) return null;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-4 tracking-tighter text-white">
                        <Ship className="w-10 h-10 text-primary" /> ADMIRALTY COMMAND
                    </h1>
                    <p className="text-primary-dark font-bold uppercase tracking-[0.2em] text-xs mt-2">Fleet Management Operations</p>
                </div>
                <div className="flex gap-4">
                    {activeTab === 'products' && (
                        <>
                            <button
                                className="bg-white/5 hover:bg-white/10 text-slate-400 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 border border-white/10"
                                onClick={handleSeedDatabase}
                            >
                                Restore Defaults
                            </button>
                            <button
                                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                onClick={() => alert('New gear request sent to the dock.')}
                            >
                                <Plus className="w-5 h-5" /> Commission Gear
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'products'
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <Package className="w-4 h-4" /> Inventory
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'users'
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <Users className="w-4 h-4" /> Crew Manifest
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">{customerCount}/10</span>
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'orders'
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    <ShoppingCart className="w-4 h-4" /> Logistics / Orders
                </button>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-cyan-glow/5">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="relative group w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder={activeTab === 'products' ? "Locate specific gear..." : "Search crew members..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                        />
                    </div>
                    {activeTab === 'products' && (
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span>
                                In Stock
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
                                Critical
                            </div>
                        </div>
                    )}
                    {activeTab === 'users' && (
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                            <span className={customerCount >= 10 ? 'text-red-400' : 'text-green-400'}>
                                {customerCount >= 10 ? '⚠️ CREW LIMIT REACHED' : `${10 - customerCount} berths available`}
                            </span>
                        </div>
                    )}
                    {activeTab === 'orders' && (
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Total Orders: {orders.length}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'products' ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-white/10">
                                    <th className="p-6">Inventory Item</th>
                                    <th className="p-6">Classification</th>
                                    <th className="p-6">Valuation</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-right">Directives</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-primary font-bold animate-pulse">RETRIEVING DATA...</td></tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-500">No matching gear found in the records.</td></tr>
                                ) : (
                                    filteredProducts.map(product => (
                                        <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img src={product.image} alt="" className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow-lg" />
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent group-hover:from-primary/20 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-base tracking-tight">{product.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase mt-0.5">{product.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 capitalize">
                                                <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border border-primary/20">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="p-6 font-black text-white">${product.price}</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                                    <span className={`text-sm tracking-widest font-black uppercase ${product.stock < 5 ? 'text-red-400' : 'text-green-400'}`}>
                                                        {product.stock} Units
                                                    </span>
                                                    {product.stock < 5 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setEditingProduct(product)}
                                                        className="p-3 bg-white/10 hover:bg-white text-slate-300 hover:text-slate-900 border border-white/10 rounded-xl transition-all shadow-lg"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-xl transition-all shadow-lg">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : activeTab === 'users' ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-white/10">
                                    <th className="p-6">Crew Member</th>
                                    <th className="p-6">Contact Signal</th>
                                    <th className="p-6">Rank</th>
                                    <th className="p-6">Enlisted</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-primary font-bold animate-pulse">SCANNING CREW RECORDS...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-500">No crew members found.</td></tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr key={u.id} className={`transition-colors group ${u.role !== 'ADMIN' ? 'hover:bg-red-500/5' : 'hover:bg-white/5'}`}>
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-base tracking-tight">{u.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase mt-0.5">{u.id.slice(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-slate-300 font-mono text-sm">{u.email}</span>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-lg ${u.role === 'ADMIN'
                                                    ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-amber-500/20'
                                                    : 'bg-cyan-400 text-slate-900 border-cyan-300 shadow-cyan-500/20'
                                                    }`}>
                                                    {u.role === 'ADMIN' ? '⚓ ADMIRAL' : '👤 CUSTOMER'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-slate-400 text-sm">
                                                {new Date(u.createdAt).toLocaleDateString('sv-SE')}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => setEditingUser(u)}
                                                        className="p-3 bg-white/10 hover:bg-white text-slate-300 hover:text-slate-900 border border-white/10 rounded-xl transition-all shadow-lg active:scale-90"
                                                        title="Edit crew member"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        className="p-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 rounded-xl transition-all shadow-lg active:scale-90 disabled:opacity-0 disabled:pointer-events-none"
                                                        disabled={u.role === 'ADMIN'}
                                                        onClick={() => handleDeleteUser(u.id, u.name)}
                                                        title="Discharge crew member"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-white/10">
                                    <th className="p-6">Commander</th>
                                    <th className="p-6">Order ID</th>
                                    <th className="p-6">Logistics</th>
                                    <th className="p-6">Valuation</th>
                                    <th className="p-6">Time of Entry</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-primary font-bold animate-pulse">EXTRACTING LOGS...</td></tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-500">No mission logs found.</td></tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6">
                                                <div>
                                                    <p className="font-black text-white text-base tracking-tight">{order.user.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase mt-0.5">{order.user.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="text-slate-300 font-mono text-sm">{order.id.slice(0, 8)}...</span>
                                            </td>
                                            <td className="p-6">
                                                <div className="space-y-1">
                                                    {order.items.map(item => (
                                                        <div key={item.id} className="text-xs text-slate-400 flex items-center gap-2">
                                                            <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.quantity}x</span>
                                                            <span className="truncate max-w-[150px]">{item.product.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6 font-black text-white">${order.total}</td>
                                            <td className="p-6 text-slate-400 text-sm">
                                                {new Date(order.createdAt).toLocaleString('sv-SE', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-6 bg-white/5 border-t border-white/10 flex items-center justify-between text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">
                    <span>Logged as: {user?.name} (Commander)</span>
                    <span>System Status: Nominal</span>
                </div>
            </div>

            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSave={handleSaveProduct}
                />
            )}

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
}
