import React, { useState, useMemo } from 'react';
import { useMerchantAnalytics } from '../../../features/DealManagement/hooks/useDealAnalytics';
import { useMerchantProfile } from '../../../features/MerchantProfile/hooks/useMerchantProfile';
import { getLocalDateStr } from '../../../lib/date-utils';
import { MerchantTableSkeleton } from '../../../features/MerchantProfile/components/MerchantUI';

const MerchantAnalytics: React.FC = () => {
  // Default to last 7 days (this week)
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

  const { analytics: data, loading, error } = useMerchantAnalytics();
  const { profile } = useMerchantProfile();

  const exportCsv = () => {
    if (!data) return;

    const escapeCsv = (value: string | number) => {
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const lines: string[] = [];
    lines.push('Business Insights Report');
    lines.push(`Company,${escapeCsv(profile?.businessName || 'Merchant Business')}`);
    lines.push(`Description,${escapeCsv(profile?.businessDescription || 'N/A')}`);
    lines.push(`From,${escapeCsv(dateRange.startDate)}`);
    lines.push(`To,${escapeCsv(dateRange.endDate)}`);
    lines.push('');
    lines.push('Summary');
    lines.push('Metric,Value');
    lines.push(`Total Revenue,${escapeCsv(data.overall.totalEarnings)}`);
    lines.push(`Total Booked Slots,${escapeCsv(data.overall.totalBookings)}`);
    lines.push(`Total Locked Slots,${escapeCsv(data.overall.totalLocks)}`);
    lines.push('');
    lines.push('Package Performance');
    lines.push('Package Name,Booked Slots,Locked Slots,Earnings');

    data.dealsBreakdown.forEach((deal) => {
      lines.push([
        escapeCsv(deal.title),
        escapeCsv(deal.bookingsCount),
        escapeCsv(deal.locksCount),
        escapeCsv(deal.earnings),
      ].join(','));
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateSuffix = getLocalDateStr(new Date());
    link.href = url;
    link.download = `business-insights-${dateSuffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printBusinessReport = () => {
    if (!data) return;

    const escapeHtml = (value: string | number | null | undefined) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const buildReportHtml = () => {
      const companyName = profile?.businessName || 'Merchant Business';
      const companyDescription = profile?.businessDescription || 'Business description not provided.';
      const rowsHtml = data.dealsBreakdown
        .map(
          (deal, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(deal.title)}</td>
              <td>${escapeHtml(deal.bookingsCount)}</td>
              <td>${escapeHtml(deal.locksCount)}</td>
              <td class="money">$${escapeHtml(deal.earnings.toLocaleString())}</td>
            </tr>
          `
        )
        .join('');

      return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Business Insights Report</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: "Segoe UI", Arial, sans-serif; color: #1f2937; }
          .header { border-bottom: 2px solid #0e2a47; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: 700; color: #0e2a47; margin: 0; }
          .subtitle { font-size: 12px; color: #6b7280; margin-top: 6px; }
          .section { margin-top: 18px; }
          .section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #0e2a47; margin-bottom: 10px; }
          .meta { display: grid; grid-template-columns: 160px 1fr; gap: 6px 12px; font-size: 12px; }
          .meta .label { color: #6b7280; font-weight: 600; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
          .card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
          .card .value { font-size: 18px; font-weight: 700; color: #111827; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          td.money { text-align: right; font-weight: 700; }
          .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Business Insights Report</h1>
          <div class="subtitle">Prepared for internal business review</div>
        </div>

        <div class="section">
          <h2>Company Information</h2>
          <div class="meta">
            <div class="label">Company Name</div><div>${escapeHtml(companyName)}</div>
            <div class="label">Description</div><div>${escapeHtml(companyDescription)}</div>
            <div class="label">Reporting Period</div><div>${escapeHtml(dateRange.startDate)} to ${escapeHtml(dateRange.endDate)}</div>
            <div class="label">Generated On</div><div>${escapeHtml(new Date().toLocaleString())}</div>
          </div>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="summary">
            <div class="card"><div class="label">Total Revenue</div><div class="value">$${escapeHtml(data.overall.totalEarnings.toLocaleString())}</div></div>
            <div class="card"><div class="label">Booked Slots</div><div class="value">${escapeHtml(data.overall.totalBookings.toLocaleString())}</div></div>
            <div class="card"><div class="label">Locked Slots</div><div class="value">${escapeHtml(data.overall.totalLocks.toLocaleString())}</div></div>
          </div>
        </div>

        <div class="section">
          <h2>Package Performance</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Package Name</th>
                <th>Booked Slots</th>
                <th>Locked Slots</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="5">No package performance data available for this period.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="footer">
          LushWare Merchant Analytics - Confidential Business Document
        </div>
      </body>
      </html>
    `;
    };

    const printWindow = window.open('', '_blank', 'width=1024,height=768');
    if (!printWindow) return;

    const reportHtml = buildReportHtml();

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const shareOnWhatsApp = async () => {
    if (!data) return;

    const escapeHtml = (value: string | number | null | undefined) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const companyName = profile?.businessName || 'Merchant Business';
    const companyDescription = profile?.businessDescription || 'Business description not provided.';
    const rowsHtml = data.dealsBreakdown
      .map(
        (deal, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(deal.title)}</td>
            <td>${escapeHtml(deal.bookingsCount)}</td>
            <td>${escapeHtml(deal.locksCount)}</td>
            <td class="money">$${escapeHtml(deal.earnings.toLocaleString())}</td>
          </tr>
        `
      )
      .join('');

    const reportHtml = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Business Insights Report</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: "Segoe UI", Arial, sans-serif; color: #1f2937; }
          .header { border-bottom: 2px solid #0e2a47; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: 700; color: #0e2a47; margin: 0; }
          .subtitle { font-size: 12px; color: #6b7280; margin-top: 6px; }
          .section { margin-top: 18px; }
          .section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #0e2a47; margin-bottom: 10px; }
          .meta { display: grid; grid-template-columns: 160px 1fr; gap: 6px 12px; font-size: 12px; }
          .meta .label { color: #6b7280; font-weight: 600; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
          .card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
          .card .value { font-size: 18px; font-weight: 700; color: #111827; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          td.money { text-align: right; font-weight: 700; }
          .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Business Insights Report</h1>
          <div class="subtitle">Prepared for internal business review</div>
        </div>

        <div class="section">
          <h2>Company Information</h2>
          <div class="meta">
            <div class="label">Company Name</div><div>${escapeHtml(companyName)}</div>
            <div class="label">Description</div><div>${escapeHtml(companyDescription)}</div>
            <div class="label">Reporting Period</div><div>${escapeHtml(dateRange.startDate)} to ${escapeHtml(dateRange.endDate)}</div>
            <div class="label">Generated On</div><div>${escapeHtml(new Date().toLocaleString())}</div>
          </div>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="summary">
            <div class="card"><div class="label">Total Revenue</div><div class="value">$${escapeHtml(data.overall.totalEarnings.toLocaleString())}</div></div>
            <div class="card"><div class="label">Booked Slots</div><div class="value">${escapeHtml(data.overall.totalBookings.toLocaleString())}</div></div>
            <div class="card"><div class="label">Locked Slots</div><div class="value">${escapeHtml(data.overall.totalLocks.toLocaleString())}</div></div>
          </div>
        </div>

        <div class="section">
          <h2>Package Performance</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Package Name</th>
                <th>Booked Slots</th>
                <th>Locked Slots</th>
                <th>Earnings</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="5">No package performance data available for this period.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="footer">
          LushWare Merchant Analytics - Confidential Business Document
        </div>
      </body>
      </html>
    `;

    const filename = `business-insights-${getLocalDateStr(new Date())}.html`;
    const file = new File([reportHtml], filename, { type: 'text/html' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Business Insights Report',
        text: `Business report for ${companyName}`,
        files: [file],
      });
      return;
    }

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const whatsappMessage = `Business report is ready as ${filename}. Please attach this file in WhatsApp.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 py-6 w-full mx-auto space-y-8">
      {/* Header & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0e2a47]">Business Insights</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor your overall performance and growth</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-col px-3 py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">From</span>
            <input 
              type="date" 
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="bg-transparent border-none text-xs font-bold text-[#0e2a47] outline-none cursor-pointer"
            />
          </div>
          <div className="w-px h-8 bg-slate-100 mx-1" />
          <div className="flex flex-col px-3 py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">To</span>
            <input 
              type="date" 
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="bg-transparent border-none text-xs font-bold text-[#0e2a47] outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100/50">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</h3>
            {loading ? (
              <div className="h-8 w-32 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <p className="text-3xl font-black text-[#0e2a47] tracking-tight">${data?.overall.totalEarnings.toLocaleString()}</p>
            )}
            <p className="text-[10px] text-emerald-600 font-bold mt-2 uppercase tracking-tight">Across all packages</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100/50">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Slots Booked</h3>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <p className="text-3xl font-black text-[#0e2a47] tracking-tight">{data?.overall.totalBookings.toLocaleString()}</p>
            )}
            <p className="text-[10px] text-blue-600 font-bold mt-2 uppercase tracking-tight">Total slots confirmed</p>
          </div>
        </div>
 
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100/50">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Slots Locked</h3>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <p className="text-3xl font-black text-[#0e2a47] tracking-tight">{data?.overall.totalLocks.toLocaleString()}</p>
            )}
            <p className="text-[10px] text-amber-600 font-bold mt-2 uppercase tracking-tight">Slots under intent to purchase and expired</p>
          </div>
        </div>
      </div>
 
      {/* Breakdown Table */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden min-h-100">
        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0e2a47]">Package Performance</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Revenue and activity breakdown by deal</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={printBusinessReport}
              disabled={loading || !data}
              className="text-[10px] font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors uppercase tracking-widest border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Print Report
            </button>
            <button
              type="button"
              onClick={shareOnWhatsApp}
              disabled={loading || !data}
              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors uppercase tracking-widest border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Share WhatsApp
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || !data}
              className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors uppercase tracking-widest border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
          </div>
        </div>
 
        <div className="overflow-x-auto">
          {loading ? (
              <MerchantTableSkeleton />
          ) : data?.dealsBreakdown && data.dealsBreakdown.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none">Package Name</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none text-center">Booked Slots</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none text-center">Locked Slots</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-none text-right">Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.dealsBreakdown.map((deal) => (
                  <tr key={deal.dealId} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-[#0e2a47] text-[10px] flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-200/50">
                          {deal.title.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-[#0e2a47] group-hover:text-blue-600 transition-colors cursor-pointer">{deal.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100/50">
                        {deal.bookingsCount}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-100/50">
                        {deal.locksCount}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-[#0e2a47] text-sm tabular-nums">
                      ${deal.earnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <p className="text-sm text-slate-400">No data available for the selected range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantAnalytics;
