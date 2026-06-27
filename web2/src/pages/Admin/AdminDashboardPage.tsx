import React, { useMemo, useState } from "react";
import { AdminPageShell, AdminCard, StatCard, AdminActionButton, AdminCardsSkeleton } from "../../features/Admin/components/AdminUI";
import { useAdminDashboard } from "../../features/Admin/hooks/useAdminDashboard";
import { CustomDatePicker } from "../../components/Common/CustomDatePicker";

const AdminDashboardPage: React.FC = () => {
  const thisWeek = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);
    
    const monday = new Date(today);
    monday.setDate(diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    return {
      monday: formatDate(monday),
      sunday: formatDate(sunday)
    };
  }, []);

  const [startDate, setStartDate] = useState(thisWeek.monday);
  const [endDate, setEndDate] = useState(thisWeek.sunday);
  const { data, loading, error, setQuery } = useAdminDashboard({ startDate: thisWeek.monday, endDate: thisWeek.sunday });

  const applyFilter = () => {
    setQuery({ startDate: startDate || undefined, endDate: endDate || undefined });
  };

  const incomeChart = useMemo(() => {
    const points = data?.platformIncomeSeries ?? [];
    const maxIncome = Math.max(...points.map((point) => point.income), 1);

    return points.map((point) => ({
      ...point,
      percent: Math.max(6, Math.round((point.income / maxIncome) * 100)),
      label: new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));
  }, [data]);

  return (
    <AdminPageShell
      title="Dashboard"
      subtitle="Platform-wide metrics for the tourism system"
      actions={
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="w-full sm:w-40 z-50">
            <CustomDatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Start Date"
              compact
            />
          </div>
          <div className="w-full sm:w-40 z-40">
            <CustomDatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="End Date"
              compact
            />
          </div>
          <AdminActionButton onClick={applyFilter} variant="primary" className="w-full sm:w-auto justify-center">
            Apply
          </AdminActionButton>
        </div>
      }
    >
      {loading && (
        <div className="space-y-4">
          <AdminCardsSkeleton cards={6} />
          <AdminCard className="p-6">
            <div className="h-5 w-60 rounded bg-slate-200 animate-pulse" />
            <div className="mt-2 h-4 w-80 rounded bg-slate-200 animate-pulse" />
            <div className="mt-6 h-56 rounded-xl bg-slate-100 animate-pulse" />
          </AdminCard>
        </div>
      )}
      {error && !loading && <AdminCard className="p-4 text-rose-600">{error}</AdminCard>}

      {!loading && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
            <StatCard label="Total Users" value={data.totalUsers} tone="indigo" />
            <StatCard label="Total Merchants" value={data.totalMerchants} tone="emerald" />
            <StatCard label="Total Deals" value={data.totalDeals} tone="amber" />
            <StatCard label="Total Accommodations" value={data.totalAccommodations} tone="indigo" />
            <StatCard label="Total Bookings" value={data.totalBookings} tone="rose" />
            <StatCard label="Total Locks" value={data.totalLocks} tone="indigo" />
            <StatCard label="Platform Revenue" value={`$${data.totalPlatformRevenue.toFixed(2)}`} tone="emerald" hint="Deals markup & Accommodation commission" />
          </div>

          <AdminCard className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Platform Income Trend</h2>
                <p className="mt-1 text-sm text-slate-500 font-medium">Income calculated from booked deals (markup) and accommodations (commission).</p>
              </div>
            </div>

            {incomeChart.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-16 text-center text-sm text-slate-500 font-medium">
                No booked-income data for the selected date range.
              </div>
            ) : (
              <div className="flex overflow-x-auto pb-4 gap-3 md:gap-6 items-end h-72 scrollbar-thin scrollbar-thumb-slate-200">
                {incomeChart.map((point) => (
                  <div key={point.date} className="flex flex-col items-center gap-3 min-w-15 md:min-w-20 flex-1">
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                      ${point.income.toFixed(2)}
                    </span>
                    <div className="w-full max-w-12 h-48 flex items-end">
                      <div
                        className="w-full rounded-t-xl bg-linear-to-t from-indigo-600 to-indigo-400 shadow-sm transition-all duration-500 hover:brightness-110"
                        style={{ height: `${point.percent}%` }}
                        title={`${point.label}: $${point.income.toFixed(2)}`}
                      />
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">{point.label}</span>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </>
      )}
    </AdminPageShell>
  );
};

export default AdminDashboardPage;
