import React, { useState } from 'react';
import { MediaLightbox } from './MediaLightbox.tsx';
import type { ICommunityMedia } from '../types/community.types';

interface PostMediaGalleryProps {
  media?: ICommunityMedia[];
  onRemove?: (url: string) => void;
}

/**
 * Production-quality media gallery with:
 * - Smart responsive layout based on image count
 * - Carousel slider for multiple images
 * - Lightbox modal for full-resolution viewing
 * - Compact display to avoid bloating post height
 */
export const PostMediaGallery: React.FC<PostMediaGalleryProps> = ({ media, onRemove }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const visibleMediaCount = Math.min(media.length, 4);
  const extraCount = media.length - visibleMediaCount;

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  // ─── 1 Image: Full width with aspect ratio ───
  if (media.length === 1) {
    return (
      <>
        <div
          onClick={(e) => {
            e.stopPropagation();
            openLightbox(0);
          }}
          className="mt-3 cursor-pointer rounded-2xl overflow-hidden border border-black/5 bg-slate-100 aspect-video hover:shadow-lg transition-shadow duration-200 group relative"
        >
          <img
            src={media[0].url}
            alt="Community media"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(media[0].url);
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-500 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200 z-10"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {lightboxOpen && (
          <MediaLightbox
            media={media}
            initialIndex={currentImageIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </>
    );
  }

  // ─── 2+ Images: Carousel slider (show 1 at a time) ───
  return (
    <>
      <div className="mt-3 relative group">
        {/* Main Carousel Display */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            openLightbox(currentImageIndex);
          }}
          className="cursor-pointer rounded-2xl overflow-hidden border border-black/5 bg-slate-100 aspect-video hover:shadow-lg transition-shadow duration-200 group relative"
        >
          <img
            src={media[currentImageIndex].url}
            alt={`Gallery ${currentImageIndex + 1}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(media[currentImageIndex].url);
                // If we remove the last item, go to previous index
                if (currentImageIndex > 0 && currentImageIndex === media.length - 1) {
                  setCurrentImageIndex(prev => prev - 1);
                }
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-rose-500 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200 z-10"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {currentImageIndex + 1} / {media.length}
          </div>

          {/* Total extra images badge */}
          {extraCount > 0 && (
            <div className="absolute top-2 right-2 bg-[#2dd4af]/90 backdrop-blur-sm text-[#0e2a47] text-xs font-bold px-2.5 py-1 rounded-full">
              +{extraCount} more
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev - 1 + media.length) % media.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-[#0e2a47] transition-all duration-200 opacity-0 group-hover:opacity-100 group hover:opacity-100"
              aria-label="Previous image"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev + 1) % media.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-[#0e2a47] transition-all duration-200 opacity-0 group-hover:opacity-100 group hover:opacity-100"
              aria-label="Next image"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {media.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentImageIndex
                    ? 'bg-[#2dd4af] w-6'
                    : 'bg-slate-300 w-1.5 hover:bg-slate-400'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <MediaLightbox
          media={media}
          initialIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};
