import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminPageShell, AdminCard, StatCard, Badge, AdminCardsSkeleton, AdminActionButton } from "../../features/Admin/components/AdminUI";
import { useUserDetails } from "../../features/Admin/hooks/useUsers";

const AdminUserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useUserDetails(id);

  if (loading) {
    return (
      <AdminPageShell 
        title="User Details" 
        subtitle="Review a user's profile and activity counts"
        actions={
          <AdminActionButton
            onClick={() => navigate(-1)}
            variant="secondary"
            className="px-5"
            showArrow={false}
          >
            ← Back
          </AdminActionButton>
        }
      >
        <div className="space-y-4">
          <AdminCard className="p-6">
            <div className="h-7 w-60 rounded bg-slate-200 animate-pulse" />
            <div className="mt-3 h-4 w-72 rounded bg-slate-200 animate-pulse" />
            <div className="mt-4 h-4 w-64 rounded bg-slate-200 animate-pulse" />
          </AdminCard>
          <AdminCardsSkeleton cards={3} />
        </div>
      </AdminPageShell>
    );
  }

  if (error) {
    return (
      <AdminPageShell 
        title="User Details" 
        subtitle="Review a user's profile and activity counts"
        actions={
          <AdminActionButton
            onClick={() => navigate(-1)}
            variant="secondary"
            className="px-5"
            showArrow={false}
          >
            ← Back
          </AdminActionButton>
        }
      >
        <AdminCard className="p-4 text-rose-600">{error}</AdminCard>
      </AdminPageShell>
    );
  }

  if (!data) {
    return (
      <AdminPageShell 
        title="User Details" 
        subtitle="Review a user's profile and activity counts"
        actions={
          <AdminActionButton
            onClick={() => navigate(-1)}
            variant="secondary"
            className="px-5"
            showArrow={false}
          >
            ← Back
          </AdminActionButton>
        }
      >
        <AdminCard className="p-6 text-slate-500">User not found.</AdminCard>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell 
      title="User Details" 
      subtitle="Review a user's profile and activity counts"
      actions={
        <AdminActionButton
          onClick={() => navigate(-1)}
          variant="secondary"
          className="px-5"
          showArrow={false}
        >
          ← Back
        </AdminActionButton>
      }
    >
      <div className="space-y-6">
        <AdminCard className="p-6 border-slate-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-2">User Profile</div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{data.profile.name}</h2>
              <p className="mt-1 text-slate-500 font-medium">{data.profile.email}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {data.profile.isTraveller && <Badge tone="green">Traveller</Badge>}
                {data.profile.isMerchant && <Badge tone="indigo">Merchant</Badge>}
                {data.profile.isAdmin && <Badge tone="yellow">Admin</Badge>}
                <Badge tone={data.profile.status === "active" ? "green" : "red"}>{data.profile.status}</Badge>
              </div>
            </div>
            <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50 lg:w-80 shrink-0">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 font-medium">Contact</span>
                  <span className="text-slate-900 font-semibold">{data.profile.contactNumber || "No contact info"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 font-medium">Joined</span>
                  <span className="text-slate-900 font-semibold">{new Date(data.profile.createdAt).toLocaleDateString()}</span>
                </div>
                {data.profile.merchantProfile && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Associated Merchant</div>
                    <div className="text-sm font-bold text-indigo-600">{data.profile.merchantProfile.businessName}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AdminCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Bookings" value={data.bookingsCount} tone="indigo" />
          <StatCard label="Locks" value={data.locksCount} tone="emerald" />
          <StatCard label="Posts" value={data.postsCount} tone="amber" />
        </div>
      </div>
    </AdminPageShell>
  );
};

export default AdminUserDetailsPage;
