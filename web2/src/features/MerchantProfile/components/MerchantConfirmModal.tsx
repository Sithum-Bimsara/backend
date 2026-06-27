import React from "react";
import { createPortal } from "react-dom";
import { merchantButtonClass } from "./MerchantUI";

interface MerchantConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel?: boolean;
  tone?: "danger" | "warning" | "teal" | "primary";
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export const MerchantConfirmModal: React.FC<MerchantConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  hideCancel = false,
  onConfirm,
  onCancel,
  tone = "primary",
}) => {
  const [busy, setBusy] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      setIsVisible(false);
      setIsAnimating(false);
      setBusy(false);
    }
  }, [isOpen]);

  const handleClose = React.useCallback(() => {
    if (isAnimating || busy) return;
    setIsAnimating(true);
    setIsVisible(false);
    setTimeout(onCancel, 350);
  }, [onCancel, isAnimating, busy]);

  if (!isOpen) return null;

  const confirmClass = tone === "danger"
    ? merchantButtonClass("danger")
    : tone === "warning"
      ? merchantButtonClass("warning")
      : tone === "teal"
        ? merchantButtonClass("primary")
        : merchantButtonClass("primary");

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={handleClose} 
      />

      {/* Modal Content */}
      <div 
        className={`
          relative bg-white w-full max-w-md rounded-[2rem]
          shadow-2xl will-change-transform overflow-hidden
          transition-all duration-300
          ${isVisible 
            ? 'scale-100 opacity-100' 
            : 'scale-95 opacity-0'
          }
          ease-out
        `}
      >
        {/* Mobile Drag Indicator - Removed as it's no longer a bottom sheet */}
        <div className="sm:hidden flex justify-center py-2 sticky top-0 bg-white z-20">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="px-6 py-6 border-b border-slate-100 flex gap-4 items-start" onClick={(event) => event.stopPropagation()}>
          <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
            tone === 'danger' ? 'bg-red-50 text-red-600' :
            tone === 'warning' ? 'bg-amber-50 text-amber-600' :
            tone === 'teal' ? 'bg-[#2dd4af]/10 text-[#2dd4af]' :
            'bg-blue-50 text-blue-600'
          }`}>
            {tone === 'danger' && <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
            {tone === 'warning' && <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
            {tone === 'teal' && <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
            {tone === 'primary' && <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3 bg-slate-50/50">
          {!hideCancel && (
            <button type="button" onClick={handleClose} disabled={busy} className={`${merchantButtonClass("secondary")} w-full sm:w-auto`}>
              {cancelLabel}
            </button>
          )}
          <button type="button" onClick={handleConfirm} disabled={busy} className={`${confirmClass} w-full sm:w-auto ${busy ? "opacity-60 cursor-not-allowed" : ""}`}>
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
