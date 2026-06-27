import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminPageShell, AdminCard, Badge, AdminActionButton, AdminConfirmModal, AdminTableSkeleton } from "../../features/Admin/components/AdminUI";
import { useMerchants } from "../../features/Admin/hooks/useMerchants";
import type { MerchantVerificationStatus } from "../../features/Admin/types/admin.types";
import Pagination from "../../components/Pagination/Pagination";

const AdminMerchantsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<MerchantVerificationStatus | "">("");
  const [confirmUnverifyMerchant, setConfirmUnverifyMerchant] = useState<{ id: string; name: string } | null>(null);
  const [confirmVerifyMerchant, setConfirmVerifyMerchant] = useState<{ id: string; name: string } | null>(null);
  const { items, total, loading, error, query, setQuery, verifyMerchant, unverifyMerchant } = useMerchants();

  const applyFilters = () => {
    setQuery({ ...query, page: 1, search: search || undefined, verificationStatus: verificationStatus || undefined });
  };

  return (
    <AdminPageShell
      title="Merchants"
      subtitle="Verify and review merchant profiles"
      actions={
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchants"
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          <select
            value={verificationStatus}
            onChange={(e) => setVerificationStatus(e.target.value as MerchantVerificationStatus | "")}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
          </select>
          <AdminActionButton onClick={applyFilters} variant="primary" className="w-full sm:w-auto justify-center">
            Filter
          </AdminActionButton>
        </div>
      }
    >
      {loading && <AdminTableSkeleton rows={6} cols={6} />}
      {error && !loading && <AdminCard className="p-4 text-rose-600">{error}</AdminCard>}

      {!loading && !error && (
        <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {items.map((merchant) => (
              <AdminCard key={merchant.id} className="p-5 space-y-4 shadow-sm border-slate-100">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-base truncate">{merchant.businessName}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{merchant.user.name}</div>
                  </div>
                  <Badge tone={merchant.verificationStatus === "verified" ? "green" : "yellow"}>
                    {merchant.verificationStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Deals</div>
                    <div className="text-sm text-slate-700 font-semibold">{merchant._count.deals}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Stays</div>
                    <div className="text-sm text-slate-700 font-semibold">{merchant._count.properties}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Created</div>
                    <div className="text-sm text-slate-600 font-medium">{new Date(merchant.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <AdminActionButton
                    onClick={() => navigate(`/admin/merchants/${merchant.id}`)}
                    variant="secondary"
                    className="flex-1 justify-center py-2"
                  >
                    Details
                  </AdminActionButton>
                  <AdminActionButton
                    onClick={() =>
                      navigate(
                        `/admin/merchants/${merchant.id}/deals?merchantName=${encodeURIComponent(merchant.businessName)}`
                      )
                    }
                    variant="secondary"
                    className="flex-1 justify-center py-2"
                  >
                    View Deals
                  </AdminActionButton>
                  {merchant.verificationStatus === "verified" ? (
                    <AdminActionButton
                      onClick={() => setConfirmUnverifyMerchant({ id: merchant.id, name: merchant.businessName })}
                      variant="warning"
                      className="flex-1 justify-center py-2"
                    >
                      Unverify
                    </AdminActionButton>
                  ) : (
                    <AdminActionButton
                      onClick={() => setConfirmVerifyMerchant({ id: merchant.id, name: merchant.businessName })}
                      variant="success"
                      className="flex-1 justify-center py-2"
                    >
                      Verify
                    </AdminActionButton>
                  )}
                </div>
              </AdminCard>
            ))}
            {items.length === 0 && (
              <AdminCard className="p-10 text-center text-slate-500">No merchants found.</AdminCard>
            )}
          </div>

          {/* Desktop Table View */}
          <AdminCard className="hidden md:block overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Merchant</th>
                    <th className="px-6 py-4 text-left">Business</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-center">Deals</th>
                    <th className="px-6 py-4 text-center">Accommodations</th>
                    <th className="px-6 py-4 text-left">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((merchant) => (
                    <tr key={merchant.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{merchant.user.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{merchant.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{merchant.businessName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{merchant.city || merchant.country || merchant.contactNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={merchant.verificationStatus === "verified" ? "green" : "yellow"}>
                          {merchant.verificationStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700 font-bold">{merchant._count.deals}</td>
                      <td className="px-6 py-4 text-center text-slate-700 font-bold">{merchant._count.properties}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(merchant.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <AdminActionButton onClick={() => navigate(`/admin/merchants/${merchant.id}`)} variant="secondary">Details</AdminActionButton>
                          <AdminActionButton
                            onClick={() =>
                              navigate(
                                `/admin/merchants/${merchant.id}/deals?merchantName=${encodeURIComponent(merchant.businessName)}`
                              )
                            }
                            variant="secondary"
                          >
                            View Deals
                          </AdminActionButton>
                          {merchant.verificationStatus === "verified" ? (
                            <AdminActionButton onClick={() => setConfirmUnverifyMerchant({ id: merchant.id, name: merchant.businessName })} variant="warning">Unverify</AdminActionButton>
                          ) : (
                            <AdminActionButton onClick={() => setConfirmVerifyMerchant({ id: merchant.id, name: merchant.businessName })} variant="success">Verify</AdminActionButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No merchants found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total results: <span className="text-slate-600">{total}</span>
            </div>
          </AdminCard>

          <Pagination
            currentPage={query.page || 1}
            totalItems={total}
            itemsPerPage={query.limit || 10}
            onPageChange={(page) => setQuery({ ...query, page })}
            loading={loading}
          />

          <AdminConfirmModal
            isOpen={!!confirmUnverifyMerchant}
            title="Unverify Merchant"
            message={confirmUnverifyMerchant ? `Are you sure you want to unverify ${confirmUnverifyMerchant.name}?` : ""}
            confirmLabel="Unverify"
            tone="warning"
            onConfirm={async () => {
              if (!confirmUnverifyMerchant) return;
              await unverifyMerchant(confirmUnverifyMerchant.id);
              setConfirmUnverifyMerchant(null);
            }}
            onCancel={() => setConfirmUnverifyMerchant(null)}
          />

          <AdminConfirmModal
            isOpen={!!confirmVerifyMerchant}
            title="Verify Merchant"
            message={confirmVerifyMerchant ? `Are you sure you want to verify ${confirmVerifyMerchant.name}? This allows them to list deals.` : ""}
            confirmLabel="Verify"
            tone="indigo"
            onConfirm={async () => {
              if (!confirmVerifyMerchant) return;
              await verifyMerchant(confirmVerifyMerchant.id);
              setConfirmVerifyMerchant(null);
            }}
            onCancel={() => setConfirmVerifyMerchant(null)}
          />
        </div>
      )}
    </AdminPageShell>
  );
};

export default AdminMerchantsPage;
