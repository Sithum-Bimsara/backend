import React from 'react';

interface MarineZone {
  zone: string;
  description?: string;
}

interface MarineLifeSectionProps {
  /** Array of marine-life zones attached to the property */
  zones: MarineZone[];
}

/**
 * MarineLifeSection
 *
 * Renders the "Marine Life & Zones" section on the Property Details page.
 * Returns null when there are no zones so the section stays hidden.
 */
const MarineLifeSection: React.FC<MarineLifeSectionProps> = ({ zones }) => {
  // Do not render the section when there are no marine-life zones
  if (!zones || zones.length === 0) return null;

  return (
    <section id="marineLife" className="scroll-mt-40">
      {/* Section heading */}
      <div className="mb-8">
        <h3 className="text-2xl font-black text-[#0e2a47] mb-2">Marine Life &amp; Zones</h3>
        <p className="text-slate-400 font-medium">Discover the underwater wonders and protected zones nearby</p>
      </div>

      {/* Zones grid */}
      <div className="bg-white rounded-3xl md:rounded-[40px] p-3 md:p-6 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zones.map((zone, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#2dd4af]/30 transition-all"
            >
              {/* Zone icon + name */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#2dd4af] shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h4 className="text-[#0e2a47] font-black text-lg">{zone.zone}</h4>
              </div>

              {/* Optional zone description */}
              {zone.description && (
                <p className="text-slate-600 font-medium text-[15px] leading-relaxed">{zone.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarineLifeSection;
