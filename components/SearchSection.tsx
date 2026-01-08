import React from "react";
import { Search, X } from "lucide-react";
import { useStore } from "../store";

export const SearchSection: React.FC = () => {
  const { searchQuery, setSearchQuery } = useStore();

  return (
    <div className="px-4 pt-4 pb-2 bg-white sticky top-[60px] z-30 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className={`relative max-w-2xl mx-auto transition-all duration-300 rounded-xl group ${searchQuery ? 'scale-100' : 'scale-[0.99] hover:scale-100'}`}>
        {/* Animated Gradient Border Effect on Focus */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-300 to-purple-400 rounded-xl opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm"></div>
        
        <div className="relative bg-white rounded-xl flex items-center shadow-sm border border-gray-100 group-focus-within:border-transparent">
            <div className="pl-4 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors ${searchQuery ? 'text-brand-500' : 'text-gray-400 group-focus-within:text-brand-500'}`} />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-3 pr-10 py-3.5 bg-transparent text-gray-900 rounded-xl focus:outline-none placeholder-gray-400 text-sm font-medium"
                placeholder="Search products, brands, or categories..."
            />
            {searchQuery && (
            <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
            >
                <div className="bg-gray-100 rounded-full p-1 hover:bg-red-50 transition-colors">
                    <X className="h-3.5 w-3.5" />
                </div>
            </button>
            )}
        </div>
      </div>
    </div>
  );
};