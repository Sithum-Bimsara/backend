import React from "react";

type MerchantPageShellProps = React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}>;

export const MerchantPageShell: React.FC<MerchantPageShellProps> = ({
  title,
  subtitle,
  actions,
  children,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0e2a47]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
};

export const MerchantCard: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

export const MerchantStepHeader: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <div className="mb-6 md:mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight capitalize">{title}</h2>
    <p className="mt-1 md:mt-2 text-xs md:text-sm text-slate-500 leading-relaxed max-w-2xl">
      {description}
    </p>
  </div>
);

export const MerchantStatCard: React.FC<{
  label: string;
  value: string | number;
  hint?: string;
  tone?: "teal" | "emerald" | "blue" | "orange";
}> = ({ label, value, hint, tone = "teal" }) => {
  const iconToneClasses = {
    teal: "bg-[#2dd4af]",
    emerald: "bg-emerald-600",
    blue: "bg-blue-600",
    orange: "bg-orange-600",
  }[tone];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className={`w-11 h-11 rounded-xl ${iconToneClasses} text-white flex items-center justify-center font-bold mb-4`}>
        {String(value).slice(0, 2)}
      </div>
      <div className="text-sm text-slate-500 font-medium">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="mt-2 text-xs text-slate-400">{hint}</div>}
    </div>
  );
};

export const MerchantBadge: React.FC<{
  tone: "gray" | "green" | "yellow" | "red" | "teal" | "orange";
  children: React.ReactNode;
}> = ({ tone, children }) => {
  const toneClasses = {
    gray: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-rose-50 text-rose-700",
    teal: "bg-[#2dd4af]/10 text-[#2dd4af]",
    orange: "bg-orange-50 text-orange-700",
  }[tone];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${toneClasses}`}>
      {children}
    </span>
  );
};

export const merchantButtonClass = (
  variant: "primary" | "secondary" | "success" | "warning" | "danger" = "secondary"
) => {
  const toneClasses = {
    primary: "bg-[#2dd4af] text-white hover:bg-[#25b898]",
    secondary: "bg-[#2dd4af]/10 text-[#2dd4af] hover:bg-[#2dd4af]/20",
    success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    warning: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    danger: "bg-rose-50 text-rose-700 hover:bg-rose-100",
  }[variant];

  return `inline-flex items-center justify-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${toneClasses}`;
};

export const MerchantActionButton: React.FC<{
  onClick: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  children: React.ReactNode;
  showArrow?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}> = ({ onClick, variant = "secondary", children, showArrow = true, type = "button", disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${merchantButtonClass(variant)} ${disabled ? "opacity-60 cursor-not-allowed hover:translate-y-0" : ""}`}
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

