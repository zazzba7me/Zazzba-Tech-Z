import React, { useRef, useState } from "react";
import { useStore } from "../store";
import { 
    Smartphone, Watch, Headphones, Laptop, Gamepad2, Camera, Speaker, 
    HardDrive, Wifi, Battery, Monitor, Printer, Tablet, Tv, Cable, 
    Mouse, Keyboard, Cpu, Server, Home, Music, Video, Book, Zap, 
    Grid, Package, Layers, Tag, Gift, Star 
} from "lucide-react";

// Map of string names to Icon components
const ICON_MAP: Record<string, any> = {
    'Smartphone': Smartphone,
    'Watch': Watch,
    'Audio': Headphones,
    'Laptop': Laptop,
    'Game': Gamepad2,
    'Camera': Camera,
    'Speaker': Speaker,
    'Storage': HardDrive,
    'Wifi': Wifi,
    'Power': Battery,
    'Monitor': Monitor,
    'Printer': Printer,
    'Tablet': Tablet,
    'TV': Tv,
    'Cable': Cable,
    'Mouse': Mouse,
    'Keyboard': Keyboard,
    'CPU': Cpu,
    'Server': Server,
    'Home': Home,
    'Music': Music,
    'Video': Video,
    'Book': Book,
    'Zap': Zap,
    'Grid': Grid,
    'Package': Package,
    'Layer': Layers,
    'Tag': Tag,
    'Gift': Gift,
    'Star': Star,
};

export const Categories: React.FC = () => {
  const { categories, setSearchQuery } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag State
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const getIcon = (cat: any) => {
      if (cat.icon) return cat.icon;
      if (cat.iconName && ICON_MAP[cat.iconName]) return ICON_MAP[cat.iconName];
      return Layers; // Fallback
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) setIsDragging(true);
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleClick = (name: string) => {
      if (!isDragging) {
          setSearchQuery(name);
      }
  };

  return (
    <section className="py-6 bg-white border-t border-gray-100">
      <div className="px-4 max-w-7xl mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Featured Categories</h2>
        
        {/* Horizontal scroll container for mobile, grid for larger screens */}
        <div 
            ref={scrollRef}
            className={`flex md:grid md:grid-cols-6 gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
        >
          {categories.map((cat) => {
            const Icon = getIcon(cat);
            return (
            <div 
                key={cat.id} 
                onClick={() => handleClick(cat.name)}
                className={`flex flex-col items-center gap-2 group cursor-pointer min-w-[70px] flex-shrink-0 ${isDragging ? 'pointer-events-none' : ''}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-brand-200 group-hover:bg-brand-50 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 overflow-hidden relative select-none">
                {cat.iconUrl ? (
                   <img src={cat.iconUrl} alt={cat.name} className="w-full h-full object-cover" draggable={false} />
                ) : (
                   <Icon className="w-7 h-7 text-gray-600 group-hover:text-brand-600 transition-colors" />
                )}
                {/* Subcategory Indicator Dot */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full border border-white"></div>
                )}
              </div>
              <span className="text-xs font-bold text-gray-600 group-hover:text-brand-600 transition-colors text-center whitespace-nowrap select-none">
                {cat.name}
              </span>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
};