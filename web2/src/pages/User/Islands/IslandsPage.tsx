import { MapPin, Waves, Sun, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../../components/SEO';
import PageHeader from '../../../components/PageHeader';
import { ISLANDS_DATA } from '../../../constants/islands';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const IslandsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredIslands = useMemo(() => {
    return ISLANDS_DATA.filter(island => {
      const matchesSearch = island.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (island.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf6e9]">
      <SEO 
        title="Discover Islands | LushWare"
        description="Explore the beautiful local and resort islands of the Maldives. Find your perfect getaway."
      />

      <PageHeader 
        title="Discover the"
        highlightedWord="Islands"
        description="Explore unique local islands, bustling cities, and serene hideaways across the archipelago."
        backgroundImage="https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=2000&auto=format&fit=crop"
      />

      {/* ─── Floating Search Bar ─── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 relative z-30">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-4xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-4 md:p-5"
        >
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search islands by name, vibe or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 bg-white rounded-2xl border border-black/5 text-[14px] text-slate-700 placeholder-slate-400 outline-hidden focus:ring-2 focus:ring-[#2dd4af]/30 transition-all shadow-xl shadow-black/5 font-medium"
            />
          </div>
        </motion.div>
      </div>

      {/* ─── Islands Grid ─── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="popLayout">
          {filteredIslands.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredIslands.map((island) => (
                <motion.div
                  key={island.id}
                  variants={itemVariants}
                  layout
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100/50 flex flex-col min-h-[500px]"
                >
                  {/* Image Container */}
                  <div className="relative h-64 w-full overflow-hidden shrink-0 bg-slate-100">
                    <img 
                      src={island.image}
                      alt={island.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 z-10">
                      <p className="text-white text-sm font-medium leading-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {island.vibe}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-[#0e2a47] group-hover:text-[#2dd4af] transition-colors">
                        {island.name}
                      </h3>
                      <MapPin className="w-4 h-4 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {island.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {island.highlights?.map(h => (
                        <span key={h} className="px-2 py-1 bg-[#fdf6e9] text-[10px] font-semibold text-slate-600 rounded-md border border-slate-100">
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Footer Action */}
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <button 
                        onClick={() => navigate(`/islands/${island.name}`)}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#0e2a47] hover:text-[#2dd4af] transition-colors group/btn cursor-pointer"
                      >
                        Explore Stays 
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                      <div className="flex gap-2">
                        <Waves className="w-4 h-4 text-slate-200" />
                        <Sun className="w-4 h-4 text-slate-200" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6 text-slate-300">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#0e2a47] mb-2">No islands found</h3>
              <p className="text-slate-500">Try adjusting your search to find what you're looking for.</p>
              <button 
                onClick={() => { setSearchQuery(''); }}
                className="mt-6 px-6 py-2 bg-[#0e2a47] text-white rounded-xl font-bold text-sm hover:bg-[#2dd4af] transition-colors"
              >
                Reset Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      
    </div>
  );
};

export default IslandsPage;
