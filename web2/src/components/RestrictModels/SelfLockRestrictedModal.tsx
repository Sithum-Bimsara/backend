import React from 'react';
import { createPortal } from 'react-dom';

interface SelfLockRestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SelfLockRestrictedModal: React.FC<SelfLockRestrictedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    }

    setVisible(false);
  }, [isOpen]);

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
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
      className={`fixed inset-0 z-60 flex items-center justify-center transition-all duration-300 ${
        visible ? 'bg-black/40' : 'bg-black/0'
      }`}
    >
      <div
        className={`bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 relative ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-400 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0e2a47] mb-3">Locked to You</h2>

          <p className="text-slate-600 text-[15px] leading-relaxed mb-6">
            You cannot lock or book your own deals. This feature is intended for your customers to reserve your services.
          </p>

          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-[#0e2a47] hover:bg-[#16385d] text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SelfLockRestrictedModal;
