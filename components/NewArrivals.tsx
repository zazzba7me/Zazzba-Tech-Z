import React, { useState, useEffect } from "react";
import { Star, ShoppingCart, Eye, AlertCircle, SearchX, Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { useStore } from "../store";
import { CartItem } from "../types";

export const NewArrivals: React.FC = () => {
  const { searchQuery, addToCart, setSelectedProduct, setActiveModal, products, setCurrentView, setSearchQuery } = useStore();
  const [visibleCount, setVisibleCount] = useState(8);

  // Reset visible count when search query changes
  useEffect(() => {
    setVisibleCount(8);
  }, [searchQuery]);

  const filteredProducts = products.filter(product => {
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.subcategory?.toLowerCase().includes(query)
        );
    } else {
        return !product.isFlashSale;
    }
  });

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setActiveModal('product');
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if ((product.stock || 0) > 0) {
        addToCart(product);
    }
  };

  const handleLoadMore = () => {
      setVisibleCount(prev => prev + 4);
  };

  return (
    <section 
        className={`px-4 max-w-7xl mx-auto transition-all duration-500 group/section ${searchQuery ? 'py-4 min-h-[60vh]' : 'py-8 min-h-[400px]'}`}
    >
      
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-6">
        {searchQuery ? (
             <div className="flex items-center gap-2 animate-fade-up">
                <div className="bg-brand-100 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900">Search Results</h2>
                    <p className="text-xs text-gray-500 font-medium">Found {filteredProducts.length} items for "{searchQuery}"</p>
                </div>
             </div>
        ) : (
            <div className="flex items-center gap-2">
                 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    New Arrivals
                </h2>
                <div className="h-1 flex-grow bg-gray-100 rounded-full ml-4 hidden sm:block"></div>
            </div>
        )}

        {!searchQuery && (
          <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentView('shop')}
                className="text-xs font-bold text-gray-500 hover:text-brand-600 transition-colors border-b border-transparent hover:border-brand-600 flex items-center gap-1"
              >
                See All <ArrowRight className="w-3 h-3" />
              </button>
          </div>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <SearchX className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
                We couldn't find any products matching "{searchQuery}". Try different keywords or browse categories.
            </p>
            <button 
                onClick={() => setSearchQuery("")}
                className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all active:scale-95"
            >
                Clear Search
            </button>
        </div>
      ) : (
        <>
            {/* Responsive Grid: 2 columns on mobile, 4 on tablet, 5 on desktop */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {filteredProducts.slice(0, visibleCount).map((product, index) => {
                const isOutOfStock = (product.stock || 0) <= 0;
                return (
                <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className={`bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col cursor-pointer animate-fade-up ${isOutOfStock ? 'opacity-80' : ''}`}
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                >
                <div className="aspect-square bg-gray-50 p-4 relative overflow-hidden flex items-center justify-center">
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className={`w-full h-full object-contain transition-transform duration-500 mix-blend-multiply ${isOutOfStock ? 'grayscale-[0.8]' : 'group-hover:scale-110'} select-none`}
                        loading="lazy"
                        draggable={false}
                    />
                    
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wide flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Stock Out
                            </span>
                        </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-bold text-gray-700">{product.rating}</span>
                    </div>

                    {/* Quick View */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 hidden md:block">
                        <button className="bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-brand-600 hover:scale-110 transition-all">
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="p-3 flex flex-col flex-grow bg-white relative z-10">
                    <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wide truncate">
                        {product.category}
                    </span>

                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 leading-snug h-9 group-hover:text-brand-600 transition-colors">
                    {product.name}
                    </h3>

                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                        <div>
                            <span className="block text-base font-black text-gray-900">
                                ৳{product.price.toLocaleString()}
                            </span>
                        </div>
                        <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={isOutOfStock}
                            className="bg-gray-100 text-gray-600 p-2 rounded-xl hover:bg-brand-600 hover:text-white transition-colors active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                </div>
            )})}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredProducts.length && (
                <div className="mt-8 flex justify-center pb-4">
                    <button 
                        onClick={handleLoadMore}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:border-brand-600 hover:text-brand-600 px-8 py-3 rounded-full font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-95 group"
                    >
                        Load More Products <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            )}
        </>
      )}
    </section>
  );
};