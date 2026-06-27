import React from 'react';

interface PointOfInterest {
  name: string;
  distanceText: string;
}

interface NearbySectionProps {
  /** Array of nearby points of interest attached to the property */
  points: PointOfInterest[];
}

/**
 * NearbySection
 *
 * Renders the "Nearby Points of Interest" section on the Property Details page.
 * Returns null when there are no points to display so the section is invisible
 * rather than rendering an empty card.
 */
const NearbySection: React.FC<NearbySectionProps> = ({ points }) => {
  // Do not render the section when there are no points of interest
  if (!points || points.length === 0) return null;

  return (
    <section id="nearby" className="scroll-mt-40">
      {/* Section heading */}
      <div className="mb-8">
        <h3 className="text-2xl font-black text-[#0e2a47] mb-2">Nearby Points of Interest</h3>
        <p className="text-slate-400 font-medium">Explore the best attractions and landmarks around this property</p>
      </div>

      {/* Points of interest grid */}
      <div className="bg-white rounded-3xl md:rounded-[40px] p-3 md:p-6 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {points.map((poi, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#2dd4af]/30 transition-all"
            >
              {/* Location icon + name */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0e2a47] shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="text-[#0e2a47] font-bold">{poi.name}</span>
              </div>

              {/* Distance badge */}
              <span className="text-slate-500 font-bold text-xs bg-white px-3 py-1 rounded-full border border-slate-100">
                {poi.distanceText}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NearbySection;
