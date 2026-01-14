import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import type { CheckoutData } from '../hooks/useApi';
import { CheckCircle, CreditCard, MapPin, AlertCircle, Anchor, Ship, ArrowRight, ChevronLeft } from 'lucide-react';

type Step = 'address' | 'payment' | 'confirmation';

export function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { checkout } = useApi();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>('address');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CheckoutData>({
        items: [],
        address: { street: '', city: '', zip: '' },
        payment: { cardNumber: '', expiry: '', cvc: '' },
        discountCode: ''
    });
    const [orderDetails, setOrderDetails] = useState<{ id: string; total: number } | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login?redirectTo=/checkout');
        }
    }, [isAuthenticated, authLoading, navigate]);

    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-white">
                <Ship className="w-12 h-12 animate-bounce text-primary/40 mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Synchronizing Manifest...</p>
            </div>
        );
    }

    if (items.length === 0 && !orderDetails) {
        return (
            <div className="text-center py-32 animate-fade-in flex flex-col items-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
                    <Ship className="w-12 h-12 text-primary/40" />
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tighter text-white uppercase">Checkout Void</h2>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-10">You cannot proceed without gear.</p>
                <Link to="/" className="inline-block bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20">
                    Return to Dock
                </Link>
            </div>
        );
    }

    const handleInputChange = (section: keyof CheckoutData, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: typeof prev[section] === 'object'
                ? { ...(prev[section] as object), [field]: value }
                : value
        }));
    };

    const validateAddress = () => {
        return formData.address.street && formData.address.city && formData.address.zip;
    };

    const validatePayment = () => {
        const cardRegex = /^\d{16}$/;
        return cardRegex.test(formData.payment.cardNumber.replace(/\s/g, '')) &&
            formData.payment.expiry &&
            formData.payment.cvc;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await checkout({
                ...formData,
                items: items.map(i => ({ id: i.id, quantity: i.quantity }))
            });

            setOrderDetails({ id: result.orderId, total: result.total });
            clearCart();
            setStep('confirmation');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fleet Transmission Error');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'confirmation' && orderDetails) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center animate-scale-in flex flex-col items-center">
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-8 border border-green-500/20 shadow-lg shadow-green-500/10">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase" data-testid="order-success-msg">MISSION SUCCESS</h1>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mb-12">Your gear has been commissioned and dispatched.</p>

                <div className="glass-card rounded-3xl p-10 mb-10 text-left border border-white/10 w-full shadow-cyan-glow/5 relative overflow-hidden text-white/5 mx-1" style={{ width: 'calc(100%)' }}>
                    <div className="relative z-10 text-white">
                        <div className="mb-8 pb-8 border-b border-white/10">
                            <p className="text-[10px] text-primary-dark font-black uppercase tracking-[0.2em] mb-2">Manifest Serial</p>
                            <p className="font-mono text-xl font-black text-white tracking-widest" data-testid="order-id">{orderDetails.id}</p>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-primary-dark font-black uppercase tracking-[0.2em] mb-1">Final Settlement</p>
                                <p className="font-black text-5xl text-white tracking-tighter">€{orderDetails.total}</p>
                            </div>
                            <Anchor className="w-16 h-16 text-primary/10" />
                        </div>
                    </div>
                </div>

                <Link to="/" className="bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] border border-white/10 transition-all active:scale-95">
                    Return to High Seas
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <div className="flex items-center justify-center mb-16 gap-4">
                <StepIndicator current={step} step="address" icon={MapPin} label="Logistics" />
                <div className={`w-16 h-0.5 transition-all duration-700 ${step === 'address' ? 'bg-white/10' : 'bg-primary shadow-sm shadow-primary/50'}`} />
                <StepIndicator current={step} step="payment" icon={CreditCard} label="Settlement" />
                <div className={`w-16 h-0.5 transition-all duration-700 ${step === 'confirmation' ? 'bg-primary shadow-sm shadow-primary/50' : 'bg-white/10'}`} />
                <StepIndicator current={step} step="confirmation" icon={CheckCircle} label="Complete" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl mb-8 flex items-center gap-4 animate-shake" data-testid="checkout-error">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            <p className="font-black text-xs uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    <div className="glass-card rounded-3xl border border-white/10 p-8 md:p-12 shadow-cyan-glow/5">
                        {step === 'address' && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Logistics Hub</h2>
                                    <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Supply chain destination details</p>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary-dark group-focus-within:text-primary transition-colors">Sector Address</label>
                                        <input
                                            type="text"
                                            placeholder="Enter fleet-side docking address"
                                            value={formData.address.street}
                                            onChange={e => handleInputChange('address', 'street', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-700 font-medium"
                                            data-testid="input-street"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary-dark group-focus-within:text-primary transition-colors">Port / City</label>
                                            <input
                                                type="text"
                                                placeholder="City Gate"
                                                value={formData.address.city}
                                                onChange={e => handleInputChange('address', 'city', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-700 font-medium"
                                                data-testid="input-city"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary-dark group-focus-within:text-primary transition-colors">Coastal Zip</label>
                                            <input
                                                type="text"
                                                placeholder="Code"
                                                value={formData.address.zip}
                                                onChange={e => handleInputChange('address', 'zip', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-700 font-medium"
                                                data-testid="input-zip"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex justify-end">
                                    <button
                                        onClick={() => validateAddress() && setStep('payment')}
                                        disabled={!validateAddress()}
                                        className="bg-primary hover:bg-primary-dark disabled:opacity-20 disabled:cursor-not-allowed text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-3"
                                        data-testid="next-to-payment"
                                    >
                                        Seal Logistics <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'payment' && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Financial Settlement</h2>
                                    <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Verify your credentials and authorize transfer</p>
                                </div>

                                <div className="bg-primary/5 border border-primary/20 text-primary-dark p-4 rounded-xl flex items-center gap-4">
                                    <Ship className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-[10px] font-black uppercase tracking-wider">Fleet Standard Encryption Active.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary-dark group-focus-within:text-primary transition-colors">Credentials (Card No.)</label>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            value={formData.payment.cardNumber}
                                            onChange={e => handleInputChange('payment', 'cardNumber', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-700 font-mono tracking-widest"
                                            maxLength={19}
                                            data-testid="input-card"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary-dark group-focus-within:text-primary transition-colors">Term (Expiry)</label>
                                            <input
                                                type="text"
                                                placeholder="MM / YY"
                                                value={formData.payment.expiry}
                                                onChange={e => handleInputChange('payment', 'expiry', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-700"
                                                data-testid="input-expiry"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-primary-dark group-focus-within:text-primary transition-colors">Auth Code (CVC)</label>
                                            <input
                                                type="text"
                                                placeholder="•••"
                                                value={formData.payment.cvc}
                                                onChange={e => handleInputChange('payment', 'cvc', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-700"
                                                maxLength={3}
                                                data-testid="input-cvc"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-white/5 pt-10 mt-6 group">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-slate-500 group-focus-within:text-primary transition-colors">Admiralty Discount Code</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter secure voucher"
                                                value={formData.discountCode}
                                                onChange={e => setFormData(prev => ({ ...prev, discountCode: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-700 uppercase tracking-widest font-black"
                                                data-testid="input-discount"
                                            />
                                            {formData.discountCode === 'FISKE20' && (
                                                <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
                                                    <CheckCircle className="w-3 h-3" /> 20% Garrison Rebate Authorized
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex items-center justify-between">
                                    <button
                                        onClick={() => setStep('address')}
                                        className="text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-colors px-4 py-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Re-route Logistics
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!validatePayment() || loading}
                                        className="bg-primary hover:bg-primary-dark disabled:opacity-20 disabled:cursor-not-allowed text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-primary/30 flex items-center gap-4"
                                        data-testid="submit-order-btn"
                                    >
                                        {loading ? 'Processing...' : (
                                            <>Authorize Transfer — €{formData.discountCode === 'FISKE20' ? Math.round(cartTotal * 0.8) : cartTotal}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="glass-card rounded-3xl border border-white/10 p-8 sticky top-24 shadow-cyan-glow/5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-primary-dark">Provision Manifest</h3>
                        <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <p className="text-white font-black text-xs leading-tight mb-1">{item.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="font-black text-white text-sm tracking-tighter">€{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 border-t border-white/10 pt-8">
                            <div className="flex justify-between items-center text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                <span>Sub-Manifest Total</span>
                                <span>€{cartTotal}</span>
                            </div>
                            {formData.discountCode === 'FISKE20' && (
                                <div className="flex justify-between items-center text-green-400 font-black text-[10px] uppercase tracking-widest">
                                    <span>Admiralty Rebate (20%)</span>
                                    <span>-€{Math.round(cartTotal * 0.2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Grand Total</span>
                                <span className="text-3xl font-black text-white tracking-tighter" data-testid="cart-total">
                                    €{formData.discountCode === 'FISKE20' ? Math.round(cartTotal * 0.8) : cartTotal}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-[9px] text-slate-600 font-bold uppercase leading-relaxed text-center">
                                By authorizing, you agree to the Admiralty's Terms of Engagement. No refunds on premium gear.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepIndicator({ current, step, icon: Icon, label }: { current: Step; step: Step; icon: any; label: string }) {
    const isActive = current === step;
    const isCompleted = (current === 'payment' && step === 'address') || (current === 'confirmation' && step !== 'confirmation');

    let containerClass = 'bg-white/5 border-white/5 text-slate-600';
    let iconClass = 'text-slate-600';

    if (isActive) {
        containerClass = 'bg-white/10 border-white/20 text-white shadow-lg shadow-white/5 scale-110';
        iconClass = 'text-primary';
    }
    if (isCompleted) {
        containerClass = 'bg-primary/20 border-primary/40 text-primary';
        iconClass = 'text-primary';
    }

    return (
        <div className="flex flex-col items-center gap-3 transition-all duration-500">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-500 ${containerClass}`}>
                <Icon className={`w-6 h-6 transition-colors duration-500 ${iconClass}`} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                {label}
            </span>
        </div>
    );
}
