import React from 'react';
import { humanizeRule } from './utils';

interface PoliciesSectionProps {
  /** Check-in window start time (e.g. "14:00") */
  checkInFrom?: string | null;
  /** Check-in window end time (e.g. "Midnight") */
  checkInTo?: string | null;
  /** Check-out window start time (e.g. "08:00") */
  checkOutFrom?: string | null;
  /** Check-out window end time (e.g. "12:00") */
  checkOutTo?: string | null;
  /** Whether smoking is allowed on the property */
  smokingAllowed?: boolean | null;
  /** Whether children are allowed on the property */
  childrenAllowed?: boolean | null;
  /** Whether parties/events are allowed on the property */
  partiesAllowed?: boolean | null;
}

/**
 * PoliciesSection
 *
 * Renders the "Stay Policies" section on the Property Details page.
 * Displays check-in / check-out schedule and the property house rules
 * (smoking, children, parties) using colour-coded bullet indicators.
 */
const PoliciesSection: React.FC<PoliciesSectionProps> = ({
  checkInFrom,
  checkInTo,
  checkOutFrom,
  checkOutTo,
  smokingAllowed,
  childrenAllowed,
  partiesAllowed,
}) => {
  /** House rules list rendered in the right column */
  const rules = [
    { label: 'Smoking',  value: smokingAllowed },
    { label: 'Children', value: childrenAllowed },
    { label: 'Parties',  value: partiesAllowed },
  ];

  return (
    <section id="policies" className="scroll-mt-40">
      {/* Section heading */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-xl md:text-2xl font-black text-[#0e2a47] mb-2">Stay Policies</h3>
        <p className="text-slate-400 text-sm md:font-medium">Important information for your stay</p>
      </div>

      <div className="bg-white rounded-3xl md:rounded-4xl p-6 md:p-10 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

          {/* ── Left column: check-in / check-out schedule ── */}
          <div>
            <h4 className="text-[12px] md:text-[14px] font-black text-[#0e2a47] uppercase tracking-widest mb-4 md:mb-6">
              Schedule
            </h4>
            <div className="space-y-4">
              {/* Check-in row */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                    Check-in
                  </span>
                  <span className="text-[#0e2a47] font-black text-base md:text-lg">
                    {checkInFrom || '14:00'} - {checkInTo || 'Midnight'}
                  </span>
                </div>
              </div>

              {/* Check-out row */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                    Check-out
                  </span>
                  <span className="text-[#0e2a47] font-black text-base md:text-lg">
                    {checkOutFrom || '08:00'} - {checkOutTo || '12:00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column: house rules ── */}
          <div>
            <h4 className="text-[12px] md:text-[14px] font-black text-[#0e2a47] uppercase tracking-widest mb-4 md:mb-6">
              House Rules
            </h4>
            <div className="space-y-2 md:space-y-3">
              {rules.map(({ label, value }) => (
                <div key={label} className="flex gap-4 p-3 md:p-4 hover:bg-slate-50 transition-colors rounded-2xl">
                  {/* Green dot = allowed, rose dot = not allowed */}
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${value ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                  <span className="text-slate-600 text-[14px] md:text-[15px] font-medium">
                    {humanizeRule(label, value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PoliciesSection;
