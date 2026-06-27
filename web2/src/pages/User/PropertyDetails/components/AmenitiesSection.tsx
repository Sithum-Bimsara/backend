import React, { useState } from 'react';
import { AmenityIcon } from './AmenityIcon';

interface AmenitiesSectionProps {
  /** List of physical facility names (e.g. "Pool", "Gym") */
  propertyFacilities: string[];
  /**
   * Key-value map of property services.
   * Values can be "yes" / "no" / a descriptive string.
   * Entries with "no" or "no parking" are filtered out automatically.
   */
  services: Record<string, string>;
}

/**
 * AmenitiesSection
 *
 * Renders the "What this place offers" section on the Property Details page.
 * Combines property facilities and services in a unified grid and exposes a
 * "Show all" modal when there are more than 12 facilities.
 */
const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({ propertyFacilities, services }) => {
  /** Controls visibility of the full-facilities modal */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** Service entries that are explicitly active (not "no" / "no parking") */
  const activeServices = Object.entries(services || {}).filter(
    ([, val]) => val && val !== 'no' && val !== 'no parking',
  );

  /** True when neither facilities nor services have anything to show */
  const isEmpty = !propertyFacilities?.length && !activeServices.length;

  return (
    <>
      {/* ── Amenities Section ── */}
      <section id="amenities" className="scroll-mt-40">
        {/* Section heading */}
        <div className="mb-8">
          <h3 className="text-2xl font-black text-[#0e2a47] mb-2">What this place offers</h3>
          <p className="text-slate-400 font-medium">
            Comprehensive amenities and services designed for your absolute comfort
          </p>
        </div>

        <div className="bg-white rounded-3xl md:rounded-4xl p-6 md:p-10 border border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 md:gap-y-8 gap-x-8 md:gap-x-12">

            {/* ── Property Facilities ── */}
            {propertyFacilities?.map((facility) => (
              <div key={facility} className="flex items-center gap-4 text-slate-700 group cursor-default">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2dd4af]/10 group-hover:text-[#2dd4af] transition-all shrink-0">
                  <AmenityIcon name={facility} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] md:text-[17px] font-bold leading-tight text-[#0e2a47]">{facility}</span>
                  <span className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Facility
                  </span>
                </div>
              </div>
            ))}

            {/* ── Property Services ── */}
            {activeServices.map(([key, val]) => (
              <div key={key} className="flex items-center gap-4 text-slate-700 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2dd4af]/10 group-hover:text-[#2dd4af] transition-all shrink-0">
                  <AmenityIcon name={key} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[17px] font-bold leading-tight text-[#0e2a47] capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-[11px] text-[#2dd4af] font-black uppercase tracking-widest mt-0.5">
                    {val === 'yes' ? 'Available' : val}
                  </span>
                </div>
              </div>
            ))}

            {/* Fallback when nothing is available */}
            {isEmpty && (
              <p className="text-slate-400 text-sm italic">Contact property for full facility list</p>
            )}
          </div>

          {/* "Show all" button — only rendered when there are more than 12 facilities */}
          {propertyFacilities?.length > 12 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-12 px-8 py-3 bg-white border border-[#0e2a47] hover:bg-slate-50 text-[#0e2a47] font-black rounded-xl transition-all text-sm uppercase tracking-widest active:scale-95"
            >
              Show all {propertyFacilities.length} amenities
            </button>
          )}
        </div>
      </section>

      {/* ── Amenities Modal (full facility list) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
          {/* Backdrop — click to close */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-2xl max-h-[80vh] rounded-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between z-10">
              <h3 className="text-xl font-black text-[#0e2a47]">What this place offers</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all"
                aria-label="Close amenities modal"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal content — scrollable list of all facilities */}
            <div className="p-8 overflow-y-auto max-h-[calc(80vh-80px)] scrollbar-hide">
              <div className="grid grid-cols-1 gap-8">
                {propertyFacilities.map((facility) => (
                  <div key={facility} className="flex items-center gap-6 border-b border-slate-50 pb-6 last:border-0 last:pb-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#2dd4af]">
                      <AmenityIcon name={facility} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#0e2a47]">{facility}</p>
                      <p className="text-sm text-slate-400 font-medium">Verified property facility</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AmenitiesSection;
