import React from 'react';
import { createPortal } from 'react-dom';

interface UnauthorizedActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'edit' | 'delete';
  type: 'post' | 'comment';
}

export const UnauthorizedActionModal: React.FC<UnauthorizedActionModalProps> = ({
  isOpen,
  onClose,
  action,
  type,
}) => {
  if (!isOpen) return null;

  const getTitle = () => {
    return `Can't ${action} this ${type}`;
  };

  const getMessage = () => {
    return `Only the person who created this ${type} can ${action} it. This ensures everyone's contributions are protected.`;
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[4000] p-4 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#0e2a47] text-center mb-3">
          {getTitle()}
        </h2>

        {/* Message */}
        <p className="text-slate-600 text-center mb-6 leading-relaxed">
          {getMessage()}
        </p>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-900 font-medium">
            <span className="font-bold">Why?</span> This protects content ownership and keeps our community safe.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-[#0e2a47] hover:bg-[#1a3a55] text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          Got It
        </button>
      </div>
    </div>,
    document.body
  );
};
