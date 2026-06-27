import React from 'react';
import type { BulkInventoryUpdateDto } from '../../features/Accommodation/dtos/accommodation.dto';
import BulkUpdatePreview from './BulkUpdatePreview';
import { CustomDatePicker } from '../Common/CustomDatePicker';

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulkData: Partial<BulkInventoryUpdateDto>;
  setBulkData: (data: Partial<BulkInventoryUpdateDto>) => void;
  bulkError: string | null;
  todayStr: string;
  maxEndDate: string | undefined;
  previewLoading: boolean;
  previewDates: string[];
  conflictingDates: string[];
  onUpdate: () => void;
  isHotel: boolean;
  selectedUnitTotalInventory?: number;
}

const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  isOpen,
  onClose,
  bulkData,
  setBulkData,
  bulkError,
  todayStr,
  maxEndDate,
  previewLoading,
  previewDates,
  conflictingDates,
  onUpdate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e2a47]/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200 overflow-visible">
        <h3 className="text-xl font-bold text-[#0e2a47] mb-6">Bulk Availability Update</h3>

        {bulkError && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-700 font-medium">{bulkError}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Start Date</label>
              <CustomDatePicker
                minDate={todayStr}
                value={(bulkData.startDate as string) || ''}
                placeholder="mm/dd/yyyy"
                onChange={date => setBulkData({ ...bulkData, startDate: date })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">End Date</label>
              <CustomDatePicker
                minDate={bulkData.startDate || todayStr}
                maxDate={maxEndDate}
                value={(bulkData.endDate as string) || ''}
                placeholder="mm/dd/yyyy"
                onChange={date => setBulkData({ ...bulkData, endDate: date })}
              />
              <p className="text-[10px] text-slate-400 mt-1">Max 15 days</p>
            </div>
          </div>
          {/* 
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Daily Rate Override ($)</label>
            <input type="number" placeholder="Leave empty for base rate" className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-sm focus:border-[#2dd4af] outline-none" onChange={e => setBulkData({...bulkData, priceOverride: Number(e.target.value)})} />
          </div> */}

          {/* <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Status</label>
            <select className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-sm focus:border-[#2dd4af] outline-none" onChange={e => setBulkData({...bulkData, status: e.target.value as any})}>
              <option value="available">Available</option>
              <option value="blocked">Blocked / Closed</option>
            </select>
          </div>

          {isHotel && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Room Count</label>
              <input type="number" placeholder={selectedUnitTotalInventory?.toString()} className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-sm focus:border-[#2dd4af] outline-none" onChange={e => setBulkData({...bulkData, totalRooms: Number(e.target.value)})} />
            </div>
          )} */}
        </div>

        {bulkData.startDate && bulkData.endDate && (
          <BulkUpdatePreview
            previewLoading={previewLoading}
            previewDates={previewDates}
            conflictingDates={conflictingDates}
          />
        )}

        <div className="flex gap-3 mt-8 border-t border-slate-100 pt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
          <button
            onClick={onUpdate}
            disabled={previewLoading || !bulkData.startDate || !bulkData.endDate || conflictingDates.length > 0}
            className="flex-1 py-3 rounded-xl bg-[#2dd4af] text-[#0e2a47] font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Range
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateModal;
