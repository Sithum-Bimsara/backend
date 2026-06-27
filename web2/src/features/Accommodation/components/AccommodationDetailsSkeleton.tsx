import React from 'react';

export const AccommodationDetailsSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 min-h-0 overflow-y-auto">
      
      {/* ── Section 1: Main Property Details Grid ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Property Type */}
            <div>
              <div className="h-3.5 bg-slate-200 rounded-md w-1/4 mb-3"></div>
              <div className="h-8 bg-slate-100 rounded-xl w-1/3"></div>
            </div>

            {/* Property Name & Description */}
            <div className="space-y-3">
              <div className="h-3.5 bg-slate-200 rounded-md w-1/3 mb-2"></div>
              <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl w-full"></div>
              <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl w-full"></div>
            </div>

            {/* Location Section */}
            <div>
              <div className="h-3.5 bg-slate-200 rounded-md w-1/4 mb-3"></div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="h-10 bg-white border border-slate-200/60 rounded-xl w-full"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-10 bg-white border border-slate-200/60 rounded-xl w-full"></div>
                  <div className="h-10 bg-white border border-slate-200/60 rounded-xl w-full"></div>
                </div>
                <div className="h-10 bg-white border border-slate-200/60 rounded-xl w-full"></div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Star Rating & Status */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="h-3.5 bg-slate-200 rounded-md w-1/3 mb-2"></div>
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl w-full"></div>
              </div>
              <div className="flex-1">
                <div className="h-3.5 bg-slate-200 rounded-md w-1/3 mb-2"></div>
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl w-1/2"></div>
              </div>
            </div>

            {/* House Rules Form Card */}
            <div>
              <div className="h-3.5 bg-slate-200 rounded-md w-1/3 mb-3"></div>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                {/* Rule Row Skeletons */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-slate-200 rounded-md"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-slate-200 rounded-md"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-2/3"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-slate-200 rounded-md"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
                </div>

                {/* Check In / Out grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                  <div>
                    <div className="h-3 bg-slate-200 rounded-md w-2/3 mb-2"></div>
                    <div className="h-8 bg-white border border-slate-200/60 rounded-lg w-full"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-slate-200 rounded-md w-2/3 mb-2"></div>
                    <div className="h-8 bg-white border border-slate-200/60 rounded-lg w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Facilities & Spoken Languages */}
        <div className="pt-6 border-t border-slate-100 space-y-5">
          <div>
            <div className="h-3.5 bg-slate-200 rounded-md w-1/6 mb-4"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-8 bg-slate-100 border border-slate-200/60 rounded-lg w-20"></div>
              <div className="h-8 bg-slate-100 border border-slate-200/60 rounded-lg w-24"></div>
              <div className="h-8 bg-slate-100 border border-slate-200/60 rounded-lg w-16"></div>
              <div className="h-8 bg-slate-100 border border-slate-200/60 rounded-lg w-28"></div>
              <div className="h-8 bg-slate-100 border border-slate-200/60 rounded-lg w-22"></div>
              <div className="h-8 bg-slate-100 border border-slate-200/60 rounded-lg w-32"></div>
            </div>
          </div>

          <div>
            <div className="h-3 bg-slate-200 rounded-md w-1/12 mb-3"></div>
            <div className="flex gap-4">
              <div className="h-4 bg-slate-100 rounded-md w-16"></div>
              <div className="h-4 bg-slate-100 rounded-md w-20"></div>
            </div>
          </div>
        </div>

        {/* Environment & Host Profile */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Environment */}
          <div className="space-y-4">
            <div className="h-3.5 bg-slate-200 rounded-md w-1/4 mb-2"></div>
            
            {/* Nearby Places */}
            <div>
              <div className="h-3 bg-slate-200 rounded-md w-1/3 mb-2"></div>
              <div className="space-y-2">
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl w-full"></div>
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl w-full"></div>
              </div>
            </div>
          </div>

          {/* Host Profile */}
          <div className="space-y-4">
            <div className="h-3.5 bg-slate-200 rounded-md w-1/4 mb-3"></div>
            <div className="space-y-3">
              <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl w-full"></div>
              <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Property Images Skeleton ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 animate-pulse">
        <div className="h-3.5 bg-slate-200 rounded-md w-1/5 mb-4"></div>
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
          <div className="h-3 bg-slate-100 rounded-md w-1/4"></div>
        </div>
      </div>

      {/* ── Section 3: Room Manager Skeleton ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded-md w-1/4"></div>
          <div className="h-10 bg-slate-100 rounded-xl w-32"></div>
        </div>
        
        {/* Room items list */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
                <div className="flex gap-2">
                  <div className="h-3 bg-slate-200 rounded-md w-12"></div>
                  <div className="h-3 bg-slate-200 rounded-md w-16"></div>
                </div>
              </div>
              <div className="h-6 bg-slate-200 rounded-md w-24"></div>
              <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
