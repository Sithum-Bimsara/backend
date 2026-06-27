import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-(--app-bg) pt-0 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative pt-16 pb-6 md:pt-24 md:pb-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero4.png"
            alt="Explore travel deals"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#0e2a47]/90 via-[#0e2a47]/65 to-[#0e2a47]/35 pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h1 className="font-['Playfair_Display',Georgia,serif] text-[2rem] md:text-[3.5rem] font-light text-white/90 mb-4 tracking-wide">
            Legal <em className="text-[#2dd4af] font-['Cormorant_Garamond',Georgia,serif] italic font-semibold">&</em> Terms
          </h1>
          <p className="text-white/60 text-sm md:text-base font-light max-w-lg mx-auto">
            Everything you need to know about booking your island adventure with LushWare.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="grid gap-8 md:gap-12">

          {/* Booking Terms Section */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-black/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2dd4af]/5 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700 pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#2dd4af]/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl md:text-3xl font-extrabold text-[#0e2a47]">
                Booking Terms
              </h2>
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
              <div className="flex gap-4">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2dd4af] shrink-0"></div>
                <p>Full payment is required at the time of booking to secure your reservation.</p>
              </div>
              <div className="flex gap-4">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2dd4af] shrink-0"></div>
                <p>All prices are quoted in USD and include all applicable luxury taxes, environment fees, and service charges unless stated otherwise.</p>
              </div>
              <div className="flex gap-4">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2dd4af] shrink-0"></div>
                <p>Bookings are only confirmed once the transaction has been successfully processed and you receive a confirmation voucher.</p>
              </div>
            </div>
          </section>

          {/* Cancellation Policy Section */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-black/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7b54]/5 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700 pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#ff7b54]/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#ff7b54]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl md:text-3xl font-extrabold text-[#0e2a47]">
                Cancellation Policy
              </h2>
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
              <div className="flex gap-4 items-start p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-emerald-900"><span className="font-bold">Flexible Window:</span> Cancellations made more than 30 days before arrival will receive a full refund.</p>
              </div>

              <div className="flex gap-4 items-start p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                <div className="mt-1 w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-rose-600" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
                <p className="text-rose-900"><span className="font-bold">No-Show Policy:</span> No-shows will be charged the full amount (100%) of the booking.</p>
              </div>

              <div className="flex gap-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                <p className="text-amber-900 text-sm">Any refunds processed will deduct the bank processing fees which have already been incurred during the initial transaction.</p>
              </div>
            </div>
          </section>

          {/* Contact Support CTA */}
          <div className="text-center py-6">
            <p className="text-slate-400 text-sm mb-4">Have questions about our policies?</p>
            <a
              href="mailto:lushware@contactcom"
              className="relative z-50 pointer-events-auto inline-flex items-center gap-2 text-[#0e2a47] font-bold hover:text-[#2dd4af] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Contact Support
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsPage;
