import React from "react";
import { MerchantActionButton } from "./MerchantUI";

interface DangerZoneProps {
  onLogoutClick: () => void;
}

export const DangerZone: React.FC<DangerZoneProps> = ({ onLogoutClick }) => {
  return (
    <>
      <h3 className="text-lg font-bold text-red-500 mt-13 mb-6 flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Danger Zone
      </h3>
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-red-50/50 border border-red-100 rounded-3xl gap-4 w-full">
        <div className="flex flex-col w-full sm:w-auto text-left">
          <span className="text-[15px] font-bold text-[#0e2a47] mb-1">Logout Account</span>
          <span className="text-[13px] text-slate-500 font-medium">Log out securely from this session.</span>
        </div>
        <MerchantActionButton
          onClick={onLogoutClick}
          variant="danger"
          showArrow
        >
          Sign Out
        </MerchantActionButton>
      </div>
    </>
  );
};
