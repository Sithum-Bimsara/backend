import React from 'react';
import { motion } from 'framer-motion';

interface FormErrorBannerProps {
  error: string | null | undefined;
}

const FormErrorBanner: React.FC<FormErrorBannerProps> = ({ error }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 shadow-xs"
    >
      <div className="h-8 w-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <span className="text-xs font-bold uppercase tracking-wide leading-tight">
        {error}
      </span>
    </motion.div>
  );
};

export default FormErrorBanner;
