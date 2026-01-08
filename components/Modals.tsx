import React, { useState, useEffect } from 'react';
import { 
    X, Printer, Download, Star, CheckCircle, ShieldCheck, MapPin, 
    Phone, User, FileText, Banknote, CreditCard, Copy, Mail, 
    ArrowRight, Smartphone, Lock, Shield, Minus, Plus, Heart, 
    Share2, Truck, RotateCcw, AlertCircle, Box, Zap, MessageSquare, Send, Search, PackageCheck,
    Clock, Calendar
} from 'lucide-react';
import { useStore } from '../store';
import { CartItem, Order, Review, OrderStatusLog } from '../types';

export const Modals: React.FC = () => {
  const { 
    activeModal, setActiveModal, selectedProduct, addToCart, 
    openCheckout, checkoutItems, user, setUser, setCurrentView, 
    addOrder, clearCart, reviews, addReview, orders, paymentConfig,
    deliveryZones,
    // Auth Actions
    loginWithEmail, registerWithEmail, authLoading, authError, setAuthError
  } = useStore();
  
  // Checkout State
  const [checkoutForm, setCheckoutForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', note: '' });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [trxId, setTrxId] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  // Auth State
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' });

  // Tracking State
  const [trackId, setTrackId] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');

  // Product Modal State
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Reset states when modals close/open
  useEffect(() => {
    if (activeModal === 'product') {
        setQuantity(1);
        setReviewRating(5);
        setReviewComment('');
        setShowReviewForm(false);
        setReviewSubmitted(false);
    }
    if (activeModal === 'tracking') {
        setTrackId('');
        setTrackPhone('');
        setFoundOrder(null);
        setTrackError('');
    }
    if (activeModal === 'checkout') {
        if (deliveryZones.length > 0 && !selectedZoneId) {
            setSelectedZoneId(deliveryZones[0].id);
        }
        // Prefill checkout form if user data exists
        setCheckoutForm(prev => ({
            ...prev,
            name: user?.name || prev.name,
            phone: user?.phone || prev.phone,
            address: user?.address || prev.address
        }));
    }
    if (activeModal === 'auth') {
        setAuthError(null);
        setAuthView('login');
    }
  }, [selectedProduct, activeModal, deliveryZones, user]);

  if (activeModal === 'none') return null;

  const handleClose = () => {
    setActiveModal('none');
    setOrderPlaced(false);
    setLastOrder(null);
    setAuthView('login');
    setAuthForm({ name: '', email: '', phone: '', password: '' });
    setAuthError(null);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine delivery charge
    const zone = deliveryZones.find(z => z.id === selectedZoneId);
    const deliveryCharge = zone ? zone.charge : 0;
    const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + deliveryCharge;

    const initialHistory: OrderStatusLog[] = [{
        status: 'pending',
        date: new Date().toLocaleString(),
        note: 'Order placed successfully'
    }];

    const newOrder: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        customerName: checkoutForm.name,
        phone: checkoutForm.phone,
        address: checkoutForm.address,
        items: checkoutItems,
        total: total,
        deliveryCharge: deliveryCharge,
        deliveryZone: zone?.name,
        date: new Date().toLocaleString(),
        status: 'pending',
        statusHistory: initialHistory,
        paymentMethod: paymentMethod,
        trxId: paymentMethod === 'online' ? trxId : undefined,
        userId: user?.id
    };

    addOrder(newOrder);
    setLastOrder(newOrder);
    clearCart();
    setOrderPlaced(true);
  };

  const handleSendToWhatsApp = () => {
    if (!lastOrder) return;

    const itemsList = lastOrder.items.map(item => `- ${item.name} (x${item.quantity})`).join('%0a');
    
    const message = `*New Order: ${lastOrder.id}*%0a` +
        `Name: ${lastOrder.customerName}%0a` +
        `Phone: ${lastOrder.phone}%0a` +
        `Address: ${lastOrder.address}%0a` +
        `%0a*Items:*%0a${itemsList}%0a` +
        `%0a*Total: ৳${lastOrder.total.toLocaleString()}*` +
        `%0aPayment: ${lastOrder.paymentMethod.toUpperCase()}`;

    // Replace with your actual WhatsApp business number
    const phoneNumber = "8801953319995"; 
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authView === 'register') {
        await registerWithEmail(authForm.email, authForm.password, authForm.name, authForm.phone);
    } else {
        // Login handles both customer and admin
        await loginWithEmail(authForm.email, authForm.password);
    }
  };

  const handleTrackOrder = (e: React.FormEvent) => {
      e.preventDefault();
      const order = orders.find(o => 
          (o.id.toLowerCase() === trackId.toLowerCase()) && 
          (o.phone.includes(trackPhone))
      );

      if (order) {
          setFoundOrder(order);
          setTrackError('');
      } else {
          setFoundOrder(null);
          setTrackError('Order not found. Please check Order ID and Phone Number.');
      }
  };

  const handleAddToCartFromModal = () => {
      if (selectedProduct) {
          for(let i=0; i<quantity; i++) {
              addToCart(selectedProduct);
          }
          setActiveModal('none');
      }
  };

  const handleBuyNowFromModal = () => {
      if (selectedProduct) {
          const item: CartItem = { ...selectedProduct, quantity: quantity };
          openCheckout([item]);
      }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !selectedProduct) return;

      const newReview: Review = {
          id: `rev-${Date.now()}`,
          productId: selectedProduct.id,
          userId: user.email,
          userName: user.name,
          rating: reviewRating,
          comment: reviewComment,
          date: new Date().toISOString().split('T')[0],
          status: 'pending'
      };

      addReview(newReview);
      setReviewSubmitted(true);
      setShowReviewForm(false);
  };

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const deliveryCharge = selectedZone ? selectedZone.charge : 0;
  const checkoutTotal = subtotal + deliveryCharge;

  // Tracking Modal (Revamped)
  if (activeModal === 'tracking') {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-[pop-in_0.3s_ease-out] max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Truck className="w-5 h-5" /> Track Order
                    </h3>
                    <button onClick={handleClose}><X className="w-6 h-6" /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {!foundOrder ? (
                        <form onSubmit={handleTrackOrder} className="space-y-4">
                            <p className="text-gray-500 text-sm mb-4">Enter your Order ID (sent via SMS) and Phone Number to see real-time updates.</p>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Order ID</label>
                                <div className="relative">
                                    <PackageCheck className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input required type="text" className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase font-medium placeholder-gray-300" placeholder="e.g. ORD-123456" value={trackId} onChange={e => setTrackId(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input required type="tel" className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium placeholder-gray-300" placeholder="e.g. 017..." value={trackPhone} onChange={e => setTrackPhone(e.target.value)} />
                                </div>
                            </div>
                            
                            {trackError && (
                                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" /> {trackError}
                                </div>
                            )}

                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2">
                                Track Now <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <div className="animate-fade-up">
                            {/* Order Summary Header */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Order ID</p>
                                        <h4 className="font-black text-gray-900 text-lg">#{foundOrder.id}</h4>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> {foundOrder.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-bold uppercase">Current Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                                            foundOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            foundOrder.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                            foundOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {foundOrder.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="mb-8">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-4 h-4"/> Order Timeline</h4>
                                <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                                    {(foundOrder.statusHistory || []).map((log, index) => (
                                        <div key={index} className="relative pl-4">
                                            {/* Dot */}
                                            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${index === 0 ? 'bg-brand-500 scale-125' : 'bg-gray-300'}`}></div>
                                            
                                            <p className={`text-sm font-bold ${index === 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                                {log.status.toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-400">{log.date}</p>
                                            {log.note && <p className="text-xs text-gray-500 mt-0.5 italic">"{log.note}"</p>}
                                        </div>
                                    ))}
                                    {/* Fallback if no history yet */}
                                    {(!foundOrder.statusHistory || foundOrder.statusHistory.length === 0) && (
                                         <div className="relative pl-4">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm bg-brand-500"></div>
                                            <p className="text-sm font-bold text-gray-900">ORDER PLACED</p>
                                            <p className="text-xs text-gray-400">{foundOrder.date}</p>
                                         </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items Summary */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-3">Item Details</p>
                                <div className="space-y-3 max-h-32 overflow-y-auto scrollbar-thin">
                                    {foundOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-50 rounded border border-gray-100 p-0.5"><img src={item.image} className="w-full h-full object-contain"/></div>
                                                <span className="text-gray-700 font-medium truncate max-w-[150px]">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                            </div>
                                            <span className="font-bold text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-black text-gray-900">
                                    <span>Total Payable</span>
                                    <span>৳{foundOrder.total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button onClick={() => { setFoundOrder(null); setTrackId(''); setTrackPhone(''); }} className="w-full text-center text-sm font-bold text-gray-500 hover:text-gray-800 underline py-2">
                                Check Another Order
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // Auth Modal
  if (activeModal === 'auth') {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>
            <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-[pop-in_0.4s_cubic-bezier(0.16,1,0.3,1)]">
                {/* Dynamic Header */}
                <div className="p-8 text-center relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-500">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner border border-white/30 bg-white/20">
                             <User className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-1">
                            {authView === 'login' ? 'Welcome Back' : 'Join Us'}
                        </h2>
                        <p className="text-white/80 text-xs font-medium">
                            {authView === 'login' ? 'Log in to your account' : 'Create an account to get started'}
                        </p>
                    </div>
                    <button onClick={handleClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        
                        {/* Name Field - Register Only */}
                        {authView === 'register' && (
                            <div className="space-y-1 animate-fade-up">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input required type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-medium" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} />
                                </div>
                            </div>
                        )}

                        {/* Phone Field - Register Only */}
                        {authView === 'register' && (
                            <div className="space-y-1 animate-fade-up" style={{ animationDelay: '50ms' }}>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input required type="tel" placeholder="017..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-medium" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-1 animate-fade-up" style={{ animationDelay: '100ms' }}>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                <input required type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-medium" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
                            </div>
                        </div>

                         {/* Password Field */}
                         <div className="space-y-1 animate-fade-up" style={{ animationDelay: '150ms' }}>
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                <input required type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm font-medium" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                            </div>
                        </div>

                        {/* Error Message */}
                        {authError && (
                            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg flex items-center gap-2 animate-fade-up">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={authLoading}
                            className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-brand-600/30 hover:bg-brand-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {authLoading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            ) : (
                                <>
                                    <span>{authView === 'login' ? 'Sign In' : 'Create Account'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Views */}
                    <div className="mt-6 text-center space-y-3">
                         {authView === 'login' ? (
                            <p className="text-xs text-gray-500">
                                Don't have an account?{' '}
                                <button onClick={() => { setAuthView('register'); setAuthError(null); }} className="text-brand-600 font-bold hover:underline">Register Now</button>
                            </p>
                         ) : (
                             <p className="text-xs text-gray-500">
                                Already have an account?{' '}
                                <button onClick={() => { setAuthView('login'); setAuthError(null); }} className="text-brand-600 font-bold hover:underline">Sign In</button>
                            </p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // Checkout Modal
  if (activeModal === 'checkout') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
        <div className="relative bg-gray-50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-[fade-up_0.3s_ease-out]">
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2 text-brand-600">
                    <ShieldCheck className="w-6 h-6 fill-brand-50" />
                    <h3 className="font-bold text-lg">Secure Checkout</h3>
                </div>
                <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-500" /></button>
            </div>

            <div className="overflow-y-auto flex-grow">
                {!orderPlaced ? (
                    <form onSubmit={handlePlaceOrder} className="p-5 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</h4>
                            <div className="space-y-3">
                                {checkoutItems.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg p-1 border border-gray-100"><img src={item.image} className="w-full h-full object-contain" /></div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.quantity} x ৳{item.price.toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">৳{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                                
                                <div className="border-t border-dashed border-gray-200 pt-3 mt-3 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-800">৳{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 flex items-center gap-1">Delivery Charge</span>
                                        <span className="font-bold text-brand-600">+ ৳{deliveryCharge.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className="text-base font-bold text-gray-800">Total Payable</span>
                                        <span className="text-xl font-black text-brand-600">৳{checkoutTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-700">Delivery Information</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input required type="text" placeholder="Full Name" className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input required type="tel" placeholder="Phone Number" className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <select 
                                        className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm appearance-none bg-white"
                                        value={selectedZoneId}
                                        onChange={(e) => setSelectedZoneId(e.target.value)}
                                    >
                                        {deliveryZones.map(zone => (
                                            <option key={zone.id} value={zone.id}>{zone.name} - ৳{zone.charge}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <textarea required placeholder="Full Address (House, Road, Area, City)" rows={2} className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm resize-none" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} />
                                </div>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Note (Optional)" className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm" value={checkoutForm.note} onChange={e => setCheckoutForm({...checkoutForm, note: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-700">Payment Method</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setPaymentMethod('cod')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                                    <Banknote className="w-6 h-6" />
                                    <span className="text-xs font-bold">Cash On Delivery</span>
                                </button>
                                <button type="button" onClick={() => setPaymentMethod('online')} className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'online' ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                                    <CreditCard className="w-6 h-6" />
                                    <span className="text-xs font-bold">Online Payment</span>
                                </button>
                            </div>

                            {/* Manual Payment Info (Dynamic) */}
                            {paymentMethod === 'online' && (
                                <div className="bg-white p-4 rounded-xl border border-brand-200 animate-fade-up">
                                    <p className="text-xs text-gray-500 mb-2">{paymentConfig.instructions}</p>
                                    
                                    {paymentConfig.bkashNumber && (
                                        <div className="flex items-center justify-between bg-pink-50 p-3 rounded-lg border border-pink-100 mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-pink-500 uppercase">bKash</span>
                                                <span className="font-mono font-bold text-gray-800 tracking-wider">{paymentConfig.bkashNumber}</span>
                                            </div>
                                            <button type="button" onClick={() => navigator.clipboard.writeText(paymentConfig.bkashNumber)} className="text-pink-600 hover:text-pink-700"><Copy className="w-4 h-4" /></button>
                                        </div>
                                    )}

                                    {paymentConfig.nagadNumber && (
                                        <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-100 mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-orange-500 uppercase">Nagad</span>
                                                <span className="font-mono font-bold text-gray-800 tracking-wider">{paymentConfig.nagadNumber}</span>
                                            </div>
                                            <button type="button" onClick={() => navigator.clipboard.writeText(paymentConfig.nagadNumber)} className="text-orange-600 hover:text-orange-700"><Copy className="w-4 h-4" /></button>
                                        </div>
                                    )}

                                    {paymentConfig.rocketNumber && (
                                        <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-100 mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-purple-500 uppercase">Rocket</span>
                                                <span className="font-mono font-bold text-gray-800 tracking-wider">{paymentConfig.rocketNumber}</span>
                                            </div>
                                            <button type="button" onClick={() => navigator.clipboard.writeText(paymentConfig.rocketNumber)} className="text-purple-600 hover:text-purple-700"><Copy className="w-4 h-4" /></button>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <span className="absolute left-3 top-3.5 text-gray-400 text-xs font-bold">TrxID</span>
                                        <input required type="text" placeholder="Enter Transaction ID" className="w-full pl-12 pr-3 py-3 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm uppercase font-medium" value={trxId} onChange={e => setTrxId(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                             <button type="submit" className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/30 hover:bg-brand-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <span>Place Order</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">৳{checkoutTotal.toLocaleString()}</span>
                            </button>
                            <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Secure Encrypted Transaction
                            </p>
                        </div>
                    </form>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-up">
                         <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                        <p className="text-gray-500 mb-4 max-w-xs mx-auto">
                            Thank you, {checkoutForm.name}. Your order ID is <span className="font-bold text-gray-800">#{lastOrder?.id}</span>.
                        </p>
                        
                        {/* WhatsApp Integration Button */}
                        <div className="w-full space-y-3 mb-6">
                            <button 
                                onClick={handleSendToWhatsApp}
                                className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 animate-pulse-slow"
                            >
                                <Send className="w-5 h-5" /> Confirm on WhatsApp
                            </button>
                            <p className="text-[10px] text-gray-400">
                                Send order details to us on WhatsApp to process it faster.
                            </p>
                        </div>

                        <button onClick={handleClose} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all">
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  // Improved Product Detail Modal
  if (activeModal === 'product' && selectedProduct) {
      // ... (Rest of product modal is same as before)
      // I will keep the content block for Product Modal unchanged for brevity as it was not requested to change
      const isOutOfStock = (selectedProduct.stock || 0) <= 0;
    
    // Filter approved reviews for this product
    const productReviews = reviews.filter(r => r.productId === selectedProduct.id && r.status === 'approved');
    const averageRating = productReviews.length > 0 
        ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
        : selectedProduct.rating; // Fallback to default if no reviews

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
            <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] animate-[pop-in_0.3s_ease-out]">
                
                {/* Close Button Mobile */}
                <button onClick={handleClose} className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white p-2 rounded-full transition-colors backdrop-blur-sm shadow-sm md:hidden text-gray-600"><X className="w-5 h-5" /></button>

                {/* Left: Image Section */}
                <div className="w-full md:w-5/12 bg-gray-50 relative group flex items-center justify-center p-8 md:p-12 overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                         {selectedProduct.isFlashSale && (
                             <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm animate-pulse">Flash Sale</span>
                         )}
                         {isOutOfStock && (
                             <span className="bg-gray-800 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">Out of Stock</span>
                         )}
                    </div>
                    
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110 drop-shadow-xl" />
                    
                    {/* Share/Like */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button className="bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"><Heart className="w-5 h-5" /></button>
                        <button className="bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"><Share2 className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Right: Info Section */}
                <div className="w-full md:w-7/12 flex flex-col bg-white overflow-hidden relative">
                    <button onClick={handleClose} className="absolute top-4 right-4 z-20 hover:bg-gray-100 p-2 rounded-full transition-colors hidden md:block text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                    
                    <div className="p-6 md:p-8 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-200">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-3 flex-wrap">
                            <span className="hover:text-brand-600 cursor-pointer">Home</span>
                            <span>/</span>
                            <span className="hover:text-brand-600 cursor-pointer">{selectedProduct.category}</span>
                            {selectedProduct.subcategory && (
                                <>
                                    <span>/</span>
                                    <span className="text-gray-600">{selectedProduct.subcategory}</span>
                                </>
                            )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 leading-tight">{selectedProduct.name}</h2>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span className="text-xs font-bold text-gray-800">{averageRating}</span>
                                <span className="text-[10px] text-gray-500 font-medium ml-1">({productReviews.length} Reviews)</span>
                            </div>
                            <span className="text-xs text-gray-300">|</span>
                            <span className="text-xs font-bold text-gray-500">SKU: {selectedProduct.id.split('-').pop()?.toUpperCase()}</span>
                            <span className="text-xs text-gray-300">|</span>
                             <span className={`text-xs font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                                 {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                             </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex flex-col">
                                {selectedProduct.oldPrice && <span className="text-sm text-gray-400 line-through font-medium">৳{selectedProduct.oldPrice.toLocaleString()}</span>}
                                <span className="text-3xl font-black text-brand-600 leading-none">৳{selectedProduct.price.toLocaleString()}</span>
                            </div>
                             {selectedProduct.oldPrice && (
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md mb-1">
                                    {Math.round(((selectedProduct.oldPrice - selectedProduct.price) / selectedProduct.oldPrice) * 100)}% OFF
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Description</h3>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                {selectedProduct.description || `Experience premium quality with the ${selectedProduct.name}. Designed for performance and style, this is the perfect addition to your tech collection.`}
                            </p>
                        </div>

                        {/* Specifications */}
                        <div className="mb-8 grid grid-cols-2 gap-3">
                            <div className="p-3 border border-gray-100 rounded-lg flex items-center gap-3">
                                <div className="bg-blue-50 p-2 rounded-full text-blue-600"><ShieldCheck className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Warranty</p>
                                    <p className="text-xs font-bold text-gray-700">{selectedProduct.warranty || 'No Warranty'}</p>
                                </div>
                            </div>
                             <div className="p-3 border border-gray-100 rounded-lg flex items-center gap-3">
                                <div className="bg-purple-50 p-2 rounded-full text-purple-600"><Smartphone className="w-4 h-4" /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Category</p>
                                    <p className="text-xs font-bold text-gray-700">{selectedProduct.category}</p>
                                </div>
                            </div>
                        </div>

                        {/* --- REVIEWS SECTION --- */}
                        <div className="border-t border-gray-100 pt-8 mt-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    Reviews <span className="text-sm text-gray-400 font-normal">({productReviews.length})</span>
                                </h3>
                                
                                {user ? (
                                    !reviewSubmitted && (
                                        <button 
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="text-xs font-bold bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-brand-600 transition-colors"
                                        >
                                            Write a Review
                                        </button>
                                    )
                                ) : (
                                    <button 
                                        onClick={() => setActiveModal('auth')}
                                        className="text-xs font-bold text-brand-600 hover:underline"
                                    >
                                        Log in to Review
                                    </button>
                                )}
                            </div>

                            {/* Review Form */}
                            {showReviewForm && (
                                <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-up">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Rate this product</h4>
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star} 
                                                type="button"
                                                onClick={() => setReviewRating(star)}
                                                className={`transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            >
                                                <Star className="w-6 h-6 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea 
                                        required 
                                        placeholder="Share your thoughts about this product..." 
                                        className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-brand-500 outline-none mb-3"
                                        rows={3}
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowReviewForm(false)}
                                            className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="px-6 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2"
                                        >
                                            Submit Review <Send className="w-3 h-3" />
                                        </button>
                                    </div>
                                </form>
                            )}

                            {reviewSubmitted && (
                                <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2 animate-fade-up">
                                    <CheckCircle className="w-4 h-4" /> Review submitted! It will appear after admin approval.
                                </div>
                            )}

                            {/* Review List */}
                            <div className="space-y-4">
                                {productReviews.length > 0 ? (
                                    productReviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-100 to-blue-100 flex items-center justify-center text-xs font-bold text-gray-700">
                                                        {review.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">{review.userName}</p>
                                                        <div className="flex text-yellow-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-gray-400">{review.date}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed ml-10">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-400">
                                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No reviews yet. Be the first to review!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 md:p-6 border-t border-gray-100 bg-white sticky bottom-0 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                        {isOutOfStock ? (
                             <div className="w-full bg-gray-100 text-gray-500 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                                <AlertCircle className="w-5 h-5" /> Out of Stock
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                {/* Quantity */}
                                <div className="flex items-center border border-gray-200 rounded-xl px-2 h-[50px]">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-brand-600"><Minus className="w-4 h-4" /></button>
                                    <span className="w-8 text-center font-bold text-gray-800">{quantity}</span>
                                    <button onClick={() => setQuantity(Math.min(selectedProduct.stock || 10, quantity + 1))} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-brand-600"><Plus className="w-4 h-4" /></button>
                                </div>

                                <button 
                                    onClick={handleAddToCartFromModal}
                                    className="flex-1 bg-white text-brand-600 border-2 border-brand-600 h-[50px] rounded-xl font-bold hover:bg-brand-50 transition-colors"
                                >
                                    Add to Cart
                                </button>
                                <button 
                                    onClick={handleBuyNowFromModal}
                                    className="flex-1 bg-brand-600 text-white h-[50px] rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-4 h-4 fill-current" /> Buy Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return null;
};