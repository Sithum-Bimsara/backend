import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import DealRequestWizard from './DealRequestWizard';
import { ModalCloseButton } from '../../../components/ModelCloseButton/ModalCloseButton';

type DealRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRequestSuccess?: (message: string) => void;
};

const DealRequestModal: React.FC<DealRequestModalProps> = ({ isOpen, onClose, onRequestSuccess }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(isOpen), isOpen ? 10 : 0);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-active');
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.classList.remove('modal-active');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const wizardNode = (
    <DealRequestWizard
      showIntro={false}
      compact
      showInlineSuccess={false}
      onSuccess={(message) => {
        onRequestSuccess?.(message);
        onClose();
      }}
    />
  );

  return createPortal(
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${visible ? 'bg-slate-950/60 backdrop-blur-sm' : 'bg-slate-950/0'}`}
      onClick={onClose}
    >
      {/* ── Mobile: bottom sheet ─────────────────────────────── */}
      <div
        className={`absolute bottom-0 left-0 right-0 sm:hidden flex flex-col rounded-t-[1.75rem] bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.18)] transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '92dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex shrink-0 items-center justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Sheet header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400 to-blue-600 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-600">Custom Package</p>
              <h2 className="text-sm font-bold leading-tight text-[#0e2a47]">Request a Deal</h2>
            </div>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Scrollable wizard content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {wizardNode}
        </div>
      </div>

      {/* ── Desktop: centered modal ───────────────────────────── */}
      <div className="absolute inset-0 hidden sm:flex items-start justify-center overflow-y-auto px-4 py-6 md:py-8 md:items-center">
        <div
          className={`relative w-full max-w-4xl overflow-hidden rounded-[1.75rem] shadow-[0_32px_80px_rgba(15,23,42,0.25)] transition-all duration-300 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalCloseButton
            onClick={onClose}
            className="absolute top-5 right-6 z-10"
          />
          <div className="max-h-[88vh] overflow-y-auto overscroll-contain">
            {wizardNode}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DealRequestModal;
