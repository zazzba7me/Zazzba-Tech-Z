import React, { useState } from "react";
import { Star, ShoppingCart, Zap, Eye, Filter, SlidersHorizontal, ArrowLeft, X, AlertCircle, Clock, Tag } from "lucide-react";
import { useStore } from "../store";
import { CartItem } from "../types";

export const Shop: React.FC = () => {
  const { 
    products, 
    categories, 
    addToCart, 
    setSelectedProduct, 
    setActiveModal, 
    openCheckout, 
    setCurrentView, 
    searchQuery, 
    setSearchQuery,
    shopConfig,
    setShopConfig,
    resetShopConfig
  } = useStore();
  
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high">("newest");

  // Find current category object
  const currentCategoryObj = categories.find(c => c.name === shopConfig.category);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = shopConfig.category === "All" || product.category === shopConfig.category;
      const matchesSubcategory = shopConfig.subcategory === "All" || product.subcategory === shopConfig.subcategory;
      const matchesFlashSale = !shopConfig.showFlashSale || product.isFlashSale;
      
      return matchesSearch && matchesCategory && matchesSubcategory && matchesFlashSale;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0; // Newest (default order in array)
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

  const handleBuyNow = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if ((product.stock || 0) > 0) {
        const item: CartItem = { ...product, quantity: 1 };
        openCheckout([item]);
    }
  };

  const handleClearFilters = () => {
      resetShopConfig();
      setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Shop Header */}
      <div className="bg-white sticky top-[60px] z-20 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setCurrentView('home')} className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-black text-gray-900">
                    {shopConfig.showFlashSale ? 'Flash Sales' : 'Shop'}
                </h1>
                
                {(shopConfig.category !== "All" || shopConfig.subcategory !== "All" || searchQuery || shopConfig.showFlashSale) && (
                    <button 
                        onClick={handleClearFilters}
                        className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-100 transition-colors"
                    >
                        Clear Filters <X className="w-3 h-3" />
                    </button>
                )}
            </div>
            
            {/* Flash Sale Banner if Active */}
            {shopConfig.showFlashSale && (
                <div className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 flex items-center justify-between text-white shadow-lg shadow-gray-900/10 animate-fade-up">
                    <div className="flex items-center gap-3">
                         <div className="bg-brand-600 p-2 rounded-lg animate-pulse">
                            <Zap className="w-5 h-5 text-white" />
                         </div>
                         <div>
                             <h3 className="font-bold text-lg leading-tight">Flash Deals Active</h3>
                             <p className="text-xs text-gray-400">Limited time offers. Grab them before stock runs out!</p>
                         </div>
                    </div>
                    <Tag className="w-8 h-8 text-gray-700 -rotate-12 opacity-50" />
                </div>
            )}

            <div className="flex flex-col gap-4">
                {/* Categories - Hide if Flash Sale Mode to keep it focused, or show to filter within Flash Sale. Let's show to allow filtering. */}
                <div className="flex justify-between items-center gap-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-grow">
                        <button 
                            onClick={() => setShopConfig({ category: "All", subcategory: "All" })}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${shopConfig.category === "All" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-900"}`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setShopConfig({ category: cat.name, subcategory: "All" })}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${shopConfig.category === cat.name ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-900"}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 shrink-0">
                        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="text-xs font-bold bg-transparent border-none outline-none text-gray-700 cursor-pointer"
                        >
                            <option value="newest">Newest</option>
                            <option value="price_low">Price: Low</option>
                            <option value="price_high">Price: High</option>
                        </select>
                    </div>
                </div>

                {/* Subcategories (Conditional) */}
                {shopConfig.category !== "All" && currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 animate-fade-up">
                        <button 
                            onClick={() => setShopConfig({ subcategory: "All" })}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${shopConfig.subcategory === "All" ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                        >
                            All {shopConfig.category}
                        </button>
                        {currentCategoryObj.subcategories.map(sub => (
                            <button 
                                key={sub.id}
                                onClick={() => setShopConfig({ subcategory: sub.name })}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${shopConfig.subcategory === sub.name ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
                const isOutOfStock = (product.stock || 0) <= 0;
                return (
                <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer animate-fade-up ${isOutOfStock ? 'opacity-75 grayscale-[0.5] border-gray-100' : shopConfig.showFlashSale ? 'border-brand-200 shadow-brand-100' : 'border-gray-100 hover:border-brand-200'}`}
                >
                <div className="aspect-square bg-white p-4 relative overflow-hidden flex items-center justify-center">
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                    />
                    
                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                            <span className="bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm uppercase tracking-wide">Out of Stock</span>
                        </div>
                    )}
                    
                    {/* Flash Sale Badge */}
                    {product.isFlashSale && !isOutOfStock && (
                        <div className="absolute top-0 left-0">
                            <span className="bg-brand-500 text-white text-[9px] font-black px-2 py-1 rounded-br-lg shadow-sm">FLASH</span>
                        </div>
                    )}

                    {/* Quick View Badge */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-gray-600">
                            <Eye className="w-4 h-4" />
                        </div>
                    </div>
                </div>
                
                <div className="p-3 flex flex-col flex-grow bg-white relative z-10 border-t border-gray-50">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] uppercase font-bold text-gray-400 truncate max-w-[70%]">
                            {product.category}
                            {product.subcategory && <span className="text-gray-300 font-medium normal-case"> / {product.subcategory}</span>}
                        </span>
                        <div className="flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-[10px] font-bold text-gray-600">{product.rating}</span>
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 leading-snug group-hover:text-brand-600 transition-colors h-9">
                        {product.name}
                    </h3>

                    <div className="mt-auto">
                        <div className="flex items-end gap-1.5 mb-2">
                            <span className="text-base font-extrabold text-brand-600">
                                ৳{product.price.toLocaleString()}
                            </span>
                            {product.oldPrice && (
                                <span className="text-xs text-gray-400 line-through mb-0.5">
                                    ৳{product.oldPrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={isOutOfStock}
                                className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-bold uppercase hover:bg-gray-200 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart className="w-3 h-3" /> Add
                            </button>
                            <button 
                                onClick={(e) => handleBuyNow(e, product)}
                                disabled={isOutOfStock}
                                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-white text-[10px] font-bold uppercase shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${isOutOfStock ? 'bg-gray-400' : 'bg-brand-600 hover:bg-brand-700'}`}
                            >
                                {isOutOfStock ? <AlertCircle className="w-3 h-3" /> : <Zap className="w-3 h-3 fill-white" />} 
                                {isOutOfStock ? 'Stock Out' : 'Buy'}
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            )})}
        </div>
        
        {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-400">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No products found matching your criteria.</p>
                <button onClick={handleClearFilters} className="text-brand-600 font-bold text-sm mt-2 hover:underline">Clear Filters</button>
            </div>
        )}
      </div>
    </div>
  );
};