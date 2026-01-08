import React, { useState, useRef, useEffect } from 'react';
import { 
    ArrowLeft, Search, Trash2, Plus, Minus, 
    CreditCard, Banknote, PackagePlus, X, 
    User, Phone, Printer, Save,
    LayoutGrid, LogOut, Settings,
    Percent, FileText, CheckCircle, Download, QrCode,
    MapPin, Globe, Mail, FileType, History, Eye, Pencil, AlertTriangle, RotateCcw,
    ShoppingCart
} from 'lucide-react';
import { useStore } from '../store';
import { Product } from '../types';

interface POSItem {
    product: Product;
    quantity: number;
    price: number; // Editable selling price
    imei: string;
    warranty: string;
}

export const POS: React.FC = () => {
    const { setCurrentView, user, products } = useStore();
    const [viewMode, setViewMode] = useState<'pos' | 'history'>('pos');
    
    // Mobile Tab State
    const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'history'>('catalog');

    // Cart State
    const [cart, setCart] = useState<POSItem[]>([]);
    const [search, setSearch] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [discount, setDiscount] = useState<string>(''); 
    
    // Editing State
    const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
    const [editingInvoiceNo, setEditingInvoiceNo] = useState<string | null>(null);
    
    // Invoice History State
    const [invoiceHistory, setInvoiceHistory] = useState<any[]>(() => {
        const saved = localStorage.getItem('pos_invoice_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [historySearch, setHistorySearch] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Modal States
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState<any>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [customItem, setCustomItem] = useState({ name: '', price: '' });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Business Settings State (Persisted)
    const [businessInfo, setBusinessInfo] = useState(() => {
        const saved = localStorage.getItem('pos_business_info');
        return saved ? JSON.parse(saved) : {
            name: 'Zazzba Tech Zone',
            tagline: 'Premium Tech Store',
            address: 'Isapura Chowrasta, Sirajdikhan, Munshiganj',
            phone: '01953319995',
            email: 'zazzba.info@gmail.com',
            website: 'www.zazzba.com',
            footerNote: 'Thank you for your business!',
            terms: '1. Warranty void if seal is broken or physical damage occurs.\n2. No cash refund allowed, exchange valid within 3 days.\n3. Software/liquid damage is not covered under warranty.'
        };
    });

    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Save settings & history whenever they change
    useEffect(() => {
        localStorage.setItem('pos_business_info', JSON.stringify(businessInfo));
    }, [businessInfo]);

    useEffect(() => {
        localStorage.setItem('pos_invoice_history', JSON.stringify(invoiceHistory));
    }, [invoiceHistory]);

    // Update active tab on view mode change for mobile sync
    useEffect(() => {
        if (viewMode === 'history') setActiveTab('history');
        if (viewMode === 'pos' && activeTab === 'history') setActiveTab('catalog');
    }, [viewMode]);

    // Filter dynamic products from store
    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    // --- POS Actions ---

    const addToPosCart = (product: Product) => {
        setCart(prev => {
            const exists = prev.find(item => item.product.id === product.id);
            if (exists) {
                return prev.map(item => item.product.id === product.id ? {...item, quantity: item.quantity + 1} : item);
            }
            let defaultWarranty = '';
            if (product.category === 'Smartphone') defaultWarranty = '1 Year Official';
            if (product.category === 'Accessories') defaultWarranty = '6 Months';

            return [...prev, { 
                product, 
                quantity: 1, 
                price: product.price, 
                imei: '', 
                warranty: defaultWarranty 
            }];
        });
        setSearch(''); 
        // On mobile, maybe don't auto-focus or it pops keyboard
        if (window.innerWidth > 768) {
            searchInputRef.current?.focus(); 
        }
    };

    const updateItemDetail = (id: string, field: 'imei' | 'warranty', value: string) => {
        setCart(prev => prev.map(item => item.product.id === id ? { ...item, [field]: value } : item));
    };

    const updateItemPrice = (id: string, newPrice: string) => {
        const price = parseFloat(newPrice);
        setCart(prev => prev.map(item => item.product.id === id ? { ...item, price: isNaN(price) ? 0 : price } : item));
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => item.product.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    };
    
    const removeItem = (id: string) => setCart(prev => prev.filter(item => item.product.id !== id));

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (filtered.length > 0) {
                addToPosCart(filtered[0]);
            } else {
                initiateCustomAdd(search);
            }
        }
    };

    const handleAddCustomItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customItem.name || !customItem.price) return;
        const price = parseFloat(customItem.price);
        const newProduct: Product = {
            id: `custom-${Date.now()}`,
            name: customItem.name,
            price: price,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(customItem.name)}&background=random&color=fff&size=200`,
            rating: 5,
            category: 'Custom Sale',
        };
        addToPosCart(newProduct);
        setIsCustomModalOpen(false);
        setCustomItem({ name: '', price: '' });
        setSearch('');
    };

    const initiateCustomAdd = (nameVal: string = '') => {
        setCustomItem({ name: nameVal, price: '' });
        setIsCustomModalOpen(true);
    }

    const cancelEdit = () => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscount('');
        setEditingInvoiceId(null);
        setEditingInvoiceNo(null);
    };

    const handleCheckout = (paymentMethod: 'CASH' | 'DIGITAL') => {
        if (cart.length === 0) return;
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = parseFloat(discount) || 0;
        const finalTotal = Math.max(0, subtotal - discountAmount);

        if (editingInvoiceId) {
            // Update Existing Invoice
            setInvoiceHistory(prev => prev.map(inv => {
                if (inv.id === editingInvoiceId) {
                    return {
                        ...inv,
                        customer: { name: customerName || 'Walking Customer', phone: customerPhone || 'N/A' },
                        items: cart,
                        subtotal,
                        discount: discountAmount,
                        total: finalTotal,
                        method: paymentMethod,
                        // Update Business Info on edit
                        shopName: businessInfo.name,
                        shopTagline: businessInfo.tagline,
                        shopAddress: businessInfo.address,
                        shopPhone: businessInfo.phone,
                        shopEmail: businessInfo.email,
                        shopWebsite: businessInfo.website,
                        terms: businessInfo.terms,
                        footerNote: businessInfo.footerNote
                    };
                }
                return inv;
            }));

            // Construct updated object for modal display
            const original = invoiceHistory.find(i => i.id === editingInvoiceId);
            const updatedInvoice = {
                ...original,
                customer: { name: customerName || 'Walking Customer', phone: customerPhone || 'N/A' },
                items: cart,
                subtotal,
                discount: discountAmount,
                total: finalTotal,
                method: paymentMethod,
                shopName: businessInfo.name,
                shopTagline: businessInfo.tagline,
                shopAddress: businessInfo.address,
                shopPhone: businessInfo.phone,
                shopEmail: businessInfo.email,
                shopWebsite: businessInfo.website,
                terms: businessInfo.terms,
                footerNote: businessInfo.footerNote
            };
            setCurrentInvoice(updatedInvoice);

        } else {
            // Create New Invoice
            const invoiceData = {
                id: Date.now().toString(), // Unique ID for history management
                invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
                date: new Date().toLocaleDateString('en-GB'),
                time: new Date().toLocaleTimeString(),
                customer: { name: customerName || 'Walking Customer', phone: customerPhone || 'N/A' },
                items: cart,
                subtotal,
                discount: discountAmount,
                total: finalTotal,
                method: paymentMethod,
                servedBy: user?.name || 'Admin',
                shopName: businessInfo.name,
                shopTagline: businessInfo.tagline,
                shopAddress: businessInfo.address,
                shopPhone: businessInfo.phone,
                shopEmail: businessInfo.email,
                shopWebsite: businessInfo.website,
                terms: businessInfo.terms,
                footerNote: businessInfo.footerNote
            };
            
            setInvoiceHistory(prev => [invoiceData, ...prev]); // Add to history
            setCurrentInvoice(invoiceData);
        }
        
        setShowInvoiceModal(true);
    };

    // --- History Actions ---

    const handleDeleteInvoice = () => {
        if (!deleteId) return;
        setInvoiceHistory(prev => prev.filter(inv => inv.id !== deleteId));
        setDeleteId(null);
    };

    const handleEditInvoice = (invoice: any) => {
        setCart(invoice.items);
        setCustomerName(invoice.customer.name);
        setCustomerPhone(invoice.customer.phone === 'N/A' ? '' : invoice.customer.phone);
        setDiscount(invoice.discount.toString());
        setEditingInvoiceId(invoice.id);
        setEditingInvoiceNo(invoice.invoiceNo);
        setViewMode('pos');
        setActiveTab('cart'); // Switch to cart tab on mobile
    };

    const handleViewInvoice = (invoice: any) => {
        setCurrentInvoice(invoice);
        setShowInvoiceModal(true);
    };

    // --- Utils ---

    // Update invoice preview if business info changes
    useEffect(() => {
        if (showInvoiceModal && currentInvoice && viewMode === 'pos') {
            setCurrentInvoice((prev: any) => ({
                ...prev,
                shopName: businessInfo.name,
                shopTagline: businessInfo.tagline,
                shopAddress: businessInfo.address,
                shopPhone: businessInfo.phone,
                shopEmail: businessInfo.email,
                shopWebsite: businessInfo.website,
                terms: businessInfo.terms,
                footerNote: businessInfo.footerNote
            }));
        }
    }, [businessInfo]);

    const handleDownloadPdf = () => {
        const element = document.getElementById('invoice-content');
        if (!element) return;
        setIsDownloading(true);
        const opt = {
            margin: 0,
            filename: `${currentInvoice?.invoiceNo || 'invoice'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        if ((window as any).html2pdf) {
            (window as any).html2pdf().set(opt).from(element).save().then(() => setIsDownloading(false));
        } else {
            alert('PDF Generator loading... please try again.');
            setIsDownloading(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = parseFloat(discount) || 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    // Filter History
    const filteredHistory = invoiceHistory.filter(inv => 
        inv.invoiceNo.toLowerCase().includes(historySearch.toLowerCase()) ||
        inv.customer.name.toLowerCase().includes(historySearch.toLowerCase()) ||
        inv.customer.phone.includes(historySearch)
    );

    return (
        <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col md:flex-row overflow-hidden font-sans text-slate-800">
            {/* Optimized Print Styles */}
            <style>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                    body * { visibility: hidden; }
                    #invoice-modal, #invoice-modal * { visibility: visible; }
                    #invoice-modal { position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; background: white; z-index: 9999; padding: 0; margin: 0; display: flex; align-items: flex-start; justify-content: center; }
                    #invoice-content { width: 210mm; min-height: 297mm; padding: 15mm 20mm; transform: scale(1) !important; box-shadow: none; }
                    #no-print { display: none !important; }
                    .print-bg-brand-600 { background-color: #C1105E !important; color: white !important; }
                    .print-bg-slate-100 { background-color: #f1f5f9 !important; }
                    .print-text-brand { color: #E2136E !important; }
                    .print-border-brand { border-color: #C1105E !important; }
                }
            `}</style>

            {/* Sidebar Navigation (Desktop) */}
            <div className="hidden md:flex w-20 bg-slate-900 flex-col items-center py-6 gap-6 text-slate-400 z-20 shadow-xl print:hidden">
                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-black text-lg mb-4 shadow-lg shadow-brand-500/30">Z</div>
                <button 
                    onClick={() => { setViewMode('pos'); setActiveTab('catalog'); }} 
                    className={`p-3 rounded-xl transition-colors ${viewMode === 'pos' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    title="POS Terminal"
                >
                    <LayoutGrid className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => { setViewMode('history'); setActiveTab('history'); }} 
                    className={`p-3 rounded-xl transition-colors ${viewMode === 'history' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    title="Invoice History"
                >
                    <History className="w-6 h-6" />
                </button>
                <button onClick={() => setIsSettingsOpen(true)} className="p-3 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white" title="Settings">
                    <Settings className="w-6 h-6" />
                </button>
                <div className="mt-auto flex flex-col gap-4">
                    <button onClick={() => setCurrentView('dashboard')} className="p-3 hover:text-white transition-colors">
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col h-full overflow-hidden print:hidden relative">
                {/* Mobile Header */}
                <div className="md:hidden h-14 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0 shadow-md z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold">Z</div>
                        <span className="font-bold text-lg">POS</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSettingsOpen(true)}><Settings className="w-5 h-5 text-slate-300" /></button>
                        <button onClick={() => setCurrentView('dashboard')}><LogOut className="w-5 h-5 text-slate-300" /></button>
                    </div>
                </div>

                {/* Top Bar (Desktop) */}
                <div className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-6 shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="font-bold text-xl text-slate-800">{viewMode === 'pos' ? 'New Sale' : 'Invoice History'}</h2>
                        {editingInvoiceId && viewMode === 'pos' && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200 flex items-center gap-1 animate-pulse">
                                <Pencil className="w-3 h-3" /> Editing #{editingInvoiceNo}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-700">{user?.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Admin</p>
                        </div>
                        <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 font-bold border border-brand-100">
                            {user?.name.charAt(0)}
                        </div>
                    </div>
                </div>

                {/* View Content */}
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative bg-slate-100">
                    
                    {/* --- Product Catalog Section (Visible on 'catalog' tab or Desktop) --- */}
                    {(activeTab === 'catalog' || window.innerWidth >= 768) && viewMode === 'pos' && (
                        <div className={`flex flex-col p-4 md:p-6 overflow-hidden relative ${activeTab === 'catalog' ? 'w-full md:w-[60%] lg:w-[65%]' : 'hidden md:flex'}`}>
                            <div className="flex gap-3 mb-4 md:mb-6">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        ref={searchInputRef}
                                        type="text" 
                                        placeholder="Search products..." 
                                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium text-slate-700"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        // Auto focus only on desktop to prevent keyboard popup on mobile nav
                                        autoFocus={window.innerWidth > 768} 
                                    />
                                </div>
                                <button onClick={() => initiateCustomAdd(search)} className="bg-slate-800 text-white px-4 md:px-5 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg active:scale-95 flex items-center gap-2 shrink-0">
                                    <PackagePlus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-grow overflow-y-auto pr-1 md:pr-2 pb-20 md:pb-4 no-scrollbar">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                    {filtered.map(product => (
                                        <button 
                                            key={product.id}
                                            onClick={() => {
                                                addToPosCart(product);
                                                // On mobile, show a toast or feedback, don't switch tabs immediately for speed
                                            }}
                                            className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-[0.98]"
                                        >
                                            <div className="w-20 h-20 md:w-24 md:h-24 mb-3 overflow-hidden bg-slate-50 rounded-lg p-2 border border-slate-100">
                                                <img src={product.image} className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 line-clamp-2 h-8 leading-tight w-full">{product.name}</p>
                                            <div className="mt-auto pt-2 w-full flex items-center justify-between border-t border-slate-50">
                                                 <span className="text-[10px] text-slate-400 font-medium uppercase truncate max-w-[60px]">{product.category}</span>
                                                 <span className="text-brand-600 font-bold text-sm">৳{product.price.toLocaleString()}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Cart / Billing Section (Visible on 'cart' tab or Desktop) --- */}
                    {(activeTab === 'cart' || window.innerWidth >= 768) && viewMode === 'pos' && (
                        <div className={`bg-white flex flex-col shadow-2xl z-30 ${activeTab === 'cart' ? 'w-full h-full absolute inset-0 md:static md:w-[40%] lg:w-[35%] md:border-l md:border-slate-200' : 'hidden md:flex md:w-[40%] lg:w-[35%] md:border-l md:border-slate-200'}`}>
                            {/* Cancel Edit Button */}
                            {editingInvoiceId && (
                                <div className="bg-yellow-50 px-4 py-2 border-b border-yellow-100 flex justify-between items-center shrink-0">
                                    <span className="text-xs font-bold text-yellow-800">Editing Invoice Mode</span>
                                    <button onClick={cancelEdit} className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                                        <X className="w-3 h-3" /> Cancel
                                    </button>
                                </div>
                            )}

                            <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-brand-600" />
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Name" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-500 outline-none" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                                    <input type="tel" placeholder="Phone" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-500 outline-none" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                                </div>
                            </div>
                            
                            <div className="bg-slate-100 px-4 py-2 flex text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 shrink-0">
                                <div className="flex-grow">Item Details</div>
                                <div className="w-16 text-center">Qty</div>
                                <div className="w-20 text-right">Price (৳)</div>
                                <div className="w-6"></div>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto bg-white p-2 space-y-2">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
                                        <Printer className="w-8 h-8 opacity-50" />
                                        <p className="text-sm font-medium">Cart is empty</p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.product.id} className="bg-white border border-slate-100 rounded-lg p-3 hover:border-brand-200 transition-colors shadow-sm relative group">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.product.name}</p>
                                                    <p className="text-[10px] text-slate-400">Orig: ৳{item.product.price.toLocaleString()}</p>
                                                </div>
                                                <div className="w-24 text-right">
                                                    <input 
                                                        type="number"
                                                        className="w-full text-right font-bold text-sm text-brand-600 border-b border-dashed border-brand-200 focus:border-brand-500 outline-none bg-transparent py-0.5 px-0"
                                                        value={item.price}
                                                        onChange={(e) => updateItemPrice(item.product.id, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <input type="text" placeholder="IMEI / Serial No." className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-brand-400 outline-none transition-colors placeholder-slate-400" value={item.imei} onChange={(e) => updateItemDetail(item.product.id, 'imei', e.target.value)} />
                                                <input type="text" placeholder="Warranty (e.g. 1 Yr)" className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:border-brand-400 outline-none transition-colors placeholder-slate-400" value={item.warranty} onChange={(e) => updateItemDetail(item.product.id, 'warranty', e.target.value)} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center border border-slate-200 rounded-md bg-white h-7">
                                                    <button onClick={() => updateQty(item.product.id, -1)} className="w-7 h-full flex items-center justify-center hover:bg-slate-100 text-slate-600"><Minus className="w-3 h-3" /></button>
                                                    <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                                                    <button onClick={() => updateQty(item.product.id, 1)} className="w-7 h-full flex items-center justify-center hover:bg-slate-100 text-slate-600"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                     <span className="text-xs font-bold text-slate-700">Total: ৳{(item.price * item.quantity).toLocaleString()}</span>
                                                     <button onClick={() => removeItem(item.product.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="bg-slate-50 p-4 md:p-5 border-t border-slate-200 space-y-3 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] mb-14 md:mb-0 shrink-0">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Subtotal</span>
                                    <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm relative group">
                                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                                        <Percent className="w-4 h-4" />
                                        <span>Discount</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-medium">-</span>
                                        <input type="number" className="w-20 text-right bg-white border border-slate-200 rounded px-2 py-0.5 text-sm font-bold text-slate-800 focus:border-brand-500 outline-none" placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} />
                                    </div>
                                </div>
                                <div className="h-px bg-slate-200 my-2"></div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-slate-800 font-bold text-lg">Total Payable</span>
                                    <span className="text-2xl font-black text-brand-600 leading-none">৳{finalTotal.toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button onClick={() => handleCheckout('CASH')} className="flex flex-col items-center justify-center py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all">
                                        <div className="flex items-center gap-2"><Banknote className="w-5 h-5" /><span className="font-bold">CASH SALE</span></div>
                                    </button>
                                    <button onClick={() => handleCheckout('DIGITAL')} className="flex flex-col items-center justify-center py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all">
                                        <div className="flex items-center gap-2"><CreditCard className="w-5 h-5" /><span className="font-bold">DIGITAL</span></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- History View --- */}
                    {(activeTab === 'history' || (viewMode === 'history' && window.innerWidth >= 768)) && (
                    <div className="flex-grow p-4 md:p-6 overflow-hidden flex flex-col w-full bg-slate-100">
                        <div className="mb-6 flex gap-4 max-w-3xl">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by Invoice #, Name or Phone..." 
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500 outline-none font-medium"
                                    value={historySearch}
                                    onChange={e => setHistorySearch(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-grow flex flex-col">
                            <div className="overflow-y-auto flex-grow">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Invoice No</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Customer</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-400">No invoices found.</td>
                                            </tr>
                                        ) : (
                                            filteredHistory.map((inv) => (
                                                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 text-sm font-bold text-brand-600">{inv.invoiceNo}</td>
                                                    <td className="p-4 text-sm text-slate-600">
                                                        <div className="font-medium">{inv.date}</div>
                                                        <div className="text-xs text-slate-400">{inv.time}</div>
                                                    </td>
                                                    <td className="p-4 text-sm text-slate-800">
                                                        <div className="font-bold">{inv.customer.name}</div>
                                                        <div className="text-xs text-slate-500">{inv.customer.phone}</div>
                                                    </td>
                                                    <td className="p-4 text-sm font-black text-slate-800">৳{inv.total.toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => handleViewInvoice(inv)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="View & Download PDF">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleEditInvoice(inv)} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100" title="Edit in POS">
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => setDeleteId(inv.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete">
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
                    )}
                </div>

                {/* Mobile Bottom Navigation Bar */}
                <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-40 flex justify-between px-6 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => { setViewMode('pos'); setActiveTab('catalog'); }} 
                        className={`flex flex-col items-center gap-1 ${activeTab === 'catalog' && viewMode === 'pos' ? 'text-brand-600' : 'text-slate-400'}`}
                    >
                        <LayoutGrid className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Catalog</span>
                    </button>
                    <button 
                        onClick={() => { setViewMode('pos'); setActiveTab('cart'); }} 
                        className={`flex flex-col items-center gap-1 relative ${activeTab === 'cart' && viewMode === 'pos' ? 'text-brand-600' : 'text-slate-400'}`}
                    >
                        <div className="relative">
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold">Cart</span>
                    </button>
                    <button 
                        onClick={() => { setViewMode('history'); setActiveTab('history'); }} 
                        className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-brand-600' : 'text-slate-400'}`}
                    >
                        <History className="w-6 h-6" />
                        <span className="text-[10px] font-bold">History</span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            
            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-pop-in text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Invoice?</h3>
                        <p className="text-slate-500 mb-6">Are you sure you want to delete this invoice from history? This action cannot be undone.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setDeleteId(null)} className="py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleDeleteInvoice} className="py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Item Modal */}
            {isCustomModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 print:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCustomModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-xs rounded-2xl shadow-2xl p-6 animate-pop-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-900">Add Custom Item</h3>
                            <button onClick={() => setIsCustomModalOpen(false)} className="bg-gray-100 p-1 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleAddCustomItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                                <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium" placeholder="Item Name" value={customItem.name} onChange={e => setCustomItem({...customItem, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (৳)</label>
                                <input required type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium" placeholder="0.00" value={customItem.price} onChange={e => setCustomItem({...customItem, price: e.target.value})} />
                            </div>
                            <button type="submit" className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors">Add to Cart</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Business Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 print:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-pop-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Settings className="w-6 h-6 text-brand-600" />
                                <h3 className="font-bold text-xl text-gray-900">Business Settings</h3>
                            </div>
                            <button onClick={() => setIsSettingsOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Shop Name</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={businessInfo.name} onChange={e => setBusinessInfo({...businessInfo, name: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tagline / Category</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={businessInfo.tagline} onChange={e => setBusinessInfo({...businessInfo, tagline: e.target.value})} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Shop Address</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={businessInfo.address} onChange={e => setBusinessInfo({...businessInfo, address: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={businessInfo.phone} onChange={e => setBusinessInfo({...businessInfo, phone: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={businessInfo.email} onChange={e => setBusinessInfo({...businessInfo, email: e.target.value})} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Website</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={businessInfo.website} onChange={e => setBusinessInfo({...businessInfo, website: e.target.value})} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Terms & Conditions (Line separated)</label>
                                    <textarea rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none" value={businessInfo.terms} onChange={e => setBusinessInfo({...businessInfo, terms: e.target.value})} />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Footer Note</label>
                                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={businessInfo.footerNote} onChange={e => setBusinessInfo({...businessInfo, footerNote: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setIsSettingsOpen(false)} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INVOICE MODAL (Optimized for PDF) */}
            {showInvoiceModal && currentInvoice && (
                <div className="fixed inset-0 z-[100] flex justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto items-start">
                    
                    {/* Actions Bar (No Print) */}
                    <div id="no-print" className="fixed top-4 right-4 flex flex-col md:flex-row gap-3 z-50">
                        {/* Only show Edit Template in POS view mode to allow template customization, viewing history uses saved data or template logic */}
                        {viewMode === 'pos' && (
                             <button onClick={() => setIsSettingsOpen(true)} className="bg-white text-slate-700 px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-colors flex items-center gap-2 border border-slate-200">
                                <Settings className="w-4 h-4" /> Edit Template
                            </button>
                        )}
                        <button onClick={handleDownloadPdf} disabled={isDownloading} className="bg-brand-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                            {isDownloading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            ) : (
                                <Download className="w-5 h-5" />
                            )}
                            {isDownloading ? 'Processing...' : 'Download PDF'}
                        </button>
                        <button 
                            onClick={() => {
                                setShowInvoiceModal(false); 
                                if(viewMode === 'pos') { 
                                    setCart([]); 
                                    setCustomerName(''); 
                                    setCustomerPhone(''); 
                                    setDiscount(''); 
                                    setEditingInvoiceId(null);
                                    setEditingInvoiceNo(null);
                                }
                            }} 
                            className="bg-white text-red-500 px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-red-50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Invoice Paper - A4 Scaling */}
                    <div id="invoice-modal" className="bg-white w-[210mm] min-h-[297mm] shadow-2xl text-slate-800 flex flex-col relative scale-[0.5] sm:scale-[0.65] md:scale-[0.85] lg:scale-100 origin-top mt-16 md:mt-20 mb-20">
                        
                        {/* Target Content for html2pdf */}
                        <div id="invoice-content" className="w-full h-full p-10 md:p-12 flex flex-col relative">

                            {/* Watermark */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03] text-[150px] font-black uppercase text-brand-600 border-8 border-brand-600 rounded-3xl px-20 select-none">
                                {currentInvoice.method === 'CASH' ? 'PAID' : 'DUE'}
                            </div>

                            {/* Top Header */}
                            <div className="flex justify-between items-start mb-10 border-b-2 border-brand-600 pb-6 print-border-brand">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-brand-600 text-white flex items-center justify-center rounded-2xl font-black text-3xl print-bg-brand-600">
                                        {currentInvoice.shopName.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-brand-900 uppercase tracking-tighter">{currentInvoice.shopName}</h2>
                                        <p className="text-xs text-brand-600 font-bold uppercase tracking-widest print-text-brand">{currentInvoice.shopTagline}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h1 className="text-5xl font-black text-brand-100 tracking-tight">INVOICE</h1>
                                    <p className="font-mono text-brand-900 font-bold mt-1">#{currentInvoice.invoiceNo}</p>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-12 mb-10">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To</p>
                                    <h3 className="text-xl font-bold text-gray-900">{currentInvoice.customer.name}</h3>
                                    <p className="text-gray-600 font-medium">{currentInvoice.customer.phone}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date & Time</p>
                                    <p className="text-lg font-bold text-gray-900">{currentInvoice.date}</p>
                                    <p className="text-gray-500 text-sm">{currentInvoice.time}</p>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="mb-8">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-brand-600 text-white print-bg-brand-600">
                                            <th className="py-3 px-4 text-left text-xs font-bold uppercase rounded-l-lg">Item</th>
                                            <th className="py-3 px-4 text-left text-xs font-bold uppercase">Warranty</th>
                                            <th className="py-3 px-4 text-center text-xs font-bold uppercase">Qty</th>
                                            <th className="py-3 px-4 text-right text-xs font-bold uppercase">Unit Price</th>
                                            <th className="py-3 px-4 text-right text-xs font-bold uppercase rounded-r-lg">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-100">
                                        {currentInvoice.items.map((item: any, i: number) => (
                                            <tr key={i} className="text-sm">
                                                <td className="py-4 px-4">
                                                    <p className="font-bold text-brand-900">{item.product.name}</p>
                                                    {item.imei && <p className="text-[10px] text-gray-500 mt-1 font-mono bg-gray-100 inline-block px-1 rounded print-bg-slate-100">SN: {item.imei}</p>}
                                                </td>
                                                <td className="py-4 px-4 text-gray-600">{item.warranty || '-'}</td>
                                                <td className="py-4 px-4 text-center font-bold text-gray-800">{item.quantity}</td>
                                                <td className="py-4 px-4 text-right font-medium text-gray-600">৳{item.price.toLocaleString()}</td>
                                                <td className="py-4 px-4 text-right font-bold text-brand-600">৳{(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="flex justify-end items-end mb-16">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span className="font-medium">Subtotal</span>
                                        <span className="font-bold">৳{currentInvoice.subtotal.toLocaleString()}</span>
                                    </div>
                                    {currentInvoice.discount > 0 && (
                                        <div className="flex justify-between text-red-500 text-sm">
                                            <span className="font-medium">Discount</span>
                                            <span className="font-bold">- ৳{currentInvoice.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600 text-sm border-b border-gray-200 pb-2">
                                        <span className="font-medium">Payment Method</span>
                                        <span className="font-bold uppercase">{currentInvoice.method}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-1">
                                        <span className="text-xl font-bold text-brand-900">Total</span>
                                        <span className="text-2xl font-black text-brand-600 print-text-brand">৳{currentInvoice.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Bottom */}
                            <div className="mt-auto">
                                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                                    <div className="text-xs text-gray-500 space-y-2">
                                        <p className="font-bold text-brand-900 uppercase">Terms & Conditions:</p>
                                        <div className="whitespace-pre-wrap">{currentInvoice.terms}</div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="h-16 w-32 border-b border-brand-900 mb-2"></div>
                                        <p className="text-xs font-bold text-brand-900 uppercase">Authorized Signature</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end text-[10px] text-gray-500">
                                    <div className="space-y-1">
                                        <p className="font-bold text-brand-900 uppercase mb-1">Shop Address</p>
                                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-brand-500" /> {currentInvoice.shopAddress}</div>
                                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-brand-500" /> {currentInvoice.shopPhone}</div>
                                        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-brand-500" /> {currentInvoice.shopEmail}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1.5 mb-1"><Globe className="w-3 h-3 text-brand-500" /> {currentInvoice.shopWebsite}</div>
                                        <p className="italic">{currentInvoice.footerNote}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}