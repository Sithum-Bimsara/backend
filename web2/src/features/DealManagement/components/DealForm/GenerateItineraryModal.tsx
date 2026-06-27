import React, { useState, useEffect, useCallback } from "react";
import type { GenerateItineraryAIInput } from "../../dtos/deals.dtos";

interface Props {
  loading: boolean;
  error: string | null;
  currentDay: number;
  totalDays: number;
  onClose: () => void;
  onGenerate: (payload: GenerateItineraryAIInput) => Promise<void>;
}

const defaultInput: Partial<GenerateItineraryAIInput> = {
  highlights: "",
  notes: "",
};

const GenerateItineraryModal: React.FC<Props> = ({
  loading,
  error,
  currentDay,
  totalDays,
  onClose,
  onGenerate,
}) => {
  const [input, setInput] = useState<Partial<GenerateItineraryAIInput>>(defaultInput);

  // ─── Lifecycle Handlers ───
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = useCallback(() => {
    if (loading) return;
    onClose();
  }, [onClose, loading]);

  const update = (key: keyof GenerateItineraryAIInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.highlights?.trim()) return;
    await onGenerate({
      ...input,
      highlights: input.highlights.trim(),
      notes: input.notes?.trim() || undefined,
    } as GenerateItineraryAIInput);
    // Optional: wait for generation before closing or let parent handle it.
    // Parent logic currently sets isAIModalOpen to false in success case.
  };

  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center sm:p-4 overflow-hidden">
      {/* Backdrop (Subtle tint + Blur) */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[4px]" 
        onClick={handleClose} 
      />

      {/* Modal Content - Static (No motion) */}
      <div 
        className="relative bg-white w-full sm:h-auto sm:max-h-[95vh] sm:max-w-xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col"
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 sticky top-0 bg-white rounded-t-[32px] z-30">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-linear-to-r from-[#0e2a47] to-[#1a4b7c] text-white z-20 shrink-0 sm:rounded-t-[32px]">
          <div>
            <h3 className="text-[17px] font-extrabold tracking-tight">AI Itinerary Planner</h3>
            <p className="text-[11px] text-white/70 font-medium mt-0.5">Day {currentDay} of {totalDays} • {input.highlights?.length || 0} chars</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 transition-all border-none bg-transparent text-white cursor-pointer disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 pb-32 sm:pb-6">
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-4">
              <label className="block group">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Day {currentDay} Highlights</span>
                  <span className="text-[9px] font-black text-[#2dd4af] bg-[#2dd4af]/10 px-2 py-0.5 rounded-full uppercase">Required</span>
                </div>
                <textarea
                  value={input.highlights || ""}
                  onChange={(e) => update("highlights", e.target.value)}
                  placeholder="e.g., arrival, lagoon breakfast, turtle snorkeling..."
                  rows={6}
                  className="w-full px-5 py-4 rounded-[24px] border-2 border-slate-100 bg-slate-50/50 text-[15px] text-[#0e2a47] placeholder:text-slate-300 focus:outline-none focus:border-[#2dd4af] focus:bg-white transition-all resize-none leading-relaxed shadow-inner"
                  required
                  autoFocus
                />
              </label>

              <label className="block group">
                <div className="mb-2 px-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Special Notes</span>
                </div>
                <textarea
                  value={input.notes || ""}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Any specific requests or conditions..."
                  rows={3}
                  className="w-full px-5 py-4 rounded-3xl border-2 border-slate-100 bg-slate-50/50 text-[14px] text-[#0e2a47] placeholder:text-slate-300 focus:outline-none focus:border-[#2dd4af] focus:bg-white transition-all resize-none leading-relaxed shadow-inner"
                />
              </label>
            </div>

            {error && (
              <div className="p-4 rounded-[20px] bg-red-50 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5 text-red-600">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </div>
                <p className="text-xs text-red-700 font-bold leading-relaxed">{error}</p>
              </div>
            )}

            {/* Sticky Action Footer for Mobile */}
            <div className="fixed sm:static bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white via-white to-transparent sm:bg-none sm:p-0 z-40">
              <button
                type="submit"
                disabled={loading || !input.highlights?.trim()}
                className={`
                  w-full py-4.5 sm:py-4 rounded-[24px] text-[15px] font-black text-white shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 border-none cursor-pointer
                  ${loading || !input.highlights?.trim()
                    ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' 
                    : 'bg-[#2dd4af] hover:bg-[#25c09e] hover:shadow-[#2dd4af]/30 hover:-translate-y-0.5 active:scale-[0.98] shadow-[#2dd4af]/25'
                  }
                `}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Crafting Itinerary...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                    <span>Generate Day {currentDay}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenerateItineraryModal;