export const MerchantTableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 6, cols = 5 }) => (
  <MerchantCard className="overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: cols }).map((_, idx) => (
              <th key={`head-${idx}`} className="px-4 py-3">
                <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={`row-${rIdx}`} className="border-t border-slate-100">
              {Array.from({ length: cols }).map((_, cIdx) => (
                <td key={`cell-${rIdx}-${cIdx}`} className="px-4 py-4">
                  <div className="h-3 w-full max-w-36 rounded bg-slate-200 animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </MerchantCard>
);

export const MerchantCardsSkeleton: React.FC<{ cards?: number }> = ({ cards = 6 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
    {Array.from({ length: cards }).map((_, idx) => (
      <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100" />
          <div className="h-4 w-12 bg-slate-50 rounded-full" />
        </div>
        <div className="h-3 w-20 bg-slate-100 rounded mb-2" />
        <div className="h-8 w-24 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

export const MerchantDealsSkeleton: React.FC<{ cards?: number }> = ({ cards = 8 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {Array.from({ length: cards }).map((_, idx) => (
      <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col animate-pulse">
        <div className="h-40 bg-slate-100" />
        <div className="p-4 flex-1 flex flex-col">
          <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-1/2 bg-slate-100 rounded mb-4" />
          <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
            <div className="h-5 w-16 bg-slate-200 rounded" />
            <div className="flex gap-3">
              <div className="h-3 w-8 bg-slate-100 rounded" />
              <div className="h-3 w-8 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const MerchantSettingsSkeleton: React.FC = () => (
  <div className="flex flex-col xl:flex-row gap-8 w-full animate-pulse">
    {/* Left Column Skeleton */}
    <div className="w-full xl:w-95 shrink-0 flex flex-col h-full">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="h-32 bg-slate-100 relative"></div>
        <div className="relative px-6 pb-8 flex flex-col items-center -mt-14">
          <div className="w-28 h-28 rounded-full bg-slate-200 border-[5px] border-white mb-4"></div>
          <div className="h-6 w-32 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-slate-100 rounded mb-6"></div>
          <div className="w-full h-20 bg-slate-50 rounded-2xl border border-slate-100"></div>
          <div className="h-6 w-24 bg-slate-100 rounded mt-12 mb-6 mr-auto"></div>
          <div className="w-full h-24 bg-red-50/30 rounded-3xl border border-red-50"></div>
        </div>
      </div>
    </div>

    {/* Right Column Skeleton */}
    <div className="flex-1 w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-4">
      <div className="h-7 w-40 bg-slate-200 rounded mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <div className="h-3 w-24 bg-slate-100 rounded mb-3"></div>
          <div className="h-12 w-full bg-slate-50 rounded-xl"></div>
        </div>
        <div className="md:col-span-2">
          <div className="h-3 w-32 bg-slate-100 rounded mb-3"></div>
          <div className="h-32 w-full bg-slate-50 rounded-xl"></div>
        </div>
        <div>
          <div className="h-3 w-28 bg-slate-100 rounded mb-3"></div>
          <div className="h-12 w-full bg-slate-50 rounded-xl"></div>
        </div>
        <div>
          <div className="h-3 w-16 bg-slate-100 rounded mb-3"></div>
          <div className="h-12 w-full bg-slate-50 rounded-xl"></div>
        </div>
        <div>
          <div className="h-3 w-20 bg-slate-100 rounded mb-3"></div>
          <div className="h-12 w-full bg-slate-50 rounded-xl"></div>
        </div>
        <div>
          <div className="h-3 w-20 bg-slate-100 rounded mb-3"></div>
          <div className="h-12 w-full bg-slate-50 rounded-xl"></div>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <div className="h-12 w-32 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

export const MerchantManageDealSkeleton: React.FC = () => (
  <div className="bg-(--app-bg) min-h-screen animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-white border-b border-slate-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-16 h-8 bg-slate-100 rounded-lg" />
            <div className="flex flex-col gap-1">
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-4 w-12 bg-slate-50 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="h-9 w-80 bg-slate-100/50 rounded-xl" />
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-5xl">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-8 w-24 bg-slate-50 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-2.5 w-20 bg-slate-100 rounded" />
              <div className="h-11 w-full bg-slate-50 rounded-xl border border-slate-100" />
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-2.5 w-24 bg-slate-100 rounded" />
          <div className="h-32 w-full bg-slate-50 rounded-xl border border-slate-100" />
        </div>
      </div>
    </div>
  </div>
);

{/* Itinerary Skeleton */ }
<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
  <div className="h-6 w-28 bg-slate-200 rounded" />
  {Array.from({ length: 2 }).map((_, i) => (
    <div key={`itin-${i}`} className="flex gap-4">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-xl bg-[#2dd4af]/20" />
        <div className="w-0.5 h-18 bg-slate-100 mt-2" />
      </div>
      <div className="flex-1 pt-1 space-y-2">
        <div className="h-4 w-56 bg-slate-200 rounded" />
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-5/6 bg-slate-100 rounded" />
        <div className="h-3 w-2/3 bg-slate-100 rounded" />
      </div>
    </div>
  ))}
</div>
  ;

const DealPageHeaderSkeleton: React.FC<{ activeTab: 'details' | 'availability' | 'bookings' }> = ({ activeTab }) => (
  <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 py-3">
        <div className="h-8 w-16 bg-slate-50 rounded-lg" />
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="h-4 w-48 bg-slate-100 rounded" />
          <div className="h-5 w-16 bg-slate-50 rounded-full" />
          <div className="h-7 w-7 rounded-lg bg-slate-50 ml-1" /> {/* Refresh button skeleton */}
        </div>
        {activeTab === 'availability' && (
          <div className="h-8 w-24 bg-[#2dd4af]/10 rounded-lg" />
        )}
      </div>
      <div className="flex items-center justify-center sm:justify-start gap-0 border-t border-slate-100">
        {[1, 2, 3].map((i) => {
          const isTabActive = (activeTab === 'details' && i === 1) || 
                             (activeTab === 'availability' && i === 2) || 
                             (activeTab === 'bookings' && i === 3);
          return (
            <div key={i} className="px-4 py-2.5">
              <div className={`h-4 w-16 rounded ${isTabActive ? 'bg-[#2dd4af]/20' : 'bg-slate-50'}`} />
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export const MerchantManageBookingsSkeleton: React.FC = () => (
  <div className="bg-(--app-bg) min-h-screen animate-pulse">
    <DealPageHeaderSkeleton activeTab="bookings" />

    {/* Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-5 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`card-${i}`} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
            <div className="h-8 w-20 bg-slate-100 rounded mb-2" />
            <div className="h-3 w-36 bg-slate-50 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <th key={`head-${idx}`} className="px-6 py-4">
                    <div className="h-3 w-24 rounded bg-slate-100" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <tr key={`row-${rowIdx}`}>
                  <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-50" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-10 rounded-lg bg-slate-50" /></td>
                  <td className="px-6 py-4">
                    <div className="h-3 w-28 rounded bg-slate-100 mb-2" />
                    <div className="h-3 w-20 rounded bg-slate-50" />
                  </td>
                  <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-slate-50" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-18 rounded bg-slate-50" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export const MerchantAvailabilityBodySkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative flex-1 flex flex-col min-h-0">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
      <div className="flex flex-col gap-1">
        <div className="h-2 w-16 rounded bg-slate-50" />
        <div className="h-4 w-40 rounded bg-slate-100" />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-8 rounded-lg bg-slate-50" />
        <div className="w-12 h-8 rounded-lg bg-slate-50" />
        <div className="w-8 h-8 rounded-lg bg-slate-50" />
      </div>
    </div>

    {/* Legend Skeleton */}
    <div className="flex items-center gap-2.5 sm:gap-5 px-4 py-2 bg-slate-50/80 border-b border-slate-100 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-slate-200" />
          <div className="h-2.5 w-12 rounded bg-slate-100" />
        </div>
      ))}
    </div>

    {/* Grid Skeleton */}
    <div className="flex-1 min-h-0 overflow-x-auto no-scrollbar">
      <div className="grid grid-cols-7 grid-rows-[auto_1fr] h-full min-w-140 sm:min-w-0">
        {/* Days Header */}
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={`wd-${idx}`} className="py-2 flex justify-center border-b border-slate-50 bg-slate-50/30">
            <div className="h-3 w-10 rounded bg-slate-100" />
          </div>
        ))}
        {/* Day Cells */}
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={`d-${idx}`} className="border-r border-slate-50 p-2 relative bg-white min-h-[40vh]">
            <div className="w-4 h-4 rounded-full bg-slate-50 mb-3" />
            <div className="space-y-2">
              <div className="h-24 w-full rounded-xl bg-slate-50/80" />
              <div className="h-24 w-full rounded-xl bg-slate-50/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const MerchantManageAvailabilitySkeleton: React.FC = () => (
  <div className="bg-(--app-bg) flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-1.5rem)] animate-pulse overflow-hidden">
    <DealPageHeaderSkeleton activeTab="availability" />
    <div className="flex-1 min-h-0 p-2 lg:p-4 flex flex-col">
      <MerchantAvailabilityBodySkeleton />
    </div>
  </div>
);

export const MerchantFormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="px-4 lg:px-8 py-6 space-y-6 animate-pulse w-full max-w-4xl">
    <div className="h-8 w-64 bg-slate-200 rounded mb-8" />
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className={i % 3 === 0 ? 'md:col-span-2' : ''}>
            <div className="h-3 w-32 bg-slate-100 rounded mb-3" />
            <div className="h-12 w-full bg-slate-50 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="h-32 w-full bg-slate-50 rounded-xl" />
      <div className="flex justify-end gap-3 pt-4">
        <div className="h-11 w-24 bg-slate-100 rounded-xl" />
        <div className="h-11 w-32 bg-slate-200 rounded-xl" />
      </div>
    </div>
  </div>
);

export { MerchantConfirmModal } from "./MerchantConfirmModal";


export const DealDetailsSkeleton: React.FC = () => (
  <div className="bg-(--app-bg) min-h-screen animate-pulse">
    <DealPageHeaderSkeleton activeTab="details" />

    {/* Main Grid Content Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-5">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Column (Main) */}
        <div className="xl:col-span-2 space-y-8">
          {/* Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-8">
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-8 w-24 bg-slate-50 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-2.5 w-20 bg-slate-100 rounded ml-1" />
                  <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100" />
                </div>
              ))}
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-2.5 w-24 bg-slate-100 rounded ml-1" />
              <div className="h-32 w-full bg-slate-50 rounded-xl border border-slate-100" />
            </div>
          </div>

          {/* Itinerary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-6 p-6 rounded-2xl border border-slate-50 bg-slate-50/30">
                <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-48 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="xl:col-span-1 space-y-8">
          {/* Status Card */}
          <div className="h-48 bg-slate-200 rounded-2xl shadow-sm" />

          {/* Inclusion/Exclusion Cards */}
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`side-${i}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex gap-3 items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-100 shrink-0" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  </div>
);