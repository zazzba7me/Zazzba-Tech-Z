import React, { useState, useEffect, useRef } from "react";
import { Zap, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../store";
import { CartItem } from "../types";

export const FlashSaleSection: React.FC = () => {
  const { products, openCheckout, setCurrentView, setShopConfig } = useStore();
  const [timeLeft, setTimeLeft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Dragging State
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const flashSaleProducts = products.filter(p => p.isFlashSale);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
      );
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer(); 

    return () => clearInterval(timer);
  }, []);

  // Auto Scroll Logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const autoScroll = setInterval(() => {
      if (!isPaused && !isDown && scrollContainer) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        // Check if we've reached the end
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
           scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
           // Scroll by roughly one card width + gap
           scrollContainer.scrollBy({ left: 220, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(autoScroll);
  }, [isPaused, isDown]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
        const { clientWidth } = scrollRef.current;
        const scrollAmount = direction === 'left' ? -(clientWidth / 2) : (clientWidth / 2);
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleBuyNow = (product: any) => {
    if ((product.stock || 0) > 0) {
        const item: CartItem = { ...product, quantity: 1 };
        openCheckout([item]);
    }
  };

  const handleViewAllFlashSale = () => {
      setShopConfig({ showFlashSale: true, category: 'All', subcategory: 'All' });
      setCurrentView('shop');
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
      if (!scrollRef.current) return;
      setIsDown(true);
      setIsPaused(true);
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
      setIsDown(false);
      setIsPaused(false);
      setIsDragging(false);
  };

  const handleMouseUp = () => {
      setIsDown(false);
      setIsPaused(false);
      setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDown || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed
      if (Math.abs(walk) > 5) setIsDragging(true);
      scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleCardClickCapture = (e: React.MouseEvent) => {
      if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
      }
  };

  if (flashSaleProducts.length === 0) return null;

  return (
    <section 
        className="py-8 bg-gray-900 relative overflow-hidden my-4 sm:my-8 sm:rounded-3xl sm:mx-4 group/section"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
    >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="px-4 mb-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-brand-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/40 animate-pulse">
                    <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">
                        Flash Sale
                    </h2>
                    <p className="text-brand-200 text-xs font-medium">Limited Time Offers</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Timer */}
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden sm:inline">Ending in</span>
                    <div className="flex items-center gap-2 text-white font-mono font-bold text-lg">
                        <Clock className="w-4 h-4 text-brand-400" />
                        {timeLeft}
                    </div>
                </div>
                
                <button 
                onClick={handleViewAllFlashSale}
                className="text-xs font-bold text-white border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-gray-900 transition-colors"
                >
                    View All
                </button>
            </div>
        </div>
      </div>

      {/* Navigation Buttons (Desktop) */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-4 top-1/2 mt-8 -translate-y-1/2 z-20 bg-white/10 hover:bg-white text-white hover:text-gray-900 p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/section:opacity-100 hidden md:block"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={() => scroll('right')}
        className="absolute right-4 top-1/2 mt-8 -translate-y-1/2 z-20 bg-white/10 hover:bg-white text-white hover:text-gray-900 p-3 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/section:opacity-100 hidden md:block"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Horizontal Scroll with Snap & Drag */}
      <div 
        ref={scrollRef}
        className={`flex overflow-x-auto gap-4 px-4 pb-6 no-scrollbar ${isDown ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory scroll-smooth'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {flashSaleProducts.slice(0, 8).map((product) => {
          const isOutOfStock = (product.stock || 0) <= 0;
          return (
          <div
            key={product.id}
            onClickCapture={handleCardClickCapture}
            className={`min-w-[200px] w-[200px] snap-center bg-white rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 flex flex-col relative shadow-xl shadow-black/20 ${isOutOfStock ? 'opacity-80' : ''} ${isDragging ? 'pointer-events-none' : ''}`}
          >
            {/* Discount Badge */}
            <div className="absolute top-2 left-2 z-20">
                <div className="bg-brand-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg shadow-brand-600/30">
                    -{(100 - (product.price / (product.oldPrice || (product.price * 1.2))) * 100).toFixed(0)}%
                </div>
            </div>
            
            {/* Image */}
            <div className="aspect-[4/3] p-4 bg-white relative flex items-center justify-center border-b border-gray-100">
                <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 select-none"
                    loading="lazy"
                    draggable={false}
                />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="text-white text-xs font-black uppercase border border-white/50 px-2 py-1 rounded">Stock Out</span>
                    </div>
                )}
            </div>
            
            {/* Content */}
            <div className="p-3 bg-white flex flex-col flex-grow relative z-10">
              <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 h-10 leading-tight">
                {product.name}
              </h3>
              
              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-black text-brand-600">
                    ৳{product.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                    ৳{(product.oldPrice || (product.price * 1.2)).toLocaleString()}
                    </span>
                </div>
                
                <button 
                    onClick={() => handleBuyNow(product)}
                    disabled={isOutOfStock}
                    className={`w-full text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-brand-600 shadow-brand-500/20'}`}
                >
                     {isOutOfStock ? 'Sold Out' : <>Buy Now <Zap className="w-3 h-3 fill-white" /></>}
                </button>
              </div>
            </div>
          </div>
        )})}
        {/* See More Card */}
        <div 
            onClick={handleViewAllFlashSale}
            className="min-w-[100px] snap-center bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors gap-2"
        >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-400" />
            </div>
            <span className="text-xs font-bold">View All</span>
        </div>
      </div>
    </section>
  );
};