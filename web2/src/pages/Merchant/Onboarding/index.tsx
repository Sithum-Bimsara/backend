import { useMerchantOnboardingForm } from "../../../features/MerchantProfile/hooks/useMerchantOnboardingForm";

const TOTAL_STEPS = 3;

const MerchantOnboardingPage: React.FC = () => {
  const {
    step,
    setStep,
    loading,
    error,
    setError,
    privacyAgreed,
    setPrivacyAgreed,
    showPrivacyModal,
    setShowPrivacyModal,
    form: {
      businessName,
      setBusinessName,
      businessDescription,
      setBusinessDescription,
      contactNumber,
      setContactNumber,
      address,
      setAddress,
      city,
      setCity,
      country,
      setCountry,
      businessRegistrationDocument,
      setBusinessRegistrationDocument,
    },
    actions: {
      canProceed,
      handleSubmit,
    },
  } = useMerchantOnboardingForm();

  const progressPercent = (step / TOTAL_STEPS) * 100;

  const PrivacyModal = () => (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${showPrivacyModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => {}} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-2xl font-bold text-[#1a1145]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Your Privacy Matters
          </h2>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-gray-700 text-sm leading-relaxed">
            <strong>Data Protection Notice:</strong> Your personal and business information is safe with us.
          </p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-700">✓ Your data is encrypted and securely stored</p>
            <p className="text-sm text-gray-700">✓ We never share your data with unauthorized third parties</p>
            <p className="text-sm text-gray-700">✓ You can update your profile details anytime</p>
            <p className="text-sm text-gray-700">✓ We follow strict privacy and compliance standards</p>
          </div>
        </div>

        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAgreed}
            onChange={(e) => setPrivacyAgreed(e.target.checked)}
            className="w-5 h-5 accent-indigo-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700">
            I acknowledge that I've read and understand the privacy notice
          </span>
        </label>

        <button
          onClick={() => setShowPrivacyModal(false)}
          disabled={!privacyAgreed}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Continue to Merchant Setup
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0e2a47] via-[#112d4e] to-[#0a192f] flex flex-col">
      {showPrivacyModal && <PrivacyModal />}

      {/* Top bar */}
      <div
        className="sticky top-0 z-10 px-4 md:px-6 py-3 flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 backdrop-blur-md"
        style={{ opacity: showPrivacyModal ? 0.5 : 1 }}
      >
        {/* Left: Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img src="/images/logo.png" alt="LushWare" className="h-10 w-auto shrink-0 object-contain" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-wider border border-indigo-400/20">
              Merchant Setup
            </span>
          </div>
        </div>

        {/* Right: Step indicator pill */}
        <div className="shrink-0 px-3 py-1 rounded-full bg-white/8 border border-white/10 text-white/60 text-[11px] font-medium tabular-nums">
          {showPrivacyModal ? "Privacy Notice" : `Step ${step} / ${TOTAL_STEPS}`}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6" style={{ opacity: showPrivacyModal ? 0.5 : 1, pointerEvents: showPrivacyModal ? "none" : "auto" }}>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-indigo-400 to-violet-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-6 md:py-8" style={{ opacity: showPrivacyModal ? 0.5 : 1, pointerEvents: showPrivacyModal ? "none" : "auto" }}>
        <div className="w-full max-w-lg">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  About your business
                </h1>
                <p className="text-white/60 text-sm">This information will be shown on your merchant profile</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Business Name</label>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Island Paradise Tours"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Business Description</label>
                  <textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    placeholder="Describe what your business offers..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Contact Details
                </h1>
                <p className="text-white/60 text-sm">How can customers reach you?</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Business Phone</label>
                  <input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location + Document */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Business Location
                </h1>
                <p className="text-white/60 text-sm">Address is required so customers and admins can verify your business</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address (required)"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-white/70 text-xs font-semibold uppercase tracking-wider">City</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Country</label>
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <label className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    Business Registration Document
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 15 * 1024 * 1024) {
                        setError("File is too large. Maximum size is 15MB.");
                        setBusinessRegistrationDocument(null);
                        e.target.value = "";
                        return;
                      }
                      setBusinessRegistrationDocument(file);
                      if (error?.includes("large")) setError(null);
                    }}
                    className="w-full rounded-xl bg-white/5 border border-white/10 text-white text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-indigo-700 transition cursor-pointer"
                  />
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-white/40 text-[11px] leading-relaxed">
                      Upload your business registration certificate or license as a PDF or image.
                    </p>
                    <p className="text-indigo-400/60 text-[10px] whitespace-nowrap font-medium uppercase tracking-tighter">
                      Max Size: 15MB
                    </p>
                  </div>
                  {businessRegistrationDocument && (
                    <p className="text-indigo-200 text-[12px] font-medium truncate">
                      Selected: {businessRegistrationDocument.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-all cursor-pointer"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
              >
                {loading ? "Creating Profile..." : "Launch My Business ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantOnboardingPage;
