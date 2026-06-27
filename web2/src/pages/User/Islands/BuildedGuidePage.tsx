import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, ArrowLeft, ArrowRight, HelpCircle, CheckCircle } from 'lucide-react';
import SEO from '../../../components/SEO';
import PageHeader from '../../../components/PageHeader';
import { useIslands } from '../../../features/Islands/hooks/useIslands';
import { ComparisonBar } from '../../../features/Islands/components/ComparisonBar';

const BuildedGuidePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { suitableIslands, loading, error, fetchSuitableIslands } = useIslands();
  
  // Local comparison state
  const [selectedForCompare, setSelectedForCompare] = useState<Array<{ id: string; name: string; image: string | null }>>(() => {
    const saved = localStorage.getItem('island_compare_list');
    return saved ? JSON.parse(saved) : [];
  });

  const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const activities = searchParams.get('activities')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    fetchSuitableIslands(categories, activities);
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('island_compare_list', JSON.stringify(selectedForCompare));
  }, [selectedForCompare]);

  const handleToggleCompare = (island: any) => {
    const exists = selectedForCompare.some(item => item.id === island.id);
    if (exists) {
      setSelectedForCompare(prev => prev.filter(item => item.id !== island.id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can select a maximum of 3 islands to compare.');
        return;
      }
      const image = island.firstImage || island.images?.[0] || null;
      setSelectedForCompare(prev => [...prev, { id: island.id, name: island.name, image }]);
    }
  };

  const handleClearCompare = () => {
    setSelectedForCompare([]);
  };

  const formatCategory = (cat: string) => {
    return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-(--app-bg) text-slate-800 pb-32">
      <SEO 
        title="Your Matching Guide | LushWare"
        description="Here are the best matching Maldives islands based on your custom preferences."
      />

      <PageHeader 
        title="Custom Tailored"
        highlightedWord="Islands"
        description="We scored and sorted our entire database. Here are the top 6 islands matching your vacation profile."
        backgroundImage="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2000&auto=format&fit=crop"
      />

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Active Filters Summary */}
        <div className="bg-white border border-black/5 rounded-3xl p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#25b898] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Active Preference Profile
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {categories.map(c => (
                <span key={c} className="px-3 py-1 bg-slate-50 border border-black/5 rounded-full text-xs font-medium text-[#0e2a47]">
                  {formatCategory(c)}
                </span>
              ))}
              {activities.map(a => (
                <span key={a} className="px-3 py-1 bg-slate-50 border border-black/5 rounded-full text-xs font-medium text-[#0e2a47]">
                  {formatCategory(a)}
                </span>
              ))}
            </div>
          </div>

          <Link
            to="/local-guide"
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-[#0e2a47] rounded-xl text-sm font-semibold transition-all border border-black/5 shadow-sm shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Adjust Filters
          </Link>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#2dd4af] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Matching and scoring islands...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0e2a47] mb-2">Error matching islands</h3>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <button onClick={() => fetchSuitableIslands(categories, activities)} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-xs transition-all cursor-pointer">
              Try Again
            </button>
          </div>
        ) : suitableIslands.length === 0 ? (
          <div className="bg-white border border-black/5 rounded-[2.5rem] p-16 text-center max-w-2xl mx-auto shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <HelpCircle className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-[#0e2a47] mb-3">No matching islands found</h3>
            <p className="text-slate-500 text-sm mb-8">
              We couldn't find any islands matching your selected vibes and activities. Try adjusting your preferences or explore all of our islands.
            </p>
            <div className="flex items-center gap-4 justify-center">
              <Link to="/local-guide" className="px-6 py-3 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-[#2dd4af]/20">
                Back to questionnaire
              </Link>
              <Link to="/local-guide/islands" className="px-6 py-3 bg-white border border-black/5 text-[#0e2a47] rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                Browse All Islands
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {suitableIslands.map((island: any, index: number) => {
              const isSelected = selectedForCompare.some(item => item.id === island.id);
              const cardImage = island.firstImage || "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=2000&auto=format&fit=crop";

              return (
                <motion.div
                  key={island.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white border border-black/5 rounded-[2rem] overflow-hidden flex flex-col justify-between hover:border-[#2dd4af]/30 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-xl"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="h-56 relative overflow-hidden bg-slate-100">
                      <img 
                        src={cardImage} 
                        alt={island.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e2a47]/50 via-transparent to-transparent opacity-60" />

                      {/* Suitability score badge */}
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-[#2dd4af] text-white rounded-full text-[10px] font-bold shadow-lg">
                        <CheckCircle className="w-3 h-3" />
                        <span>Match Rank #{index + 1}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold font-['Playfair_Display'] text-[#0e2a47] group-hover:text-[#25b898] transition-colors">
                        {island.name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {island.categories.map((c: string) => (
                          <span key={c} className="px-2 py-0.5 bg-slate-50 border border-black/5 rounded text-[10px] text-slate-500 font-medium uppercase">
                            {c.replace('_', ' ')}
                          </span>
                        ))}
                      </div>

                      <p className="text-slate-600 text-xs mt-4 line-clamp-3 leading-relaxed">
                        {island.bestFor}
                      </p>

                      <div className="mt-6 space-y-2 border-t border-black/5 pt-4 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Transfer:</span>
                          <span className="font-semibold text-[#0e2a47] truncate max-w-44 text-right">{island.transferDetails.join(", ")}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Est. Pricing:</span>
                          <span className="font-semibold text-[#0e2a47]">${island.costNonLocal} / night</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex gap-3">
                    <button
                      onClick={() => handleToggleCompare(island)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100/50'
                          : 'bg-white border border-black/5 text-[#0e2a47] hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? 'Remove Compare' : 'Add to Compare'}
                    </button>
                    
                    <Link
                      to={`/local-guide/island/${island.id}`}
                      className="px-4 py-3 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] rounded-xl text-xs font-bold flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Comparison Pool Bar */}
      <ComparisonBar 
        selectedIslands={selectedForCompare}
        onRemove={(id) => setSelectedForCompare(prev => prev.filter(item => item.id !== id))}
        onClear={handleClearCompare}
      />
    </div>
  );
};

export default BuildedGuidePage;
