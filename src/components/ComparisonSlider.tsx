import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ComparisonSliderProps {
  original: string;
  restored: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ original, restored }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
        setSliderPosition(percent);
      }
    },
    []
  );

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleTouchStart = useCallback(() => setIsDragging(true), []);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div 
        ref={containerRef}
        className="relative w-full max-w-4xl h-[60vh] select-none overflow-hidden rounded-xl shadow-2xl shadow-black/50 bg-gray-900 border border-gray-800"
    >
      {/* Restored Image (Background) */}
      <img
        src={restored}
        alt="Atkurta"
        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
      />

      {/* Original Image (Foreground, clipped) */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={original}
          alt="Originalas"
          className="absolute top-0 left-0 w-full h-full object-contain"
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-800">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 4.5 15.75 9" transform="rotate(90 12 12)" />
          </svg>
        </div>
      </div>
      
      {/* Labels */}
      <span className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm font-medium backdrop-blur-sm">Originalas</span>
      <span className="absolute bottom-4 right-4 bg-indigo-600/80 text-white px-2 py-1 rounded text-sm font-medium backdrop-blur-sm">Atkurta</span>
    </div>
  );
};

export default ComparisonSlider;