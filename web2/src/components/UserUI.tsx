import React from 'react';

/**
 * Common Card for user side with soft shadows and rounded corners
 */
export const UserCard: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => (
  <div className={`bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 ${className}`}>
    {children}
  </div>
);

/**
 * Skeleton for the main Deal Card used on Home page and My Deals
 */
export const UserDealCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-black/5 w-full max-w-110 animate-pulse">
    {/* Image area */}
    <div className="relative h-42.5 bg-slate-100">
      <div className="absolute top-4 left-4 h-6 w-24 bg-slate-200 rounded-full" />
      <div className="absolute top-4 right-4 h-12 w-12 bg-slate-200 rounded-full" />
    </div>
    
    {/* Content area */}
    <div className="p-5 pb-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-3 w-24 bg-slate-100 rounded" />
      </div>

      <div className="h-6 w-3/4 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-1/3 bg-slate-100 rounded mb-4" />

      {/* Tags */}
      <div className="flex gap-1.5 mb-4">
        <div className="h-4 w-20 bg-slate-50 rounded" />
        <div className="h-4 w-24 bg-slate-50 rounded" />
      </div>

      {/* Pricing block */}
      <div className="bg-slate-50 rounded-[14px] p-3 border border-slate-100 mb-4">
        <div className="flex justify-between items-center">
          <div className="h-3 w-8 bg-slate-200 rounded" />
          <div className="h-6 w-24 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Button area */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-10 bg-slate-200 rounded-xl" />
        <div className="h-4 w-12 bg-slate-100 rounded" />
      </div>
    </div>
  </div>
);

/**
 * Grid of Deal Card Skeletons
 */
export const UserDealsGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
    {Array.from({ length: count }).map((_, i) => (
      <UserDealCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Skeleton for the hero section stats
 */
export const UserHeroStatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-3 gap-3 md:gap-12 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-3 md:px-10 py-3 md:py-5 w-fit mt-12 md:mt-16 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="text-center space-y-2">
        <div className="h-4 md:h-6 w-8 md:w-12 bg-white/20 rounded mx-auto" />
        <div className="h-1.5 md:h-2 w-12 md:w-16 bg-white/10 rounded mx-auto" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton for the horizontal and vertical Locked Deal Card
 */
export const UserLockedDealSkeleton: React.FC = () => (
  <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 w-full animate-pulse overflow-hidden">
    {/* Image area */}
    <div className="w-full md:w-60 h-40 md:h-auto bg-slate-100 shrink-0" />
    
    {/* Content area */}
    <div className="flex flex-col md:flex-row flex-1 p-4 md:p-5 gap-4 md:gap-5">
      <div className="flex-1 flex flex-col justify-center space-y-3">
        <div className="h-6 w-3/4 bg-slate-200 rounded" />
        <div className="h-3 w-1/3 bg-slate-100 rounded" />
        <div className="h-3 w-1/2 bg-slate-100 rounded" />
        <div className="h-5 w-24 bg-slate-50 rounded-lg mt-2" />
      </div>

      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 min-w-37.5 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 mt-3 md:mt-0 space-y-3">
        <div className="h-8 w-20 bg-slate-200 rounded" />
        <div className="flex flex-col gap-1.5 w-auto md:w-full">
          <div className="h-9 w-24 md:w-full bg-slate-100 rounded-lg" />
          <div className="h-9 w-24 md:w-full bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * List of Locked Deal Skeletons
 */
export const UserLockedDealsListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="flex flex-col gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <UserLockedDealSkeleton key={i} />
    ))}
  </div>
);

/**
 * Skeleton for the User Booking card
 */
export const UserBookingSkeleton: React.FC = () => (
  <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 w-full animate-pulse overflow-hidden">
    {/* Image area */}
    <div className="w-full md:w-60 h-40 md:h-auto bg-slate-100 shrink-0 relative">
      <div className="absolute top-3 left-3 h-6 w-24 bg-slate-200 rounded-full" />
    </div>

    {/* Content area */}
    <div className="flex flex-col md:flex-row flex-1 p-4 md:p-5 gap-4 md:gap-5">
      <div className="flex-1 flex flex-col justify-center space-y-3">
        <div className="h-6 w-3/4 bg-slate-200 rounded" />
        <div className="h-3 w-1/3 bg-slate-100 rounded" />
        <div className="flex gap-4">
          <div className="h-3 w-32 bg-slate-100 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
        <div className="h-5 w-24 bg-slate-50 rounded-lg mt-2" />
      </div>

      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 min-w-37.5 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 mt-3 md:mt-0 space-y-3">
        <div className="h-8 w-20 bg-slate-200 rounded" />
        <div className="w-full">
           <div className="h-10 w-full bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * List of Booking Skeletons
 */
export const UserBookingsListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="flex flex-col gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <UserBookingSkeleton key={i} />
    ))}
  </div>
);

/**
 * Skeleton for a Community Post item
 */
export const UserCommunityPostSkeleton: React.FC = () => (
  <div className="flex flex-col bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 overflow-hidden w-full animate-pulse">
    <div className="p-4 md:p-5">
      {/* User Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-slate-100 shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="space-y-2 mb-4">
        <div className="h-3.5 w-full bg-slate-100 rounded" />
        <div className="h-3.5 w-full bg-slate-100 rounded" />
        <div className="h-3.5 w-2/3 bg-slate-100 rounded" />
      </div>

      {/* Media placeholder */}
      <div className="aspect-video w-full bg-slate-50 rounded-2xl mb-4" />

      {/* Actions footer */}
      <div className="flex items-center gap-6 pt-4 border-t border-slate-50 mt-auto">
        <div className="h-4 w-12 bg-slate-100 rounded" />
        <div className="h-4 w-12 bg-slate-100 rounded" />
      </div>
    </div>
  </div>
);

