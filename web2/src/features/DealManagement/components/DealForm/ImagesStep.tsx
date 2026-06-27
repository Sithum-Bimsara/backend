import React, { useEffect, useMemo, useState } from 'react';
import type { CreateDealDto } from '../../dtos/deals.dtos';
import { uploadDealImageToStorage } from '../../utils/deal-image-upload';
import { DEFAULT_DEAL_IMAGE_URL } from '../../../../lib/deal-image';

interface Props {
  data: CreateDealDto;
  onChange: (data: Partial<CreateDealDto>) => void;
  onUploadStatusChange?: (isUploading: boolean) => void;
}

const IMAGE_SLOTS = [
  { key: 'primaryImageUrl' as const, label: 'Primary Image', required: true },
  { key: 'secondImageUrl' as const, label: 'Second Image', required: false },
  { key: 'thirdImageUrl' as const, label: 'Third Image', required: false },
  { key: 'fourthImageUrl' as const, label: 'Fourth Image', required: false },
];

const ImagesStep: React.FC<Props> = ({ data, onChange, onUploadStatusChange }) => {
  const [uploadingBySlot, setUploadingBySlot] = useState<Record<string, boolean>>({});
  const [uploadErrorBySlot, setUploadErrorBySlot] = useState<Record<string, string | null>>({});

  const isUploading = useMemo(
    () => Object.values(uploadingBySlot).some(Boolean),
    [uploadingBySlot],
  );

  useEffect(() => {
    onUploadStatusChange?.(isUploading);
  }, [isUploading, onUploadStatusChange]);

  const setSlotUploading = (slot: string, value: boolean) => {
    setUploadingBySlot((prev) => ({ ...prev, [slot]: value }));
  };

  const setSlotError = (slot: string, value: string | null) => {
    setUploadErrorBySlot((prev) => ({ ...prev, [slot]: value }));
  };

  const handleFileChange = async (
    slot: 'primaryImageUrl' | 'secondImageUrl' | 'thirdImageUrl' | 'fourthImageUrl',
    file: File | null,
  ) => {
    if (!file) {
      return;
    }

    setSlotUploading(slot, true);
    setSlotError(slot, null);

    try {
      const uploadedUrl = await uploadDealImageToStorage(file, slot);
      onChange({ [slot]: uploadedUrl });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload image.';
      setSlotError(slot, message);
    } finally {
      setSlotUploading(slot, false);
    }
  };

  const handleRemoveImage = (
    slot: 'primaryImageUrl' | 'secondImageUrl' | 'thirdImageUrl' | 'fourthImageUrl',
  ) => {
    onChange({ [slot]: '' });
    setSlotError(slot, null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#0e2a47] mb-0.5">Deal Images</h3>
        <p className="text-[12px] text-slate-400">Upload high-quality images to attract customers</p>
      </div>

      <div className="bg-linear-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-3">
        <h4 className="text-xs font-bold text-[#0e2a47] mb-2">Images</h4>
        <p className="text-xs text-slate-400 mb-4">
          Upload JPG, JPEG, PNG, or WEBP files. Maximum file size: 5MB.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {IMAGE_SLOTS.map(({ key, label, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                {label}
                {required && <span className="text-[#ff7b54] ml-1">*</span>}
              </label>

              <div className="rounded-xl border border-slate-200 bg-white p-1.5">
                <div className="relative h-24 rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                  <img
                    src={data[key] || DEFAULT_DEAL_IMAGE_URL}
                    alt={label}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_DEAL_IMAGE_URL;
                    }}
                  />
                  {uploadingBySlot[key] && (
                    <div className="absolute inset-0 bg-[#0e2a47]/55 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold animate-pulse">Uploading...</span>
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
                      {data[key] ? 'Replace' : 'Upload'}
                    </span>
                  </label>

                  {data[key] && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(key)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-[#b45309] bg-amber-50 hover:bg-amber-100 transition-all border border-amber-100 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {uploadErrorBySlot[key] && (
                <p className="mt-1.5 text-[11px] text-red-500 font-medium">{uploadErrorBySlot[key]}</p>
              )}
            </div>
          ))}
        </div>
        {isUploading && (
          <p className="mt-3 text-xs text-[#0e2a47] font-semibold">
            Please wait until image uploads finish before moving forward.
          </p>
        )}
      </div>
    </div>
  );
};

export default ImagesStep;
