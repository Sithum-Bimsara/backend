import React, { useState, useEffect } from 'react';
import { useUserProfile } from '../../../features/TravelerProfile/hooks/useUserProfile';
import { useLogout } from '../../../features/(auth)/hooks/auth.hooks';

const Profile: React.FC = () => {
  const { profile, loading, error, updateProfile } = useUserProfile();
  const { logout } = useLogout();

  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    address: '',
    city: '',
    country: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        contactNumber: profile.contactNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Only send name, city, and address as others are now read-only
      const { name, city, address } = formData;
      await updateProfile({ name, city, address });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin w-8 h-8 text-[#2dd4af]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full p-4 lg:p-8 max-w-6xl mx-auto lg:pt-16">
      <div className="flex flex-col xl:flex-row gap-8 items-start">

        {/* Left Column: Profile Card */}
        <div className="w-full xl:w-95 shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="h-32 bg-linear-to-r from-[#2dd4af] to-[#25b898] relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>

            <div className="relative px-6 pb-8 flex flex-col items-center -mt-14">
              <div className="relative mb-4 group">
                <div className="w-28 h-28 rounded-full bg-linear-to-br from-[#1b3a5a] to-[#0e2a47] flex items-center justify-center text-white shadow-xl shadow-black/10 border-[5px] border-white z-10 relative uppercase">
                  <span className="text-3xl font-bold tracking-wider">{profile?.name?.slice(0, 2) || 'TR'}</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#0e2a47] mb-1 m-0 text-center tracking-tight">
                {profile?.name}
              </h2>
              <p className="text-[13px] text-slate-500 font-medium m-0 flex items-center gap-1.5 mb-6">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {profile?.city}, {profile?.country}
              </p>

              <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Authenticated Account</span>
                <span className="text-sm font-semibold text-[#0e2a47] truncate block">{profile?.email}</span>
                <span className="text-[11px] text-slate-400 mt-1 block italic opacity-70">Email cannot be changed</span>
              </div>

              {/* Danger Zone */}
              <h3 className="text-lg font-bold text-red-500 m-6 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Danger Zone
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-red-50/50 border border-red-100 rounded-3xl gap-4">
                <div className="flex flex-col w-full sm:w-auto text-left">
                  <span className="text-[15px] font-bold text-[#0e2a47] mb-1">Logout Account</span>
                  <span className="text-[13px] text-slate-500 font-medium">Log out securely from this session.</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <form onSubmit={handleSubmit} className="flex-1 w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <h3 className="text-lg font-bold text-[#0e2a47] mb-6">Personal Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-[#0e2a47] outline-none focus:border-[#2dd4af]/40 focus:ring-4 focus:ring-[#2dd4af]/5 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                disabled
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1.5 block italic opacity-70 px-1">Verified number cannot be changed</span>
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
                disabled
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1.5 block italic opacity-70 px-1">Country cannot be changed</span>
            </div>
          </div>

          {(error) && (
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="w-full h-px bg-slate-100 my-10"></div>

        </form>
      </div>

    </div>
  );
};

export default Profile;
