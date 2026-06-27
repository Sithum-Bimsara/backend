import React from "react";
import type { IMerchantProfile } from "../types/merchant-profile.types";
import { DangerZone } from "./DangerZone";

interface ProfileCardProps {
  profile: IMerchantProfile | null;
  onLogoutClick: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onLogoutClick }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="h-32 bg-linear-to-r from-[#2dd4af] to-[#25b898] relative">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      </div>

      <div className="relative px-6 pb-8 flex flex-col items-center -mt-14">
        <div className="relative mb-4 group">
          <div className="w-28 h-28 rounded-full bg-linear-to-br from-[#1b3a5a] to-[#0e2a47] flex items-center justify-center text-white shadow-xl shadow-black/10 border-[5px] border-white z-10 relative uppercase">
            <span className="text-3xl font-bold tracking-wider">{profile?.businessName?.slice(0, 2) || "MP"}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#0e2a47] mb-1 m-0 text-center tracking-tight">
          {profile?.businessName}
        </h2>
        <p className="text-[13px] text-slate-500 font-medium m-0 flex items-center gap-1.5 mb-6">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {profile?.city}, {profile?.country}
        </p>

        <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Authenticated Account</span>
          <span className="text-sm font-semibold text-[#0e2a47] truncate block">{profile?.user?.email}</span>
          <span className="text-[11px] text-slate-400 mt-1 block italic opacity-70">Email cannot be changed</span>
        </div>

        {/* Danger Zone */}
        <DangerZone onLogoutClick={onLogoutClick} />
      </div>
    </div>
  );
};
