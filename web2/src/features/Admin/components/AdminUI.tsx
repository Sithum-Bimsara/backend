import React from "react";
import { createPortal } from "react-dom";

type AdminPageShellProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}>;

export const AdminPageShell: React.FC<AdminPageShellProps> = ({
  title,
  subtitle,
  actions,
  children,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500 font-medium">{subtitle}</p>}
        </div>
        {actions && <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:items-center gap-3 lg:justify-end">{actions}</div>}
      </div>
      {children}
    </div>
  );
};

export const AdminCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 w-full ${className}`}>{children}</div>
);

export const StatCard: React.FC<{ label: string; value: string | number; hint?: string; tone?: "indigo" | "emerald" | "amber" | "rose" }> = ({
  label,
  value,
  hint,
  tone = "indigo",
}) => {
  const iconToneClasses = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-600",
    rose: "bg-rose-600",
  }[tone];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 transition-all hover:shadow-md h-full w-full">
      <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${iconToneClasses} text-white flex items-center justify-center font-bold mb-4 shadow-sm`}>
        {String(value).slice(0, 2)}
      </div>
      <div className="text-[12px] md:text-sm text-slate-500 font-bold uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
      {hint && <div className="mt-2 text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">{hint}</div>}
    </div>
  );
};

export const Badge: React.FC<{ tone: "gray" | "green" | "yellow" | "red" | "indigo"; children: React.ReactNode }> = ({ tone, children }) => {
  const toneClasses = {
    gray: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700",
  }[tone];

  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${toneClasses}`}>{children}</span>;
};

const adminButtonClass = (
  variant: "primary" | "secondary" | "success" | "warning" | "danger" = "secondary"
) => {
  const toneClasses = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    warning: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    danger: "bg-rose-50 text-rose-700 hover:bg-rose-100",
  }[variant];

  return `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${toneClasses}`;
};

export const AdminActionButton: React.FC<{
  onClick: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  children: React.ReactNode;
  showArrow?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}> = ({ onClick, variant = "secondary", children, showArrow = true, type = "button", disabled = false, className = "" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${adminButtonClass(variant)} ${disabled ? "opacity-60 cursor-not-allowed hover:translate-y-0" : ""} ${className}`}
  >
    {showArrow && (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
      </svg>
    )}
    {children}
  </button>
);

export const AdminTableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 6, cols = 5 }) => (
  <div className="space-y-4">
    {/* Desktop Table Skeleton */}
    <AdminCard className="hidden md:block overflow-hidden border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {Array.from({ length: cols }).map((_, idx) => (
                <th key={`head-${idx}`} className="px-6 py-4">
                  <div className="h-2.5 w-16 rounded bg-slate-200 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={`row-${rIdx}`}>
                {Array.from({ length: cols }).map((_, cIdx) => (
                  <td key={`cell-${rIdx}-${cIdx}`} className="px-6 py-5">
                    <div className="h-3 w-full max-w-[140px] rounded bg-slate-100 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>

    {/* Mobile Card Skeleton */}
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <AdminCard key={`mob-skel-${rIdx}`} className="p-5 space-y-4 shadow-sm border-slate-100">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2.5">
              <div className="h-4 w-3/4 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-3 w-1/2 rounded-md bg-slate-100 animate-pulse" />
            </div>
            <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
          </div>
          
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <div className="h-2 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <div className="h-9 flex-1 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-9 flex-1 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </AdminCard>
      ))}
    </div>
  </div>
);

export const AdminCardsSkeleton: React.FC<{ cards?: number }> = ({ cards = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: cards }).map((_, idx) => (
      <AdminCard key={`card-${idx}`} className="p-6 border-slate-100 shadow-sm">
        <div className="w-11 h-11 rounded-xl bg-slate-200 animate-pulse mb-4" />
        <div className="space-y-2">
          <div className="h-2.5 w-24 rounded bg-slate-100 animate-pulse" />
          <div className="h-6 w-16 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="mt-4 pt-4 border-t border-slate-50">
          <div className="h-2 w-32 rounded bg-slate-50 animate-pulse" />
        </div>
      </AdminCard>
    ))}
  </div>
);

export const AdminConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "indigo";
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) => {
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setBusy(false);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, busy, onCancel]);

  if (!isOpen) return null;

  const confirmClass = tone === "danger"
    ? adminButtonClass("danger")
    : tone === "warning"
      ? adminButtonClass("warning")
      : adminButtonClass("primary");

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => !busy && onCancel()}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200" onClick={(event) => event.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className={adminButtonClass("secondary")}>
            {cancelLabel}
          </button>
          <button type="button" onClick={handleConfirm} disabled={busy} className={`${confirmClass} ${busy ? "opacity-60 cursor-not-allowed" : ""}`}>
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
