'use client';

import React, { useEffect, useState } from 'react';

interface ImagePreviewProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  onDelete?: (index: number) => void;
}

export default function ImagePreview({ images, initialIndex = 0, onClose, onDelete }: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Escape', 'Esc', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }

      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    // Prevent background scrolling while preview is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.body.style.overflow = '';
    };
  }, [images.length, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;

    // Swipe left (next image)
    if (diff > 50) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setTouchStart(null);
    }
    // Swipe right (prev image)
    if (diff < -50) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-[10005] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-[10006]">
        {onDelete && (
          <button 
            type="button"
            className="text-red-400 hover:text-red-300 text-sm transition-colors p-2 bg-black/60 hover:bg-black/80 rounded-md flex items-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Are you sure you want to delete this image?")) {
                const targetIdx = currentIndex;
                onDelete(targetIdx);
                if (images.length <= 1) {
                  onClose();
                } else {
                  setCurrentIndex((prev) => (prev >= images.length - 1 ? Math.max(0, images.length - 2) : prev));
                }
              }
            }}
            title="Delete Image"
          >
            <i className="fa-solid fa-trash-can"></i>
            <span>Delete</span>
          </button>
        )}
        <button 
          className="text-white text-3xl hover:text-gray-300 transition-colors p-1"
          onClick={onClose}
        >
          &times;
        </button>
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 text-white text-lg font-medium bg-black/50 px-3 py-1 rounded-full z-[201]">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main Image */}
      <div 
        className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 1 && (
          <button 
            className="absolute left-0 text-white text-4xl p-4 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
          >
            &#8249;
          </button>
        )}

        <img 
          src={images[currentIndex]} 
          alt={`Preview ${currentIndex + 1}`} 
          className="max-w-full max-h-full object-contain"
        />

        {images.length > 1 && (
          <button 
            className="absolute right-0 text-white text-4xl p-4 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          >
            &#8250;
          </button>
        )}
      </div>

      {/* Thumbnail strip (optional, can be disabled if too cluttered) */}
      {images.length > 1 && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <img 
              key={idx}
              src={img}
              alt={`Thumb ${idx + 1}`}
              className={`w-16 h-16 object-cover rounded cursor-pointer border-2 transition-all ${idx === currentIndex ? 'border-white scale-110 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
