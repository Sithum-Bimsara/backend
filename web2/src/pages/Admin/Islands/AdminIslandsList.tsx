import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AdminPageShell,
  AdminCard,
  Badge,
  AdminActionButton,
  AdminConfirmModal,
  AdminTableSkeleton,
} from "../../../features/Admin/components/AdminUI";
import { useIslands } from "../../../features/Islands/hooks/useIslands";
import { deleteIsland } from "../../../features/Islands/api/island.api";
import Pagination from "../../../components/Pagination/Pagination";

const AdminIslandsList: React.FC = () => {
  const navigate = useNavigate();
  const {
    paginatedData,
    loading,
    page,
    limit,
    search,
    fetchIslands,
    setPage,
    setSearch,
  } = useIslands();

  const [searchInput, setSearchInput] = useState(search);
  const [confirmDeleteIsland, setConfirmDeleteIsland] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchIslands();
  }, [page, search, fetchIslands]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleDelete = async () => {
    if (!confirmDeleteIsland) return;
    setDeleting(true);
    try {
      await deleteIsland(confirmDeleteIsland.id);
      setConfirmDeleteIsland(null);
      fetchIslands();
    } catch (err: any) {
      alert(err.message || "Failed to delete island");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminPageShell
      title="Island Directory"
      subtitle="Manage islands and local guides"
      actions={
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <input
              type="text"
              placeholder="Search islands..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
            <AdminActionButton
              onClick={() => setSearch(searchInput)}
              variant="secondary"
              showArrow={false}
              className="whitespace-nowrap"
            >
              Search
            </AdminActionButton>
          </form>
          <AdminActionButton
            onClick={() => navigate("/admin/islands/create")}
            variant="primary"
            className="w-full sm:w-auto justify-center"
          >
            Add New Island
          </AdminActionButton>
        </div>
      }
    >
      {loading && <AdminTableSkeleton rows={6} cols={5} />}
      {!loading && (
        <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedData.items.map((island) => (
              <AdminCard
                key={island.id}
                className="p-5 space-y-4 shadow-sm border-slate-100"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-base truncate">
                      {island.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      Best for: {island.bestFor}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 py-2 border-y border-slate-50">
                  {island.categories.map((cat) => (
                    <Badge key={cat} tone="indigo">
                      {cat.replace("_", " ")}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>Local Stay: ${island.costLocal}</div>
                  <div>Tourist Stay: ${island.costNonLocal}</div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <AdminActionButton
                    onClick={() => navigate(`/admin/islands/${island.id}/edit`)}
                    variant="secondary"
                    className="flex-1 justify-center py-2"
                    showArrow={false}
                  >
                    Edit
                  </AdminActionButton>
                  <AdminActionButton
                    onClick={() =>
                      setConfirmDeleteIsland({ id: island.id, name: island.name })
                    }
                    variant="danger"
                    className="flex-1 justify-center py-2"
                    showArrow={false}
                  >
                    Delete
                  </AdminActionButton>
                </div>
              </AdminCard>
            ))}
            {paginatedData.items.length === 0 && (
              <AdminCard className="p-10 text-center text-slate-500">
                No islands found.
              </AdminCard>
            )}
          </div>

          {/* Desktop Table View */}
          <AdminCard className="hidden md:block overflow-hidden border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Island Name</th>
                    <th className="px-6 py-4 text-left">Categories</th>
                    <th className="px-6 py-4 text-left">Stay Pricing (Local / Tourist)</th>
                    <th className="px-6 py-4 text-left">Best For</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.items.map((island) => (
                    <tr
                      key={island.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {island.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {island.categories.map((cat) => (
                            <Badge key={cat} tone="indigo">
                              {cat.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        ${island.costLocal} / ${island.costNonLocal} per night
                      </td>
                      <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">
                        {island.bestFor}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <AdminActionButton
                            onClick={() =>
                              navigate(`/admin/islands/${island.id}/edit`)
                            }
                            variant="secondary"
                            showArrow={false}
                          >
                            Edit
                          </AdminActionButton>
                          <AdminActionButton
                            onClick={() =>
                              setConfirmDeleteIsland({
                                id: island.id,
                                name: island.name,
                              })
                            }
                            variant="danger"
                            showArrow={false}
                          >
                            Delete
                          </AdminActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedData.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-400 italic"
                      >
                        No islands found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total results:{" "}
              <span className="text-slate-600">
                {paginatedData.totalItems}
              </span>
            </div>
          </AdminCard>

          <Pagination
            currentPage={paginatedData.currentPage}
            totalItems={paginatedData.totalItems}
            itemsPerPage={limit}
            onPageChange={(p) => setPage(p)}
            loading={loading}
          />
        </div>
      )}

      <AdminConfirmModal
        isOpen={!!confirmDeleteIsland}
        title="Delete Island"
        message={
          confirmDeleteIsland
            ? `Are you sure you want to delete the island "${confirmDeleteIsland.name}"? This action is permanent and will remove all associated guide info.`
            : ""
        }
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteIsland(null)}
      />
    </AdminPageShell>
  );
};

export default AdminIslandsList;
