import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const phoneNumber = "8801953319995";
  const message = "Hello, I am interested in your products.";
  
  return (
    <a 
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60] bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-xl shadow-green-500/30 transition-all duration-300 hover:scale-110 flex items-center justify-center group animate-fade-up"
      aria-label="Chat on WhatsApp"
    >
        {/* Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping group-hover:animate-none"></span>
        
        <div className="relative">
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 fill-white stroke-white" />
        </div>
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none flex items-center gap-1">
            Chat on WhatsApp
            <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
        </span>
    </a>
  );
};