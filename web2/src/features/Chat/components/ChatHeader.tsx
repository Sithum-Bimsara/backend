import React from "react";
import { ArrowLeftIcon, TagIcon, UserIcon } from "./ChatIcons";

interface ChatHeaderProps {
  customerName: string;
  contextName?: string | null;
  isConnected: boolean;
  isOnline: boolean;
  memberCount?: number;
  onBack?: () => void;
}

const PulseCSS = () => (
  <style>{`
    @keyframes pulse-green {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .online-pulse {
      animation: pulse-green 2s infinite;
    }
  `}</style>
);

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  customerName,
  contextName,
  isConnected,
  isOnline,
  memberCount,
  onBack
}) => {
  return (
    <div className="px-5 py-3 border-b flex items-center justify-between bg-white shrink-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 md:hidden text-slate-600 hover:bg-slate-50 rounded-full transition-colors border-none bg-transparent cursor-pointer"
          >
            <ArrowLeftIcon />
          </button>
        )}

        <div className="w-10 h-10 rounded-full bg-[#0e2a47] flex items-center justify-center text-white shrink-0 shadow-sm">
          <UserIcon size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="font-extrabold text-slate-900 text-sm leading-tight truncate">
            {customerName}
          </h2>
          {contextName && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#2dd4af] font-bold mt-0.5 truncate max-w-full">
              <TagIcon size={9} />
              {contextName}
            </span>
          )}
          
          {/* Presence Status */}
          {isOnline ? (
            <div className="flex items-center gap-1.5 mt-1 bg-green-50 px-2 py-0.5 rounded-full w-fit">
              <PulseCSS />
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 online-pulse" />
              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Online</span>
            </div>
          ) : (
            <p className={`text-[10px] font-semibold mt-0.5 ${isConnected ? "text-slate-400" : "text-amber-500"}`}>
              {isConnected ? "Connected" : "Reconnecting..."}
            </p>
          )}
        </div>
      </div>

      {memberCount !== undefined && (
        <div className="text-right hidden sm:block shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};
