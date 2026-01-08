import React, { useState } from "react";
import { Menu, ShoppingCart, User, ShieldCheck, X, Home, Grid, Tag, Phone } from "lucide-react";
import { useStore } from "../store";

export const Header: React.FC = () => {
  const { cart, setIsCartOpen, user, setActiveModal, setCurrentView, categories, setShopConfig } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleMobileNav = (view: any) => {
      setCurrentView(view);
      setIsMobileMenuOpen(false);
  };

  const handleCategoryClick = (catName: string) => {
      setShopConfig({ category: catName });
      setCurrentView('shop');
      setIsMobileMenuOpen(false);
  };

  return (
    <>
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center justify-between">
        
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div 
            className="flex items-center gap-1 select-none cursor-pointer group"
            onClick={() => setCurrentView('home')}
          >
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-brand-500/30 shadow-lg group-hover:scale-105 transition-transform">Z</div>
            <div className="hidden sm:flex flex-col">
                <h1 className="text-lg font-black text-gray-900 leading-none tracking-tight">Zazzba</h1>
                <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest leading-none">Tech Zone</span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setCurrentView('home')} className="text-sm font-bold text-gray-500 hover:text-brand-600 transition-colors">Home</button>
            <button onClick={() => setCurrentView('shop')} className="text-sm font-bold text-gray-500 hover:text-brand-600 transition-colors">Shop</button>
            <button onClick={() => { setShopConfig({ showFlashSale: true }); setCurrentView('shop'); }} className="text-sm font-bold text-gray-500 hover:text-brand-600 transition-colors">Flash Deals</button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
            {/* User Auth */}
            {user ? (
                <div 
                    onClick={() => setCurrentView('dashboard')}
                    className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-50 transition-colors ${user.role === 'admin' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200'}`}
                >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs uppercase ${user.role === 'admin' ? 'bg-red-500 text-white' : 'bg-brand-100 text-brand-600'}`}>
                        {user.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : user.name.charAt(0)}
                    </div>
                    <span className={`text-xs font-bold ${user.role === 'admin' ? 'text-white' : 'text-gray-700'}`}>
                        {user.name.split(' ')[0]}
                    </span>
                </div>
            ) : (
                <button 
                    onClick={() => setActiveModal('auth')}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-all"
                >
                    <User className="w-3.5 h-3.5" />
                    <span>Login</span>
                </button>
            )}

            {/* Mobile User Icon */}
            <button 
                onClick={() => user ? setCurrentView('dashboard') : setActiveModal('auth')}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700 relative"
            >
                {user ? (
                    <div className={`w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-sm ${user.role === 'admin' ? 'bg-gray-900' : 'bg-brand-500'}`}>
                         {user.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : user.name.charAt(0)}
                    </div>
                ) : (
                    <User className="w-6 h-6" />
                )}
            </button>

            {/* Cart Button */}
            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
                <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-brand-600 transition-colors" />
                {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white animate-pop-in">
                    {cartItemCount}
                </span>
                )}
            </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Drawer */}
    {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative w-[80%] max-w-xs bg-white h-full shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black text-lg">Z</div>
                         <h2 className="text-lg font-black text-gray-900">Zazzba</h2>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 bg-gray-50 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 space-y-1">
                    <button onClick={() => handleMobileNav('home')} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 flex items-center gap-3 font-bold text-gray-700">
                        <Home className="w-5 h-5 text-gray-400" /> Home
                    </button>
                    <button onClick={() => handleMobileNav('shop')} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 flex items-center gap-3 font-bold text-gray-700">
                        <Grid className="w-5 h-5 text-gray-400" /> Shop All
                    </button>
                    <button onClick={() => { setShopConfig({ showFlashSale: true }); handleMobileNav('shop'); }} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 flex items-center gap-3 font-bold text-gray-700">
                        <Tag className="w-5 h-5 text-brand-500" /> Flash Deals
                    </button>
                    
                    <div className="mt-6 mb-2 px-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</p>
                    </div>
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => handleCategoryClick(cat.name)} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-brand-50 hover:text-brand-600 text-sm font-medium text-gray-600 transition-colors">
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                     <button className="w-full flex items-center gap-2 text-sm font-bold text-gray-600 justify-center bg-white border border-gray-200 py-3 rounded-xl shadow-sm">
                         <Phone className="w-4 h-4" /> 01953319995
                     </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};