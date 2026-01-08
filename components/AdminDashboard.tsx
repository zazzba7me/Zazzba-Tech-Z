// ... (imports remain mostly same, ensure ICON_OPTIONS is used correctly)
import React, { useState, useRef } from 'react';
import { 
    Store, ShoppingBag, Users, Settings, TrendingUp, Monitor, Package, 
    LogOut, Plus, Search, Edit3, Trash2, X, Image as ImageIcon, 
    Save, Filter, Layers, Smartphone, Watch, Headphones, 
    Laptop, Gamepad2, Camera, Speaker, HardDrive, Wifi, Battery, 
    Check, Calendar, Eye, ArrowLeft, MoreHorizontal, FileText, Tag, UploadCloud,
    ChevronDown, RefreshCw, AlertCircle, ExternalLink, CheckCircle, ShieldCheck,
    Printer, Tablet, Tv, Cable, Mouse, Keyboard, Cpu, Server, Star, Gift, 
    Book, Music, Video, Zap, Home, Grid, AlertTriangle, RotateCcw, Box,
    ArrowUp, ArrowDown, Link, Move, MessageSquare, Truck, Banknote, CreditCard,
    DollarSign, Phone, MapPin, Send, Upload, Clock, CreditCard as PaymentIcon,
    Globe, Mail, Facebook, Instagram, Youtube
} from 'lucide-react';
import { useStore } from '../store';
import { Product, Category, SubCategory, Review, Order } from '../types';

type AdminView = 'overview' | 'products' | 'categories' | 'orders' | 'reviews' | 'settings';
type OrderFilter = 'all' | 'pending' | 'processing' | 'delivered' | 'cancelled';

const ICON_OPTIONS = [
    { name: 'Phone', icon: Smartphone },
    { name: 'Watch', icon: Watch },
    { name: 'Audio', icon: Headphones },
    { name: 'Laptop', icon: Laptop },
    { name: 'Game', icon: Gamepad2 },
    { name: 'Camera', icon: Camera },
    { name: 'Speaker', icon: Speaker },
    { name: 'Storage', icon: HardDrive },
    { name: 'Wifi', icon: Wifi },
    { name: 'Power', icon: Battery },
    { name: 'Monitor', icon: Monitor },
    { name: 'Printer', icon: Printer },
    { name: 'Tablet', icon: Tablet },
    { name: 'TV', icon: Tv },
    { name: 'Cable', icon: Cable },
    { name: 'Mouse', icon: Mouse },
    { name: 'Keyboard', icon: Keyboard },
    { name: 'CPU', icon: Cpu },
    { name: 'Server', icon: Server },
    { name: 'Home', icon: Home },
    { name: 'Music', icon: Music },
    { name: 'Video', icon: Video },
    { name: 'Book', icon: Book },
    { name: 'Zap', icon: Zap },
    { name: 'Grid', icon: Grid },
    { name: 'Package', icon: Package },
    { name: 'Layer', icon: Layers },
    { name: 'Tag', icon: Tag },
    { name: 'Gift', icon: Gift },
    { name: 'Star', icon: Star },
];

const NavTab: React.FC<{ active: boolean; onClick: () => void; label: string; count?: number }> = ({ active, onClick, label, count }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all relative ${active ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
    >
        {label}
        {count !== undefined && count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-gray-900">
                {count}
            </span>
        )}
    </button>
);

const MobileTab: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
    >
        {label}
    </button>
);

