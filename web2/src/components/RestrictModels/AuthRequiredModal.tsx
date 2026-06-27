import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName: string;
}

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  actionName = 'lock or book deals',
}) => {
  const navigate = useNavigate();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const handleSignUpClick = () => {
    onClose();
    navigate('/register');
  };

  const handleSignInClick = () => {
    onClose();
    navigate('/login');
  };

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        visible ? 'bg-black/40' : 'bg-black/0'
      }`}
    >
      <div
        className={`bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-400 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#0e2a47] mb-3">
            Sign in to Continue
          </h2>

          {/* Message */}
          <p className="text-slate-600 text-[15px] leading-relaxed mb-6">
            To {actionName}, you need to sign in or create an account. Join our community of travellers and start exploring amazing deals!
          </p>

          {/* Feature List */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-sm text-slate-600 text-left">Access exclusive travel deals</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-sm text-slate-600 text-left">Lock and book amazing trips</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-sm text-slate-600 text-left">Manage your reservations</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 flex-col">
            <button
              onClick={handleSignUpClick}
              className="w-full px-6 py-3 bg-[#2dd4af] hover:bg-[#1fb899] text-white font-bold rounded-xl shadow-lg shadow-[#2dd4af]/20 hover:shadow-[#2dd4af]/30 transition-all active:scale-[0.98]"
            >
              Create New Account
            </button>
            <button
              onClick={handleSignInClick}
              className="w-full px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Sign In
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            No payment required to lock or view deals
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthRequiredModal;
