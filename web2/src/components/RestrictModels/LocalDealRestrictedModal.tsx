import React from 'react';
import { createPortal } from 'react-dom';

interface LocalDealRestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocalDealRestrictedModal: React.FC<LocalDealRestrictedModalProps> = ({
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
            <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-orange-400 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-orange-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l9 16H3L12 2z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <circle cx="12" cy="17" r="1" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0e2a47] mb-3">Local Resident Only</h2>

          <p className="text-slate-600 text-[15px] leading-relaxed mb-6">
            This deal is restricted to local residents.
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

export default LocalDealRestrictedModal;
