import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Product, CartItem, User, Category, Order, Review, OrderStatusLog, BannerConfig, FooterConfig } from './types';
import { FLASH_SALE_PRODUCTS, NEW_ARRIVALS, CATEGORIES } from './constants';

// --- CONFIGURATION ---
const ADMIN_EMAILS = ['sazzad7.me@gmail.com']; 
const ADMIN_PREFIX = 'admin'; 

// --- SUPABASE CONFIGURATION ---
// These can be set as environment variables in Netlify UI
const supabaseUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || 'https://lduhfmkzhjdzskacvqfs.supabase.co';
const supabaseKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || 'sb_publishable_qo7f0EnWkgLhgVY2wVjWfw_zrw8hEWP';
export const supabase = createClient(supabaseUrl, supabaseKey);

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
  
  // Auth Functions
  authLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
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
  
  // Shop Configuration (Filters)
  shopConfig: ShopConfig;
  setShopConfig: (config: Partial<ShopConfig>) => void;
  resetShopConfig: () => void;

  // Product Management
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // Category Management
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;

  // Order Management
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  clearCart: () => void;

  // Review Management
  reviews: Review[];
  addReview: (review: Review) => void;
  updateReviewStatus: (id: string, status: 'approved' | 'pending') => void;
  deleteReview: (id: string) => void;

  // SMS Management
  smsConfig: SmsConfig;
  updateSmsConfig: (config: Partial<SmsConfig>) => void;
  sendCustomSms: (phone: string, message: string) => Promise<boolean>;

  // Payment Management
  paymentConfig: PaymentConfig;
  updatePaymentConfig: (config: Partial<PaymentConfig>) => void;

  // Delivery Management
  deliveryZones: DeliveryZone[];
  addDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: string) => void;

  // Banner Management
  bannerConfig: BannerConfig;
  updateBannerConfig: (config: Partial<BannerConfig>) => void;

  // Footer Management
  footerConfig: FooterConfig;
  updateFooterConfig: (config: Partial<FooterConfig>) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
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
  
  const [shopConfig, setShopConfigState] = useState<ShopConfig>({
      category: 'All',
      subcategory: 'All',
      showFlashSale: false
  });

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // Config States
  const [smsConfig, setSmsConfigState] = useState<SmsConfig>(() => {
      const saved = localStorage.getItem('zazzba_sms_config');
      return saved ? JSON.parse(saved) : {
          apiKey: 'y53bZP7uPRQ7yC0oCO6Zaa4rTM996L933vBaSA1E',
          processingTemplate: 'Dear {customerName}, Your order #{orderId} is now Processing. Total: {total}TK. Thank you for shopping with Zazzba Tech Zone.'
      };
  });

  const [paymentConfig, setPaymentConfigState] = useState<PaymentConfig>(() => {
      const saved = localStorage.getItem('zazzba_payment_config');
      return saved ? JSON.parse(saved) : {
          bkashNumber: '01700000000',
          nagadNumber: '',
          rocketNumber: '',
          instructions: 'Please send money via Send Money option. Use your Order ID as Reference.'
      };
  });

  const [bannerConfig, setBannerConfigState] = useState<BannerConfig>(() => {
      const saved = localStorage.getItem('zazzba_banner_config');
      return saved ? JSON.parse(saved) : {
          title: "Upgrade Your <br/> <span class='text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-200'>Digital Life</span>",
          subtitle: "Experience the latest in tech innovation. Premium gadgets at unbeatable prices delivered to your door.",
          image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80",
          tagText: "New Collection",
          buttonText: "Shop Now"
      };
  });

  const [footerConfig, setFooterConfigState] = useState<FooterConfig>(() => {
      const saved = localStorage.getItem('zazzba_footer_config');
      return saved ? JSON.parse(saved) : {
          description: "Your trusted destination for premium gadgets and tech accessories. We bring the future to your doorstep.",
          facebook: "#",
          instagram: "#",
          youtube: "#",
          address: "Isapura Chowrasta, Sirajdikhan, Munshiganj, Bangladesh",
          phone: "01953319995",
          email: "support@zazzba.com"
      };
  });

  // --- SUPABASE DATA FETCHING ---
  
  useEffect(() => {
    fetchInitialData();
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            if (!user || user.email !== session.user.email) {
                await fetchUserProfile(session.user.id, session.user.email!);
            }
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setCurrentView('home');
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchInitialData = async () => {
      try {
        const { data: prodData, error: prodError } = await supabase.from('products').select('*');
        if (prodData && prodData.length > 0) {
            setProducts(prodData);
        } else {
            setProducts([...FLASH_SALE_PRODUCTS, ...NEW_ARRIVALS]);
        }

        const { data: catData, error: catError } = await supabase.from('categories').select('*');
        if (catData && catData.length > 0) {
            setCategories(catData);
        } else {
            setCategories(CATEGORIES);
        }

        const { data: ordData, error: ordError } = await supabase.from('orders').select('*');
        if (ordData) setOrders(ordData);

        const { data: revData, error: revError } = await supabase.from('reviews').select('*');
        if (revData) setReviews(revData);

        const { data: zoneData, error: zoneError } = await supabase.from('delivery_zones').select('*');
        if (zoneData) setDeliveryZones(zoneData);
      } catch (err) {
        console.error("Error fetching initial data (likely first run or network):", err);
        if (products.length === 0) setProducts([...FLASH_SALE_PRODUCTS, ...NEW_ARRIVALS]);
        if (categories.length === 0) setCategories(CATEGORIES);
      }
  };

  const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
           const userData = await fetchUserProfile(session.user.id, session.user.email!);
           if (userData && userData.role === 'admin') {
               setCurrentView('dashboard');
           }
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
  };

  const fetchUserProfile = async (uid: string, email: string): Promise<User | null> => {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
        const lowerEmail = email.toLowerCase();
        const isAdminEmail = ADMIN_EMAILS.includes(lowerEmail) || lowerEmail.startsWith(ADMIN_PREFIX);
        let userObj: User;
        if (data) {
            userObj = {
                id: uid,
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                role: isAdminEmail ? 'admin' : (data.role as 'admin' | 'customer')
            };
        } else {
            const name = email.split('@')[0];
            const role = isAdminEmail ? 'admin' : 'customer';
            const newProfileDb = { id: uid, email, name, role: role };
            supabase.from('profiles').insert([newProfileDb]).then();
            userObj = { id: uid, name, email, role: role };
        }
        setUser(userObj);
        return userObj;
      } catch (err) {
          console.error("Fetch User Profile Error", err);
          return null;
      }
  };

  const loginWithEmail = async (email: string, pass: string) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;
          if (data.user) {
              const userProfile = await fetchUserProfile(data.user.id, data.user.email!);
              setActiveModal('none');
              setCurrentView('dashboard');
          }
      } catch (err: any) {
          console.error("Login Error:", err);
          if (err.message === "Invalid login credentials") {
             setAuthError("Incorrect email or password. If you don't have an account, please register.");
          } else {
             setAuthError(err.message || "Failed to login");
          }
      } finally {
          setAuthLoading(false);
      }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone: string) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
          const { data, error } = await supabase.auth.signUp({ email, password: pass });
          if (error) throw error;
          if (data.user) {
              const lowerEmail = email.toLowerCase();
              const isAdminEmail = ADMIN_EMAILS.includes(lowerEmail) || lowerEmail.startsWith(ADMIN_PREFIX);
              const role = isAdminEmail ? 'admin' : 'customer';
              const { error: profileError } = await supabase.from('profiles').insert([{
                  id: data.user.id, email, name, phone, role: role
              }]);
              if (profileError) {
                  await fetchUserProfile(data.user.id, email);
              } else {
                  setUser({ id: data.user.id, name, email, phone, role: role });
              }
              setActiveModal('none');
              setCurrentView('dashboard');
          }
      } catch (err: any) {
          console.error("Registration Error:", err);
          setAuthError(err.message || "Failed to register");
      } finally {
          setAuthLoading(false);
      }
  };

  const loginWithGoogle = async () => {
      alert("Please configure Google Auth in Supabase Dashboard first.");
  };

  const logout = async () => {
      await supabase.auth.signOut();
      setUser(null);
      setCurrentView('home');
  };

  const addProduct = async (product: Product) => {
      setProducts(prev => [product, ...prev]);
      await supabase.from('products').insert([product]);
  };

  const updateProduct = async (updatedProduct: Product) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
  };

  const deleteProduct = async (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
      await supabase.from('products').delete().eq('id', id);
  };

  const addCategory = async (category: Category) => {
      setCategories(prev => [...prev, category]);
      const { icon, ...dbCategory } = category;
      await supabase.from('categories').insert([dbCategory]);
  };

  const updateCategory = async (updatedCat: Category) => {
      setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
      const { icon, ...dbCategory } = updatedCat;
      await supabase.from('categories').update(dbCategory).eq('id', updatedCat.id);
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
      const logEntry: OrderStatusLog = {
          status,
          date: new Date().toLocaleString(),
          note: `Status updated to ${status.toUpperCase()}`
      };
      setOrders(prev => prev.map(o => {
          if (o.id === id) {
              const currentHistory = o.statusHistory || [];
              return { ...o, status, statusHistory: [logEntry, ...currentHistory] };
          }
          return o;
      }));
      const orderToUpdate = orders.find(o => o.id === id);
      const currentHistory = orderToUpdate?.statusHistory || [];
      const updatedHistory = [logEntry, ...currentHistory];
      await supabase.from('orders').update({ status, statusHistory: updatedHistory }).eq('id', id);
      if (status === 'processing') {
          const order = orders.find(o => o.id === id);
          if (order) {
              let message = smsConfig.processingTemplate;
              message = message.replace(/{customerName}/g, order.customerName);
              message = message.replace(/{orderId}/g, order.id);
              message = message.replace(/{total}/g, order.total.toLocaleString());
              message = message.replace(/{phone}/g, order.phone);
              executeSendSms(order.phone, message);
          }
      }
  };

  const deleteOrder = async (id: string) => {
      setOrders(prev => prev.filter(o => o.id !== id));
      await supabase.from('orders').delete().eq('id', id);
  };

  const addReview = async (review: Review) => {
      setReviews(prev => [review, ...prev]);
      await supabase.from('reviews').insert([review]);
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'pending') => {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      await supabase.from('reviews').update({ status }).eq('id', id);
  };

  const deleteReview = async (id: string) => {
      setReviews(prev => prev.filter(r => r.id !== id));
      await supabase.from('reviews').delete().eq('id', id);
  };

  const addDeliveryZone = async (zone: DeliveryZone) => {
      setDeliveryZones(prev => [...prev, zone]);
      await supabase.from('delivery_zones').insert([zone]);
  };

  const deleteDeliveryZone = async (id: string) => {
      setDeliveryZones(prev => prev.filter(z => z.id !== id));
      await supabase.from('delivery_zones').delete().eq('id', id);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const openCheckout = (items: CartItem[]) => {
    setCheckoutItems(items);
    setIsCartOpen(false);
    setActiveModal('checkout');
  };

  const setShopConfig = (config: Partial<ShopConfig>) => {
      setShopConfigState(prev => ({ ...prev, ...config }));
  };

  const resetShopConfig = () => {
      setShopConfigState({ category: 'All', subcategory: 'All', showFlashSale: false });
  };

  const updateSmsConfig = (config: Partial<SmsConfig>) => {
      setSmsConfigState(prev => {
          const newConfig = { ...prev, ...config };
          localStorage.setItem('zazzba_sms_config', JSON.stringify(newConfig));
          return newConfig;
      });
  };

  const updatePaymentConfig = (config: Partial<PaymentConfig>) => {
      setPaymentConfigState(prev => {
          const newConfig = { ...prev, ...config };
          localStorage.setItem('zazzba_payment_config', JSON.stringify(newConfig));
          return newConfig;
      });
  };

  const updateBannerConfig = (config: Partial<BannerConfig>) => {
      setBannerConfigState(prev => {
          const newConfig = { ...prev, ...config };
          localStorage.setItem('zazzba_banner_config', JSON.stringify(newConfig));
          return newConfig;
      });
  };

  const updateFooterConfig = (config: Partial<FooterConfig>) => {
      setFooterConfigState(prev => {
          const newConfig = { ...prev, ...config };
          localStorage.setItem('zazzba_footer_config', JSON.stringify(newConfig));
          return newConfig;
      });
  };

  const executeSendSms = async (phone: string, message: string): Promise<boolean> => {
    if (!smsConfig.apiKey) return false;
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('01')) formattedPhone = '88' + formattedPhone;
    const url = `https://api.sms.net.bd/sendsms?api_key=${smsConfig.apiKey}&msg=${encodeURIComponent(message)}&to=${formattedPhone}`;
    try {
        await fetch(url, { mode: 'no-cors' });
        return true;
    } catch (error) {
        console.error("[SMS] Failed to send:", error);
        return false;
    }
  };

  const sendCustomSms = async (phone: string, message: string) => {
      return await executeSendSms(phone, message);
  };

  const reorderCategories = (newOrder: Category[]) => {
      setCategories(newOrder);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        user, setUser, authLoading, authError, setAuthError, loginWithEmail, registerWithEmail, loginWithGoogle, logout,
        cart, addToCart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen, searchQuery, setSearchQuery,
        activeModal, setActiveModal, selectedProduct, setSelectedProduct, checkoutItems, openCheckout, currentView, setCurrentView,
        shopConfig, setShopConfig, resetShopConfig, products, addProduct, updateProduct, deleteProduct,
        categories, addCategory, updateCategory, deleteCategory, reorderCategories,
        orders, addOrder, updateOrderStatus, deleteOrder, clearCart, reviews, addReview, updateReviewStatus, deleteReview,
        smsConfig, updateSmsConfig, sendCustomSms, paymentConfig, updatePaymentConfig,
        deliveryZones, addDeliveryZone, deleteDeliveryZone, bannerConfig, updateBannerConfig, footerConfig, updateFooterConfig
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};