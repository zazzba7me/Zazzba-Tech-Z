import React from "react";
import { useStore } from "../store";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export const Footer: React.FC = () => {
  const { setCurrentView, resetShopConfig, footerConfig } = useStore();

  const handleShopClick = () => {
      resetShopConfig();
      setCurrentView('shop');
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Top Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-gray-800 mb-12">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-600/10 rounded-full flex items-center justify-center text-brand-500">
                    <Truck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-white">Nationwide Delivery</h4>
                    <p className="text-xs text-gray-400">Fast delivery across Bangladesh</p>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-600/10 rounded-full flex items-center justify-center text-brand-500">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-white">100% Authentic</h4>
                    <p className="text-xs text-gray-400">Original products guaranteed</p>
                </div>
            </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-600/10 rounded-full flex items-center justify-center text-brand-500">
                    <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-white">Easy Returns</h4>
                    <p className="text-xs text-gray-400">3 days easy return policy</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2">Zazzba <span className="text-brand-500">Tech</span></h2>
                    <p className="text-sm leading-relaxed text-gray-400">
                        {footerConfig.description}
                    </p>
                </div>
                <div className="flex gap-3">
                    {footerConfig.facebook && (
                        <a href={footerConfig.facebook} target="_blank" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all"><Facebook className="w-4 h-4" /></a>
                    )}
                    {footerConfig.instagram && (
                        <a href={footerConfig.instagram} target="_blank" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all"><Instagram className="w-4 h-4" /></a>
                    )}
                    {footerConfig.youtube && (
                        <a href={footerConfig.youtube} target="_blank" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all"><Youtube className="w-4 h-4" /></a>
                    )}
                </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
                <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                    <li><button onClick={() => setCurrentView('home')} className="hover:text-brand-500 transition-colors">Home</button></li>
                    <li><button onClick={handleShopClick} className="hover:text-brand-500 transition-colors">Shop All</button></li>
                    <li><button onClick={() => setCurrentView('shop')} className="hover:text-brand-500 transition-colors">New Arrivals</button></li>
                    <li><button onClick={() => setCurrentView('shop')} className="hover:text-brand-500 transition-colors">Flash Deals</button></li>
                </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div>
                <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Customer Service</h3>
                <ul className="space-y-2 text-sm">
                    <li><button onClick={() => setCurrentView('dashboard')} className="hover:text-brand-500 transition-colors">My Account</button></li>
                    <li><button className="hover:text-brand-500 transition-colors">Order Tracking</button></li>
                    <li><button onClick={() => setCurrentView('terms')} className="hover:text-brand-500 transition-colors">Terms & Conditions</button></li>
                    <li><button onClick={() => setCurrentView('privacy')} className="hover:text-brand-500 transition-colors">Privacy Policy</button></li>
                </ul>
            </div>

            {/* Column 4: Contact & Newsletter */}
            <div>
                 <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Contact Us</h3>
                 <ul className="space-y-3 text-sm mb-6">
                     <li className="flex items-start gap-3">
                         <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
                         <span>{footerConfig.address}</span>
                     </li>
                     <li className="flex items-center gap-3">
                         <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                         <span>{footerConfig.phone}</span>
                     </li>
                     <li className="flex items-center gap-3">
                         <Mail className="w-5 h-5 text-brand-500 shrink-0" />
                         <span>{footerConfig.email}</span>
                     </li>
                 </ul>
                 
                 <h3 className="text-white font-bold mb-2 uppercase text-xs tracking-wider">Stay Updated</h3>
                 <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 focus-within:border-brand-500 transition-colors">
                     <input type="email" placeholder="Your Email" className="bg-transparent border-none outline-none text-xs px-3 text-white w-full placeholder-gray-500" />
                     <button className="bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-md transition-colors"><ArrowRight className="w-4 h-4" /></button>
                 </div>
            </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Zazzba Tech Zone. All rights reserved.</p>
            <div className="flex items-center gap-4">
                <span className="hover:text-white cursor-pointer">Sitemap</span>
                <span className="hover:text-white cursor-pointer">Cookies</span>
                <span className="hover:text-white cursor-pointer">Disclaimer</span>
            </div>
        </div>
      </div>
    </footer>
  );
};