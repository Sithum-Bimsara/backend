import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminPageShell, AdminCard, Badge, AdminActionButton, AdminConfirmModal, AdminTableSkeleton } from "../../features/Admin/components/AdminUI";
import { useUsers } from "../../features/Admin/hooks/useUsers";
import Pagination from "../../components/Pagination/Pagination";

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [confirmSuspendUser, setConfirmSuspendUser] = useState<{ id: string; name: string } | null>(null);
  const [confirmActivateUser, setConfirmActivateUser] = useState<{ id: string; name: string } | null>(null);
  const { items, total, loading, error, query, setQuery, suspendUser, activateUser } = useUsers();

  const applyFilters = () => setQuery({ ...query, page: 1, search: search || undefined });

  return (
    <AdminPageShell
      title="Users"
      subtitle="Manage travellers"
      actions={
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users"
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          <AdminActionButton onClick={applyFilters} variant="primary" className="w-full sm:w-auto justify-center">
            Search By Name
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
            {items.map((user) => (
              <AdminCard key={user.id} className="p-5 space-y-4 shadow-sm border-slate-100">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-base truncate">{user.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{user.email}</div>
                  </div>
                  <Badge tone={user.status === "active" ? "green" : "red"}>
                    {user.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 py-2 border-y border-slate-50">
                  {user.isTraveller && <Badge tone="green">Traveller</Badge>}
                  {user.isMerchant && <Badge tone="indigo">Merchant</Badge>}
                  {user.isAdmin && <Badge tone="yellow">Admin</Badge>}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <AdminActionButton
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    variant="secondary"
                    className="flex-1 justify-center py-2"
                  >
                    Details
                  </AdminActionButton>
                  {user.status === "active" ? (
                    <AdminActionButton
                      onClick={() => setConfirmSuspendUser({ id: user.id, name: user.name })}
                      variant="danger"
                      className="flex-1 justify-center py-2"
                    >
                      Suspend
                    </AdminActionButton>
                  ) : (
                    <AdminActionButton
                      onClick={() => setConfirmActivateUser({ id: user.id, name: user.name })}
                      variant="success"
                      className="flex-1 justify-center py-2"
                    >
                      Activate
                    </AdminActionButton>
                  )}
                </div>
              </AdminCard>
            ))}
            {items.length === 0 && (
              <AdminCard className="p-10 text-center text-slate-500">No users found.</AdminCard>
            )}
          </div>

          {/* Desktop Table View */}
          <AdminCard className="hidden md:block overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Roles</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {user.isTraveller && <Badge tone="green">Traveller</Badge>}
                          {user.isMerchant && <Badge tone="indigo">Merchant</Badge>}
                          {user.isAdmin && <Badge tone="yellow">Admin</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge tone={user.status === "active" ? "green" : "red"}>{user.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <AdminActionButton onClick={() => navigate(`/admin/users/${user.id}`)} variant="secondary">Details</AdminActionButton>
                          {user.status === "active" ? (
                            <AdminActionButton onClick={() => setConfirmSuspendUser({ id: user.id, name: user.name })} variant="danger">Suspend</AdminActionButton>
                          ) : (
                            <AdminActionButton onClick={() => setConfirmActivateUser({ id: user.id, name: user.name })} variant="success">Activate</AdminActionButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No users found.</td>
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
            isOpen={!!confirmSuspendUser}
            title="Suspend Traveller"
            message={confirmSuspendUser ? `Are you sure you want to suspend ${confirmSuspendUser.name}?` : ""}
            confirmLabel="Suspend"
            tone="danger"
            onConfirm={async () => {
              if (!confirmSuspendUser) return;
              await suspendUser(confirmSuspendUser.id);
              setConfirmSuspendUser(null);
            }}
            onCancel={() => setConfirmSuspendUser(null)}
          />

          <AdminConfirmModal
            isOpen={!!confirmActivateUser}
            title="Activate Traveller"
            message={confirmActivateUser ? `Are you sure you want to activate ${confirmActivateUser.name}?` : ""}
            confirmLabel="Activate"
            tone="indigo"
            onConfirm={async () => {
              if (!confirmActivateUser) return;
              await activateUser(confirmActivateUser.id);
              setConfirmActivateUser(null);
            }}
            onCancel={() => setConfirmActivateUser(null)}
          />
        </div>
      )}
    </AdminPageShell>
  );
};

export default AdminUsersPage;
