import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  action: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  action,
}) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-active');
      return () => {
        document.body.style.overflow = '';
        document.body.classList.remove('modal-active');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginClick = () => {
    onClose();
    navigate('/login');
  };

  const handleSignUpClick = () => {
    onClose();
    navigate('/register');
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-4000 p-4 animate-in fade-in duration-200">
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
          <div className="w-16 h-16 rounded-full bg-[#2dd4af]/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#0e2a47] text-center mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-slate-600 text-center mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Info */}
        <div className="bg-[#f0fdf9] border border-[#2dd4af]/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-[#0e2a47] font-medium">
            <span className="font-bold">You're about to:</span> {action}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLoginClick}
            className="w-full px-4 py-3 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Sign In to Your Account
          </button>
          <button
            onClick={handleSignUpClick}
            className="w-full px-4 py-3 bg-[#0e2a47] hover:bg-[#1a3a55] text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Create New Account
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-sm transition-all"
          >
            Maybe Later
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-slate-500 text-center mt-5">
          Creating an account only takes a minute and lets you participate in our community!
        </p>
      </div>
    </div>,
    document.body
  );
};
