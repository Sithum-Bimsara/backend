import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface ComparisonBarProps {
  selectedIslands: Array<{ id: string; name: string; image: string | null }>;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({
  selectedIslands,
  onRemove,
  onClear,
}) => {
  const navigate = useNavigate();

  const handleCompare = () => {
    if (selectedIslands.length < 2) return;
    const ids = selectedIslands.map(i => i.id).join(',');
    navigate(`/local-guide/compare?ids=${ids}`);
  };

  if (selectedIslands.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-4xl px-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-[#0f172a]/90 backdrop-blur-2xl border border-yellow-500/20 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 flex-1 overflow-x-auto w-full no-scrollbar">
          <div className="flex flex-col shrink-0">
            <span className="text-sm font-bold text-yellow-400">Comparison Pool</span>
            <span className="text-[10px] text-slate-400">{selectedIslands.length} of 3 selected</span>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {selectedIslands.map((island) => (
                <motion.div
                  key={island.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full relative group hover:border-red-500/30 transition-all shrink-0"
                >
                  <img
                    src={island.image || "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=200&auto=format&fit=crop"}
                    alt={island.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-white truncate max-w-32">{island.name}</span>
                  <button
                    onClick={() => onRemove(island.id)}
                    className="p-0.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {selectedIslands.length < 2 && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Select at least 2 islands</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            onClick={handleCompare}
            disabled={selectedIslands.length < 2}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              selectedIslands.length >= 2
                ? 'bg-yellow-400 text-[#0a192f] hover:-translate-y-0.5 shadow-yellow-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            Compare Stays
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
