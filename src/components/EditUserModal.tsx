import { useState } from 'react';
import { X, Save, User, Shield, Anchor, UserCircle } from 'lucide-react';

interface EditUserModalProps {
    user: { id: string; name: string; email: string; role: string };
    onClose: () => void;
    onSave: (userId: string, data: { name: string; role: string }) => Promise<void>;
}

export function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
    const [name, setName] = useState(user.name);
    const [role, setRole] = useState(user.role);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave(user.id, { name, role });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Message lost at sea: Failed to update crew member.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-scale-in">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter text-white">
                        <Shield className="w-6 h-6 text-primary" /> CREW ASSIGNMENT
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white font-black">{user.email}</p>
                                <p className="text-[10px] text-slate-500 font-mono uppercase">ID: {user.id.slice(0, 8)}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">Crew Name</label>
                            <div className="relative group">
                                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block">Rank Assignment</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('USER')}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${role === 'USER'
                                            ? 'bg-cyan-400/20 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/10'
                                            : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                                        }`}
                                >
                                    <User className="w-6 h-6" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Customer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('ADMIN')}
                                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${role === 'ADMIN'
                                            ? 'bg-amber-400/20 border-amber-400 text-amber-400 shadow-lg shadow-amber-400/10'
                                            : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                                        }`}
                                >
                                    <Anchor className="w-6 h-6" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Admiral</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95"
                        >
                            Dismiss
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Finalize Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
