import React from "react";
import type { IMerchantProfile } from "../types/merchant-profile.types";

interface SettingsFormData {
  businessName: string;
  businessDescription: string;
  contactNumber: string;
  address: string;
  city: string;
  country: string;
}

interface EditProfileFormProps {
  formData: SettingsFormData;
  profile: IMerchantProfile | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setDocumentFile: (file: File | null) => void;
  removeDocument: boolean;
  setRemoveDocument: (val: boolean) => void;
  error: string | null;
  saveSuccess: boolean;
  isSaving: boolean;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  formData,
  profile,
  handleChange,
  handleSubmit,
  setDocumentFile,
  removeDocument,
  setRemoveDocument,
  error,
  saveSuccess,
  isSaving,
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex-1 w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
      <h3 className="text-lg font-bold text-[#0e2a47] mb-6">Profile Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#0e2a47] outline-none focus:border-[#2dd4af]/40 focus:ring-4 focus:ring-[#2dd4af]/5 transition-all"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Business Description</label>
          <textarea
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#0e2a47] outline-none focus:border-[#2dd4af]/40 focus:ring-4 focus:ring-[#2dd4af]/5 transition-all resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#0e2a47] outline-none focus:border-[#2dd4af]/40 focus:ring-4 focus:ring-[#2dd4af]/5 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#0e2a47] outline-none focus:border-[#2dd4af]/40 focus:ring-4 focus:ring-[#2dd4af]/5 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#0e2a47] outline-none focus:border-[#2dd4af]/40 focus:ring-4 focus:ring-[#2dd4af]/5 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#0e2a47] outline-none focus:border-[#2dd4af]/40 focus:ring-4 focus:ring-[#2dd4af]/5 transition-all"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Business Registration Document</label>

          {profile?.businessRegistrationDocUrl ? (
            <div className="mb-3 text-sm text-slate-600">
              Current: <a href={profile.businessRegistrationDocUrl} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline">{profile.businessRegistrationDocName || "View current document"}</a>
            </div>
          ) : (
            <div className="mb-3 text-sm text-slate-500">No document uploaded yet.</div>
          )}

          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => {
              const nextFile = e.target.files?.[0] || null;
              setDocumentFile(nextFile);
              if (nextFile) setRemoveDocument(false);
            }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#0e2a47] outline-none focus:border-[#2dd4af]/40 focus:ring-4 focus:ring-[#2dd4af]/5 transition-all file:mr-3 file:rounded-lg file:border-0 file:bg-[#0e2a47] file:px-3 file:py-2 file:text-white file:font-semibold"
          />

          {profile?.businessRegistrationDocUrl && (
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-rose-600 cursor-pointer">
              <input
                type="checkbox"
                checked={removeDocument}
                onChange={(e) => {
                  setRemoveDocument(e.target.checked);
                  if (e.target.checked) setDocumentFile(null);
                }}
                className="h-4 w-4"
              />
              Remove current document on save
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        {saveSuccess && (
          <div className="text-emerald-600 text-sm font-bold flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Changes saved successfully!
          </div>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="ml-auto px-8 py-3 bg-[#0e2a47] text-white font-bold rounded-xl hover:bg-[#1b3a5a] transition-all cursor-pointer shadow-lg shadow-[#0e2a47]/10 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="w-full h-px bg-slate-100 mt-8"></div>
    </form>
  );
};
