import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-32" />
        <div className="h-3 bg-slate-100 rounded w-48" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-20" />
    </div>
    <div className="grid grid-cols-4 gap-3 mb-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
    </div>
    <div className="h-20 bg-slate-50 rounded-xl mb-4" />
    <div className="flex justify-between">
      <div className="h-3 bg-slate-100 rounded w-28" />
      <div className="h-8 bg-slate-100 rounded w-32" />
    </div>
  </div>
);

export default CardSkeleton;
