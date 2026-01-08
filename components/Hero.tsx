import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { useStore } from '../store';

const DEFAULT_SLIDES = [
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80", 
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80"
];

export const Hero: React.FC = () => {
  const { setCurrentView, bannerConfig } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fallback slides if DB is empty or still loading
  const slides = bannerConfig.image 
    ? [bannerConfig.image, ...DEFAULT_SLIDES.filter(s => s !== bannerConfig.image)].slice(0, 3)
    : DEFAULT_SLIDES;

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Loading Skeleton
  if (!bannerConfig.title && !bannerConfig.image) {
    return <div className="mx-4 mt-4 rounded-3xl h-[400px] bg-gray-200 animate-pulse flex items-center justify-center text-gray-400">Loading Innovation...</div>;
  }

  return (
    <div 
      className="relative overflow-hidden bg-gray-900 text-white mx-0 sm:mx-4 mt-0 sm:mt-4 sm:rounded-3xl h-[500px] sm:h-[400px] md:h-[450px] flex items-end sm:items-center shadow-xl shadow-gray-200/50 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
            <div 
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
                style={{ backgroundImage: `url('${slide}')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent sm:bg-gradient-to-r sm:from-gray-900 sm:via-gray-900/80 sm:to-transparent"></div>
        </div>
      ))}
      
      <div className="relative z-10 p-6 sm:p-12 max-w-2xl w-full pb-16 sm:pb-12 animate-fade-up">
        {bannerConfig.tagText && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 border border-white/20 shadow-lg">
                <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" /> {bannerConfig.tagText}
            </div>
        )}
        <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4 tracking-tight drop-shadow-lg"
            dangerouslySetInnerHTML={{ __html: bannerConfig.title || "Upgrade Your Life" }}
        >
        </h1>
        <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-8 font-medium max-w-sm sm:max-w-md leading-relaxed drop-shadow-md">
          {bannerConfig.subtitle || "Premium gadgets at unbeatable prices."}
        </p>
        
        <div className="flex gap-4">
            <button 
            onClick={() => setCurrentView('shop')}
            className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2 transition-all hover:bg-brand-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 group/btn"
            >
            {bannerConfig.buttonText || "Shop Now"} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end sm:justify-start sm:left-12 sm:right-auto sm:gap-4 z-20">
          <div className="flex gap-2 mb-1">
            {slides.map((_, index) => (
                <button 
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="group relative h-1 rounded-full overflow-hidden transition-all duration-300 bg-white/20 hover:h-2"
                    style={{ width: index === currentSlide ? '40px' : '20px' }}
                >
                    <div className={`absolute top-0 left-0 h-full bg-white transition-all duration-300 ${index === currentSlide ? 'w-full' : 'w-0'}`}></div>
                </button>
            ))}
          </div>
      </div>

      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10 hover:bg-white hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex">
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};