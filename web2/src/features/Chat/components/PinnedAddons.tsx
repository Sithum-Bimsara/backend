import React from "react";
import { motion } from "framer-motion";
import { TagIcon } from "./ChatIcons";

import { ErrorHandler } from "../../../utils/error-handler";
import type { IViewLockSummary, IViewCustomAddon } from "../types/chat.types";

interface PinnedAddonsProps {
  dealLock?: (IViewLockSummary & { 
    user: { name: string; email: string };
    deal: { title: string; merchant: { businessName: string; user: { id: string; name: string } } };
  }) | null;
  accommodationLock?: (IViewLockSummary & { 
    user: { name: string; email: string };
    property: { name: string; merchant: { businessName: string; user: { id: string; name: string } } };
  }) | null;
}

export const PinnedAddons: React.FC<PinnedAddonsProps> = ({
  dealLock,
  accommodationLock
}) => {
  const getAddons = (lock: PinnedAddonsProps["dealLock"] | PinnedAddonsProps["accommodationLock"]): IViewCustomAddon[] => {
    if (!lock?.customAddons) return [];
    if (Array.isArray(lock.customAddons)) return lock.customAddons;
    try {
      if (typeof lock.customAddons === 'string') return JSON.parse(lock.customAddons);
    } catch (e) {
      ErrorHandler.handle(e, { showToast: false });
    }
    return [];
  };

  const addons: IViewCustomAddon[] = [
    ...getAddons(dealLock),
    ...getAddons(accommodationLock)
  ];
  
  if (addons.length === 0) return null;

  const total = addons.reduce((sum: number, a: IViewCustomAddon) => sum + (a.price || 0), 0);

  return (
    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-col gap-2 overflow-hidden shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)] shrink-0">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Pinned Add-ons
        </span>
        <div className="bg-[#2dd4af]/10 px-2 py-0.5 rounded-lg">
          <span className="text-[10px] font-black text-[#25b898]">
            TOTAL: ${total.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {addons.map((addon: IViewCustomAddon, idx: number) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 shrink-0 shadow-sm hover:border-[#2dd4af]/30 transition-all group/addon relative"
          >
            <div className="w-7 h-7 rounded-lg bg-[#2dd4af]/10 flex items-center justify-center text-[#2dd4af]">
              <TagIcon size={12} />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[12px] font-bold text-slate-800 leading-none">{addon.name}</span>
              <span className="text-[10px] font-black text-[#2dd4af] mt-1">${addon.price}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