/**
 * List of Community Post Skeletons
 */
export const UserCommunityFeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <UserCommunityPostSkeleton key={i} />
    ))}
  </div>
);

export const UserConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  tone?: 'danger' | 'primary';
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  tone = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmClass = tone === 'danger'
    ? 'bg-rose-600 hover:bg-rose-700 text-white'
    : 'bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47]';

  const handleConfirm = async () => {
    if (busy) return;
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-[#0e2a47]/45 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-black/5 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-br from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0e2a47]">{title}</h3>
              <p className="text-xs text-slate-500">Please confirm this action before continuing.</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-600">{message}</p>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${confirmClass}`}
          >
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
/**
 * Skeleton for the Registration / Login Page (Split Screen)
 */
export const UserAuthFormSkeleton: React.FC = () => (
  <div className="h-screen overflow-hidden flex bg-[#0a192f] font-sans">
    {/* Left Side Visual Placeholder */}
    <div className="hidden lg:flex w-1/2 relative bg-[#0a192f]">
      <div className="absolute inset-0 bg-slate-800 opacity-20" />
      <div className="relative z-10 p-16 flex flex-col justify-between w-full h-full">
        {/* Logo Placeholder */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700/50 rounded-lg" />
          <div className="h-6 w-32 bg-slate-700/50 rounded" />
        </div>

        {/* Text Placeholder */}
        <div>
          <div className="h-10 w-64 bg-slate-700/50 rounded mb-4" />
          <div className="h-10 w-48 bg-slate-700/50 rounded mb-6" />
          <div className="h-4 w-80 bg-slate-700/30 rounded mb-2" />
          <div className="h-4 w-64 bg-slate-700/30 rounded" />
        </div>

        {/* Tags Placeholder */}
        <div className="flex gap-3">
          <div className="h-9 w-32 bg-slate-700/20 rounded-full" />
          <div className="h-9 w-28 bg-slate-700/20 rounded-full" />
          <div className="h-9 w-32 bg-slate-700/20 rounded-full" />
        </div>
      </div>
    </div>

    {/* Right Side Form Placeholder */}
    <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 relative bg-[#0e2a47]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        {/* Title & Subtitle */}
        <div className="h-8 w-64 bg-slate-100 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-50 rounded mb-8" />

        {/* Form Fields Placholder */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 w-full bg-slate-50 rounded-xl" />
          ))}
          <div className="h-12 w-full bg-slate-200 rounded-xl mt-6" />
        </div>

        {/* Divider & Social Placeholder */}
        <div className="my-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100" />
          <div className="h-3 w-8 bg-slate-100 rounded" />
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className="h-12 w-full bg-slate-50 rounded-xl mb-4" />
        <div className="h-4 w-1/2 bg-slate-50 rounded mx-auto" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for the Deal Detail page
 * Replicates the layout of DealDetailPage.tsx: 4-image hero, sticky tabs, 2-column body.
 */
export const UserDealDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-(--app-bg) pt-0 animate-pulse">
    {/* ─── Hero: 4-Image Grid ─── */}
    <div className="relative h-[40vh] md:h-[55vh] min-h-60 md:min-h-95 max-h-130 overflow-hidden bg-slate-100">
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-0.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-200 h-full w-full" />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 md:pl-31 pb-4 md:pb-15 z-10">
        <div className="space-y-4">
          <div className="h-4 w-48 bg-slate-300/30 rounded-full" />
          <div className="h-10 w-3/4 bg-slate-300/50 rounded-lg" />
          <div className="flex gap-3">
             <div className="h-6 w-24 bg-slate-300/20 rounded-full" />
             <div className="h-6 w-32 bg-slate-300/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* ─── Tabs ─── */}
    <div className="sticky top-15 z-50 bg-white border-b border-slate-100 py-3 px-4 md:pl-31">
      <div className="">
        <div className="flex gap-8 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-7 w-28 bg-slate-100 rounded-full shrink-0" />
          ))}
        </div>
      </div>
    </div>

    {/* ─── Body ─── */}
    <div className="px-4 md:pl-31 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-4/5 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="space-y-4">
             <div className="h-4 w-24 bg-slate-200 rounded" />
             {[1, 2, 3].map(i => (
               <div key={i} className="flex gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-slate-200 shrink-0" />
                 <div className="flex-1 h-20 bg-white rounded-3xl border border-slate-100" />
               </div>
             ))}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-full lg:w-75 shrink-0 order-first lg:order-last">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-5">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-100 rounded" />
              <div className="h-10 w-32 bg-slate-200 rounded-lg" />
            </div>
            <div className="space-y-3 py-4 border-y border-slate-50">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex justify-between">
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                    <div className="h-3 w-12 bg-slate-100 rounded" />
                 </div>
               ))}
            </div>
            <div className="h-12 w-full bg-[#2dd4af]/10 rounded-2xl" />
          </div>
        </div>

      </div>
    </div>
  </div>
);

