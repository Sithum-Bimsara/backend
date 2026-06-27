import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import React, { useState } from "react";
import {
  AdminPageShell,
  AdminCard,
  Badge,
  AdminActionButton,
  AdminTableSkeleton,
} from "../../features/Admin/components/AdminUI";
import { useAdminDeals } from "../../features/Admin/hooks/useAdminDeals";
import Pagination from "../../components/Pagination/Pagination";

const AdminDealsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: merchantId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const merchantNameFromUrl = searchParams.get("merchantName") ?? undefined;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");

  const { items, total, loading, error, query, setQuery } = useAdminDeals(merchantId, {
    page: 1,
    limit: 15,
  });

  const applyFilters = () => {
    setQuery({
      ...query,
      page: 1,
      search: search || undefined,
      status: status || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters();
  };

  const pageTitle = merchantNameFromUrl
    ? `Deals — ${merchantNameFromUrl}`
    : "All Deals";

  const pageSubtitle = merchantNameFromUrl
    ? `Viewing all deals for ${merchantNameFromUrl}`
    : "Browse and inspect all merchant deals across the platform";

  return (
    <AdminPageShell
      title={pageTitle}
      subtitle={pageSubtitle}
      actions={
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search deals…"
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | "active" | "inactive")}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <AdminActionButton onClick={applyFilters} variant="primary" className="w-full sm:w-auto justify-center">
            Filter
          </AdminActionButton>
          {merchantId && (
            <AdminActionButton
              onClick={() => navigate("/admin/merchants")}
              variant="secondary"
              className="w-full sm:w-auto justify-center"
            >
              ← Back to Merchants
            </AdminActionButton>
          )}
        </div>
      }
    >
      {loading && <AdminTableSkeleton rows={8} cols={6} />}
      {error && !loading && <AdminCard className="p-4 text-rose-600">{error}</AdminCard>}

      {!loading && !error && (
        <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {items.map((deal) => (
              <AdminCard key={deal.id} className="p-5 space-y-4 shadow-sm border-slate-100">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-base truncate">
                      {deal.title ?? "Untitled Deal"}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{deal.merchant.businessName}</div>
                    {deal.location && (
                      <div className="text-xs text-slate-400 mt-0.5 truncate">📍 {deal.location}</div>
                    )}
                  </div>
                  <Badge tone={deal.isActive ? "green" : "red"}>
                    {deal.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-50">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Price</div>
                    <div className="text-sm text-slate-700 font-semibold">
                      {deal.displayedPrice != null ? `$${deal.displayedPrice.toFixed(2)}` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Number of days this deal run/ran</div>
                    <div className="text-sm text-slate-700 font-semibold">{deal._count.variants}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Bookings</div>
                    <div className="text-sm text-slate-700 font-semibold">{deal._count.bookings}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Locks</div>
                    <div className="text-sm text-slate-700 font-semibold">{deal._count.locks}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <AdminActionButton
                    onClick={() => navigate(`/admin/deals/${deal.id}`)}
                    variant="secondary"
                    className="flex-1 justify-center py-2"
                  >
                    Manage Deal
                  </AdminActionButton>
                  <AdminActionButton
                    onClick={() => navigate(`/admin/merchants/${deal.merchant.id}/deals/${deal.id}/reviews?merchantName=${encodeURIComponent(deal.merchant.businessName)}`)}
                    variant="primary"
                    className="flex-1 justify-center py-2"
                  >
                    Manage Reviews
                  </AdminActionButton>
                </div>
              </AdminCard>
            ))}
            {items.length === 0 && (
              <AdminCard className="p-10 text-center text-slate-500">No deals found.</AdminCard>
            )}
          </div>

          {/* Desktop Table View */}
          <AdminCard className="hidden md:block overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Deal</th>
                    <th className="px-6 py-4 text-left">Merchant</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Display Price</th>
                    <th className="px-6 py-4 text-center">Number of days this deal run/ran</th>
                    <th className="px-6 py-4 text-center">Bookings</th>
                    <th className="px-6 py-4 text-center">Locks</th>
                    <th className="px-6 py-4 text-left">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((deal) => (
                    <tr key={deal.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 max-w-50 truncate">
                          {deal.title ?? "Untitled Deal"}
                        </div>
                        {deal.location && (
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">📍 {deal.location}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 font-medium truncate max-w-35">
                          {deal.merchant.businessName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={deal.isActive ? "green" : "red"}>
                          {deal.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        {deal.displayedPrice != null ? `$${deal.displayedPrice.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700 font-bold">{deal._count.variants}</td>
                      <td className="px-6 py-4 text-center text-slate-700 font-bold">{deal._count.bookings}</td>
                      <td className="px-6 py-4 text-center text-slate-700 font-bold">{deal._count.locks}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(deal.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <AdminActionButton
                            onClick={() => navigate(`/admin/deals/${deal.id}`)}
                            variant="secondary"
                            className="px-4"
                          >
                            View
                          </AdminActionButton>
                          <AdminActionButton
                            onClick={() => navigate(`/admin/merchants/${deal.merchant.id}/deals/${deal.id}/reviews?merchantName=${encodeURIComponent(deal.merchant.businessName)}`)}
                            variant="primary"
                            className="px-4"
                          >
                            Manage Reviews
                          </AdminActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">
                        No deals found.
                      </td>
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
            itemsPerPage={query.limit || 15}
            onPageChange={(page) => setQuery({ ...query, page })}
            loading={loading}
          />
        </div>
      )}
    </AdminPageShell>
  );
};

export default AdminDealsPage;
