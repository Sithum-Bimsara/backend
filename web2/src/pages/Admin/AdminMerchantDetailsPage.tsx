import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminPageShell, AdminCard, StatCard, Badge, AdminActionButton, AdminCardsSkeleton, AdminTableSkeleton } from "../../features/Admin/components/AdminUI";
import { useMerchantDetails } from "../../features/Admin/hooks/useMerchants";

const AdminMerchantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error, setDisplayPrice, query, setQuery } = useMerchantDetails(id);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});

  const applyFilter = () => setQuery({ ...query, startDate: startDate || undefined, endDate: endDate || undefined });

  const savePrice = async (dealId: string) => {
    const nextPrice = Number(priceDrafts[dealId]);
    if (!Number.isFinite(nextPrice)) return;
    await setDisplayPrice(dealId, nextPrice);
  };

  return (
    <AdminPageShell
      title="Merchant Details"
      subtitle="Review merchant analytics and update deal display prices"
      actions={
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <input 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            type="date" 
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" 
          />
          <input 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            type="date" 
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" 
          />
          <AdminActionButton onClick={applyFilter} variant="primary" className="w-full sm:w-auto justify-center">
            Apply
          </AdminActionButton>
          <AdminActionButton
            onClick={() => navigate(-1)}
            variant="secondary"
            className="w-full sm:w-auto justify-center"
            showArrow={false}
          >
            ← Back
          </AdminActionButton>
        </div>
      }
    >
      {loading && (
        <div className="space-y-4">
          <AdminCard className="p-6">
            <div className="h-6 w-56 rounded bg-slate-200 animate-pulse" />
            <div className="mt-3 h-4 w-80 rounded bg-slate-200 animate-pulse" />
            <div className="mt-4 h-4 w-64 rounded bg-slate-200 animate-pulse" />
          </AdminCard>
          <AdminCardsSkeleton cards={6} />
          <AdminTableSkeleton rows={6} cols={5} />
        </div>
      )}
      {error && !loading && <AdminCard className="p-4 text-rose-600">{error}</AdminCard>}

      {!loading && data && (
        <div className="space-y-6">
          <AdminCard className="p-6 border-slate-100 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-2">Merchant Profile</div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{data.merchant.businessName}</h2>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm md:text-base max-w-3xl">{data.merchant.businessDescription}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone={data.merchant.verificationStatus === "verified" ? "green" : "yellow"}>{data.merchant.verificationStatus}</Badge>
                  <Badge tone="indigo">{data.merchant.user.name}</Badge>
                  <Badge tone="gray">{data.merchant.user.email}</Badge>
                </div>
              </div>
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50 lg:w-80 shrink-0">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 font-medium">Contact</span>
                    <span className="text-slate-900 font-semibold">{data.merchant.contactNumber}</span>
                  </div>
                  {(data.merchant.city || data.merchant.country) && (
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400 font-medium">Location</span>
                      <span className="text-slate-900 font-semibold text-right">{[data.merchant.city, data.merchant.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-100">
                    {data.merchant.businessRegistrationDocUrl ? (
                      <a
                        href={data.merchant.businessRegistrationDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                        </svg>
                        View Registration Doc
                      </a>
                    ) : (
                      <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider italic">No document uploaded</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard label="Total Deals" value={data.analytics.totalDeals} tone="indigo" />
            <StatCard label="Total Bookings" value={data.analytics.totalBookings} tone="emerald" />
            <StatCard label="Total Locks" value={data.analytics.totalLocks} tone="amber" />
            <StatCard label="Revenue" value={`$${data.analytics.totalRevenueGenerated.toFixed(2)}`} tone="rose" />
            <StatCard label="Commission" value={`$${data.analytics.platformCommission.toFixed(2)}`} tone="indigo" />
            <StatCard label="Payout" value={`$${data.analytics.merchantPayout.toFixed(2)}`} tone="emerald" />
          </div>

          <div className="space-y-4">
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {data.deals.map((deal) => (
                <AdminCard key={deal.dealId} className="p-5 space-y-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Deal Title</div>
                    <div className="font-bold text-slate-900">{deal.title || "Untitled deal"}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 text-indigo-500">Display Price ($)</div>
                      <input
                        type="number"
                        defaultValue={deal.displayedPrice ?? 0}
                        onChange={(e) => setPriceDrafts((prev) => ({ ...prev, [deal.dealId]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                    <div className="flex flex-col justify-end gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Locks:</span>
                        <span className="font-bold text-slate-700">{deal.locksCount}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Bookings:</span>
                        <span className="font-bold text-slate-700">{deal.bookingsCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <AdminActionButton 
                      onClick={() => savePrice(deal.dealId)} 
                      variant="secondary"
                      className="flex-1 justify-center py-2.5 text-[11px]"
                      showArrow={false}
                    >
                      Save Price
                    </AdminActionButton>
                    <AdminActionButton 
                      onClick={() => navigate(`/admin/merchants/${id}/deals/${deal.dealId}/reviews?merchantName=${encodeURIComponent(data.merchant.businessName)}`)} 
                      variant="primary"
                      className="flex-1 justify-center py-2.5 text-[11px]"
                      showArrow={false}
                    >
                      Reviews
                    </AdminActionButton>
                  </div>
                </AdminCard>
              ))}
              {data.deals.length === 0 && (
                <AdminCard className="p-10 text-center text-slate-500">No deals found.</AdminCard>
              )}
            </div>

            {/* Desktop Table View */}
            <AdminCard className="hidden md:block overflow-hidden border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Merchant Deals</h3>
                <Badge tone="indigo">{data.deals.length} active</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50/30 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-6 py-4 text-left">Deal Title</th>
                      <th className="px-6 py-4 text-left w-48">Display Price</th>
                      <th className="px-6 py-4 text-center">Locks</th>
                      <th className="px-6 py-4 text-center">Bookings</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.deals.map((deal) => (
                      <tr key={deal.dealId} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">{deal.title || "Untitled deal"}</td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                            <input
                              type="number"
                              defaultValue={deal.displayedPrice ?? 0}
                              onChange={(e) => setPriceDrafts((prev) => ({ ...prev, [deal.dealId]: e.target.value }))}
                              className="w-full pl-7 pr-4 py-2 rounded-xl border border-slate-100 bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-900 font-bold">{deal.locksCount}</td>
                        <td className="px-6 py-4 text-center text-slate-900 font-bold">{deal.bookingsCount}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <AdminActionButton onClick={() => savePrice(deal.dealId)} variant="secondary" showArrow={false} className="px-4">Save Price</AdminActionButton>
                            <AdminActionButton 
                              onClick={() => navigate(`/admin/merchants/${id}/deals/${deal.dealId}/reviews?merchantName=${encodeURIComponent(data.merchant.businessName)}`)} 
                              variant="primary" 
                              showArrow={false} 
                              className="px-4"
                            >
                              Reviews
                            </AdminActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
};

export default AdminMerchantDetailsPage;
