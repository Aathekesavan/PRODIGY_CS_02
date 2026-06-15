import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ImageSliderProps {
  original: string;
  processed: string;
  originalLabel?: string;
  processedLabel?: string;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  original,
  processed,
  originalLabel = 'SOURCE IMAGE',
  processedLabel = 'ENCRYPTED CIPHER'
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video md:aspect-[16/10] bg-cyber-dark border border-cyber-border rounded-lg overflow-hidden select-none"
    >
      {/* Background/Original Image */}
      <img 
        src={original} 
        alt="Original" 
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      <div className="absolute top-3 left-3 bg-cyber-dark/85 border border-cyber-cyan/30 px-3 py-1 text-xs font-mono text-cyber-cyan tracking-wider flex items-center gap-1.5 backdrop-blur-md rounded shadow-lg">
        <Eye className="w-3.5 h-3.5" />
        {originalLabel}
      </div>

      {/* Foreground/Processed Image with clipping mask */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
      >
        <img 
          src={processed} 
          alt="Processed" 
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <div className="absolute top-3 right-3 bg-cyber-dark/85 border border-cyber-purple/30 px-3 py-1 text-xs font-mono text-cyber-purple tracking-wider flex items-center gap-1.5 backdrop-blur-md rounded shadow-lg">
          <EyeOff className="w-3.5 h-3.5" />
          {processedLabel}
        </div>
      </div>

      {/* Slider line & handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-cyber-cyan cursor-ew-resize select-none pointer-events-auto"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Glow Line */}
        <div className="absolute inset-0 w-full h-full bg-cyber-cyan/50 blur-[2px]"></div>

        {/* Grab Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyber-dark border-2 border-cyber-cyan flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-transform duration-200 active:scale-90">
          <div className="flex gap-0.5 justify-center items-center">
            <span className="w-0.5 h-3 bg-cyber-cyan rounded"></span>
            <span className="w-0.5 h-3 bg-cyber-cyan rounded"></span>
            <span className="w-0.5 h-3 bg-cyber-cyan rounded"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