const AdminCard: React.FC<{ icon: any; title: string; subtitle: string; color: string }> = ({ icon: Icon, title, subtitle, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
            <p className="text-lg font-black text-gray-800">{subtitle}</p>
        </div>
    </div>
);

export const AdminDashboard: React.FC = () => {
    // ... (Keep state hooks and functions as they were, only update handleSaveCategory)
    const { 
        user, setUser, setCurrentView, 
        products, addProduct, updateProduct, deleteProduct,
        categories, addCategory, updateCategory, deleteCategory, reorderCategories,
        orders, updateOrderStatus, deleteOrder,
        reviews, updateReviewStatus, deleteReview,
        smsConfig, updateSmsConfig, sendCustomSms,
        paymentConfig, updatePaymentConfig,
        deliveryZones, addDeliveryZone, deleteDeliveryZone,
        bannerConfig, updateBannerConfig,
        footerConfig, updateFooterConfig
    } = useStore();
    
    // ... (Keep all state definitions)
    const [view, setView] = useState<AdminView>('overview');
    
    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '', price: 0, oldPrice: 0, category: '', subcategory: '', image: '', rating: 0, 
        isFlashSale: false, description: '', warranty: '', stock: 10,
        publishedAt: new Date().toISOString().split('T')[0]
    });
    const [formErrors, setFormErrors] = useState<{name?: string, price?: string}>({});
    const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Notification State
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    // Category State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [catForm, setCatForm] = useState<{
        name: string;
        iconType: 'preset' | 'url' | 'upload';
        iconIdx: number;
        iconUrl: string;
        subcategories: SubCategory[];
    }>({
        name: '',
        iconType: 'preset',
        iconIdx: 0,
        iconUrl: '',
        subcategories: []
    });
    const [newSubcatName, setNewSubcatName] = useState('');
    const catFileInputRef = useRef<HTMLInputElement>(null);

    // Order Logic
    const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Delete Confirmation State
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        type: 'product' | 'category' | 'review' | 'order';
        id: string;
        name: string;
        count?: number; 
    } | null>(null);

    // Filter State
    const [productSearch, setProductSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    const [orderFilterStatus, setOrderFilterStatus] = useState<Order['status'] | 'all'>('all');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    // Settings State
    const [settingsForm, setSettingsForm] = useState({
        apiKey: smsConfig.apiKey,
        processingTemplate: smsConfig.processingTemplate
    });
    const [paymentSettingsForm, setPaymentSettingsForm] = useState({
        bkashNumber: paymentConfig.bkashNumber,
        nagadNumber: paymentConfig.nagadNumber,
        rocketNumber: paymentConfig.rocketNumber,
        instructions: paymentConfig.instructions
    });
    const [bannerSettingsForm, setBannerSettingsForm] = useState({
        title: bannerConfig.title,
        subtitle: bannerConfig.subtitle,
        image: bannerConfig.image,
        tagText: bannerConfig.tagText,
        buttonText: bannerConfig.buttonText
    });
    const [footerSettingsForm, setFooterSettingsForm] = useState({
        description: footerConfig.description,
        facebook: footerConfig.facebook,
        instagram: footerConfig.instagram,
        youtube: footerConfig.youtube,
        address: footerConfig.address,
        phone: footerConfig.phone,
        email: footerConfig.email
    });

    // Delivery Settings State
    const [newZone, setNewZone] = useState({ name: '', charge: '' });
    const [customSms, setCustomSms] = useState({ phone: '', message: '' });
    const [sendingSms, setSendingSms] = useState(false);

    // Derived Stats
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    const processingOrdersCount = orders.filter(o => o.status === 'processing').length;
    const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
    const pendingReviewsCount = reviews.filter(r => r.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total : sum, 0);

    // Order Filtering Logic
    const filteredOrders = orders.filter(order => {
        const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
        // Optional search logic if needed later
        // const matchesSearch = ...
        return matchesFilter;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // ... (Keep helper functions like showNotification, getCategoryProductCount, handleLogout)

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentView('home');
    };

    const getCategoryProductCount = (catName: string) => products.filter(p => p.category === catName).length;

    const handleSaveSmsSettings = () => {
        updateSmsConfig(settingsForm);
        showNotification('SMS Configuration saved successfully!');
    };

    const handleSavePaymentSettings = () => {
        updatePaymentConfig(paymentSettingsForm);
        showNotification('Payment settings saved successfully!');
    };

    const handleSaveBannerSettings = () => {
        updateBannerConfig(bannerSettingsForm);
        showNotification('Homepage banner updated!');
    };

    const handleSaveFooterSettings = () => {
        updateFooterConfig(footerSettingsForm);
        showNotification('Footer section updated!');
    };

    const handleAddZone = () => {
        if (!newZone.name || !newZone.charge) return;
        const charge = parseFloat(newZone.charge);
        if (isNaN(charge)) return;

        addDeliveryZone({
            id: `dz-${Date.now()}`,
            name: newZone.name,
            charge
        });
        setNewZone({ name: '', charge: '' });
        showNotification('Delivery zone added!');
    };

    const handleSendCustomSms = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingSms(true);
        const success = await sendCustomSms(customSms.phone, customSms.message);
        if (success) {
            showNotification(`SMS sent to ${customSms.phone}`);
            setCustomSms({ phone: '', message: '' });
        } else {
            showNotification('Failed to send SMS. Check API Key.', 'error');
        }
        setSendingSms(false);
    };

    // ... (Keep handleOpenEditor, handleResetForm, handleGenerateImage, handleFileUpload, validateForm, handleSaveProduct, initiateDelete...)
    const handleOpenEditor = (product?: Product) => {
        setFormErrors({});
        if (product) {
            setEditingProduct(product);
            setFormData({ 
                ...product,
                stock: product.stock !== undefined ? product.stock : 10,
                publishedAt: product.publishedAt || new Date().toISOString().split('T')[0]
            });
            setImageInputMode(product.image?.startsWith('data:') ? 'upload' : 'url');
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', price: undefined, oldPrice: undefined, 
                category: categories.length > 0 ? categories[0].name : 'Uncategorized',
                subcategory: '', 
                image: '', rating: 0, isFlashSale: false, description: '', warranty: '',
                stock: 10,
                publishedAt: new Date().toISOString().split('T')[0]
            });
            setImageInputMode('upload');
        }
        setIsEditorOpen(true);
    };

    const handleResetForm = () => {
         if (editingProduct) {
             setFormData({ 
                ...editingProduct,
                stock: editingProduct.stock !== undefined ? editingProduct.stock : 10,
                publishedAt: editingProduct.publishedAt || new Date().toISOString().split('T')[0]
            });
         } else {
             setFormData({
                name: '', price: undefined, oldPrice: undefined, 
                category: categories.length > 0 ? categories[0].name : 'Uncategorized', 
                subcategory: '',
                image: '', rating: 0, isFlashSale: false, description: '', warranty: '',
                stock: 10,
                publishedAt: new Date().toISOString().split('T')[0]
            });
         }
         setFormErrors({});
         showNotification('Form reset.', 'success');
    };

    const handleGenerateImage = () => {
        const seed = formData.name ? formData.name.replace(/\s+/g, '-') : 'gadget';
        const randomId = Math.floor(Math.random() * 1000);
        const url = `https://picsum.photos/seed/${seed}-${randomId}/400/400`;
        setFormData(prev => ({ ...prev, image: url }));
        setImageInputMode('url');
        showNotification('Random image generated!', 'success');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev, image: base64String }));
                showNotification('Image uploaded successfully!');
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const errors: any = {};
        if (!formData.name?.trim()) errors.name = "Product name is required";
        if (!formData.price || formData.price <= 0) errors.price = "Price must be greater than 0";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProduct = () => {
        if (!validateForm()) {
            showNotification('Please fix the errors.', 'error');
            return;
        }

        const productData: Product = {
            id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
            name: formData.name!,
            price: Number(formData.price),
            oldPrice: Number(formData.oldPrice) || undefined,
            category: formData.category || 'Uncategorized',
            subcategory: formData.subcategory || undefined,
            image: formData.image || `https://picsum.photos/seed/${formData.name}/400/400`,
            rating: editingProduct ? editingProduct.rating : 0, 
            isFlashSale: formData.isFlashSale,
            description: formData.description || '',
            warranty: formData.warranty || '',
            stock: Number(formData.stock) || 0,
            publishedAt: formData.publishedAt || new Date().toISOString().split('T')[0]
        };

        if (editingProduct) {
            updateProduct(productData);
            showNotification('Product updated successfully!');
        } else {
            addProduct(productData);
            showNotification('Product published successfully!');
            setIsEditorOpen(false);
        }
    };

    const initiateDeleteProduct = (product: Product) => {
        setDeleteConfirmation({
            isOpen: true,
            type: 'product',
            id: product.id,
            name: product.name
        });
    };

    const initiateDeleteCategory = (category: Category) => {
        const count = getCategoryProductCount(category.name);
        setDeleteConfirmation({
            isOpen: true,
            type: 'category',
            id: category.id,
            name: category.name,
            count
        });
    };
    
    const initiateDeleteReview = (review: Review) => {
        setDeleteConfirmation({
            isOpen: true,
            type: 'review',
            id: review.id,
            name: `Review by ${review.userName}`
        });
    }

    const initiateDeleteOrder = (order: Order) => {
        setDeleteConfirmation({
            isOpen: true,
            type: 'order',
            id: order.id,
            name: `Order #${order.id}`
        });
        if(selectedOrder) setSelectedOrder(null);
    };

    const confirmDelete = () => {
        if (!deleteConfirmation) return;

        if (deleteConfirmation.type === 'product') {
            deleteProduct(deleteConfirmation.id);
            showNotification('Product moved to trash.', 'success');
            if (isEditorOpen && editingProduct?.id === deleteConfirmation.id) {
                setIsEditorOpen(false);
            }
        } else if (deleteConfirmation.type === 'category') {
            deleteCategory(deleteConfirmation.id);
            showNotification('Category deleted successfully.');
        } else if (deleteConfirmation.type === 'review') {
            deleteReview(deleteConfirmation.id);
            showNotification('Review deleted.');
        } else if (deleteConfirmation.type === 'order') {
            deleteOrder(deleteConfirmation.id);
            showNotification('Order deleted permanently.', 'success');
        } else if (deleteConfirmation.type === 'deliveryZone') {
            deleteDeliveryZone(deleteConfirmation.id);
            showNotification('Delivery zone removed.');
        }
        setDeleteConfirmation(null);
    };

    // Category Handlers
    const handleOpenCategoryModal = (cat?: Category) => {
        if (cat) {
            // Determine icon type logic
            let type: 'preset' | 'url' | 'upload' = 'preset';
            let idx = 0;
            if (cat.iconUrl) {
                type = cat.iconUrl.startsWith('data:') ? 'upload' : 'url';
            } else if (cat.iconName) {
                type = 'preset';
                idx = ICON_OPTIONS.findIndex(i => i.name === cat.iconName);
                if (idx === -1) idx = 0;
            }

            setEditingCategory(cat);
            setCatForm({
                name: cat.name,
                iconType: type,
                iconIdx: idx, 
                iconUrl: cat.iconUrl || '',
                subcategories: cat.subcategories || []
            });
        } else {
            setEditingCategory(null);
            setCatForm({
                name: '',
                iconType: 'preset',
                iconIdx: 0,
                iconUrl: '',
                subcategories: []
            });
        }
        setShowCategoryModal(true);
    };

    const handleCategoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCatForm(prev => ({ ...prev, iconUrl: reader.result as string, iconType: 'upload' }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSubcategory = () => {
        if (!newSubcatName.trim()) return;
        setCatForm(prev => ({
            ...prev,
            subcategories: [...prev.subcategories, { id: `sub-${Date.now()}`, name: newSubcatName.trim() }]
        }));
        setNewSubcatName('');
    };

    const handleRemoveSubcategory = (id: string) => {
        setCatForm(prev => ({
            ...prev,
            subcategories: prev.subcategories.filter(sub => sub.id !== id)
        }));
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!catForm.name) return;

        const iconName = catForm.iconType === 'preset' ? ICON_OPTIONS[catForm.iconIdx].name : undefined;
        const icon = catForm.iconType === 'preset' ? ICON_OPTIONS[catForm.iconIdx].icon : undefined;

        const categoryData: Category = {
            id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
            name: catForm.name,
            icon,
            iconName, // Save string for DB
            iconUrl: (catForm.iconType === 'url' || catForm.iconType === 'upload') ? catForm.iconUrl : undefined,
            subcategories: catForm.subcategories
        };

        if (editingCategory) {
            updateCategory(categoryData);
            showNotification('Category updated successfully.');
        } else {
            addCategory(categoryData);
            if (isEditorOpen) {
                setFormData(prev => ({ ...prev, category: categoryData.name }));
            }
            showNotification('Category added successfully.');
        }
        setShowCategoryModal(false);
    };

    const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex >= 0 && targetIndex < newCategories.length) {
            [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
            reorderCategories(newCategories);
        }
    };

    const calculateDiscount = () => {
        if (formData.price && formData.oldPrice) {
            const price = Number(formData.price);
            const old = Number(formData.oldPrice);
            if (old > price) {
                return Math.round(((old - price) / old) * 100);
            }
        }
        return 0;
    };

    const handleUpdateStatusAndClose = (status: Order['status']) => {
        if (selectedOrder) {
            updateOrderStatus(selectedOrder.id, status);
            // Update local selectedOrder to reflect change immediately in modal
            const updated = { ...selectedOrder, status };
            // Manually add history log for immediate UI update in modal
            const log = { status, date: new Date().toLocaleString(), note: `Status updated to ${status.toUpperCase()}` };
            updated.statusHistory = [log, ...(updated.statusHistory || [])];
            setSelectedOrder(updated);
        }
    };

    const initiateDeleteDeliveryZone = (zone: any) => {
        setDeleteConfirmation({
            isOpen: true,
            type: 'deliveryZone', // Using generic type handling in confirmDelete via string
            id: zone.id,
            name: zone.name
        } as any);
    }

    const CurrentIcon = ICON_OPTIONS[catForm.iconIdx].icon;

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-20 relative">
             {/* ... Notification Toast ... */}
             {notification && (
                <div className={`fixed top-20 right-6 z-[60] px-6 py-3 rounded-lg shadow-xl text-white font-bold text-sm animate-fade-up flex items-center gap-2 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {notification.message}
                </div>
            )}
            
            {/* ... Editor View ... (Existing code) */}
            {isEditorOpen ? (
                // ... (No change to Product Editor layout logic, using previous) ...
                 <div className="min-h-screen bg-gray-100 font-sans text-gray-800 pb-20 relative">
                    {/* ... Same Product Editor Code as before ... */}
                    {/* ... I will output the existing product editor code briefly to ensure file completeness ... */}
                    <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-lg font-bold text-gray-800">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleResetForm} className="hidden sm:flex text-gray-400 hover:text-gray-600 px-3 py-2 text-xs font-bold items-center gap-1">
                                <RotateCcw className="w-4 h-4" /> Reset
                            </button>
                            <button onClick={handleSaveProduct} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Save className="w-4 h-4" /> {editingProduct ? 'Update' : 'Publish'}
                            </button>
                        </div>
                    </div>
                    {/* ... (Editor Body content omitted for brevity as it was not changed, but assumed present in logic) ... */}
                    {/* Since I must output full content, I will paste the Product Editor Body from previous file here to ensure it works */}
                    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                         <div className="lg:col-span-9 space-y-6">
                            <div className={`bg-white p-6 border shadow-sm rounded-lg ${formErrors.name ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200'}`}>
                                <div className="flex justify-between">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Product Name <span className="text-red-500">*</span></label>
                                    {formErrors.name && <span className="text-xs font-bold text-red-500">{formErrors.name}</span>}
                                </div>
                                <input type="text" className="w-full text-xl font-bold p-3 border border-gray-300 rounded-md focus:border-blue-500 outline-none" placeholder="e.g. Wireless Headphones" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            
                            <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden flex flex-col h-[300px]">
                                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-500" /> <span className="text-sm font-bold text-gray-700">Description</span>
                                </div>
                                <textarea className="flex-grow w-full p-4 outline-none text-sm resize-none" placeholder="Description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>

                            <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3"><h3 className="font-bold text-gray-700 text-sm">Product Data</h3></div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Regular Price <span className="text-red-500">*</span></label>
                                            <input type="number" className="w-full p-2.5 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none" placeholder="0.00" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                                        </div>
                                        <div className="space-y-1 relative">
                                            <label className="text-xs font-bold text-gray-500">Old Price</label>
                                            <input type="number" className="w-full p-2.5 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none" placeholder="0.00" value={formData.oldPrice || ''} onChange={e => setFormData({...formData, oldPrice: parseFloat(e.target.value)})} />
                                        </div>
                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Warranty</label><input type="text" className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none" value={formData.warranty || ''} onChange={e => setFormData({...formData, warranty: e.target.value})} /></div>
                                        <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Stock</label><input type="number" className="w-full p-2.5 border border-gray-300 rounded text-sm outline-none" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} /></div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-6">
                                        <div className="flex items-center gap-4 cursor-pointer p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100" onClick={() => setFormData({...formData, isFlashSale: !formData.isFlashSale})}>
                                            <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${formData.isFlashSale ? 'bg-brand-500' : 'bg-gray-300'}`}>
                                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${formData.isFlashSale ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                            <div><p className="text-sm font-bold text-gray-700">Flash Sale Product</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </div>
                         
                         <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3"><h3 className="font-bold text-gray-700 text-sm">Publish</h3></div>
                                <div className="p-4 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-600"><span>Status:</span><span className="font-bold">{editingProduct ? 'Published' : 'Draft'}</span></div>
                                    <div className="flex justify-between text-sm text-gray-600"><span>Visibility:</span><span className="font-bold">Public</span></div>
                                </div>
                                <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between">
                                    {editingProduct && <button onClick={() => initiateDeleteProduct(editingProduct)} className="text-red-500 text-xs hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3"/>Trash</button>}
                                    <button onClick={handleSaveProduct} className="ml-auto bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold">{editingProduct ? 'Update' : 'Publish'}</button>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden flex flex-col max-h-[400px]">
                                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3"><h3 className="font-bold text-gray-700 text-sm">Categories</h3></div>
                                <div className="p-4 overflow-y-auto flex-grow space-y-2">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex flex-col gap-1 p-1 rounded hover:bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <input type="radio" name="category" checked={formData.category === cat.name} onChange={() => setFormData({...formData, category: cat.name, subcategory: ''})} className="text-blue-600 cursor-pointer" />
                                                <label className="text-sm text-gray-700 select-none cursor-pointer flex-grow">{cat.name}</label>
                                            </div>
                                            {formData.category === cat.name && cat.subcategories && (
                                                <div className="ml-6 pl-2 border-l-2 border-gray-200 space-y-1">
                                                    {cat.subcategories.map(sub => (
                                                        <div key={sub.id} className="flex items-center gap-2">
                                                            <input type="radio" name="subcategory" checked={formData.subcategory === sub.name} onChange={() => setFormData({...formData, subcategory: sub.name})} className="text-blue-600 w-3 h-3 cursor-pointer" />
                                                            <label className="text-xs text-gray-600 cursor-pointer select-none">{sub.name}</label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-gray-100 bg-gray-50">
                                    <button onClick={() => handleOpenCategoryModal()} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline w-full justify-center py-1 border border-blue-200 rounded hover:bg-blue-50"><Plus className="w-3 h-3" /> Add New</button>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                                <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700 text-sm">Image</h3>
                                    <div className="flex gap-1 bg-gray-200 p-0.5 rounded text-[10px] font-bold">
                                        <button onClick={() => setImageInputMode('upload')} className={`px-2 py-0.5 rounded ${imageInputMode === 'upload' ? 'bg-white shadow-sm' : ''}`}>Upload</button>
                                        <button onClick={() => setImageInputMode('url')} className={`px-2 py-0.5 rounded ${imageInputMode === 'url' ? 'bg-white shadow-sm' : ''}`}>URL</button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    {formData.image ? (
                                        <div className="relative group cursor-pointer border border-gray-200 rounded overflow-hidden aspect-square bg-gray-50 mb-3">
                                            <img src={formData.image} className="w-full h-full object-contain" />
                                            <button onClick={() => setFormData({...formData, image: ''})} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold flex items-center justify-center">Remove</button>
                                        </div>
                                    ) : (
                                        <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 mb-3 hover:border-blue-400 cursor-pointer" onClick={() => imageInputMode === 'upload' ? fileInputRef.current?.click() : handleGenerateImage()}>
                                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-xs font-medium">{imageInputMode === 'upload' ? 'Upload' : 'Random'}</span>
                                        </div>
                                    )}
                                    {imageInputMode === 'url' ? (
                                        <div className="space-y-2">
                                            <input type="text" className="w-full p-2 border border-gray-300 rounded text-xs outline-none" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
                                            <button onClick={handleGenerateImage} className="w-full py-2 border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"><RefreshCw className="w-3 h-3" /> Random</button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 bg-gray-800 text-white rounded text-xs font-bold hover:bg-gray-900 flex items-center justify-center gap-2"><Upload className="w-3 h-3" /> Choose File</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>
                    </div>
                 </div>
            ) : (
                <>
                {/* --- ADMIN BAR --- */}
                <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-50">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
                            <Monitor className="w-5 h-5 text-brand-500" />
                            <span className="font-bold text-sm tracking-wide">Zazzba Admin</span>
                        </div>
                        <nav className="hidden md:flex gap-1">
                            <NavTab active={view === 'overview'} onClick={() => setView('overview')} label="Dashboard" />
                            <NavTab active={view === 'products'} onClick={() => setView('products')} label="Products" />
                            <NavTab active={view === 'categories'} onClick={() => setView('categories')} label="Categories" />
                            <NavTab active={view === 'orders'} onClick={() => setView('orders')} label="Orders" count={pendingOrdersCount} />
                            <NavTab active={view === 'reviews'} onClick={() => setView('reviews')} label="Reviews" count={pendingReviewsCount} />
                            <NavTab active={view === 'settings'} onClick={() => setView('settings')} label="Settings" />
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView('pos')} className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2"><Store className="w-3 h-3" /> POS</button>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-white"><LogOut className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto no-scrollbar flex px-4 gap-2 py-2">
                    {['overview', 'products', 'categories', 'orders', 'reviews', 'settings'].map(v => (
                        <MobileTab key={v} active={view === v} onClick={() => setView(v as AdminView)} label={v.charAt(0).toUpperCase() + v.slice(1)} />
                    ))}
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    {view === 'overview' && (
                        // ... Overview Content (Unchanged)
                        <div className="animate-fade-up">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <AdminCard icon={Package} title="Products" subtitle={`${products.length} Items`} color="text-blue-600" />
                                <AdminCard icon={DollarSign} title="Revenue" subtitle={`৳${totalRevenue.toLocaleString()}`} color="text-green-600" />
                                <AdminCard icon={ShoppingBag} title="Orders" subtitle={`${orders.length} Total`} color="text-orange-600" />
                                <AdminCard icon={MessageSquare} title="Reviews" subtitle={`${reviews.length} Total`} color="text-yellow-600" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-4">Shortcuts</h3>
                                <div className="flex gap-4">
                                    <button onClick={() => handleOpenEditor()} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100"><Plus className="w-4 h-4" /> Add Product</button>
                                    <button onClick={() => handleOpenCategoryModal()} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-100"><Layers className="w-4 h-4" /> Add Category</button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {view === 'products' && (
                        // ... Products Content (Unchanged)
                        <div className="animate-fade-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                                <button onClick={() => handleOpenEditor()} className="px-3 py-1 bg-white border border-blue-600 text-blue-600 rounded text-sm font-bold hover:bg-blue-50">Add New</button>
                            </div>
                             <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 border-b border-gray-200 font-bold"><tr><th className="p-4">Name</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Actions</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50">
                                                <td className="p-4 flex items-center gap-3"><img src={p.image} className="w-8 h-8 object-contain" /><span onClick={() => handleOpenEditor(p)} className="font-bold text-blue-600 cursor-pointer">{p.name}</span></td>
                                                <td className="p-4 font-bold">৳{p.price.toLocaleString()}</td>
                                                <td className="p-4">{p.stock}</td>
                                                <td className="p-4 flex gap-2"><button onClick={() => handleOpenEditor(p)}><Edit3 className="w-4 h-4 text-blue-600" /></button><button onClick={() => initiateDeleteProduct(p)}><Trash2 className="w-4 h-4 text-red-600" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {view === 'categories' && (
                         <div className="animate-fade-up">
                            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800">Categories</h2><button onClick={() => handleOpenCategoryModal()} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700">Add New</button></div>
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 font-bold"><tr><th className="p-4">Icon</th><th className="p-4">Name</th><th className="p-4">Subs</th><th className="p-4">Actions</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {categories.map((cat, idx) => (
                                            <tr key={cat.id} className="hover:bg-gray-50">
                                                <td className="p-4"><div className="w-8 h-8 bg-gray-100 flex items-center justify-center rounded">{cat.iconUrl ? <img src={cat.iconUrl} className="w-full h-full object-cover" /> : cat.icon ? <cat.icon className="w-4 h-4" /> : <Layers className="w-4 h-4"/>}</div></td>
                                                <td className="p-4 font-bold">{cat.name}</td>
                                                <td className="p-4">{cat.subcategories?.length || 0}</td>
                                                <td className="p-4 flex gap-2"><button onClick={() => handleOpenCategoryModal(cat)}><Edit3 className="w-4 h-4 text-blue-600" /></button><button onClick={() => initiateDeleteCategory(cat)}><Trash2 className="w-4 h-4 text-red-600" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    )}

                    {view === 'orders' && (
                         <div className="animate-fade-up">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
                             </div>
                             
                             {/* Filter Tabs */}
                             <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                                <button onClick={() => setOrderFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${orderFilter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                    All Orders
                                </button>
                                <button onClick={() => setOrderFilter('pending')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${orderFilter === 'pending' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-yellow-600 border-yellow-100 hover:bg-yellow-50'}`}>
                                    Pending ({orders.filter(o => o.status === 'pending').length})
                                </button>
                                <button onClick={() => setOrderFilter('processing')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${orderFilter === 'processing' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'}`}>
                                    Processing ({orders.filter(o => o.status === 'processing').length})
                                </button>
                                <button onClick={() => setOrderFilter('delivered')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${orderFilter === 'delivered' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-green-600 border-green-100 hover:bg-green-50'}`}>
                                    Delivered
                                </button>
                                <button onClick={() => setOrderFilter('cancelled')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${orderFilter === 'cancelled' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-600 border-red-100 hover:bg-red-50'}`}>
                                    Cancelled
                                </button>
                             </div>

                             <div className="space-y-3">
                                 {filteredOrders.length === 0 ? (
                                     <div className="bg-white rounded-lg p-12 text-center border border-gray-200 text-gray-400">
                                         <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20"/>
                                         <p>No orders found with this status.</p>
                                     </div>
                                 ) : (
                                     filteredOrders.map(o => (
                                     <div key={o.id} onClick={() => setSelectedOrder(o)} className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group relative">
                                         <div className="flex gap-4 items-center mb-4 md:mb-0">
                                             <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                                                o.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                                o.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                                                o.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                             }`}>
                                                 {o.status === 'pending' && <Clock className="w-6 h-6"/>}
                                                 {o.status === 'processing' && <Zap className="w-6 h-6"/>}
                                                 {o.status === 'delivered' && <CheckCircle className="w-6 h-6"/>}
                                                 {o.status === 'cancelled' && <X className="w-6 h-6"/>}
                                             </div>
                                             <div>
                                                 <div className="flex items-center gap-2">
                                                     <span className="font-black text-gray-900 text-lg">#{o.id}</span>
                                                     <span className="text-xs text-gray-400 font-medium">{o.date}</span>
                                                 </div>
                                                 <div className="text-sm text-gray-600 font-medium">{o.customerName} • {o.phone}</div>
                                             </div>
                                         </div>
                                         
                                         <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10">
                                             <div className="text-right">
                                                 <p className="text-[10px] uppercase font-bold text-gray-400">Items</p>
                                                 <p className="font-bold text-gray-700">{o.items.length}</p>
                                             </div>
                                             <div className="text-right">
                                                 <p className="text-[10px] uppercase font-bold text-gray-400">Total</p>
                                                 <p className="font-black text-brand-600 text-lg">৳{o.total.toLocaleString()}</p>
                                             </div>
                                              <div className="text-right hidden sm:block">
                                                 <p className="text-[10px] uppercase font-bold text-gray-400">Status</p>
                                                 <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    o.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                                    o.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                                                    o.status === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {o.status}
                                                </span>
                                             </div>
                                         </div>
                                         <div className="absolute right-4 top-4 md:static md:ml-4 text-gray-300 group-hover:text-blue-500">
                                             <ArrowLeft className="w-5 h-5 rotate-180" />
                                         </div>
                                     </div>
                                 )))}
                             </div>
                         </div>
                    )}
                    
                    {view === 'reviews' && (
                         <div className="animate-fade-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Reviews Management</h2>
                            </div>
                            
                            {reviews.length === 0 ? (
                                <div className="bg-white rounded-lg p-12 text-center border border-gray-200 text-gray-400">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20"/>
                                    <p>No reviews yet.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 font-bold border-b border-gray-200">
                                            <tr>
                                                <th className="p-4">Customer</th>
                                                <th className="p-4">Product ID</th>
                                                <th className="p-4">Rating</th>
                                                <th className="p-4">Comment</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {reviews.map(rev => (
                                                <tr key={rev.id} className="hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-800">{rev.userName}</div>
                                                        <div className="text-xs text-gray-500">{rev.date}</div>
                                                    </td>
                                                    <td className="p-4 text-xs font-mono text-gray-500">{rev.productId}</td>
                                                    <td className="p-4 flex gap-1 text-yellow-400">
                                                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`}/>)}
                                                    </td>
                                                    <td className="p-4 text-gray-600 max-w-xs truncate">{rev.comment}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${rev.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {rev.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 flex gap-2">
                                                        {rev.status === 'pending' && (
                                                            <button onClick={() => updateReviewStatus(rev.id, 'approved')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Approve">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button onClick={() => initiateDeleteReview(rev)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'settings' && (
                        <div className="animate-fade-up">
                             <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
                             
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Banner Settings */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-brand-600"/> Homepage Banner</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Title (Supports HTML)</label>
                                                <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={bannerSettingsForm.title} onChange={e => setBannerSettingsForm({...bannerSettingsForm, title: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Subtitle</label>
                                                <textarea rows={2} className="w-full p-2 border rounded text-sm mt-1" value={bannerSettingsForm.subtitle} onChange={e => setBannerSettingsForm({...bannerSettingsForm, subtitle: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Tag Text</label>
                                                    <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={bannerSettingsForm.tagText} onChange={e => setBannerSettingsForm({...bannerSettingsForm, tagText: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Button Text</label>
                                                    <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={bannerSettingsForm.buttonText} onChange={e => setBannerSettingsForm({...bannerSettingsForm, buttonText: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Image URL</label>
                                                <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={bannerSettingsForm.image} onChange={e => setBannerSettingsForm({...bannerSettingsForm, image: e.target.value})} />
                                            </div>
                                            <div className="mt-2 aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                                                {bannerSettingsForm.image ? (
                                                    <img src={bannerSettingsForm.image} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image Preview</div>
                                                )}
                                                <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">Preview</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button onClick={handleSaveBannerSettings} className="bg-brand-600 text-white px-6 py-2 rounded font-bold text-sm hover:bg-brand-700">Update Banner</button>
                                    </div>
                                </div>

                                {/* Footer Settings (New) */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-brand-600"/> Footer Configuration</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Shop Description</label>
                                                <textarea rows={3} className="w-full p-2 border rounded text-sm mt-1" value={footerSettingsForm.description} onChange={e => setFooterSettingsForm({...footerSettingsForm, description: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Social Links</label>
                                                <div className="flex items-center gap-2">
                                                    <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                                                    <input type="text" placeholder="Facebook URL" className="w-full p-2 border rounded text-xs" value={footerSettingsForm.facebook} onChange={e => setFooterSettingsForm({...footerSettingsForm, facebook: e.target.value})} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                                                    <input type="text" placeholder="Instagram URL" className="w-full p-2 border rounded text-xs" value={footerSettingsForm.instagram} onChange={e => setFooterSettingsForm({...footerSettingsForm, instagram: e.target.value})} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Youtube className="w-4 h-4 text-red-600 shrink-0" />
                                                    <input type="text" placeholder="YouTube URL" className="w-full p-2 border rounded text-xs" value={footerSettingsForm.youtube} onChange={e => setFooterSettingsForm({...footerSettingsForm, youtube: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Contact Information</label>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400">Address</label>
                                                <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={footerSettingsForm.address} onChange={e => setFooterSettingsForm({...footerSettingsForm, address: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400">Phone</label>
                                                <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={footerSettingsForm.phone} onChange={e => setFooterSettingsForm({...footerSettingsForm, phone: e.target.value})} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400">Email</label>
                                                <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={footerSettingsForm.email} onChange={e => setFooterSettingsForm({...footerSettingsForm, email: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button onClick={handleSaveFooterSettings} className="bg-gray-900 text-white px-6 py-2 rounded font-bold text-sm hover:bg-gray-800">Update Footer</button>
                                    </div>
                                </div>

                                {/* Payment Config */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-brand-600"/> Payment Gateway Info</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-pink-500 uppercase">bKash Number</label>
                                            <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={paymentSettingsForm.bkashNumber} onChange={e => setPaymentSettingsForm({...paymentSettingsForm, bkashNumber: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-orange-500 uppercase">Nagad Number</label>
                                            <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={paymentSettingsForm.nagadNumber} onChange={e => setPaymentSettingsForm({...paymentSettingsForm, nagadNumber: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-purple-500 uppercase">Rocket Number</label>
                                            <input type="text" className="w-full p-2 border rounded text-sm mt-1" value={paymentSettingsForm.rocketNumber} onChange={e => setPaymentSettingsForm({...paymentSettingsForm, rocketNumber: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Payment Instructions</label>
                                            <textarea rows={2} className="w-full p-2 border rounded text-sm mt-1" value={paymentSettingsForm.instructions} onChange={e => setPaymentSettingsForm({...paymentSettingsForm, instructions: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button onClick={handleSavePaymentSettings} className="bg-gray-900 text-white px-6 py-2 rounded font-bold text-sm hover:bg-gray-800">Save Payment Info</button>
                                    </div>
                                </div>

                                {/* SMS Config */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6">
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-brand-600"/> SMS Configuration</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">SMS Gateway API Key</label>
                                            <input type="password" className="w-full p-2 border rounded text-sm mt-1" value={settingsForm.apiKey} onChange={e => setSettingsForm({...settingsForm, apiKey: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Processing Template</label>
                                            <textarea rows={3} className="w-full p-2 border rounded text-xs mt-1" value={settingsForm.processingTemplate} onChange={e => setSettingsForm({...settingsForm, processingTemplate: e.target.value})} />
                                            <p className="text-[10px] text-gray-400 mt-1">Tags: {'{customerName}'}, {'{orderId}'}, {'{total}'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button onClick={handleSaveSmsSettings} className="bg-gray-900 text-white px-6 py-2 rounded font-bold text-sm hover:bg-gray-800">Save SMS Config</button>
                                    </div>

                                    {/* Quick Send Tool */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Quick SMS Sender</h4>
                                        <form onSubmit={handleSendCustomSms} className="space-y-2">
                                            <input type="text" placeholder="Phone Number (017...)" className="w-full p-2 border rounded text-sm" value={customSms.phone} onChange={e => setCustomSms({...customSms, phone: e.target.value})} required />
                                            <textarea placeholder="Message..." rows={2} className="w-full p-2 border rounded text-sm" value={customSms.message} onChange={e => setCustomSms({...customSms, message: e.target.value})} required />
                                            <button disabled={sendingSms} className="w-full bg-blue-600 text-white py-2 rounded text-xs font-bold hover:bg-blue-700 disabled:opacity-50">
                                                {sendingSms ? 'Sending...' : 'Send Test SMS'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Delivery Zones */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-2">
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-brand-600"/> Delivery Zones</h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Existing Zones</h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {deliveryZones.length === 0 && <p className="text-xs text-gray-400 italic">No zones added.</p>}
                                                {deliveryZones.map(zone => (
                                                    <div key={zone.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                                        <span className="text-sm font-medium text-gray-700">{zone.name}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-brand-600">৳{zone.charge}</span>
                                                            <button onClick={() => initiateDeleteDeliveryZone(zone)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-3 h-3"/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Add New Zone</h4>
                                            <div className="space-y-3">
                                                <input type="text" placeholder="Zone Name (e.g. Inside Dhaka)" className="w-full p-2 border rounded text-sm bg-white" value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} />
                                                <input type="number" placeholder="Delivery Charge (৳)" className="w-full p-2 border rounded text-sm bg-white" value={newZone.charge} onChange={e => setNewZone({...newZone, charge: e.target.value})} />
                                                <button onClick={handleAddZone} className="w-full bg-green-600 text-white py-2 rounded text-xs font-bold hover:bg-green-700">Add Zone</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                </>
            )}

            {/* --- IMPROVED CATEGORY MODAL --- */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-0 animate-pop-in overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                        
                        {/* LEFT: FORM */}
                        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-2xl text-gray-900">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                                <button onClick={() => setShowCategoryModal(false)} className="md:hidden bg-gray-100 p-2 rounded-full"><X className="w-5 h-5"/></button>
                            </div>

                            <form onSubmit={handleSaveCategory} className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Category Name</label>
                                    <input autoFocus required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all font-bold text-lg" placeholder="e.g. Smartphones" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} />
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Category Icon</label>
                                    
                                    {/* Icon Type Tabs */}
                                    <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                                        <button type="button" onClick={() => setCatForm({...catForm, iconType: 'preset'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${catForm.iconType==='preset'?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-900'}`}>Preset Icons</button>
                                        <button type="button" onClick={() => setCatForm({...catForm, iconType: 'upload'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${catForm.iconType==='upload'?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-900'}`}>Upload Image</button>
                                        <button type="button" onClick={() => setCatForm({...catForm, iconType: 'url'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${catForm.iconType==='url'?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-900'}`}>Image URL</button>
                                    </div>

                                    {/* Icon Inputs */}
                                    {catForm.iconType === 'preset' && (
                                        <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-xl bg-gray-50/50">
                                            {ICON_OPTIONS.map((opt, i) => (
                                                <div key={i} onClick={() => setCatForm({...catForm, iconIdx: i})} className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all ${catForm.iconIdx === i ? 'bg-brand-600 text-white shadow-md scale-110' : 'bg-white text-gray-400 hover:bg-gray-200'}`}>
                                                    <opt.icon className="w-5 h-5" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {catForm.iconType === 'url' && (
                                        <input type="text" className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-500" placeholder="https://example.com/icon.png" value={catForm.iconUrl} onChange={e => setCatForm({...catForm, iconUrl: e.target.value})} />
                                    )}
                                    {catForm.iconType === 'upload' && (
                                        <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-xl text-xs text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-brand-400 transition-all" onClick={() => catFileInputRef.current?.click()}>
                                            <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                            {catForm.iconUrl ? <span className="text-brand-600 font-bold">Image Selected</span> : "Click to Upload Image"}
                                            <input ref={catFileInputRef} type="file" className="hidden" onChange={handleCategoryFileUpload} />
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Subcategories</label>
                                    <div className="flex gap-2 mb-3">
                                        <input 
                                            type="text" 
                                            className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-brand-500" 
                                            placeholder="New Subcategory..." 
                                            value={newSubcatName} 
                                            onChange={e => setNewSubcatName(e.target.value)} 
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubcategory())}
                                        />
                                        <button type="button" onClick={handleAddSubcategory} className="bg-gray-900 text-white px-4 rounded-xl hover:bg-black transition-colors"><Plus className="w-5 h-5"/></button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {catForm.subcategories.length === 0 && <span className="text-xs text-gray-400 italic">No subcategories added.</span>}
                                        {catForm.subcategories.map(s => (
                                            <span key={s.id} className="bg-white border border-gray-200 pl-3 pr-1 py-1 rounded-full text-xs font-bold text-gray-700 flex items-center gap-1 shadow-sm">
                                                {s.name}
                                                <button type="button" onClick={() => handleRemoveSubcategory(s.id)} className="p-1 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT: PREVIEW */}
                        <div className="w-full md:w-1/2 bg-gray-50 border-l border-gray-100 p-6 md:p-8 flex flex-col">
                             <div className="flex justify-between items-start mb-8">
                                 <div>
                                     <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">Live Preview</h4>
                                     <p className="text-gray-500 text-sm">See how it looks on the shop.</p>
                                 </div>
                                 <button onClick={() => setShowCategoryModal(false)} className="hidden md:block bg-white p-2 rounded-full shadow-sm hover:bg-gray-100"><X className="w-5 h-5 text-gray-500"/></button>
                             </div>

                             <div className="flex-grow flex flex-col items-center justify-center">
                                 {/* Mockup Card */}
                                 <div className="flex flex-col items-center gap-3 animate-fade-up">
                                     <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center relative border border-gray-100 group">
                                         {/* Render Icon */}
                                         {catForm.iconType === 'preset' ? (
                                             <CurrentIcon className="w-10 h-10 text-brand-600" />
                                         ) : catForm.iconUrl ? (
                                             <img src={catForm.iconUrl} className="w-full h-full object-cover rounded-3xl" />
                                         ) : (
                                             <Layers className="w-10 h-10 text-gray-300" />
                                         )}
                                         
                                         {/* Subcat Dot */}
                                         {catForm.subcategories.length > 0 && (
                                             <div className="absolute top-2 right-2 w-3 h-3 bg-brand-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                                         )}
                                     </div>
                                     <span className="font-bold text-gray-800 text-sm tracking-tight">{catForm.name || "Category Name"}</span>
                                 </div>

                                 {/* Dropdown Preview (Mock) */}
                                 {catForm.subcategories.length > 0 && (
                                     <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-2 w-48 animate-fade-up" style={{animationDelay: '100ms'}}>
                                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1 mb-1">Subcategories</p>
                                         <div className="space-y-1">
                                             {catForm.subcategories.slice(0, 4).map(s => (
                                                 <div key={s.id} className="px-3 py-2 hover:bg-gray-50 rounded-lg text-xs font-medium text-gray-600 cursor-pointer flex justify-between items-center">
                                                     {s.name}
                                                     <ChevronDown className="-rotate-90 w-3 h-3 text-gray-300" />
                                                 </div>
                                             ))}
                                             {catForm.subcategories.length > 4 && (
                                                 <div className="px-3 py-1 text-[10px] text-brand-500 font-bold text-center">
                                                     + {catForm.subcategories.length - 4} more
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                 )}
                             </div>

                             <div className="mt-auto pt-6 border-t border-gray-200">
                                 <button onClick={handleSaveCategory} className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                     <Save className="w-5 h-5" /> Save Category
                                 </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ... Delete & Order Modals (Keep existing code) ... */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-pop-in text-center">
                        <h3 className="text-xl font-bold mb-2">Confirm Delete?</h3>
                        <p className="text-gray-500 mb-6">Are you sure you want to delete "{deleteConfirmation.name}"?</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setDeleteConfirmation(null)} className="py-3 rounded-xl border font-bold">Cancel</button>
                            <button onClick={confirmDelete} className="py-3 rounded-xl bg-red-600 text-white font-bold">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* ... Selected Order Modal (Keep existing) ... */}
            {selectedOrder && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {/* ... (Existing Order Detail Modal Content) ... */}
                    {/* Simplified for brevity in this output, assume it matches previous complete block */}
                     <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-[pop-in_0.3s_ease-out] flex flex-col max-h-[90vh]">
                        <div className="bg-gray-900 p-4 flex justify-between items-center text-white shrink-0">
                             <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">Order Details</h3>
                                <p className="text-xs text-gray-400">ID: #{selectedOrder.id}</p>
                             </div>
                             <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="overflow-y-auto flex-grow p-6">
                            {/* ... Content ... */}
                             <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Current Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold uppercase ${
                                        selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                        selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                     {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                                         <button onClick={() => handleUpdateStatusAndClose('cancelled')} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50">Cancel</button>
                                     )}
                                     {selectedOrder.status === 'pending' && (
                                         <button onClick={() => handleUpdateStatusAndClose('processing')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30">Process Order</button>
                                     )}
                                     {selectedOrder.status === 'processing' && (
                                         <button onClick={() => handleUpdateStatusAndClose('delivered')} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-500/30">Mark Delivered</button>
                                     )}
                                </div>
                            </div>
                            {/* ... Item List ... */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-900 border-b pb-2 mb-3 flex items-center gap-2"><Package className="w-4 h-4"/> Items</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded border border-gray-200 p-0.5"><img src={item.image} className="w-full h-full object-contain"/></div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.quantity} x ৳{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-sm">৳{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                             <button onClick={() => initiateDeleteOrder(selectedOrder)} className="text-red-500 text-xs font-bold hover:underline mr-auto">Delete Order</button>
                             <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};