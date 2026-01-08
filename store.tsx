import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Product, CartItem, User, Category, Order, Review, OrderStatusLog, BannerConfig, FooterConfig } from './types';
import { FLASH_SALE_PRODUCTS, NEW_ARRIVALS, CATEGORIES } from './constants';

// --- SUPABASE CONFIGURATION ---
const supabaseUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || 'https://lduhfmkzhjdzskacvqfs.supabase.co';
const supabaseKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || 'sb_publishable_qo7f0EnWkgLhgVY2wVjWfw_zrw8hEWP';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin Emails
const ADMIN_EMAILS = ['sazzad7.me@gmail.com']; 

interface ShopConfig {
  category: string;
  subcategory: string;
  showFlashSale: boolean;
}

interface SmsConfig {
  apiKey: string;
  processingTemplate: string;
}

interface PaymentConfig {
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  instructions: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  charge: number;
}

interface StoreContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  authLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeModal: 'none' | 'invoice' | 'product' | 'checkout' | 'auth' | 'tracking';
  setActiveModal: (modal: 'none' | 'invoice' | 'product' | 'checkout' | 'auth' | 'tracking') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  checkoutItems: CartItem[];
  openCheckout: (items: CartItem[]) => void;
  currentView: 'home' | 'dashboard' | 'pos' | 'shop' | 'privacy' | 'terms';
  setCurrentView: (view: 'home' | 'dashboard' | 'pos' | 'shop' | 'privacy' | 'terms') => void;
  shopConfig: ShopConfig;
  setShopConfig: (config: Partial<ShopConfig>) => void;
  resetShopConfig: () => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  clearCart: () => void;
  reviews: Review[];
  addReview: (review: Review) => void;
  updateReviewStatus: (id: string, status: 'approved' | 'pending') => void;
  deleteReview: (id: string) => void;
  smsConfig: SmsConfig;
  updateSmsConfig: (config: Partial<SmsConfig>) => void;
  sendCustomSms: (phone: string, message: string) => Promise<boolean>;
  paymentConfig: PaymentConfig;
  updatePaymentConfig: (config: Partial<PaymentConfig>) => void;
  deliveryZones: DeliveryZone[];
  addDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: string) => void;
  bannerConfig: BannerConfig;
  updateBannerConfig: (config: Partial<BannerConfig>) => void;
  footerConfig: FooterConfig;
  updateFooterConfig: (config: Partial<FooterConfig>) => void;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<'none' | 'invoice' | 'product' | 'checkout' | 'auth' | 'tracking'>('none');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'pos' | 'shop' | 'privacy' | 'terms'>('home');
  const [shopConfig, setShopConfigState] = useState<ShopConfig>({ category: 'All', subcategory: 'All', showFlashSale: false });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // Site Configs - Default values used only as fallback
  const [smsConfig, setSmsConfigState] = useState<SmsConfig>({ apiKey: '', processingTemplate: '' });
  const [paymentConfig, setPaymentConfigState] = useState<PaymentConfig>({ bkashNumber: '', nagadNumber: '', rocketNumber: '', instructions: '' });
  const [bannerConfig, setBannerConfigState] = useState<BannerConfig>({ title: '', subtitle: '', image: '', tagText: '', buttonText: '' });
  const [footerConfig, setFooterConfigState] = useState<FooterConfig>({ description: '', facebook: '', instagram: '', youtube: '', address: '', phone: '', email: '' });

  useEffect(() => {
    refreshData();
    checkSession();

    // --- REALTIME SUBSCRIPTIONS ---
    // This allows the app to update INSTANTLY when database changes
    const productSub = supabase.channel('realtime-products').on('postgres_changes', { event: '*', table: 'products' }, fetchInitialData).subscribe();
    const orderSub = supabase.channel('realtime-orders').on('postgres_changes', { event: '*', table: 'orders' }, fetchInitialData).subscribe();
    const settingsSub = supabase.channel('realtime-settings').on('postgres_changes', { event: '*', table: 'site_settings' }, fetchSettings).subscribe();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email!);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentView('home');
      }
    });

    return () => {
      productSub.unsubscribe();
      orderSub.unsubscribe();
      settingsSub.unsubscribe();
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshData = async () => {
    await Promise.all([fetchInitialData(), fetchSettings()]);
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (data) {
        const banner = data.find(s => s.key === 'banner_config')?.value;
        const footer = data.find(s => s.key === 'footer_config')?.value;
        const sms = data.find(s => s.key === 'sms_config')?.value;
        const payment = data.find(s => s.key === 'payment_config')?.value;

        if (banner) setBannerConfigState(banner);
        if (footer) setFooterConfigState(footer);
        if (sms) setSmsConfigState(sms);
        if (payment) setPaymentConfigState(payment);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [{ data: prodData }, { data: catData }, { data: ordData }, { data: revData }, { data: zoneData }] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: false }),
        supabase.from('categories').select('*').order('id', { ascending: true }),
        supabase.from('orders').select('*').order('id', { ascending: false }),
        supabase.from('reviews').select('*').order('id', { ascending: false }),
        supabase.from('delivery_zones').select('*').order('id', { ascending: true })
      ]);

      if (prodData && prodData.length > 0) setProducts(prodData);
      else setProducts([...FLASH_SALE_PRODUCTS, ...NEW_ARRIVALS]);

      if (catData && catData.length > 0) setCategories(catData);
      else setCategories(CATEGORIES);

      if (ordData) setOrders(ordData);
      if (revData) setReviews(revData);
      if (zoneData) setDeliveryZones(zoneData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchUserProfile = async (uid: string, email: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const userObj: User = {
      id: uid,
      name: data?.name || email.split('@')[0],
      email,
      phone: data?.phone,
      address: data?.address,
      role: isAdmin ? 'admin' : (data?.role || 'customer')
    };
    setUser(userObj);
    return userObj;
  };

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await fetchUserProfile(session.user.id, session.user.email!);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setAuthError(error.message);
    else if (data.user) {
      await fetchUserProfile(data.user.id, email);
      setActiveModal('none');
    }
    setAuthLoading(false);
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone: string) => {
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password: pass });
    if (error) setAuthError(error.message);
    else if (data.user) {
      await supabase.from('profiles').insert([{ id: data.user.id, email, name, phone, role: 'customer' }]);
      setUser({ id: data.user.id, name, email, phone, role: 'customer' });
      setActiveModal('none');
    }
    setAuthLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView('home');
  };

  const saveSettingToDb = async (key: string, value: any) => {
    await supabase.from('site_settings').upsert({ key, value });
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id: string, delta: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const clearCart = () => setCart([]);

  const updateProduct = async (p: Product) => {
    setProducts(prev => prev.map(old => old.id === p.id ? p : old));
    await supabase.from('products').update(p).eq('id', p.id);
  };

  const addProduct = async (p: Product) => {
    setProducts(prev => [p, ...prev]);
    await supabase.from('products').insert([p]);
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await supabase.from('products').delete().eq('id', id);
  };

  const addCategory = async (cat: Category) => {
    const { icon, ...dbCat } = cat;
    setCategories(prev => [...prev, cat]);
    await supabase.from('categories').insert([dbCat]);
  };

  const updateCategory = async (cat: Category) => {
    const { icon, ...dbCat } = cat;
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    await supabase.from('categories').update(dbCat).eq('id', cat.id);
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    await supabase.from('categories').delete().eq('id', id);
  };

  const addOrder = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    await supabase.from('orders').insert([order]);
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const logEntry = { status, date: new Date().toLocaleString(), note: `Status updated to ${status}` };
    const order = orders.find(o => o.id === id);
    const history = [logEntry, ...(order?.statusHistory || [])];
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, statusHistory: history } : o));
    await supabase.from('orders').update({ status, statusHistory: history }).eq('id', id);
  };

  const updateSmsConfig = (config: Partial<SmsConfig>) => {
    const next = { ...smsConfig, ...config };
    setSmsConfigState(next);
    saveSettingToDb('sms_config', next);
  };

  const updatePaymentConfig = (config: Partial<PaymentConfig>) => {
    const next = { ...paymentConfig, ...config };
    setPaymentConfigState(next);
    saveSettingToDb('payment_config', next);
  };

  const updateBannerConfig = (config: Partial<BannerConfig>) => {
    const next = { ...bannerConfig, ...config };
    setBannerConfigState(next);
    saveSettingToDb('banner_config', next);
  };

  const updateFooterConfig = (config: Partial<FooterConfig>) => {
    const next = { ...footerConfig, ...config };
    setFooterConfigState(next);
    saveSettingToDb('footer_config', next);
  };

  return (
    <StoreContext.Provider value={{
      user, setUser, authLoading, authError, setAuthError, loginWithEmail, registerWithEmail, logout,
      cart, addToCart, removeFromCart, updateQuantity, cartTotal: cart.reduce((s, i) => s + i.price * i.quantity, 0),
      isCartOpen, setIsCartOpen, searchQuery, setSearchQuery, activeModal, setActiveModal,
      selectedProduct, setSelectedProduct, checkoutItems, openCheckout: (items) => { setCheckoutItems(items); setIsCartOpen(false); setActiveModal('checkout'); },
      currentView, setCurrentView, shopConfig, setShopConfig: (c) => setShopConfigState(p => ({ ...p, ...c })),
      resetShopConfig: () => setShopConfigState({ category: 'All', subcategory: 'All', showFlashSale: false }),
      products, addProduct, updateProduct, deleteProduct, categories, addCategory, updateCategory, deleteCategory,
      reorderCategories: setCategories, orders, addOrder, updateOrderStatus, deleteOrder: async (id) => { setOrders(p => p.filter(o => o.id !== id)); await supabase.from('orders').delete().eq('id', id); },
      clearCart, reviews, addReview: async (r) => { setReviews(p => [r, ...p]); await supabase.from('reviews').insert([r]); },
      updateReviewStatus: async (id, status) => { setReviews(p => p.map(r => r.id === id ? { ...r, status } : r)); await supabase.from('reviews').update({ status }).eq('id', id); },
      deleteReview: async (id) => { setReviews(p => p.filter(r => r.id !== id)); await supabase.from('reviews').delete().eq('id', id); },
      smsConfig, updateSmsConfig, sendCustomSms: async (p, m) => {
        if (!smsConfig.apiKey) return false;
        try { await fetch(`https://api.sms.net.bd/sendsms?api_key=${smsConfig.apiKey}&msg=${encodeURIComponent(m)}&to=${p}`, { mode: 'no-cors' }); return true; }
        catch { return false; }
      },
      paymentConfig, updatePaymentConfig, deliveryZones, addDeliveryZone: async (z) => { setDeliveryZones(p => [...p, z]); await supabase.from('delivery_zones').insert([z]); },
      deleteDeliveryZone: async (id) => { setDeliveryZones(p => p.filter(z => z.id !== id)); await supabase.from('delivery_zones').delete().eq('id', id); },
      bannerConfig, updateBannerConfig, footerConfig, updateFooterConfig, refreshData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};