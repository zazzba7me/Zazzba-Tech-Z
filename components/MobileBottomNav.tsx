import React from 'react';
import { Home, Grid, ShoppingCart, User, Zap } from 'lucide-react';
import { useStore } from '../store';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, cart, isCartOpen, setIsCartOpen, user, setActiveModal, setShopConfig } = useStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleNav = (view: 'home' | 'shop' | 'dashboard' | 'cart' | 'flash') => {
      if (view === 'cart') {
          setIsCartOpen(true);
      } else if (view === 'flash') {
          setShopConfig({ showFlashSale: true });
          setCurrentView('shop');
      } else if (view === 'dashboard') {
          if (user) {
              setCurrentView('dashboard');
          } else {
              setActiveModal('auth');
          }
      } else {
          setCurrentView(view);
      }
  };

  // Don't show on POS or Admin Dashboard if user is admin (optional, based on pref)
  // But generally bottom nav is for customer experience
  if (currentView === 'pos' || (user?.role === 'admin' && currentView === 'dashboard')) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 pb-safe">
      <div className="flex justify-around items-center h-16">
        
        <button 
            onClick={() => handleNav('home')} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'home' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Home className={`w-6 h-6 ${currentView === 'home' ? 'fill-brand-100' : ''}`} />
            <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
            onClick={() => handleNav('shop')} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'shop' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Grid className={`w-6 h-6 ${currentView === 'shop' ? 'fill-brand-100' : ''}`} />
            <span className="text-[10px] font-bold">Shop</span>
        </button>

        {/* Floating Action Button Style for Cart */}
        <div className="relative -top-5">
             <button 
                onClick={() => handleNav('cart')}
                className="w-14 h-14 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-500/40 border-4 border-gray-50 active:scale-95 transition-transform"
            >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-brand-600">
                        {cartCount}
                    </span>
                )}
            </button>
        </div>

        <button 
            onClick={() => handleNav('flash')} 
            className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 hover:text-brand-600"
        >
            <Zap className="w-6 h-6" />
            <span className="text-[10px] font-bold">Deals</span>
        </button>

        <button 
            onClick={() => handleNav('dashboard')} 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'dashboard' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <User className={`w-6 h-6 ${currentView === 'dashboard' ? 'fill-brand-100' : ''}`} />
            <span className="text-[10px] font-bold">Account</span>
        </button>

      </div>
    </div>
  );
};