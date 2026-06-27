import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getActiveIslands, getIslandListings } from '../../../../features/Deals/api/deals.api';
import { ISLANDS_DATA, type Island } from '../../../../constants/islands';
import { ErrorHandler } from '../../../../utils/error-handler';
import type { IDealCard } from '../../../../features/Deals/types/deals.types';
import { IslandCard } from './IslandCard';
import { IslandDrawer } from './IslandDrawer';

export const ActiveIslandsSection: React.FC = () => {
  const [islands, setIslands] = useState<Island[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Selected Island for the Slide-Over Drawer
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null);
  const [deals, setDeals] = useState<IDealCard[]>([]);
  const [accommodations, setAccommodations] = useState<IDealCard[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [errorData, setErrorData] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'stays'>('packages');

  // Pagination states for side-drawer lazy loading
  const [dealsPage, setDealsPage] = useState<number>(1);
  const [accommodationsPage, setAccommodationsPage] = useState<number>(1);
  const [hasMoreDeals, setHasMoreDeals] = useState<boolean>(false);
  const [hasMoreAccommodations, setHasMoreAccommodations] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchIslands = async () => {
      try {
        const activeNames = await getActiveIslands();
        if (!isMounted) return;

        const mapped = activeNames
          .map((name) => {
            const cleanName = name.split(" (")[0].trim();
            return ISLANDS_DATA.find((i) => i.name.toLowerCase() === cleanName.toLowerCase());
          })
          .filter((i): i is Island => i !== undefined);

        setIslands(mapped);
      } catch (err) {
        if (isMounted) {
          const errMsg = ErrorHandler.getErrorMessage(err);
          setError(errMsg);
          ErrorHandler.handle(err, { showToast: false });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchIslands();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch package deals & accommodations concurrently when an island is selected
  useEffect(() => {
    if (!selectedIsland) {
      setDeals([]);
      setAccommodations([]);
      setDealsPage(1);
      setAccommodationsPage(1);
      setHasMoreDeals(false);
      setHasMoreAccommodations(false);
      setErrorData(null);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setLoadingData(true);
      setErrorData(null);
      setDealsPage(1);
      setAccommodationsPage(1);
      try {
        const result = await getIslandListings(selectedIsland.name, {
          dealsPage: 1,
          dealsLimit: 10,
          accommodationsPage: 1,
          accommodationsLimit: 10,
        });

        if (!isMounted) return;

        const dealsList = result.deals || [];
        const accsList = result.accommodations || [];

        setDeals(dealsList);
        setAccommodations(accsList);
        setHasMoreDeals(result.pagination?.deals?.hasMore ?? false);
        setHasMoreAccommodations(result.pagination?.accommodations?.hasMore ?? false);

        // Auto toggle tab if one has listings and the other is empty
        if (dealsList.length === 0 && accsList.length > 0) {
          setActiveTab('stays');
        } else {
          setActiveTab('packages');
        }
      } catch (err) {
        if (isMounted) {
          setErrorData(ErrorHandler.getErrorMessage(err));
          ErrorHandler.handle(err, { showToast: false });
        }
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [selectedIsland]);

  // Lock background scroll when the side drawer is open
  useEffect(() => {
    if (selectedIsland) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedIsland]);

  const handleIslandClick = (island: Island) => {
    setSelectedIsland(island);
  };

  const handleCardClick = (id: string, type: 'packages' | 'stays') => {
    setSelectedIsland(null); // Close the drawer
    if (type === 'packages') {
      navigate(`/deals/${id}`);
    } else {
      navigate(`/accommodations/${id}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadMore = async () => {
    if (!selectedIsland || loadingMore) return;

    setLoadingMore(true);
    try {
      if (activeTab === 'packages') {
        const nextPage = dealsPage + 1;
        const result = await getIslandListings(selectedIsland.name, {
          dealsPage: nextPage,
          dealsLimit: 10,
          accommodationsPage: 1,
          accommodationsLimit: 10,
        });

        setDeals((prev) => [...prev, ...(result.deals || [])]);
        setDealsPage(nextPage);
        setHasMoreDeals(result.pagination?.deals?.hasMore ?? false);
      } else {
        const nextPage = accommodationsPage + 1;
        const result = await getIslandListings(selectedIsland.name, {
          dealsPage: 1,
          dealsLimit: 10,
          accommodationsPage: nextPage,
          accommodationsLimit: 10,
        });

        setAccommodations((prev) => [...prev, ...(result.accommodations || [])]);
        setAccommodationsPage(nextPage);
        setHasMoreAccommodations(result.pagination?.accommodations?.hasMore ?? false);
      }
    } catch (err) {
      ErrorHandler.handle(err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-16">
        <h3 className="text-xl font-['Playfair_Display',serif] font-bold text-[#0e2a47] mb-6 text-left">
          Gathering Active Gateways...
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-72 rounded-3xl bg-slate-100 animate-pulse border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-16 p-8 bg-red-50/50 border border-red-100 rounded-3xl text-center">
        <p className="text-red-500 font-semibold mb-2">Failed to load active gateways</p>
        <p className="text-xs text-red-400">{error}</p>
      </div>
    );
  }

  if (islands.length === 0) {
    return null;
  }

  const currentList = activeTab === 'packages' ? deals : accommodations;

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div className="text-left">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#2dd4af] uppercase block mb-2">
              Active Gateways
            </span>
            <h2 className="text-3xl md:text-4xl font-['Playfair_Display',serif] font-bold text-[#0e2a47]">
              Trending Maldives Escapes
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Discover breathtaking islands with confirmed package deals or available room inventories. Click an island to view stays.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {islands.map((island) => (
            <IslandCard
              key={island.id}
              island={island}
              onClick={() => handleIslandClick(island)}
            />
          ))}
        </div>
      </motion.div>

      {/* Slide-over side drawer component */}
      <IslandDrawer
        selectedIsland={selectedIsland}
        onClose={() => setSelectedIsland(null)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        deals={deals}
        accommodations={accommodations}
        loadingData={loadingData}
        errorData={errorData}
        currentList={currentList}
        hasMoreDeals={hasMoreDeals}
        hasMoreAccommodations={hasMoreAccommodations}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        onCardClick={handleCardClick}
      />
    </div>
  );
};
