import React, { useState, useMemo, useEffect } from 'react';
import { useDealAnalytics } from '../hooks/useDealAnalytics';
import { formatLocalDate, getLocalDateStr } from '../../../lib/date-utils';

interface Props {
  dealId: string;
}

const BookingsEarningsTab: React.FC<Props> = ({ dealId }) => {
  // Default to last 7 days
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getLocalDateStr(d);
  }, []);
  
  const defaultEnd = useMemo(() => getLocalDateStr(new Date()), []);

  const [dateRange, setDateRange] = useState({
    startDate: defaultStart,
    endDate: defaultEnd
  });

  const { analytics: data, loading, error, actions } = useDealAnalytics(dealId);

  useEffect(() => {
    actions.refetch({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  }, [dateRange.startDate, dateRange.endDate, actions]);

  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'locks'>('bookings');

  const renderListSkeleton = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            {Array.from({ length: 5 }).map((_, idx) => (
              <th key={`head-${idx}`} className="px-6 py-4 border-none">
                <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {Array.from({ length: 6 }).map((_, rowIdx) => (
            <tr key={`row-${rowIdx}`}>
              <td className="px-6 py-4">
                <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-5 w-10 rounded-lg bg-slate-100 animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3 w-30 rounded bg-slate-200 animate-pulse mb-2" />
                <div className="h-3 w-20 rounded bg-slate-100 animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-18 rounded bg-slate-200 animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filter & Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-bold text-[#0e2a47]">Bookings & Earnings</h3>
            <p className="text-xs text-slate-400 mt-1">Track your performance and revenue for this deal</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <div className="flex flex-col px-3 py-1 sm:py-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</span>
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-transparent border-none text-xs font-bold text-[#0e2a47] outline-none cursor-pointer"
              />
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200 mx-1" />
            <div className="sm:hidden w-full h-px bg-slate-200 mx-0" />
            <div className="flex flex-col px-3 py-1 sm:py-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</span>
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-transparent border-none text-xs font-bold text-[#0e2a47] outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <span className="text-xs font-bold text-emerald-700/70 border-none">Total Earnings</span>
            </div>
            {loading ? (
              <div className="h-8 w-24 bg-emerald-200/50 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-black text-[#0e2a47]">${data?.totalEarnings.toLocaleString() || '0'}</p>
            )}
            <p className="text-[10px] text-emerald-600/70 font-bold mt-1 uppercase tracking-tight">Revenue from Paid Bookings</p>
          </div>

          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </div>
              <span className="text-xs font-bold text-blue-700/70">Total Bookings</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-blue-200/50 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-black text-[#0e2a47]">{data?.bookings.length || '0'}</p>
            )}
            <p className="text-[10px] text-blue-600/70 font-bold mt-1 uppercase tracking-tight">Confirmed reservations</p>
          </div>

          <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <span className="text-xs font-bold text-amber-700/70">Pending Locks</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-amber-200/50 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-black text-[#0e2a47]">{data?.locks.filter(l => l.status === 'active').length || '0'}</p>
            )}
            <p className="text-[10px] text-amber-600/70 font-bold mt-1 uppercase tracking-tight">Slots tentatively held</p>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center border-b border-slate-100 bg-slate-50/30 p-1">
          <button
            onClick={() => setActiveSubTab('bookings')}
            className={`flex-1 py-3 text-xs font-bold transition-all rounded-xl border-none cursor-pointer ${
              activeSubTab === 'bookings' ? 'bg-white text-[#0e2a47] shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
            }`}
          >
            Confirmed Bookings ({data?.bookings.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('locks')}
            className={`flex-1 py-3 text-xs font-bold transition-all rounded-xl border-none cursor-pointer ${
              activeSubTab === 'locks' ? 'bg-white text-[#0e2a47] shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
            }`}
          >
            Active Locks ({data?.locks.length || 0})
          </button>
        </div>

        <div className="min-h-75">
          {loading ? (
            renderListSkeleton()
          ) : activeSubTab === 'bookings' ? (
            <div className="overflow-x-auto">
              {data?.bookings && data.bookings.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Guest</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Slots</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Date / Variant</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/30 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0e2a47]">{b.user?.name || 'Guest User'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-100">
                            {b._count?.slots || b.quantity || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-600">
                              {formatLocalDate(b.variant.startDatetime, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            b.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            b.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#0e2a47] text-sm tabular-nums">
                          ${b.totalPrice?.toLocaleString() || '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20">
                  <p className="text-sm text-slate-400">No bookings found in this range</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {data?.locks && data.locks.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Locked by</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Slots</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Expires At</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Variant</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.locks.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/30 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0e2a47]">{l.user?.name || 'Anonymous User'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-100">
                            {l._count?.slots || l.quantity || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-amber-600">
                              {new Date(l.expiresAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            l.status === 'active' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            l.status === 'expired' ? 'bg-red-50 text-red-600 border border-red-100' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20">
                  <p className="text-sm text-slate-400">No active locks in this range</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsEarningsTab;
