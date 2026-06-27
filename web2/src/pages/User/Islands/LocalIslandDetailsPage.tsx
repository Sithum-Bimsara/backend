import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Palmtree, MapPin, Compass, DollarSign, Calendar, Info, 
  ShieldAlert, Wifi, Award, CheckCircle, ChevronLeft, ChevronRight, Bookmark
} from 'lucide-react';
import SEO from '../../../components/SEO';
import * as api from '../../../features/Islands/api/island.api';
import type { IIslandFull } from '../../../features/Islands/types/island.types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LocalIslandDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [island, setIsland] = useState<IIslandFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Local comparison state
  const [selectedForCompare, setSelectedForCompare] = useState<Array<{ id: string; name: string; image: string | null }>>(() => {
    const saved = localStorage.getItem('island_compare_list');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getIslandById(id);
        setIsland(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load island details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  useEffect(() => {
    localStorage.setItem('island_compare_list', JSON.stringify(selectedForCompare));
  }, [selectedForCompare]);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--app-bg) text-slate-800 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-[#2dd4af] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Fetching paradise details...</p>
      </div>
    );
  }

  if (error || !island) {
    return (
      <div className="min-h-screen bg-(--app-bg) text-slate-800 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Island not found'}</h2>
        <Link to="/local-guide/islands" className="flex items-center gap-2 text-[#25b898] font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Islands Catalog
        </Link>
      </div>
    );
  }

  const isSelectedForCompare = selectedForCompare.some(item => item.id === island.id);
  const photos = island.images.length > 0 ? island.images : ["https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=2000&auto=format&fit=crop"];

  const handleToggleCompare = () => {
    if (isSelectedForCompare) {
      setSelectedForCompare(prev => prev.filter(item => item.id !== island.id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can select a maximum of 3 islands to compare.');
        return;
      }
      setSelectedForCompare(prev => [...prev, { id: island.id, name: island.name, image: photos[0] }]);
    }
  };

  const getWeatherStyle = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold';
      case 'good':
        return 'bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold';
      case 'fair':
        return 'bg-amber-50 border border-amber-200 text-amber-700 font-bold';
      case 'avoid':
        return 'bg-rose-50 border border-rose-200 text-rose-700 font-bold';
      default:
        return 'bg-slate-50 border border-black/5 text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-(--app-bg) text-slate-800 pb-24">
      <SEO 
        title={`${island.name} Local Guide | LushWare`}
        description={island.bestFor}
      />

      {/* ─── Premium Header Image Carousel ─── */}
      <section className="relative h-[60vh] w-full bg-slate-900 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activePhotoIdx}
            src={photos[activePhotoIdx]}
            alt={`${island.name} gallery ${activePhotoIdx + 1}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Carousel overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdf5e9] via-transparent to-black/35" />

        {/* Carousel controls */}
        {photos.length > 1 && (
          <>
            <button 
              onClick={() => setActivePhotoIdx(prev => (prev - 1 + photos.length) % photos.length)}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/45 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/75 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={() => setActivePhotoIdx(prev => (prev + 1) % photos.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/45 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/75 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Back link */}
        <div className="absolute top-28 left-8 z-30">
          <Link 
            to="/local-guide/islands"
            className="flex items-center gap-2 px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-xl font-bold text-xs hover:bg-black/60 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>
        </div>

        {/* Photo Index Indicator */}
        <div className="absolute bottom-8 right-8 z-10 flex gap-2">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhotoIdx(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activePhotoIdx ? 'bg-[#2dd4af] w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* ─── Two-Column Details ─── */}
      <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        
        {/* Left column: Sticky Summary Card */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white border border-black/5 rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <span className="px-3 py-1 bg-[#2dd4af] text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              {island.categories[0]?.replace('_', ' ')}
            </span>
            
            <h1 className="text-4xl font-bold font-['Playfair_Display'] text-[#0e2a47] mt-4">
              {island.name}
            </h1>

            <div className="space-y-4 mt-6 border-t border-black/5 pt-6 text-xs text-slate-500">
              <div className="flex gap-2.5">
                <MapPin className="w-4 h-4 text-[#25b898] shrink-0" />
                <div>
                  <span className="block text-[#0e2a47] font-bold">Transfer Service</span>
                  <span className="mt-0.5 block leading-relaxed">{island.transferDetails.join(", ")}</span>
                </div>
              </div>

              <div className="flex gap-2.5 border-t border-black/5 pt-4">
                <Award className="w-4 h-4 text-[#25b898] shrink-0" />
                <div>
                  <span className="block text-[#0e2a47] font-bold">Vibe & Best For</span>
                  <span className="mt-0.5 block leading-relaxed">{island.bestFor}</span>
                </div>
              </div>

              <div className="flex gap-2.5 border-t border-black/5 pt-4">
                <DollarSign className="w-4 h-4 text-[#25b898] shrink-0" />
                <div>
                  <span className="block text-[#0e2a47] font-bold">Nightly Cost Estimations</span>
                  <div className="flex gap-4 mt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Non-Local</span>
                      <span className="text-[#0e2a47] font-bold font-mono text-[13px]">${island.costNonLocal}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Local</span>
                      <span className="text-[#0e2a47] font-bold font-mono text-[13px]">${island.costLocal}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleToggleCompare}
                className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  isSelectedForCompare
                    ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100/50'
                    : 'bg-[#2dd4af] text-[#0e2a47] hover:bg-[#25b898] border-transparent hover:-translate-y-0.5 hover:shadow-lg shadow-md shadow-[#2dd4af]/10'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {isSelectedForCompare ? 'Remove from Comparison' : 'Add to Comparison'}
              </button>

              <Link
                to={`/islands/${island.name}`}
                className="w-full py-3.5 bg-white border border-black/5 text-[#0e2a47] hover:bg-slate-50 rounded-xl text-xs font-bold text-center transition-all block shadow-sm cursor-pointer"
              >
                Browse Stays & Deals
              </Link>
            </div>
          </div>
        </div>

        {/* Right column: Elegant Tabbed Block Sections */}
        <div className="lg:col-span-2 space-y-8 bg-white border border-black/5 rounded-[2rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          {/* Custom navigation tabs */}
          <div className="flex flex-wrap gap-2 border-b border-black/5 pb-4">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'weather', label: 'Weather & Seasons' },
              { id: 'pricing', label: 'Pricing details' },
              { id: 'activities', label: 'Activities & Nightlife' },
              { id: 'timeline', label: 'Sample Itinerary' },
              { id: 'customs', label: 'Customs & Insider Tips' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0e2a47] text-white shadow-md shadow-[#0e2a47]/10'
                    : 'text-slate-500 hover:text-[#0e2a47] hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="py-2">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0e2a47] flex items-center gap-2">
                      <Palmtree className="w-5 h-5 text-[#25b898]" />
                      About {island.name}
                    </h3>
                    <p className="text-slate-600 text-sm mt-3 leading-relaxed whitespace-pre-line">
                      {island.overview}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 border-t border-black/5 pt-6">
                    <div className="bg-slate-50 border border-black/5 p-4 rounded-2xl flex gap-3">
                      <Wifi className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-[#0e2a47] uppercase tracking-wider">Internet & Connectivity</h4>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed">{island.internetText}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-black/5 p-4 rounded-2xl flex gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-[#0e2a47] uppercase tracking-wider">Safety & Local Etiquette</h4>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed">{island.safetyText}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'weather' && (
                <motion.div
                  key="weather"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0e2a47] flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#25b898]" />
                      Month-by-Month Weather Guide
                    </h3>
                    <p className="text-slate-600 text-sm mt-2">
                      Review climate suitability based on traditional weather grids.
                    </p>
                  </div>

                  {/* 12-Month Color Coded Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {MONTHS.map((month, idx) => {
                      const status = island.bestTimeMonths[idx] || 'good';
                      return (
                        <div
                          key={month}
                          className={`p-3 rounded-2xl border text-center flex flex-col justify-between h-24 shadow-sm ${getWeatherStyle(status)}`}
                        >
                          <span className="text-xs font-bold uppercase tracking-wider block opacity-70">{month}</span>
                          <div>
                            <span className="text-[10px] uppercase font-extrabold tracking-widest block">
                              {status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-black/5 pt-6 text-xs text-slate-600">
                    {island.bestTimeTextBest && (
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                        <span className="font-bold text-emerald-700 block mb-1">Peak Season Details</span>
                        <p className="leading-relaxed">{island.bestTimeTextBest}</p>
                      </div>
                    )}
                    {island.bestTimeTextAvoid && (
                      <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                        <span className="font-bold text-rose-700 block mb-1">Monsoon / Avoid Seasons</span>
                        <p className="leading-relaxed">{island.bestTimeTextAvoid}</p>
                      </div>
                    )}
                  </div>
                  
                  {island.bestTimeTextTips && (
                    <div className="bg-slate-50 border border-black/5 p-4 rounded-xl text-xs text-slate-600">
                      <span className="font-bold text-[#0e2a47] block mb-1">Climatology Tips</span>
                      <p className="leading-relaxed">{island.bestTimeTextTips}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'pricing' && (
                <motion.div
                  key="pricing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0e2a47] flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#25b898]" />
                      Cost of Stay Parameters
                    </h3>
                    <p className="text-slate-600 text-sm mt-2">
                      Detailed parameters to help you formulate a realistic vacation budget.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {[
                      { label: 'Non-Local Stay Per Night', val: island.costNonLocal, desc: 'Average cost of resort/guesthouse per night for tourists.' },
                      { label: 'Local Stay Per Night', val: island.costLocal, desc: 'Nightly rates for local travelers or expats.' },
                      { label: 'Food & Drinks Estimation', val: island.costFoodDrinks, desc: 'Approximate daily cost of basic restaurant meals.' },
                      { label: 'Excursions & Activities', val: island.costActivities, desc: 'Cost of sunset cruises, diving, or snorkeling tours.' },
                      { label: 'Extras & Transfer Surcharges', val: island.costExtra, desc: 'Hidden fees, tourism green taxes, speedboats.' },
                    ].map(cost => (
                      <div key={cost.label} className="bg-slate-50 border border-black/5 p-5 rounded-2xl flex flex-col justify-between h-[120px] shadow-sm">
                        <div>
                          <span className="text-[10px] text-slate-500 font-extrabold uppercase block">{cost.label}</span>
                          <span className="text-slate-600 text-[10px] mt-1 leading-snug block">{cost.desc}</span>
                        </div>
                        <span className="text-xl font-bold text-[#25b898] font-mono mt-2">${cost.val}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'activities' && (
                <motion.div
                  key="activities"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0e2a47] flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#25b898]" />
                      Activities & Marine Highlights
                    </h3>
                  </div>

                  <div className="bg-slate-50 border border-black/5 p-6 rounded-2xl mt-4 shadow-sm">
                    <span className="text-xs font-bold text-[#0e2a47] uppercase tracking-wider block">Marine Biology Hotspots</span>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {island.marineLifeZones.map((zone) => (
                        <span key={zone} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100/80 text-indigo-700 rounded-xl text-xs font-semibold shadow-2xs">
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-black/5 p-6 rounded-2xl mt-4 shadow-sm">
                    <span className="text-xs font-bold text-[#0e2a47] uppercase tracking-wider block">Nightlife & Social Atmosphere</span>
                    <p className="text-slate-600 text-xs leading-relaxed mt-2">{island.nightlife}</p>
                  </div>

                  <div className="border-t border-black/5 pt-6 mt-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Activities on Offer</span>
                    <div className="flex flex-wrap gap-2">
                      {island.activities.map(act => (
                        <span key={act} className="px-3.5 py-1.5 bg-[#2dd4af]/10 border border-[#2dd4af]/20 text-[#25b898] rounded-xl text-xs font-semibold">
                          {act.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0e2a47] flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#25b898]" />
                      Suggested Daily Timeline
                    </h3>
                  </div>

                  {island.sampleDay && island.sampleDay.length > 0 ? (
                    <div className="relative border-l border-black/5 pl-6 space-y-6 mt-6 ml-2">
                      {island.sampleDay.map((day, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[30px] top-1.5 w-4 h-4 bg-[#2dd4af] rounded-full border-4 border-white shadow-sm" />
                          <span className="text-xs font-bold text-[#25b898] font-mono uppercase">{day.time}</span>
                          <p className="text-slate-600 text-xs mt-1 leading-relaxed">{day.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs py-8 text-center bg-slate-50 border border-black/5 rounded-2xl mt-4 shadow-sm">
                      No sample day timeline has been formulated for this island.
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === 'customs' && (
                <motion.div
                  key="customs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Insider tips list */}
                  <div>
                    <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0e2a47] flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#25b898]" />
                      Insider Secrets & Expert Tips
                    </h3>
                  </div>

                  {island.insiderTips && island.insiderTips.length > 0 ? (
                    <ul className="space-y-3 mt-6">
                      {island.insiderTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-3 bg-slate-50 border border-black/5 p-4 rounded-xl text-xs text-slate-600 leading-relaxed items-start shadow-sm">
                          <CheckCircle className="w-4 h-4 text-[#2dd4af] shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-xs py-8 text-center bg-slate-50 border border-black/5 rounded-2xl mt-4 shadow-sm">
                      No insider tips available for this island.
                    </p>
                  )}

                  {/* Food Deals Section */}
                  <div className="border-t border-black/5 pt-6 mt-8">
                    <h4 className="text-md font-bold text-[#0e2a47] mb-4">Recommended Gastronomic Deals</h4>
                    {island.foodAndDrinkDeals && island.foodAndDrinkDeals.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {island.foodAndDrinkDeals.map((deal, idx) => (
                          <div key={idx} className="bg-slate-50 border border-black/5 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                            <div>
                              <span className="font-bold text-[#0e2a47] text-sm block">{deal.name}</span>
                              <span className="text-slate-600 text-xs mt-1 block leading-relaxed">{deal.description}</span>
                            </div>
                            <span className="text-[#25b898] font-bold font-mono text-sm mt-3 block">${deal.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs">No specific culinary deals published yet.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LocalIslandDetailsPage;
