import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useApi } from '../hooks/useApi';
import type { CheckoutData } from '../hooks/useApi';
import { CheckCircle, CreditCard, User, MapPin, AlertCircle } from 'lucide-react';

type Step = 'address' | 'payment' | 'confirmation';

export function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { checkout } = useApi();
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

    if (items.length === 0 && !orderDetails) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link to="/" className="text-secondary hover:underline">Go back to shop</Link>
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
            setError(err instanceof Error ? err.message : 'Checkout Failed');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'confirmation' && orderDetails) {
        return (
            <div className="max-w-md mx-auto py-12 text-center animate-scale-in">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2" data-testid="order-success-msg">Order Confirmed!</h1>
                <p className="text-muted mb-6">Thank you for your purchase.</p>

                <div className="bg-surface rounded-lg p-6 mb-8 text-left border border-white/5">
                    <p className="text-sm text-muted">Order ID</p>
                    <p className="font-mono text-lg font-bold mb-4" data-testid="order-id">{orderDetails.id}</p>
                    <p className="text-sm text-muted">Total Paid</p>
                    <p className="font-bold text-2xl text-primary-foreground">${orderDetails.total}</p>
                </div>

                <Link to="/" className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-12">
                <StepIndicator current={step} step="address" icon={MapPin} label="Address" />
                <div className={`w-12 h-1 mx-4 transition-colors ${step === 'address' ? 'bg-slate-700' : 'bg-secondary'}`} />
                <StepIndicator current={step} step="payment" icon={CreditCard} label="Payment" />
                <div className={`w-12 h-1 mx-4 transition-colors ${step === 'confirmation' ? 'bg-secondary' : 'bg-slate-700'}`} />
                <StepIndicator current={step} step="confirmation" icon={CheckCircle} label="Done" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2 animate-shake" data-testid="checkout-error">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <div className="bg-surface rounded-xl border border-white/5 p-6 md:p-8">
                        {step === 'address' && (
                            <div className="space-y-4 animate-fade-in">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-secondary" /> Shipping Address
                                </h2>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted">Street Address</label>
                                    <input
                                        type="text"
                                        value={formData.address.street}
                                        onChange={e => handleInputChange('address', 'street', e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-secondary/50 outline-none"
                                        data-testid="input-street"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-muted">City</label>
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={e => handleInputChange('address', 'city', e.target.value)}
                                            className="w-full bg-background border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-secondary/50 outline-none"
                                            data-testid="input-city"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-muted">Zip Code</label>
                                        <input
                                            type="text"
                                            value={formData.address.zip}
                                            onChange={e => handleInputChange('address', 'zip', e.target.value)}
                                            className="w-full bg-background border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-secondary/50 outline-none"
                                            data-testid="input-zip"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={() => validateAddress() && setStep('payment')}
                                        disabled={!validateAddress()}
                                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-colors"
                                        data-testid="next-to-payment"
                                    >
                                        Next: Payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'payment' && (
                            <div className="space-y-4 animate-fade-in">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-secondary" /> Payment Details
                                </h2>

                                <div className="bg-blue-900/20 text-blue-300 p-3 rounded text-sm mb-4">
                                    <p>Check "Internal Chaos" validation rules.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-muted">Card Number</label>
                                    <input
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        value={formData.payment.cardNumber}
                                        onChange={e => handleInputChange('payment', 'cardNumber', e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-secondary/50 outline-none font-mono"
                                        maxLength={19}
                                        data-testid="input-card"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-muted">Expiry</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={formData.payment.expiry}
                                            onChange={e => handleInputChange('payment', 'expiry', e.target.value)}
                                            className="w-full bg-background border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-secondary/50 outline-none"
                                            data-testid="input-expiry"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-muted">CVC</label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            value={formData.payment.cvc}
                                            onChange={e => handleInputChange('payment', 'cvc', e.target.value)}
                                            className="w-full bg-background border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-secondary/50 outline-none"
                                            maxLength={3}
                                            data-testid="input-cvc"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4 mt-4">
                                    <label className="block text-sm font-medium mb-1 text-muted">Discount Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            value={formData.discountCode}
                                            onChange={e => setFormData(prev => ({ ...prev, discountCode: e.target.value }))}
                                            className="flex-1 bg-background border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-secondary/50 outline-none uppercase"
                                            data-testid="input-discount"
                                        />
                                    </div>
                                    {formData.discountCode === 'FISKE20' && (
                                        <p className="text-green-400 text-xs mt-2">Discount applied: 20% off!</p>
                                    )}
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <button
                                        onClick={() => setStep('address')}
                                        className="text-muted hover:text-white px-4 py-2"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!validatePayment() || loading}
                                        className="bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
                                        data-testid="submit-order-btn"
                                    >
                                        {loading ? 'Processing...' : `Pay $${formData.discountCode === 'FISKE20' ? Math.round(cartTotal * 0.8) : cartTotal}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-surface rounded-xl border border-white/5 p-6">
                        <h3 className="font-bold mb-4">Order Summary</h3>
                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-muted">{item.quantity}x {item.name}</span>
                                    <span className="font-medium">${item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-white/10 pt-4 flex justify-between items-center font-bold text-lg">
                            <span>Total</span>
                            <span className="text-primary-foreground">${cartTotal}</span>
                        </div>
                        {formData.discountCode === 'FISKE20' && (
                            <div className="flex justify-between items-center text-green-400 text-sm mt-2">
                                <span>Discount (20%)</span>
                                <span>-${Math.round(cartTotal * 0.2)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepIndicator({ current, step, icon: Icon, label }: { current: Step; step: Step; icon: any; label: string }) {
    const isActive = current === step;
    const isCompleted = (current === 'payment' && step === 'address') || (current === 'confirmation' && step !== 'confirmation');

    let colorClass = 'text-slate-600 bg-slate-800';
    if (isActive) colorClass = 'text-white bg-secondary';
    if (isCompleted) colorClass = 'text-white bg-primary';

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-muted'}`}>{label}</span>
        </div>
    );
}
