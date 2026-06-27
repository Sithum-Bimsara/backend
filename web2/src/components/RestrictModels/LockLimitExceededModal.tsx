import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

interface LockLimitExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LockLimitExceededModal: React.FC<LockLimitExceededModalProps> = ({
  isOpen,
  onClose,
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

  const handleViewMyLocks = () => {
    onClose();
    navigate('/my-deals');
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
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-amber-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#0e2a47] mb-3">
            Daily Lock Limit Reached
          </h2>

          {/* Message */}
          <p className="text-slate-600 text-[15px] leading-relaxed mb-6">
            You can lock up to 5 deals per day. Complete booking for an existing lock or try again tomorrow.
          </p>

          {/* Info Box */}
          <div className="bg-amber-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span className="text-sm text-slate-600 text-left">Locks expire after 1 hours if not booked</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-sm text-slate-600 text-left">Complete booking to free up lock slots</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-sm text-slate-600 text-left">Limit resets daily at midnight</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 flex-col">
            <button
              onClick={handleViewMyLocks}
              className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all active:scale-[0.98]"
            >
              View My Locks
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LockLimitExceededModal;
