import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

interface RoleRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName: string;
}

const RoleRequirementModal: React.FC<RoleRequirementModalProps> = ({
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

  const handleRegisterClick = () => {
    onClose();
    navigate('/register');
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
            <div className="w-16 h-16 rounded-full bg-[#fff9eb] border-2 border-[#ffb800] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-[#ffb800]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#0e2a47] mb-3">
            Become a Traveller
          </h2>

          {/* Message */}
          <p className="text-slate-600 text-[15px] leading-relaxed mb-6">
            To {actionName}, you need to register as a traveller first. Create a traveller profile and start exploring amazing deals!
          </p>

          {/* Feature List */}
          <div className="bg-[#f0fdf9] rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#2dd4af] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-sm text-slate-600 text-left">Lock deals to reserve spots</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#2dd4af] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-sm text-slate-600 text-left">Book amazing travel deals</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#2dd4af] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-sm text-slate-600 text-left">Get exclusive travel discounts</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleRegisterClick}
              className="flex-1 px-6 py-3 bg-[#2dd4af] hover:bg-[#1fb899] text-white font-bold rounded-xl shadow-lg shadow-[#2dd4af]/20 hover:shadow-[#2dd4af]/30 transition-all active:scale-[0.98]"
            >
              Register as Traveller
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RoleRequirementModal;
