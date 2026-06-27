import React, { useState } from 'react';
import type { CreateDealDto, GenerateItineraryAIInput } from '../../dtos/deals.dtos';
import GenerateItineraryModal from './GenerateItineraryModal';
import { useDealAIGenerator, type AISettings } from '../../hooks/useDealAIGenerator';

interface Props {
  data: CreateDealDto;
  onChange: (data: Partial<CreateDealDto>) => void;
}

const DetailsStep: React.FC<Props> = ({ data, onChange }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const {
    aiLoading,
    aiError,
    aiSuccess,
    aiCurrentDay,
    addonsAILoading,
    addonsAIError,
    aiSettings,
    setAiSettings,
    setAiCurrentDay,
    setAiError,
    setAiSuccess,
    generateDayItinerary,
    generateAddOns,
  } = useDealAIGenerator();

  const inferredDays = data.durationDays && data.durationDays > 0
    ? data.durationDays
    : 1;

  const openAIModalForDay = (dayNumber: number) => {
    setAiCurrentDay(dayNumber);
    setAiError(null);
    setAiSuccess(null);
    setIsAIModalOpen(true);
  };

  // ─── Itinerary Helpers ───
  const addItinerary = () => {
    const items = data.itineraries || [];
    onChange({ itineraries: [...items, { dayNumber: items.length + 1, title: '', description: '' }] });
  };
  const removeItinerary = (idx: number) => {
    const items = (data.itineraries || []).filter((_, i) => i !== idx);
    onChange({ itineraries: items.map((it, i) => ({ ...it, dayNumber: i + 1 })) });
  };
  const updateItinerary = (idx: number, field: 'title' | 'description', value: string) => {
    const items = [...(data.itineraries || [])];
    items[idx] = { ...items[idx], [field]: value };
    onChange({ itineraries: items });
  };

  // ─── Inclusion Helpers ───
  const addInclusion = () => {
    onChange({ inclusions: [...(data.inclusions || []), { description: '' }] });
  };
  const removeInclusion = (idx: number) => {
    onChange({ inclusions: (data.inclusions || []).filter((_, i) => i !== idx) });
  };
  const updateInclusion = (idx: number, field: 'description', value: string) => {
    const items = [...(data.inclusions || [])];
    items[idx] = { ...items[idx], [field]: value };
    onChange({ inclusions: items });
  };

  // ─── Exclusion Helpers ───
  const addExclusion = () => {
    onChange({ exclusions: [...(data.exclusions || []), { description: '' }] });
  };
  const removeExclusion = (idx: number) => {
    onChange({ exclusions: (data.exclusions || []).filter((_, i) => i !== idx) });
  };
  const updateExclusion = (
    idx: number,
    field: 'description' | 'additionalPrice',
    value: string | number | undefined
  ) => {
    const items = [...(data.exclusions || [])];
    items[idx] = { ...items[idx], [field]: value } as typeof items[number];
    onChange({ exclusions: items });
  };

  const handleGenerateAddOnsWithAI = async () => {
    await generateAddOns(data, onChange);
  };

  const handleGenerateWithAI = async (input: GenerateItineraryAIInput) => {
    const success = await generateDayItinerary(data, onChange, input, inferredDays);
    if (success) {
      setIsAIModalOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-5">
        {/* ─── Global AI Settings ─── */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-linear-to-br from-[#2dd4af]/5 to-transparent border border-[#2dd4af]/10">
          <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#2dd4af]/10 flex items-center justify-center text-[#2dd4af] shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <div>
              <h3 className="text-[13px] sm:text-base font-bold text-[#0e2a47]">AI Itinerary Settings</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Define global preferences for AI generation</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <label className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Traveler Type</span>
              <select
                value={aiSettings.travelerType}
                onChange={(e) => setAiSettings((prev) => ({ ...prev, travelerType: e.target.value }))}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 text-[12px] sm:text-sm text-[#0e2a47] bg-white focus:outline-none focus:border-[#2dd4af] font-bold transition-all"
              >
                <option value="solo">Solo</option>
                <option value="couples">Couples</option>
                <option value="families">Families</option>
                <option value="friends">Friends</option>
                <option value="business">Business</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Trip Style</span>
              <select
                value={aiSettings.travelStyle}
                onChange={(e) => setAiSettings((prev) => ({ ...prev, travelStyle: e.target.value }))}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 text-[12px] sm:text-sm text-[#0e2a47] bg-white focus:outline-none focus:border-[#2dd4af] font-bold transition-all"
              >
                <option value="adventure">Adventure</option>
                <option value="relaxation">Relaxation</option>
                <option value="nature">Nature & Wildlife</option>
                <option value="cultural">Cultural</option>
                <option value="party">Party</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Accom. Level</span>
              <select
                value={aiSettings.accommodationLevel}
                onChange={(e) => setAiSettings((prev) => ({ ...prev, accommodationLevel: e.target.value }))}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 text-[12px] sm:text-sm text-[#0e2a47] bg-white focus:outline-none focus:border-[#2dd4af] font-bold transition-all"
              >
                <option value="budget">Budget</option>
                <option value="3-star">3 Star</option>
                <option value="4-star">4 Star</option>
                <option value="5-star">5 Star</option>
                <option value="ultra-luxury">Ultra Luxury</option>
              </select>
            </label>

            <div className="space-y-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Trip Pace</span>
              <select
                value={aiSettings.pace}
                onChange={(e) => setAiSettings((prev) => ({ ...prev, pace: e.target.value as AISettings['pace'] }))}
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 text-[12px] sm:text-sm text-[#0e2a47] bg-white focus:outline-none focus:border-[#2dd4af] font-bold transition-all"
              >
                <option value="relaxed">Relaxed</option>
                <option value="balanced">Balanced</option>
                <option value="packed">Packed</option>
              </select>
              <p className="text-[8px] sm:text-[9px] text-slate-400 leading-tight px-1">
                {aiSettings.pace === 'relaxed' && "Focuses on leisure. Best for honeymoons."}
                {aiSettings.pace === 'balanced' && "A steady mix of activity and rest."}
                {aiSettings.pace === 'packed' && "Energetic activities. Best for adventures."}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Itinerary ─── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-[#0e2a47] mb-0.5">Itinerary</h3>
              <p className="text-[11px] text-slate-400">Day-by-day breakdown</p>
            </div>
          </div>

          {aiError && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[10px] font-medium">
              {aiError}
            </div>
          )}

          {aiSuccess && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-medium animate-in fade-in slide-in-from-top-1">
              ✓ {aiSuccess}
            </div>
          )}

          <div className="space-y-2">
            {(data.itineraries || []).map((item, idx) => (
              <div key={idx} className="bg-slate-50/80 rounded-2xl border border-slate-100 p-3 group relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#2dd4af]/15 text-[#2dd4af] text-[10px] font-bold flex items-center justify-center shrink-0">
                    {item.dayNumber}
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItinerary(idx, 'title', e.target.value)}
                    placeholder={`Day ${item.dayNumber} Title`}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#0e2a47] placeholder:text-slate-350 focus:outline-none focus:border-[#2dd4af] transition-all"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openAIModalForDay(item.dayNumber)}
                      className="px-2 py-1 rounded-lg bg-[#0e2a47] text-white text-[9px] font-black hover:bg-[#2dd4af] transition-colors border-none cursor-pointer"
                    >
                      AI
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItinerary(idx)}
                      className="p-1 rounded-lg text-slate-300 hover:text-red-500 transition-colors border-none cursor-pointer bg-transparent"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
                <textarea
                  value={item.description || ''}
                  onChange={(e) => updateItinerary(idx, 'description', e.target.value)}
                  placeholder="Activities..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 bg-white text-[12px] text-[#0e2a47] placeholder:text-slate-300 focus:outline-none focus:border-[#2dd4af] transition-all resize-none leading-relaxed"
                />
              </div>
            ))}

            {(data.itineraries || []).length === 0 && (
              <div className="text-center py-8 text-slate-300 text-sm">
                No itinerary days added yet. Click "Add Day" to start.
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <button
              type="button"
              onClick={addItinerary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2dd4af]/10 text-[#2dd4af] text-xs font-bold hover:bg-[#2dd4af]/20 transition-colors border-none cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Day
            </button>
          </div>
        </div>

        {/* ─── Inclusions ─── */}
        <div>
          <button
            type="button"
            onClick={handleGenerateAddOnsWithAI}
            disabled={addonsAILoading}
            className="flex items-center gap-1.5 px-3 py-2 mb-2 rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:opacity-95 transition-opacity border-none cursor-pointer disabled:opacity-60"
          >
            {addonsAILoading ? 'Generating Add-ons...' : 'Generate Add-ons with AI'}
          </button>

          {addonsAIError && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[10px] font-medium">
              {addonsAIError}
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-[#0e2a47] mb-0.5">Inclusions</h3>
              <p className="text-xs text-slate-400">What's included in this deal</p>
            </div>
            <button
              type="button"
              onClick={addInclusion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors border-none cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          </div>

          <div className="space-y-2">
            {(data.inclusions || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateInclusion(idx, 'description', e.target.value)}
                  placeholder="e.g. Airport transfers"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-[#0e2a47] placeholder:text-slate-300 focus:outline-none focus:border-emerald-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeInclusion(idx)}
                  className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors border-none cursor-pointer bg-transparent"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Exclusions ─── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-[#0e2a47] mb-0.5">Exclusions</h3>
              <p className="text-xs text-slate-400">What's not included (optional additional price)</p>
            </div>
            <button
              type="button"
              onClick={addExclusion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition-colors border-none cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add
            </button>
          </div>

          <div className="space-y-2">
            {(data.exclusions || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateExclusion(idx, 'description', e.target.value)}
                  placeholder="e.g. International flights"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-[#0e2a47] placeholder:text-slate-300 focus:outline-none focus:border-red-300 transition-all"
                />
                <input
                  type="number"
                  value={item.additionalPrice ?? ''}
                  onChange={(e) => updateExclusion(idx, 'additionalPrice', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Price"
                  min={0}
                  className="w-20 px-2 py-2 rounded-lg border border-slate-200 bg-white text-xs text-[#0e2a47] placeholder:text-slate-300 focus:outline-none focus:border-red-300 transition-all text-center"
                />
                <button
                  type="button"
                  onClick={() => removeExclusion(idx)}
                  className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors border-none cursor-pointer bg-transparent"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAIModalOpen && (
        <GenerateItineraryModal
          loading={aiLoading}
          error={aiError}
          currentDay={aiCurrentDay}
          totalDays={inferredDays}
          onClose={() => {
            setIsAIModalOpen(false);
            setAiError(null);
            setAiSuccess(null);
          }}
          onGenerate={handleGenerateWithAI}
        />
      )}
    </>
  );
};

export default DetailsStep;
