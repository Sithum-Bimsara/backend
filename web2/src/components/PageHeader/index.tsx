import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  highlightedWord?: string;
  description?: string;
  backgroundImage: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  highlightedWord,
  description,
  backgroundImage,
  children,
}) => {
  return (
    <div className="relative pt-16 pb-6 md:pt-24 md:pb-8 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#0e2a47]/90 via-[#0e2a47]/65 to-[#0e2a47]/35" />
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="font-['Playfair_Display',Georgia,serif] text-[1.8rem] md:text-[2.6rem] font-light text-white/90 mb-3 tracking-wide">
            {title} {highlightedWord && (
              <em className="text-[#2dd4af] font-['Cormorant_Garamond',Georgia,serif] italic font-semibold whitespace-nowrap not-italic">
                <span className="italic">{highlightedWord}</span>
              </em>
            )}
          </h1>
          {description && (
            <p className="text-sm md:text-base text-white/80 font-light max-w-xl animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
              {description}
            </p>
          )}
        </motion.div>
        
        {children && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
