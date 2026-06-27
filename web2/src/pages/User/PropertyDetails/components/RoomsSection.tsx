import React from 'react';
import { formatLocalDate } from '../../../../lib/date-utils';

interface BedConfig {
  id: string;
  bedType: string;
  count: number;
}

interface RoomInventory {
  id: string;
  date: string;
  availableRooms: number;
  priceOverride: number | null;
}

interface Unit {
  id: string;
  name: string;
  maxGuests: number | null;
  size: number | null;
  bathrooms: number | null;
  isBathroomPrivate: boolean | null;
  displayedPrice: number | null;
  pricePerNight: number | null;
  bedConfigs: BedConfig[];
  inventory: RoomInventory[];
  amenities?: string[];
  smokingAllowed?: boolean | null;
}

interface RoomsSectionProps {
  /** Array of available room types/units */
  units: Unit[];
  /** Is the property type a hotel */
  isHotel: boolean;
  /** Currently selected unit ID in the booking flow */
  selectedUnitId: string | null;
  /** Current check-in / check-out range selected by guest */
  selectedRange: { checkIn: string | null; checkOut: string | null };
}

/**
 * RoomsSection
 *
 * Renders the "Available Room Options" comparison table.
 * Fully responsive, with smooth selection states, pricing overviews,
 * real-time inventory calendars per room, and premium glassmorphic accents.
 */
const RoomsSection: React.FC<RoomsSectionProps> = ({
  units,
  selectedUnitId,
  selectedRange,
}) => {
  if (!units || units.length === 0) {
    return (
      <section id="rooms" className="scroll-mt-40">
        <div className="mb-6">
          <h3 className="text-2xl font-black text-[#0e2a47]">Available Room Options</h3>
          <p className="text-slate-400 text-sm font-medium">Select a room type to start your booking</p>
        </div>
        <div className="bg-white rounded-4xl p-12 border-2 border-dashed border-slate-200 text-center">
          <h4 className="text-lg font-bold text-slate-600">No rooms available</h4>
        </div>
      </section>
    );
  }

  return (
    <section id="rooms" className="scroll-mt-40">
      {/* Section Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-black text-[#0e2a47] mb-2">Available Room Options</h3>
        <p className="text-slate-400 font-medium">Compare options and choose the perfect space for your stay</p>
      </div>

      {/* Responsive Table Container */}
      <div className="bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-wider w-[28%]">Room Details</th>
                <th className="py-6 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider w-[22%]">Bedding &amp; Size</th>
                <th className="py-6 px-6 text-[11px] font-black text-slate-400 uppercase tracking-wider w-[35%]">Daily Rates &amp; Availability</th>
                <th className="py-6 px-8 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right w-[15%]">Nightly Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {units.map((unit) => {
                const isSelected = selectedUnitId === unit.id;
                const displayPrice = unit.displayedPrice || unit.pricePerNight || 0;

                return (
                  <tr
                    key={unit.id}
                    className={`transition-all duration-300 group hover:bg-slate-50/30 ${
                      isSelected ? 'bg-emerald-50/10' : ''
                    }`}
                  >
                    {/* Column 1: Name, Guests, Bathrooms */}
                    <td className="py-8 px-8 align-top">
                      <div className="space-y-3">
                        <h4 className="text-lg font-black text-[#0e2a47] tracking-tight group-hover:text-[#2dd4af] transition-colors leading-snug">
                          {unit.name}
                        </h4>
                        
                        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                          {/* Capacity */}
                          {unit.maxGuests && (
                            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                              </svg>
                              {unit.maxGuests} Adults
                            </span>
                          )}

                          {/* Bathroom */}
                          {unit.bathrooms && (
                            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M1 6v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6" />
                                <path d="M1 10h22" />
                                <path d="M8 2v4" />
                                <path d="M16 2v4" />
                              </svg>
                              {unit.bathrooms} {unit.isBathroomPrivate ? 'Private' : 'Shared'}
                            </span>
                          )}
                        </div>

                        {/* Guest recommendation helper */}
                        <p className="text-[11px] text-slate-400 font-medium">
                          {unit.maxGuests && unit.maxGuests > 2
                            ? 'Perfect for families or groups'
                            : unit.maxGuests === 2
                            ? 'Ideal for couples'
                            : 'Solo travelers choice'}
                        </p>
                      </div>
                    </td>

                    {/* Column 2: Bed configs & size */}
                    <td className="py-8 px-6 align-top">
                      <div className="space-y-4">
                        {/* Bed Configurations */}
                        {unit.bedConfigs?.length > 0 && (
                          <div className="space-y-1">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">Beds</span>
                            <div className="flex flex-col gap-0.5">
                              {unit.bedConfigs.map((bed) => (
                                <span key={bed.id} className="text-sm text-[#0e2a47] font-bold">
                                  {bed.count} &times; <span className="capitalize">{bed.bedType}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Room size */}
                        {unit.size && (
                          <div className="space-y-1">
                            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider">Space</span>
                            <span className="text-sm text-[#0e2a47] font-bold flex items-center gap-1.5">
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 opacity-55" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                              </svg>
                              {unit.size} m² Room
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Column 3: Daily Rate Inventory Scroller */}
                    <td className="py-8 px-6 align-top">
                      <div className="space-y-2">
                        <span className="block text-[9px] font-black text-slate-300 uppercase tracking-wider mb-2">Real-time Daily Rates (scroll to view more)</span>
                        
                        {unit.inventory?.length > 0 ? (
                          <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[340px] pb-2 -mx-1 px-1">
                            {unit.inventory.map((inv) => {
                              const isSelectedStart = isSelected && selectedRange.checkIn === inv.date;
                              const isInRange = isSelected && selectedRange.checkIn && selectedRange.checkOut &&
                                new Date(inv.date) >= new Date(selectedRange.checkIn) &&
                                new Date(inv.date) < new Date(selectedRange.checkOut);

                              return (
                                <div
                                  key={inv.id}
                                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all shrink-0 w-[78px] text-center ${
                                    isSelectedStart || isInRange
                                      ? 'bg-[#0e2a47] border-[#0e2a47] text-white'
                                      : inv.availableRooms > 0
                                      ? 'bg-white border-slate-100 hover:border-[#2dd4af]'
                                      : 'bg-slate-50 border-slate-100 opacity-50'
                                  }`}
                                >
                                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                                    {formatLocalDate(inv.date, { day: 'numeric', month: 'short' })}
                                  </span>
                                  <span className={`text-[12px] font-black tracking-tight my-0.5 ${isSelectedStart || isInRange ? 'text-[#2dd4af]' : 'text-[#0e2a47]'}`}>
                                    ${(inv.priceOverride || displayPrice).toLocaleString()}
                                  </span>
                                  <span className={`text-[7px] font-black uppercase tracking-wider ${
                                    inv.availableRooms === 0
                                      ? 'text-rose-500'
                                      : inv.availableRooms <= 2
                                      ? 'text-amber-600 animate-pulse'
                                      : 'text-emerald-500'
                                  }`}>
                                    {inv.availableRooms === 0 ? 'Sold' : `${inv.availableRooms} Left`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No available dates in next 60 days</span>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Base Pricing & Details */}
                    <td className="py-8 px-8 align-top text-right">
                      <div className="flex flex-col items-end justify-center">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider mb-0.5">nightly value</span>
                        <span className="text-2xl font-black text-[#0e2a47] tracking-tight">
                          ${displayPrice.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium tracking-normal mt-0.5 block">No instant payment</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;
