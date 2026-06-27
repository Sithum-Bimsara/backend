import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Wifi, ShieldAlert, Compass, RefreshCw } from 'lucide-react';
import SEO from '../../../components/SEO';
import PageHeader from '../../../components/PageHeader';
import { useIslands } from '../../../features/Islands/hooks/useIslands';

const ComparisonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { compareList, loading, error, fetchCompareIslands } = useIslands();

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    fetchCompareIslands(ids);
  }, [searchParams]);

  const calculateTotalTypicalStay = (island: any) => {
    return island.costNonLocal + island.costFoodDrinks + island.costActivities + island.costExtra;
  };

  return (
    <div className="min-h-screen bg-(--app-bg) text-slate-800 pb-24">
      <SEO 
        title="Compare Islands Side-by-Side | LushWare"
        description="Compare Maldives stays, transfer logistics, and local amenities before booking."
      />

      <PageHeader 
        title="Side-by-Side"
        highlightedWord="Comparison"
        description="Compare stay costs, transfer logistics, wifi connectivity, and marine life parameters before making your final selection."
        backgroundImage="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop"
      />

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Navigation header */}
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/local-guide/islands"
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-[#0e2a47] rounded-xl text-xs font-semibold border border-black/5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>
          <span className="text-xs text-slate-500 font-medium">Comparing {ids.length} Maldives islands</span>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#2dd4af] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Compiling comparison matrix...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center max-w-md mx-auto shadow-sm">
            <RefreshCw className="w-12 h-12 text-red-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-bold text-[#0e2a47] mb-2">Error building comparison matrix</h3>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <button onClick={() => fetchCompareIslands(ids)} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-xs transition-all cursor-pointer">
              Try Again
            </button>
          </div>
        ) : compareList.length === 0 ? (
          <div className="bg-white border border-black/5 rounded-[2.5rem] p-16 text-center max-w-lg mx-auto shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <h3 className="text-xl font-bold text-[#0e2a47] mb-2">No islands selected for comparison</h3>
            <p className="text-slate-500 text-xs mb-6">Select at least 2 islands in the catalog or search result lists to compare.</p>
            <Link to="/local-guide/islands" className="px-6 py-2.5 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] rounded-xl font-bold text-xs hover:-translate-y-0.5 transition-all shadow-md shadow-[#2dd4af]/20 cursor-pointer">
              Select Islands
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                <thead>
                  <tr className="border-b border-black/5 bg-slate-50">
                    <th className="p-6 w-[220px] text-xs font-bold uppercase tracking-widest text-slate-500">Parameter</th>
                    {compareList.map((island) => (
                      <th key={island.id} className="p-6 text-left align-top">
                        <div className="space-y-4">
                           <img
                             src={island.images[0] || "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=200&auto=format&fit=crop"}
                             alt={island.name}
                             className="w-full h-32 object-cover rounded-2xl border border-black/5"
                           />
                           <div>
                             <h3 className="text-xl font-bold text-[#0e2a47] font-['Playfair_Display']">{island.name}</h3>
                             <span className="text-[10px] bg-[#2dd4af]/10 text-[#25b898] border border-[#2dd4af]/20 px-2 py-0.5 rounded uppercase mt-2 inline-block font-semibold">
                               {island.categories[0]?.replace('_', ' ')}
                             </span>
                           </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs">
                  {/* Category Vibes */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Vibe Description</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-600 leading-relaxed align-top break-words">{island.bestFor}</td>
                    ))}
                  </tr>

                  {/* Transfer Logistic */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Transfer Services</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-600 leading-relaxed align-top break-words">
                        <div className="flex gap-2">
                          <MapPin className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                          <span className="break-words">{island.transferDetails.join(", ")}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Non-local price per night */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Non-Local / Tourist Nightly Rate</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-[#25b898] font-bold font-mono text-sm align-top">${island.costNonLocal}</td>
                    ))}
                  </tr>

                  {/* Local price per night */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Local / Expats Nightly Rate</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-700 font-semibold font-mono align-top">${island.costLocal}</td>
                    ))}
                  </tr>

                  {/* Daily Food and drinks price */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Daily Food & Drink Cost</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-700 font-mono align-top">${island.costFoodDrinks}</td>
                    ))}
                  </tr>

                  {/* Excursion & activities price */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Average Activity Excursion Cost</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-700 font-mono align-top">${island.costActivities}</td>
                    ))}
                  </tr>

                  {/* Extras / Green tax / tourism fees */}
                  <tr>
                    <td className="p-6 bg-[#0e2a47]/5 font-bold text-[#0e2a47]">Hidden Extras / Taxes / Surcharges</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-700 font-mono align-top">${island.costExtra}</td>
                    ))}
                  </tr>

                  {/* Total package estimate */}
                  <tr className="bg-[#2dd4af]/5 font-semibold">
                    <td className="p-6 bg-[#0e2a47]/5 font-bold text-[#25b898]">Total Typical Day Estimation</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-[#25b898] font-bold font-mono text-sm align-top">
                        ${calculateTotalTypicalStay(island)}
                      </td>
                    ))}
                  </tr>

                  {/* Wifi & internet connectivity */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Internet & Wifi Info</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-600 leading-relaxed align-top break-words">
                        <div className="flex gap-2">
                          <Wifi className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                          <span className="break-words break-all">{island.internetText}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Marine life zone characteristics */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Marine Life Zones</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-600 leading-relaxed align-top break-words">
                        <div className="flex gap-2">
                          <Compass className="w-4 h-4 text-[#25b898] shrink-0 mt-0.5" />
                          <span className="break-words">{island.marineLifeZones.join(", ")}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Nightlife and socialscene */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Nightlife & Social Atmosphere</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-600 leading-relaxed align-top break-words break-all">{island.nightlife}</td>
                    ))}
                  </tr>

                  {/* Safety parameters & customs */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Customs & Local Regulations</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-600 leading-relaxed align-top break-words">
                        <div className="flex gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span className="break-words break-all">{island.safetyText}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Custom timelines / sample day */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Sample Day Timeline</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-600 leading-relaxed align-top break-words">
                        {island.sampleDay && island.sampleDay.length > 0 ? (
                           <div className="space-y-3">
                             {island.sampleDay.slice(0, 3).map((day: any, idx: number) => (
                               <div key={idx} className="break-words">
                                 <span className="font-bold text-[#25b898] block font-mono">{day.time}</span>
                                 <span className="text-[10px] block mt-0.5 text-slate-500 leading-relaxed break-words">{day.description}</span>
                               </div>
                             ))}
                           </div>
                        ) : (
                          <span className="text-slate-400">None formulated</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Insider tips */}
                  <tr>
                    <td className="p-6 bg-slate-50/50 font-bold text-[#0e2a47]">Top Expert Tips</td>
                    {compareList.map((island) => (
                      <td key={island.id} className="p-6 text-slate-600 leading-relaxed align-top break-words">
                        {island.insiderTips && island.insiderTips.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1.5 break-words">
                            {island.insiderTips.slice(0, 3).map((tip: string, idx: number) => (
                              <li key={idx} className="leading-relaxed break-all">{tip}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400">None available</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ComparisonPage;
