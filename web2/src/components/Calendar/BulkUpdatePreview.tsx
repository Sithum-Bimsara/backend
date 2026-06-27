import React from 'react';

interface BulkUpdatePreviewProps {
  previewLoading: boolean;
  previewDates: string[];
  conflictingDates: string[];
}

const BulkUpdatePreview: React.FC<BulkUpdatePreviewProps> = ({
  previewLoading,
  previewDates,
  conflictingDates
}) => {
  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <label className="text-xs font-bold text-slate-400 uppercase block mb-3 justify-between">
        <span>Selected Dates Preview</span>
        {previewLoading && <span className="text-[#2dd4af]">Loading...</span>}
      </label>

      <div className="flex flex-wrap gap-2">
        {previewDates.map((date) => {
          const isConflict = conflictingDates.includes(date);
          // Parse as local midnight to avoid UTC timezone shift (e.g. IST shows prev day)
          const localDate = new Date(`${date}T00:00:00`);
          return (
            <div
              key={date}
              className={`text-xs font-bold px-2 py-1 rounded-md ${
                isConflict ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {localDate.getDate()} {localDate.toLocaleString('default', { month: 'short' })}
            </div>
          );
        })}
        {previewDates.length === 0 && !previewLoading && (
          <p className="text-sm text-slate-500 italic">No valid dates selected.</p>
        )}
      </div>
    </div>
  );
};

export default BulkUpdatePreview;
