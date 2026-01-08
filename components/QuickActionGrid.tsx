import React, { useRef, useState } from "react";
import { QUICK_ACTIONS } from "../constants";
import { useStore } from "../store";

export const QuickActionGrid: React.FC = () => {
  const { setActiveModal } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Drag State
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleActionClick = (id: string) => {
    if (isDragging) return; // Prevent click if dragging
    if (id === 'tracking') {
      setActiveModal('tracking');
    }
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

  return (
    <section className="pt-6 pb-2 px-4 max-w-7xl mx-auto">
      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        className={`flex gap-3 overflow-x-auto no-scrollbar pb-2 ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            className={`flex items-center gap-2 px-4 py-3 bg-white rounded-full shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all active:scale-95 whitespace-nowrap group shrink-0 ${isDragging ? 'pointer-events-none' : ''}`}
          >
            <div className={`p-1.5 rounded-full bg-gradient-to-br ${action.gradient} text-white shadow-sm group-hover:scale-110 transition-transform`}>
              <action.icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-700 group-hover:text-brand-600 transition-colors">
              {action.title}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};