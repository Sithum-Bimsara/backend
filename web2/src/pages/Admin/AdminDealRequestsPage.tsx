import React, { useState } from "react";
import { AdminPageShell, AdminCard, Badge, AdminActionButton, AdminConfirmModal, AdminTableSkeleton } from "../../features/Admin/components/AdminUI";
import { useDealRequests } from "../../features/Admin/hooks/useDealRequests";
import Pagination from "../../components/Pagination/Pagination";
import type { DealRequestStatus } from "../../features/Admin/types/admin.types";
import { RequestDetailsModal } from "../../features/Admin/components/RequestDetailsModal";

const formatRequestMessage = (message: string) => {
  const lines = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsedFields: Array<{ label: string; value: string }> = [];
  const freeformNotes: string[] = [];

  lines.forEach((line, index) => {
    const separatorIndex = line.indexOf(":");

    if (index === 0 && separatorIndex <= 0) {
      return;
    }

    if (separatorIndex <= 0) {
      freeformNotes.push(line);
      return;
    }

    const label = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!label || !value) {
      freeformNotes.push(line);
      return;
    }

    parsedFields.push({ label, value });
  });

  const summary = lines.length > 0 ? lines[0] : message.trim();

  return {
    summary,
    parsedFields,
    freeformNotes,
  };
};


const AdminDealRequestsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DealRequestStatus | "">("");
  const [confirmContacted, setConfirmContacted] = useState<{ id: string; name: string } | null>(null);
  const [confirmClosed, setConfirmClosed] = useState<{ id: string; name: string } | null>(null);
  const [expandedItem, setExpandedItem] = useState<(ReturnType<typeof formatRequestMessage> & {
    name: string;
    email: string;
    createdAt: string;
    contactNumber: string | null;
    status: DealRequestStatus;
    id: string;
  }) | null>(null);
  const { items, total, loading, error, query, setQuery, markContacted, markClosed } = useDealRequests();

  const applyFilters = () => setQuery({ ...query, page: 1, search: search || undefined, status: status || undefined });

  return (
    <AdminPageShell
      title="Deal Requests"
      subtitle="Track new leads and update request status"
      actions={
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests"
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DealRequestStatus | "")}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contact</option>
            <option value="closed">Close</option>
          </select>
          <AdminActionButton onClick={applyFilters} variant="primary" className="w-full sm:w-auto justify-center">
            Filter
          </AdminActionButton>
        </div>
      }
    >
      {loading && <AdminTableSkeleton rows={6} cols={5} />}
      {error && !loading && <AdminCard className="p-4 text-rose-600">{error}</AdminCard>}

      {!loading && !error && (
        <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {items.map((item) => {
              const request = formatRequestMessage(item.message);
              return (
                <AdminCard key={item.id} className="p-5 space-y-4 shadow-sm border-slate-100">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.user.name}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{item.user.email}</div>
                    </div>
                    <Badge tone={item.status === "new" ? "yellow" : item.status === "contacted" ? "indigo" : "gray"}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Request Overview</div>
                    <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 font-medium">
                      {request.summary}
                    </p>
                    <button
                      onClick={() =>
                        setExpandedItem({
                          id: item.id,
                          name: item.user.name,
                          email: item.user.email,
                          createdAt: item.createdAt,
                          contactNumber: item.contactNumber,
                          status: item.status,
                          ...request,
                        })
                      }
                      className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      Read Full Details →
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 py-3 border-y border-slate-50 overflow-hidden">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 shrink-0">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.11 4.18 2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.12.92.32 1.82.59 2.69a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.39-1.23a2 2 0 0 1 2.11-.45c.87.27 1.77.47 2.69.59A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {item.contactNumber}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">Sent on {new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <AdminActionButton
                      onClick={() => setConfirmContacted({ id: item.id, name: item.user.name })}
                      variant="secondary"
                      className="flex-1 justify-center py-2 text-xs"
                      showArrow={false}
                      disabled={item.status === "contacted"}
                    >
                      Contacted
                    </AdminActionButton>
                    <AdminActionButton
                      onClick={() => setConfirmClosed({ id: item.id, name: item.user.name })}
                      variant="warning"
                      className="flex-1 justify-center py-2 text-xs"
                      showArrow={false}
                      disabled={item.status === "closed"}
                    >
                      Closed
                    </AdminActionButton>
                  </div>
                </AdminCard>
              );
            })}
            {items.length === 0 && (
              <AdminCard className="p-10 text-center text-slate-500">No deal requests found.</AdminCard>
            )}
          </div>

          {/* Desktop Table View */}
          <AdminCard className="hidden md:block overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Requester</th>
                    <th className="px-6 py-4 text-left">Request Summary</th>
                    <th className="px-6 py-4 text-left">Contact</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-2">
                          <div className="font-semibold text-slate-900">{item.user.name}</div>
                          <div className="text-slate-400 text-[11px] font-medium truncate max-w-[140px]">{item.user.email}</div>
                          <div className="flex flex-wrap gap-2">
                            <Badge tone="gray">{new Date(item.createdAt).toLocaleDateString()}</Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xl align-top">
                        {(() => {
                          const request = formatRequestMessage(item.message);

                          return (
                            <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-4 shadow-sm relative group overflow-hidden">
                              <div className="flex items-start gap-4 mb-3">
                                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16v10H7l-3 3V4z" />
                                  </svg>
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer message</div>
                                  <p className="mt-1.5 text-sm leading-7 text-slate-700 whitespace-pre-wrap wrap-break-word font-medium line-clamp-3">
                                    {request.summary}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                <div className="flex flex-wrap gap-2">
                                  {request.parsedFields.slice(0, 2).map((field) => (
                                    <Badge key={`${field.label}-${field.value}`} tone="gray">{field.label}</Badge>
                                  ))}
                                  {request.freeformNotes.length > 0 && <Badge tone="green">Notes Attached</Badge>}
                                </div>

                                <AdminActionButton
                                  onClick={() =>
                                    setExpandedItem({
                                      id: item.id,
                                      name: item.user.name,
                                      email: item.user.email,
                                      createdAt: item.createdAt,
                                      contactNumber: item.contactNumber,
                                      status: item.status,
                                      ...request,
                                    })
                                  }
                                  variant="primary"
                                  className="py-1.5"
                                >
                                  Expand
                                </AdminActionButton>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100/50">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.11 4.18 2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.12.92.32 1.82.59 2.69a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6 6l1.39-1.23a2 2 0 0 1 2.11-.45c.87.27 1.77.47 2.69.59A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {item.contactNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <Badge tone={item.status === "new" ? "yellow" : item.status === "contacted" ? "indigo" : "gray"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <AdminActionButton
                            onClick={() => setConfirmContacted({ id: item.id, name: item.user.name })}
                            variant="secondary"
                            className="justify-center py-2"
                            showArrow={false}
                            disabled={item.status === "contacted"}
                          >
                            Contacted
                          </AdminActionButton>
                          <AdminActionButton
                            onClick={() => setConfirmClosed({ id: item.id, name: item.user.name })}
                            variant="warning"
                            className="justify-center py-2"
                            showArrow={false}
                            disabled={item.status === "closed"}
                          >
                            Closed
                          </AdminActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No deal requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total requests: <span className="text-slate-600">{total}</span>
            </div>
          </AdminCard>

          <Pagination currentPage={query.page || 1} totalItems={total} itemsPerPage={query.limit || 10} onPageChange={(page) => setQuery({ ...query, page })} loading={loading} />
        </div>
      )}

      <AdminConfirmModal
        isOpen={!!confirmContacted}
        title="Mark as Contacted"
        message={confirmContacted ? `Are you sure you want to mark ${confirmContacted.name}'s request as contacted?` : ""}
        confirmLabel="Confirm"
        tone="indigo"
        onConfirm={async () => {
          if (!confirmContacted) return;
          await markContacted(confirmContacted.id);
          setConfirmContacted(null);
        }}
        onCancel={() => setConfirmContacted(null)}
      />

      <AdminConfirmModal
        isOpen={!!confirmClosed}
        title="Close Request"
        message={confirmClosed ? `Are you sure you want to close ${confirmClosed.name}'s request?` : ""}
        confirmLabel="Close"
        tone="warning"
        onConfirm={async () => {
          if (!confirmClosed) return;
          await markClosed(confirmClosed.id);
          setConfirmClosed(null);
        }}
        onCancel={() => setConfirmClosed(null)}
      />

      <RequestDetailsModal
        isOpen={!!expandedItem}
        item={expandedItem}
        onClose={() => setExpandedItem(null)}
      />
    </AdminPageShell>
  );
};

export default AdminDealRequestsPage;
