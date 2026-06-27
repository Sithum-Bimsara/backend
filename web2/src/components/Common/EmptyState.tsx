import React from 'react';

interface EmptyStateProps {
  type: 'locks' | 'bookings';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 rounded-2xl bg-[#2dd4af]/10 text-[#2dd4af] flex items-center justify-center mx-auto mb-4">
      {type === 'locks' ? (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
      )}
    </div>
    <h3 className="text-base font-bold text-[#0e2a47] mb-1">
      No {type === 'locks' ? 'Locks' : 'Bookings'} Found
    </h3>
    <p className="text-sm text-slate-400 max-w-xs mx-auto">
      There are no {type === 'locks' ? 'active room or slot locks' : 'confirmed customer reservations'} recorded for this period.
    </p>
  </div>
);

export default EmptyState;
