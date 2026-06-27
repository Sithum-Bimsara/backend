import React, { useState, useEffect } from 'react';
import { useDealDetail } from '../../../features/DealManagement/hooks/useDealDetail';
import * as dealsApi from '../../../features/DealManagement/api/deals.api';
import type { IDeal } from '../../../features/DealManagement/types/deals.types';
import { DealDetailsSkeleton } from '../../../features/MerchantProfile/components/MerchantUI';
import DealPageHeader from '../../../features/DealManagement/components/DealPageHeader';
import { uploadDealImageToStorage, deleteDealImageFromStorage } from '../../../features/DealManagement/utils/deal-image-upload';
import { DEFAULT_DEAL_IMAGE_URL } from '../../../lib/deal-image';
import { ErrorHandler } from '../../../utils/error-handler';

interface Props {
  dealId: string;
  onBack: () => void;
  onNavigate: (tab: 'details' | 'availability' | 'bookings') => void;
}

const DealDetailsPage: React.FC<Props> = ({ dealId, onBack, onNavigate }) => {
  const { deal, loading, actions } = useDealDetail(dealId);

  if (loading) return <DealDetailsSkeleton />;
  if (!deal) return <div className="p-8 text-center text-slate-400 font-medium">Deal not found</div>;

  return (
    <div className="bg-(--app-bg) min-h-screen">
      <DealPageHeader 
        deal={deal} 
        onBack={onBack} 
        activeTab="details" 
        onTabChange={onNavigate} 
        onRefresh={actions.refetchDeal}
        isRefreshing={loading}
      />
      
      {/* ─── Main Responsive Container ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <DetailsTabContent deal={deal} onDealUpdated={actions.refetchDeal} />
      </main>
    </div>
  );
};

// ─── Sub-Components for Premium Feel ───

const Card: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }> = ({ 
  title, children, action, className = "" 
}) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}>
    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
      <h3 className="text-[15px] font-bold text-[#0e2a47] tracking-tight">{title}</h3>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; error?: string; helper?: string; className?: string }> = ({ 
  label, children, error, helper, className = "" 
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    {children}
    {error ? (
      <p className="text-[10px] text-red-500 font-semibold ml-1 mt-1">{error}</p>
    ) : helper ? (
      <p className="text-[10px] text-slate-400 font-medium ml-1 mt-1">{helper}</p>
    ) : null}
  </div>
);

const DealImagesCard: React.FC<{ deal: IDeal, onDealUpdated: () => void }> = ({ deal, onDealUpdated }) => {
  const [uploadingBySlot, setUploadingBySlot] = useState<Record<string, boolean>>({});
  const [errorBySlot, setErrorBySlot] = useState<Record<string, string | null>>({});

  const IMAGE_SLOTS = [
    { key: 'primaryImageUrl' as const, label: 'Primary Image', required: true },
    { key: 'secondImageUrl' as const, label: 'Second Image', required: false },
    { key: 'thirdImageUrl' as const, label: 'Third Image', required: false },
    { key: 'fourthImageUrl' as const, label: 'Fourth Image', required: false },
  ];

  const handleFileChange = async (slot: 'primaryImageUrl' | 'secondImageUrl' | 'thirdImageUrl' | 'fourthImageUrl', file: File | null) => {
    if (!file) return;

    setUploadingBySlot(prev => ({ ...prev, [slot]: true }));
    setErrorBySlot(prev => ({ ...prev, [slot]: null }));

    try {
      const oldUrl = deal[slot];
      const newUrl = await uploadDealImageToStorage(file, slot);
      
      await dealsApi.updateDeal(deal.id, { [slot]: newUrl });
      
      if (oldUrl) {
        await deleteDealImageFromStorage(oldUrl);
      }
      
      onDealUpdated();
    } catch (err: unknown) {
      const message = ErrorHandler.getErrorMessage(err, 'Upload failed');
      setErrorBySlot(prev => ({ ...prev, [slot]: message }));
    } finally {
      setUploadingBySlot(prev => ({ ...prev, [slot]: false }));
    }
  };

  const handleDelete = async (slot: 'primaryImageUrl' | 'secondImageUrl' | 'thirdImageUrl' | 'fourthImageUrl') => {
    setUploadingBySlot(prev => ({ ...prev, [slot]: true }));
    setErrorBySlot(prev => ({ ...prev, [slot]: null }));

    try {
      const oldUrl = deal[slot];
      await dealsApi.updateDeal(deal.id, { [slot]: '' });
      
      if (oldUrl) {
        await deleteDealImageFromStorage(oldUrl);
      }
      
      onDealUpdated();
    } catch (err: unknown) {
      const message = ErrorHandler.getErrorMessage(err, 'Delete failed');
      setErrorBySlot(prev => ({ ...prev, [slot]: message }));
    } finally {
      setUploadingBySlot(prev => ({ ...prev, [slot]: false }));
    }
  };

  return (
    <Card title="Deal Images">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {IMAGE_SLOTS.map(({ key, label, required }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {label} {required && <span className="text-[#ff7b54] ml-1">*</span>}
            </label>
            <div className="rounded-xl border border-slate-200 bg-white p-1.5">
              <div className="relative h-28 rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                <img
                  src={deal[key] || DEFAULT_DEAL_IMAGE_URL}
                  alt={label}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = DEFAULT_DEAL_IMAGE_URL; }}
                />
                {uploadingBySlot[key] && (
                  <div className="absolute inset-0 bg-[#0e2a47]/55 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold animate-pulse">Processing...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => {
                      void handleFileChange(key, e.target.files?.[0] ?? null);
                      e.currentTarget.value = '';
                    }}
                    className="hidden"
                    disabled={uploadingBySlot[key]}
                  />
                  <span className="w-full inline-flex justify-center items-center px-3 py-2 rounded-lg text-xs font-semibold text-[#0e2a47] bg-[#e8fffa] hover:bg-[#d9fbf3] transition-all cursor-pointer">
                    {deal[key] ? 'Replace' : 'Upload'}
                  </span>
                </label>
                {deal[key] && (!required) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(key)}
                    disabled={uploadingBySlot[key]}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-[#b45309] bg-amber-50 hover:bg-amber-100 transition-all border border-amber-100 cursor-pointer disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            {errorBySlot[key] && (
              <p className="mt-1.5 text-[11px] text-red-500 font-medium">{errorBySlot[key]}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─── Extracted Details Content ───
const DetailsTabContent: React.FC<{ deal: IDeal, onDealUpdated?: () => Promise<void> | void }> = ({ deal, onDealUpdated }) => {
  const hasBookings = (deal._count?.bookings ?? 0) > 0;
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: deal.category || '',
    durationDays: deal.durationDays?.toString() || '',
    dealPrice: deal.dealPrice?.toString() || '',
    originalPrice: deal.originalPrice?.toString() || '',
    description: deal.description || '',
    isLocalOnly: deal.isLocalOnly || false,
    currency: deal.currency || (deal.isLocalOnly ? 'MVR' : 'USD'),
    dealLockExpireTime: deal.dealLockExpireTime?.toString() || '',
    itineraries: (deal.itineraries || []).map((item) => ({
      dayNumber: item.dayNumber?.toString() || '',
      title: item.title || '',
      description: item.description || '',
    })),
    inclusions: (deal.inclusions || []).map((inc) => inc.description || ''),
    exclusions: (deal.exclusions || []).map((exc) => ({
      description: exc.description || '',
      additionalPrice: exc.additionalPrice?.toString() || '',
    })),
  });

  useEffect(() => {
    setForm({
      category: deal.category || '',
      durationDays: deal.durationDays?.toString() || '',
      dealPrice: deal.dealPrice?.toString() || '',
      originalPrice: deal.originalPrice?.toString() || '',
      description: deal.description || '',
      isLocalOnly: deal.isLocalOnly || false,
      currency: deal.currency || (deal.isLocalOnly ? 'MVR' : 'USD'),
      dealLockExpireTime: deal.dealLockExpireTime?.toString() || '',
      itineraries: (deal.itineraries || []).map((item) => ({
        dayNumber: item.dayNumber?.toString() || '',
        title: item.title || '',
        description: item.description || '',
      })),
      inclusions: (deal.inclusions || []).map((inc) => inc.description || ''),
      exclusions: (deal.exclusions || []).map((exc) => ({
        description: exc.description || '',
        additionalPrice: exc.additionalPrice?.toString() || '',
      })),
    });
    setIsEditing(false);
    setSaveError(null);
  }, [deal]);

  const toNumberOrUndefined = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const buildDurationValidationMessage = (): string | null => {
    const durationDays = toNumberOrUndefined(form.durationDays);
    const validItineraries = form.itineraries
      .filter((item) => Number.isFinite(Number(item.dayNumber)) && Number(item.dayNumber) > 0 && item.title.trim());
    
    const dealPrice = toNumberOrUndefined(form.dealPrice);
    const originalPrice = toNumberOrUndefined(form.originalPrice);

    if (dealPrice !== undefined && originalPrice !== undefined) {
      const rate = form.isLocalOnly ? 0.08 : 0.03;
      const displayedPrice = Math.round(dealPrice * (1 + rate));
      const symbol = form.currency === 'MVR' ? 'MVR' : '$';
      if (displayedPrice >= originalPrice) {
        return `Final Price (${symbol}${displayedPrice}) must be lower than Original Price (${symbol}${originalPrice}).`;
      }
    }

    if (!durationDays || durationDays <= 0) return 'Duration must be greater than 0';
    if (validItineraries.length === 0) return 'Add at least one itinerary day';

    if (durationDays !== validItineraries.length) {
      const diff = durationDays - validItineraries.length;
      return diff > 0 
        ? `Add ${diff} more itinerary day${diff > 1 ? 's' : ''}` 
        : `Remove ${Math.abs(diff)} itinerary day${Math.abs(diff) > 1 ? 's' : ''}`;
    }

    return null;
  };

  const handleSave = async () => {
    setSaveError(null);
    const validationError = buildDurationValidationMessage();
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setSaving(true);
    try {
      await dealsApi.updateDeal(deal.id, {
        category: form.category.trim() || undefined,
        durationDays: toNumberOrUndefined(form.durationDays),
        dealPrice: toNumberOrUndefined(form.dealPrice),
        originalPrice: toNumberOrUndefined(form.originalPrice),
        description: form.description.trim() || undefined,
        isLocalOnly: form.isLocalOnly,
        dealLockExpireTime: toNumberOrUndefined(form.dealLockExpireTime),
        itineraries: form.itineraries
          .filter((item) => item.title.trim())
          .map((item) => ({
            dayNumber: Number(item.dayNumber),
            title: item.title.trim(),
            description: item.description.trim(),
          })),
        inclusions: form.inclusions
          .map((inc) => inc.trim())
          .filter(Boolean)
          .map((desc) => ({ description: desc })),
        exclusions: form.exclusions
          .filter((exc) => exc.description.trim())
          .map((exc) => ({
            description: exc.description.trim(),
            additionalPrice: toNumberOrUndefined(exc.additionalPrice),
          })),
        currency: form.currency,
      });
      if (onDealUpdated) await onDealUpdated();
      setIsEditing(false);
    } catch (err: unknown) {
      let errMsg = 'Failed to save changes';
      if (err && typeof err === 'object') {
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        errMsg = axiosErr.response?.data?.message || axiosErr.message || errMsg;
      }
      setSaveError(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#0e2a47] font-medium outline-none focus:border-[#2dd4af] focus:ring-4 focus:ring-[#2dd4af]/5 disabled:bg-slate-50 disabled:text-slate-400 transition-all placeholder:text-slate-300";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-5">
      
      {/* ─── Left Column (Main Content) ─── */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* Overview Card */}
        <Card 
          title="Deal Overview" 
          action={
            !isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#2dd4af] bg-[#2dd4af]/5 hover:bg-[#2dd4af]/10 transition-all"
              >
                Edit Details
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSaveError(null);
                  }}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0e2a47] hover:bg-[#1a3a5a] shadow-lg shadow-[#0e2a47]/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )
          }
        >
          {saveError && (
            <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <FormField label="Category">
              <input
                value={form.category}
                disabled={!isEditing || saving}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Adventure, Relaxing"
                className={inputClasses}
              />
            </FormField>

            <FormField 
              label="Duration (Days)" 
              helper={hasBookings ? "Duration is locked due to active bookings" : undefined}
            >
              <input
                type="number"
                min={1}
                value={form.durationDays}
                disabled={!isEditing || saving || hasBookings}
                onChange={(e) => setForm((prev) => ({ ...prev, durationDays: e.target.value }))}
                className={inputClasses}
              />
            </FormField>

            <FormField 
              label={`Deal Price (${form.currency === 'MVR' ? 'MVR' : '$'})`}
              helper={
                isEditing && deal.isActive 
                  ? "Cannot update deal prices when deal is active" 
                  : `Final customer price: ~${form.currency === 'MVR' ? 'MVR' : '$'}${Math.round(Number(form.dealPrice || 0) * (form.isLocalOnly ? 1.08 : 1.03))} (incl. ${form.isLocalOnly ? '8%' : '3%'} fee)`
              }
            >
              <input
                type="number"
                value={form.dealPrice}
                disabled={!isEditing || saving || deal.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, dealPrice: e.target.value }))}
                className={`${inputClasses} font-bold text-[#2dd4af] ${deal.isActive && isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </FormField>

            <FormField 
              label={`Original Price (${form.currency === 'MVR' ? 'MVR' : '$'})`}
              helper={isEditing && deal.isActive ? "Cannot update deal prices when deal is active" : undefined}
            >
              <input
                type="number"
                value={form.originalPrice}
                disabled={!isEditing || saving || deal.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, originalPrice: e.target.value }))}
                className={`${inputClasses} ${deal.isActive && isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </FormField>
          </div>

          <FormField label="Description" className="mt-8">
            <textarea
              value={form.description}
              disabled={!isEditing || saving}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
              className={`${inputClasses} resize-none leading-relaxed text-slate-600`}
              placeholder="Provide a detailed description of the deal..."
            />
          </FormField>
        </Card>

        <DealImagesCard deal={deal} onDealUpdated={async () => { if (onDealUpdated) await onDealUpdated(); }} />

        {/* Itinerary Card */}
        <Card title="Detailed Itinerary">
          {isEditing ? (
            <div className="space-y-4">
              {form.itineraries.map((item, idx) => (
                <div key={`itinerary-${idx}`} className="rounded-2xl border border-slate-100 p-5 bg-slate-50/40 space-y-4 transition-all">
                  <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto] gap-3 items-center">
                    <FormField label="Day">
                      <input
                        type="number"
                        min={1}
                        value={item.dayNumber}
                        disabled={saving}
                        onChange={(e) => {
                          const next = [...form.itineraries];
                          next[idx] = { ...next[idx], dayNumber: e.target.value };
                          setForm((prev) => ({ ...prev, itineraries: next }));
                        }}
                        className={inputClasses}
                      />
                    </FormField>
                    <FormField label="Title">
                      <input
                        value={item.title}
                        disabled={saving}
                        onChange={(e) => {
                          const next = [...form.itineraries];
                          next[idx] = { ...next[idx], title: e.target.value };
                          setForm((prev) => ({ ...prev, itineraries: next }));
                        }}
                        placeholder="Heading for this day"
                        className={inputClasses}
                      />
                    </FormField>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setForm((prev) => ({ ...prev, itineraries: prev.itineraries.filter((_, i) => i !== idx) }))}
                      className="mt-6 sm:mt-5 p-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                  <FormField label="Activities Description">
                    <textarea
                      value={item.description}
                      disabled={saving}
                      onChange={(e) => {
                        const next = [...form.itineraries];
                        next[idx] = { ...next[idx], description: e.target.value };
                        setForm((prev) => ({ ...prev, itineraries: next }));
                      }}
                      placeholder="Activities on this day (- Point 1...)"
                      rows={4}
                      className={`${inputClasses} resize-none leading-relaxed`}
                    />
                  </FormField>
                </div>
              ))}
              <button
                onClick={() => setForm((prev) => ({
                  ...prev,
                  itineraries: [...prev.itineraries, { dayNumber: (prev.itineraries.length + 1).toString(), title: '', description: '' }]
                }))}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold hover:border-[#2dd4af] hover:text-[#2dd4af] hover:bg-[#2dd4af]/5 transition-all flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Itinerary Day
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {deal.itineraries?.map((item) => (
                <div key={item.id} className="flex gap-6 p-6 rounded-2xl border border-slate-50 bg-slate-50/30 group hover:border-slate-100 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#0e2a47] text-white flex flex-col items-center justify-center shrink-0 shadow-lg shadow-[#0e2a47]/10">
                    <span className="text-[9px] uppercase font-black opacity-60 leading-none">Day</span>
                    <span className="text-base font-bold leading-none mt-1">{item.dayNumber}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="text-[15px] font-bold text-[#0e2a47] group-hover:text-[#2dd4af] transition-colors">{item.title || `Day ${item.dayNumber ?? ''}`}</h4>
                    {item.description && (
                      <ul className="mt-3 space-y-2">
                        {item.description.split('\n').filter(p => p.trim()).map((point, pIdx) => (
                          <li key={pIdx} className="text-[13px] text-slate-500 leading-relaxed flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4af] shrink-0 mt-1.5 shadow-[0_0_8px_rgba(45,212,175,0.4)]" />
                            <span>{point.replace(/^[•\-*]\s*/, '').trim()}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
              {(!deal.itineraries || deal.itineraries.length === 0) && (
                <div className="text-center py-10 text-slate-400 text-sm italic">No itinerary details added yet.</div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ─── Right Column (Sidebar) ─── */}
      <div className="xl:col-span-1 space-y-8">
        
        {/* Quick Status / ID Card (New for balance) - Hidden on mobile */}
        <div className="hidden xl:block bg-linear-to-br from-[#0e2a47] to-[#1a3a5a] rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Pricing</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${deal.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
              {deal.isActive ? 'Live' : 'Inactive'}
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight mb-6">
            <span className="text-sm font-medium opacity-60 mr-1.5">{deal.currency}</span>
            {deal.displayedPrice}
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
             <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Bookings</p>
                <p className="text-xl font-bold mt-0.5">{deal._count?.bookings ?? 0}</p>
             </div>
             <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Created</p>
                <p className="text-sm font-bold mt-1">{new Date(deal.createdAt).toLocaleDateString()}</p>
             </div>
          </div>
        </div>

        {/* Inclusions Card */}
        <Card title="What's Included">
          {isEditing ? (
            <div className="space-y-3">
              {form.inclusions.map((inc, idx) => (
                <div key={`inclusion-${idx}`} className="flex items-center gap-2 group">
                  <div className="flex-1">
                    <input
                      value={inc}
                      disabled={saving}
                      onChange={(e) => {
                        const next = [...form.inclusions];
                        next[idx] = e.target.value;
                        setForm((prev) => ({ ...prev, inclusions: next }));
                      }}
                      placeholder="e.g. Daily Breakfast"
                      className={`${inputClasses} py-2.5!`}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setForm((prev) => ({ ...prev, inclusions: prev.inclusions.filter((_, i) => i !== idx) }))}
                    className="p-2.5 rounded-xl border border-slate-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => setForm((prev) => ({ ...prev, inclusions: [...prev.inclusions, ''] }))}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-100 text-slate-400 text-[11px] font-bold hover:border-emerald-200 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all"
              >
                + Add Inclusion
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {deal.inclusions && deal.inclusions.length > 0 ? (
                deal.inclusions.map((inc) => (
                  <div key={inc.id} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/30 border border-emerald-100/30">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-200">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <span className="text-[13px] font-semibold text-emerald-800 leading-tight">{inc.description}</span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic">No inclusions specified</div>
              )}
            </div>
          )}
        </Card>

        {/* Exclusions Card */}
        <Card title="What's Excluded">
          {isEditing ? (
            <div className="space-y-4">
              {form.exclusions.map((exc, idx) => (
                <div key={`exclusion-${idx}`} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-3 group">
                  <div className="flex items-center gap-2">
                    <input
                      value={exc.description}
                      disabled={saving}
                      onChange={(e) => {
                        const next = [...form.exclusions];
                        next[idx] = { ...next[idx], description: e.target.value };
                        setForm((prev) => ({ ...prev, exclusions: next }));
                      }}
                      placeholder="e.g. Airport Transfers"
                      className={`${inputClasses} py-2.5!`}
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setForm((prev) => ({ ...prev, exclusions: prev.exclusions.filter((_, i) => i !== idx) }))}
                      className="p-2.5 rounded-xl border border-slate-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Optional Surcharge ({form.currency === 'MVR' ? 'MVR' : '$'})</span>
                    <input
                      type="number"
                      value={exc.additionalPrice}
                      disabled={saving}
                      onChange={(e) => {
                        const next = [...form.exclusions];
                        next[idx] = { ...next[idx], additionalPrice: e.target.value };
                        setForm((prev) => ({ ...prev, exclusions: next }));
                      }}
                      className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 font-bold outline-none focus:border-[#2dd4af]"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => setForm((prev) => ({ ...prev, exclusions: [...prev.exclusions, { description: '', additionalPrice: '' }] }))}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-100 text-slate-400 text-[11px] font-bold hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 transition-all"
              >
                + Add Exclusion
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {deal.exclusions && deal.exclusions.length > 0 ? (
                deal.exclusions.map((exc) => (
                  <div key={exc.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-50/30 border border-red-100/30">
                    <div className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-red-800 leading-tight">{exc.description}</span>
                      {exc.additionalPrice && (
                        <span className="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-wide">
                          +{form.currency === 'MVR' ? 'MVR' : '$'}{exc.additionalPrice} Optional
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-400 text-xs italic">No exclusions specified</div>
              )}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default DealDetailsPage;
