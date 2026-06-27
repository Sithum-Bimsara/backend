import React, { useEffect, useState } from 'react';
import type { ICommunityMedia } from '../types/community.types';

interface MediaLightboxProps {
  media: ICommunityMedia[];
  initialIndex: number;
  onClose: () => void;
}

/**
 * Full-screen lightbox modal for viewing images at full resolution
 * with keyboard navigation and smooth transitions
 */
export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % media.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [media.length, onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center animate-in zoom-in-95 duration-200"
      >
        {/* Main Image */}
        <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-black">
          <img
            src={media[currentIndex].url}
            alt={`Full view ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-sm font-semibold px-3 py-2 rounded-full">
            {currentIndex + 1} / {media.length}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200"
          aria-label="Close lightbox"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Previous Button */}
        {media.length > 1 && (
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200"
            aria-label="Previous image"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        {/* Next Button */}
        {media.length > 1 && (
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % media.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200"
            aria-label="Next image"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}

        {/* Bottom Thumbnails */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full p-2">
            {media.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-[#2dd4af] ring-2 ring-[#2dd4af]/50'
                    : 'border-white/20 hover:border-white/40 opacity-70 hover:opacity-100'
                }`}
                aria-label={`Go to image ${index + 1}`}
              >
                <img
                  src={item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Keyboard Help */}
        <div className="absolute top-4 left-4 text-white/60 text-xs font-medium hidden md:block">
          <p>↑ ESC to close • ← → to navigate</p>
        </div>
      </div>
    </div>
  );
};
