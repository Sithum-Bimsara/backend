import React, { useState } from "react";
import type { PropertyImage } from "../../../types/accommodation.types";
import { uploadPropertyImageToStorage } from "../../../utils/property-image-upload";
import { MerchantStepHeader } from "../../../../MerchantProfile/components/MerchantUI";

interface Props {
  value: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
  disabled?: boolean;
}

const TOTAL_SLOTS = 4;
const MIN_IMAGES = 4;

export const ImageUploader: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [uploadingBySlot, setUploadingBySlot] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (index: number, file: File | null) => {
    if (!file) return;

    setUploadingBySlot((prev) => ({ ...prev, [index]: true }));
    setError(null);

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${file.name} exceeds the 10MB limit.`);
      }

      const previewUrl = URL.createObjectURL(file);
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.width, height: image.height });
        image.src = previewUrl;
      });

      if (dimensions.width < 300 || dimensions.height < 300) {
        throw new Error(`${file.name} must be at least 300x300.`);
      }

      const uploadedUrl = await uploadPropertyImageToStorage(file);

      const newImage: PropertyImage = {
        url: uploadedUrl,
        previewUrl: uploadedUrl,
        width: dimensions.width,
        height: dimensions.height,
        fileSizeBytes: file.size,
      };

      const nextImages = [...value];
      if (index < value.length) {
        // Replacing existing image
        nextImages[index] = newImage;
      } else {
        // Adding new image
        nextImages.push(newImage);
      }
      onChange(nextImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingBySlot((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleRemove = async (index: number) => {
    try {
      const nextImages = [...value];
      nextImages.splice(index, 1);
      onChange(nextImages);
    } catch (_err) {
      setError("Failed to delete image");
    }
  };

  const isUploading = Object.values(uploadingBySlot).some(Boolean);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <MerchantStepHeader
        title="Property Photos"
        description="Upload high-quality images of your property. We recommend at least 4 photos to showcase different areas."
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <p className="text-xs text-slate-500 mb-6">
          Upload JPG, PNG, or WEBP. Max size 10MB each. Min 300x300.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
            const image = value[index];
            const isPrimary = index === 0;
            const slotUploading = uploadingBySlot[index];

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">
                    {isPrimary ? "Main Photo" : `Photo ${index + 1}`}
                    {index < MIN_IMAGES && <span className="text-[#ff7b54] ml-1">*</span>}
                  </label>
                  {image && image.width && image.height && (
                    <span className="text-[9px] font-bold text-slate-300 uppercase">
                      {image.width}x{image.height}
                    </span>
                  )}
                </div>

                <div className={`group relative aspect-video rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden bg-slate-50 ${image ? "border-slate-200 shadow-sm" : "border-slate-200 hover:border-[#2dd4af]/50"
                  }`}>
                  {image ? (
                    <>
                      <img
                        src={image.previewUrl || image.url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[#0e2a47]/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {slotUploading && (
                    <div className="absolute inset-0 bg-[#0e2a47]/60 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                        </svg>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Processing</span>
                      </div>
                    </div>
                  )}
                </div>

                {!disabled && (
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleFileChange(index, e.target.files?.[0] ?? null)}
                        className="hidden"
                        disabled={slotUploading || disabled}
                      />
                      <div className={`w-full inline-flex justify-center items-center h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${image
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        : "bg-[#2dd4af]/10 text-[#2dd4af] hover:bg-[#2dd4af] hover:text-white"
                        }`}>
                        {image ? "Replace" : "Upload"}
                      </div>
                    </label>

                    {image && (
                      <button
                        type="button"
                        onClick={() => void handleRemove(index)}
                        className="h-10 px-4 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold uppercase tracking-wider">
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {error}
          </div>
        )}

        {value.length < MIN_IMAGES && !isUploading && !disabled && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <span className="text-sm font-bold">!</span>
            </div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Please upload at least {MIN_IMAGES - value.length} more images to reach the required minimum of {MIN_IMAGES}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

