import React, { useState } from 'react';

interface PropertyImageGalleryProps {
  images: string[];
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ images }) => {
  const [mainIndex, setMainIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const mainImage = images[mainIndex];

  // Calculate exactly 4 images to show in the sidebar, cycling through everything
  const getGalleryIndices = () => {
    const indices = [];
    const count = Math.min(4, images.length);
    for (let i = 1; i <= count; i++) {
      indices.push((mainIndex + i) % images.length);
    }
    // If we still have fewer than 4 (unlikely but safe), we won't fill more
    return indices;
  };

  const galleryIndices = getGalleryIndices();

  const handleImageClick = (index: number) => {
    setMainIndex(index);
  };

  return (
    <div id="photos" className="max-w-[1536px] mx-auto px-0 md:px-12 lg:px-20 mt-0 md:mt-6 scroll-mt-40">
      <div className="flex flex-col md:flex-row gap-4 h-[200px] md:h-[300px] lg:h-[400px]">
        {/* Main Large Image - Left Side */}
        <div
          className="flex-1 relative group overflow-hidden cursor-pointer md:rounded-2xl shadow-md"
          onClick={() => setMainIndex((mainIndex + 1) % images.length)}
        >
          <img
            src={mainImage}
            className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
            alt="Main property view"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 text-white shadow-xl">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 text-white text-[12px] font-bold">
            Photo {mainIndex + 1} / {images.length}
          </div>
        </div>

        {/* Right Sidebar - 4 Thumbnails - Hidden on mobile */}
        <div className="hidden md:flex w-[120px] lg:w-[180px] flex-col gap-3 shrink-0">
          {galleryIndices.map((imgIndex) => (
            <div
              key={imgIndex}
              onClick={() => handleImageClick(imgIndex)}
              className="flex-1 relative group cursor-pointer overflow-hidden rounded-xl border-2 border-transparent hover:border-[#2dd4af] transition-all"
            >
              <img
                src={images[imgIndex]}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                alt={`Thumbnail ${imgIndex + 1}`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />

              {/* Optional indicator if this image is the "main" one (happens in loop) */}
              {imgIndex === mainIndex && (
                <div className="absolute inset-0 border-4 border-[#2dd4af] rounded-xl z-10 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyImageGallery;
