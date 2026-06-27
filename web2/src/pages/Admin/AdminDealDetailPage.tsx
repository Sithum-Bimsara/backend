import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AdminPageShell,
  AdminCard,
  Badge,
  AdminActionButton,
} from "../../features/Admin/components/AdminUI";
import { useAdminDealDetail } from "../../features/Admin/hooks/useAdminDeals";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <AdminCard className="overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </AdminCard>
);

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="flex justify-between items-start gap-6 py-2 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-400 font-medium shrink-0">{label}</span>
    <span className="text-sm text-slate-900 font-semibold text-right break-words max-w-[60%]">
      {value ?? <span className="italic text-slate-300">—</span>}
    </span>
  </div>
);

const AdminDealDetailPage: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { data, loading, error, saving, saveError, saveDeal, saveVariantPrice } = useAdminDealDetail(dealId);

  const [draftPrice, setDraftPrice] = useState<string>("");
  const [draftOriginalPrice, setDraftOriginalPrice] = useState<string>("");
  const [draftActive, setDraftActive] = useState<boolean>(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setDraftPrice(data.displayedPrice != null ? String(data.displayedPrice) : "");
      setDraftOriginalPrice(data.originalPrice != null ? String(data.originalPrice) : "");
      setDraftActive(data.isActive);
    }
  }, [data]);

  const handleSave = async () => {
    const payload: { displayedPrice?: number; originalPrice?: number; isActive?: boolean } = {};
    const parsedPrice = parseFloat(draftPrice);
    const parsedOriginalPrice = parseFloat(draftOriginalPrice);
    if (!isNaN(parsedPrice)) payload.displayedPrice = parsedPrice;
    if (!isNaN(parsedOriginalPrice)) payload.originalPrice = parsedOriginalPrice;
    payload.isActive = draftActive;
    await saveDeal(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const variantStatusBadge = (status: string) => {
    if (status === "active") return <Badge tone="green">active</Badge>;
    if (status === "sold_out") return <Badge tone="red">sold out</Badge>;
    if (status === "cancelled") return <Badge tone="gray">cancelled</Badge>;
    return <Badge tone="yellow">{status}</Badge>;
  };

  const sortedVariants = data?.variants ? [...data.variants].sort((a, b) => {
    const dateA = a.startDatetime ? new Date(a.startDatetime).getTime() : 0;
    const dateB = b.startDatetime ? new Date(b.startDatetime).getTime() : 0;
    return dateB - dateA;
  }) : [];

  return (
    <AdminPageShell
      title="Deal Details"
      subtitle="Full view of a merchant deal — edit displayed price and status below"
      actions={
        <AdminActionButton
          onClick={() => navigate(-1)}
          variant="secondary"
          className="justify-center"
        >
          ← Back
        </AdminActionButton>
      }
    >
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <AdminCard key={i} className="p-6 space-y-3">
              <div className="h-4 w-1/3 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
            </AdminCard>
          ))}
        </div>
      )}

      {error && !loading && (
        <AdminCard className="p-6 text-rose-600">{error}</AdminCard>
      )}

      {!loading && data && (
        <div className="space-y-5">
          {/* ── Overview ── */}
          <AdminCard className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-2">
                  {data.merchant.businessName}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {data.title ?? "Untitled Deal"}
                </h2>
                {data.description && (
                  <p className="mt-3 text-slate-600 leading-relaxed text-sm md:text-base max-w-3xl">
                    {data.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone={data.isActive ? "green" : "red"}>
                    {data.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {data.location && <Badge tone="gray">📍 {data.location}</Badge>}
                  {data.category && <Badge tone="indigo">{data.category}</Badge>}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/50">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Display Price</div>
                    <div className="text-xl font-bold text-indigo-600">
                      {data.displayedPrice != null ? `$${data.displayedPrice.toFixed(2)}` : "—"}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-indigo-100/50 hidden sm:block" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Original Price</div>
                    <div className="text-xl font-bold text-slate-500 line-through">
                      {data.originalPrice != null ? `$${data.originalPrice.toFixed(2)}` : "—"}
                    </div>
                  </div>
                  <div className="w-px h-8 bg-indigo-100/50 hidden sm:block" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deal Price</div>
                    <div className="text-xl font-bold text-slate-700">
                      {data.dealPrice != null ? `$${data.dealPrice.toFixed(2)}` : "—"}
                    </div>
                  </div>

                  {data.dealLockExpireTime != null && (
                    <div className="pl-8 border-l border-indigo-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lock Duration</div>
                      <div className="text-xl font-bold text-indigo-600">
                        {data.dealLockExpireTime} <span className="text-sm font-medium">days</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-100 lg:w-96 shrink-0 space-y-3">
                <InfoRow label="Merchant" value={data.merchant.businessName} />
                <InfoRow label="Contact" value={data.merchant.contactNumber} />
                <InfoRow label="Owner" value={data.merchant.user.name} />
                <InfoRow label="Email" value={data.merchant.user.email} />
                <InfoRow label="Bookings" value={data._count.bookings} />
                <InfoRow label="Active Locks" value={data._count.locks} />
                <InfoRow
                  label="Created"
                  value={new Date(data.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                />
                <InfoRow
                  label="Updated"
                  value={new Date(data.updatedAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                />
              </div>
            </div>
          </AdminCard>

          {/* ── Admin Edit Panel ── */}
          <AdminCard className="overflow-hidden border-2 border-indigo-100">
            <div className="px-6 py-4 border-b border-indigo-50 bg-indigo-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                  Admin Controls
                </h3>
                <p className="text-xs text-indigo-400 mt-0.5">Only admins can modify these fields</p>
              </div>
              {saved && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                  ✓ Saved
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Displayed Price */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Displayed Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draftPrice}
                      onChange={(e) => setDraftPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    <p className="text-[11px] text-slate-400">
                      Original price:{" "}
                      <span className="font-semibold text-slate-600 line-through">
                        {data.originalPrice != null ? `$${data.originalPrice.toFixed(2)}` : "—"}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Deal price:{" "}
                      <span className="font-semibold text-slate-600">
                        {data.dealPrice != null ? `$${data.dealPrice.toFixed(2)}` : "—"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Original Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draftOriginalPrice}
                      onChange={(e) => setDraftOriginalPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Base original price for the deal.
                  </p>
                </div>

                {/* Status toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Deal Status
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDraftActive(true)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                        draftActive
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      ✓ Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftActive(false)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                        !draftActive
                          ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      ✕ Inactive
                    </button>
                  </div>
                </div>
              </div>

              {saveError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-600 font-medium">
                  {saveError}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <AdminActionButton
                  onClick={handleSave}
                  variant="primary"
                  disabled={saving}
                  showArrow={false}
                  className="px-8 py-2.5"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </AdminActionButton>
              </div>
            </div>
          </AdminCard>


          {/* ── Inclusions ── */}
          {data.inclusions.length > 0 && (
            <Section title={`Inclusions (${data.inclusions.length})`}>
              <ul className="space-y-2">
                {data.inclusions.map((inc) => (
                  <li key={inc.id} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-0.5 text-emerald-500 font-bold shrink-0">✓</span>
                    {inc.description}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* ── Exclusions ── */}
          {data.exclusions.length > 0 && (
            <Section title={`Exclusions (${data.exclusions.length})`}>
              <ul className="space-y-3">
                {data.exclusions.map((exc) => (
                  <li key={exc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group transition-all hover:border-indigo-100 hover:bg-white">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 text-rose-400 font-bold shrink-0">✕</span>
                      <span className="text-sm text-slate-700 font-medium">{exc.description}</span>
                    </div>
                    {exc.additionalPrice != null && exc.additionalPrice > 0 && (
                      <div className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs border border-indigo-100">
                        +${exc.additionalPrice.toFixed(2)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* ── Itinerary ── */}
          {data.itineraries.length > 0 && (
            <Section title={`Itinerary (${data.itineraries.length} days)`}>
              <div className="space-y-5">
                {data.itineraries.map((day) => (
                  <div key={day.id} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      D{day.dayNumber}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{day.title ?? `Day ${day.dayNumber}`}</div>
                      {day.description && (
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">{day.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Variants ── */}
          <Section title={`Dates this deal run/ran (${data.variants.length})`}>
            {data.variants.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No variants scheduled.</p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto pr-2 -mr-2">
                {/* Mobile */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {sortedVariants.map((v) => (
                    <div key={v.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">
                          {v.startDatetime
                            ? new Date(v.startDatetime).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "No Date"}
                        </div>
                        {variantStatusBadge(v.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500">
                        <span>
                          Time:{" "}
                          <strong className="text-slate-700">
                            {v.startDatetime
                              ? new Date(v.startDatetime).toLocaleTimeString(undefined, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </strong>
                        </span>
                        <span>
                          Slots:{" "}
                          <div className="inline-flex flex-col">
                            <strong className="text-slate-700">
                              {v.availableSlots ?? 0}/{v.totalSlots ?? 0}
                            </strong>
                            <span className="text-[9px] text-slate-400">
                              ({v._count.bookings} booked, {v._count.locks} locked)
                            </span>
                          </div>
                        </span>
                        <span>
                          Price:{" "}
                          <VariantPriceEditor
                            variantId={v.id}
                            initialPrice={v.displayedPrice ?? 0}
                            onSave={saveVariantPrice}
                            isPast={v.startDatetime ? new Date(v.startDatetime).getTime() < new Date().setHours(0,0,0,0) : false}
                            hasActivity={v._count.bookings > 0 || v._count.locks > 0}
                          />
                        </span>
                        <span>
                          Deal:{" "}
                          <strong className="text-slate-700">
                            {v.dealPrice != null ? `$${v.dealPrice.toFixed(2)}` : "—"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-widest text-slate-400 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left">Trip Date</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Slots</th>
                        <th className="px-6 py-3 text-right">Deal Price</th>
                        <th className="px-6 py-3 text-right">Display Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {sortedVariants.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-3 text-slate-800 font-semibold">
                            {v.startDatetime
                              ? new Date(v.startDatetime).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                            <span className="ml-2 text-xs text-slate-400 font-medium">
                              {v.startDatetime
                                ? new Date(v.startDatetime).toLocaleTimeString(undefined, {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">{variantStatusBadge(v.status)}</td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-slate-700">
                                {v.availableSlots ?? 0} / {v.totalSlots ?? 0}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {v._count.bookings} booked, {v._count.locks} locked
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right text-slate-700 font-semibold">
                            {v.dealPrice != null ? `$${v.dealPrice.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <VariantPriceEditor
                              variantId={v.id}
                              initialPrice={v.displayedPrice ?? 0}
                              onSave={saveVariantPrice}
                              isPast={v.startDatetime ? new Date(v.startDatetime).getTime() < new Date().setHours(0,0,0,0) : false}
                              hasActivity={v._count.bookings > 0 || v._count.locks > 0}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Section>
        </div>
      )}
    </AdminPageShell>
  );
};

const VariantPriceEditor: React.FC<{
  variantId: string;
  initialPrice: number;
  onSave: (id: string, price: number) => Promise<void>;
  isPast: boolean;
  hasActivity: boolean;
}> = ({ variantId, initialPrice, onSave, isPast, hasActivity }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(initialPrice));
  const [saving, setSaving] = useState(false);

  const disabled = isPast || hasActivity;
  const tooltip = isPast ? "Past variant" : hasActivity ? "Has active bookings/locks" : "";

  if (!editing) {
    return (
      <div className="flex items-center justify-end gap-2 group">
        <span className="font-semibold text-slate-700">${initialPrice.toFixed(2)}</span>
        {!disabled && (
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded bg-indigo-50 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600 transition-all"
            title="Edit Price"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
        {disabled && (
          <div className="p-1 text-slate-300" title={tooltip}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <div className="relative">
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">$</span>
        <input
          autoFocus
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 pl-4 pr-1.5 py-1 rounded border border-indigo-200 text-right text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <button
        disabled={saving}
        onClick={async () => {
          try {
            setSaving(true);
            await onSave(variantId, parseFloat(value));
            setEditing(false);
          } catch (err) {
            // Error handled by hook
          } finally {
            setSaving(false);
          }
        }}
        className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {saving ? (
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <button
        disabled={saving}
        onClick={() => {
          setEditing(false);
          setValue(String(initialPrice));
        }}
        className="p-1 rounded bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default AdminDealDetailPage;
