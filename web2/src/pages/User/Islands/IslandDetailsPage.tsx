import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Search } from 'lucide-react';
import SEO from '../../../components/SEO';
import PageHeader from '../../../components/PageHeader';
import { usePublicDeals } from '../../../features/Deals/hooks/usePublicDeals';
import DealCard from '../../../features/Deals/components/DealCard';
import { ISLANDS_DATA } from '../../../constants/islands';
import { UserDealsGridSkeleton } from '../../../components/UserUI';

const IslandDetailsPage: React.FC = () => {
  const { islandName } = useParams<{ islandName: string }>();
  
  const island = useMemo(() => {
    return ISLANDS_DATA.find(i => i.name === islandName);
  }, [islandName]);

  const { deals, loading, total, error } = usePublicDeals({
    source: 'accommodations',
    island: islandName,
    limit: 20
  });

  if (!island && !loading) {
    return (
      <div className="min-h-screen bg-[#fdf6e9] flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-[#0e2a47] mb-4">Island not found</h1>
        <Link to="/islands" className="text-[#2dd4af] font-bold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Islands
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6e9]">
      <SEO 
        title={`${islandName} Stays | LushWare`}
        description={`Discover the best accommodation deals on ${islandName}. Plan your perfect Maldivian getaway.`}
      />

      <PageHeader 
        title="Stay in"
        highlightedWord={islandName || ''}
        description={island?.description || `Explore exclusive accommodation deals and boutique stays in ${islandName}.`}
        backgroundImage={island?.image || "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=2000&auto=format&fit=crop"}
      >
        <div className="flex items-center gap-4 mt-6">
          <Link 
            to="/islands" 
            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm backdrop-blur-md border border-white/20 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            All Islands
          </Link>
          <div className="px-6 py-2.5 bg-[#2dd4af]/20 text-[#2dd4af] rounded-xl font-bold text-sm border border-[#2dd4af]/30 backdrop-blur-md">
            {total} Active Deals
          </div>
        </div>
      </PageHeader>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[#2dd4af] font-bold text-sm uppercase tracking-wider mb-2">
              <MapPin className="w-4 h-4" />
              <span>Available Stays</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-['Playfair_Display'] font-bold text-[#0e2a47]">
              Accommodation in {islandName}
            </h2>
          </div>
          
          <div className="text-slate-500 text-sm font-medium">
            Showing {deals.length} results on this island
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <UserDealsGridSkeleton count={8} />
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl text-center">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : deals.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {deals.map((deal) => (
              <div key={deal.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DealCard deal={deal} />
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-[#0e2a47] mb-3">No active deals yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              We couldn't find any accommodation deals for {islandName} right now. Check back soon or explore other nearby islands.
            </p>
            <Link 
              to="/islands"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#0e2a47] text-white rounded-2xl font-bold hover:bg-[#2dd4af] transition-colors"
            >
              Explore Other Islands
            </Link>
          </div>
        )}
      </main>

      {/* ─── Bottom CTA ─── */}
      {!loading && deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-[#0e2a47] rounded-[2.5rem] p-10 md:p-20 overflow-hidden text-center"
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-['Playfair_Display'] font-bold text-white mb-6">
                Found your dream stay?
              </h2>
              <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
                These deals are exclusive to LushWare. Secure your dates today before they're gone.
              </p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-10 py-4 bg-[#2dd4af] text-[#0e2a47] rounded-2xl font-bold text-lg shadow-xl shadow-[#2dd4af]/20 hover:-translate-y-1 transition-all"
              >
                Back to Top
              </button>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default IslandDetailsPage;
