import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import SEO from '../../../components/SEO';
import PageHeader from '../../../components/PageHeader';
import Pagination from '../../../components/Pagination/Pagination';
import { useIslands } from '../../../features/Islands/hooks/useIslands';
import { ComparisonBar } from '../../../features/Islands/components/ComparisonBar';

const AllIslandsPage: React.FC = () => {
  const { paginatedData, loading, page, limit, search, fetchIslands, setPage, setSearch } = useIslands();
  const [searchInput, setSearchInput] = useState(search);

  // Local comparison state
  const [selectedForCompare, setSelectedForCompare] = useState<Array<{ id: string; name: string; image: string | null }>>(() => {
    const saved = localStorage.getItem('island_compare_list');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetchIslands();
  }, [page, search]);

  useEffect(() => {
    localStorage.setItem('island_compare_list', JSON.stringify(selectedForCompare));
  }, [selectedForCompare]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleToggleCompare = (island: any) => {
    const exists = selectedForCompare.some(item => item.id === island.id);
    if (exists) {
      setSelectedForCompare(prev => prev.filter(item => item.id !== island.id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can select a maximum of 3 islands to compare.');
        return;
      }
      const image = island.images?.[0] || null;
      setSelectedForCompare(prev => [...prev, { id: island.id, name: island.name, image }]);
    }
  };

  const handleClearCompare = () => {
    setSelectedForCompare([]);
  };

  return (
    <div className="min-h-screen bg-(--app-bg) text-slate-800 pb-32">
      <SEO 
        title="Browse Islands | LushWare"
        description="Explore the complete Maldives island catalog, plan your itinerary, and compare stay costs."
      />

      <PageHeader 
        title="Island"
        highlightedWord="Catalog"
        description="Browse through beautiful Maldivian islands, filter by vibes, and select up to 3 to compare costs side-by-side."
        backgroundImage="https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=2000&auto=format&fit=crop"
      />

      {/* Search & Actions Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-8 relative z-30">
        <div className="bg-white border border-black/5 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search islands by name or details..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 bg-white rounded-2xl border border-black/5 text-sm text-slate-700 placeholder-slate-400 outline-hidden focus:ring-2 focus:ring-[#2dd4af]/30 transition-all font-medium"
            />
          </form>

          <div className="flex gap-3 w-full md:w-auto shrink-0 justify-end">
            <Link
              to="/local-guide"
              className="flex items-center gap-2 px-6 py-3.5 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#2dd4af]/20 rounded-2xl text-sm font-bold shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Interactive Matcher
            </Link>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#2dd4af] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading island catalog...</p>
          </div>
        ) : paginatedData.items.length === 0 ? (
          <div className="bg-white border border-black/5 rounded-[2.5rem] p-16 text-center max-w-lg mx-auto shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0e2a47] mb-2">No islands match your search</h3>
            <p className="text-slate-500 text-sm mb-6">Try refining your keyword search or resetting the query.</p>
            <button onClick={() => { setSearchInput(''); setSearch(''); }} className="px-6 py-2.5 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] rounded-xl font-bold text-xs hover:-translate-y-0.5 transition-all shadow-md shadow-[#2dd4af]/20 cursor-pointer">
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedData.items.map((island: any) => {
                const isSelected = selectedForCompare.some(item => item.id === island.id);
                const cardImage = island.images?.[0] || "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=2000&auto=format&fit=crop";

                return (
                  <motion.div
                    key={island.id}
                    layout
                    className="group bg-white border border-black/5 rounded-[2rem] overflow-hidden flex flex-col justify-between hover:border-[#2dd4af]/30 transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-xl"
                  >
                    <div>
                      {/* Image */}
                      <div className="h-48 relative overflow-hidden bg-slate-100">
                        <img 
                          src={cardImage} 
                          alt={island.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e2a47]/50 via-transparent to-transparent opacity-60" />
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-xl font-bold font-['Playfair_Display'] text-[#0e2a47] group-hover:text-[#25b898] transition-colors">
                          {island.name}
                        </h3>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {island.categories?.slice(0, 2).map((c: string) => (
                            <span key={c} className="px-2 py-0.5 bg-slate-50 border border-black/5 rounded text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                              {c.replace('_', ' ')}
                            </span>
                          ))}
                        </div>

                        <p className="text-slate-600 text-xs mt-3 line-clamp-3 leading-relaxed">
                          {island.bestFor}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex gap-2">
                      <button
                        onClick={() => handleToggleCompare(island)}
                        className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100/50'
                            : 'bg-white border border-black/5 text-[#0e2a47] hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Compare'}
                      </button>
                      
                      <Link
                        to={`/local-guide/island/${island.id}`}
                        className="px-3 py-2.5 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] rounded-xl text-xs font-bold flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="mt-12 bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <Pagination
                currentPage={paginatedData.currentPage}
                totalItems={paginatedData.totalItems}
                itemsPerPage={limit}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </main>

      {/* Floating comparison pooling bar */}
      <ComparisonBar 
        selectedIslands={selectedForCompare}
        onRemove={(id) => setSelectedForCompare(prev => prev.filter(item => item.id !== id))}
        onClear={handleClearCompare}
      />
    </div>
  );
};

export default AllIslandsPage;
