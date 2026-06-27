import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePublicDeals } from '../../../features/Deals/hooks/usePublicDeals';
import { useRecommendedDeals } from '../../../features/Deals/hooks/useRecommendedDeals';
import { CATEGORIES } from '../../../features/Deals/constants/deal-taxonomy';
import type { IDealCard } from '../../../features/Deals/types/deals.types';
import DealCard from '../../../features/Deals/components/DealCard';
import Pagination from '../../../components/Pagination/Pagination';
import { UserCard, UserDealsGridSkeleton } from '../../../components/UserUI';
import { useAuth } from '../../../context/useAuth';
import ExploreFilters from './ExploreFilters';
import { type ExploreSortOption } from './explore.constants';
import CategoryRow from './CategoryRow';
import SEO from '../../../components/SEO';
import PageHeader from '../../../components/PageHeader';

const ITEMS_PER_PAGE = 6;
const DEFAULT_SORT: ExploreSortOption = 'Best match';
const ALL_DEALS_TAB_ID = 'all';
const FOR_YOU_TAB_ID = 'for-you';
const LOCAL_DEALS_TAB_ID = 'local-deals';
const ACCOMMODATIONS_TAB_ID = 'accommodations';

interface ExploreTabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  source: 'public' | 'recommended' | 'accommodations';
  query?: {
    category?: string;
    search?: string;
  };
}

const buildCategoryTabId = (categoryValue: string, label: string) =>
  `category:${categoryValue}:${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const EXPLORE_TABS: ExploreTabConfig[] = [
  {
    id: ALL_DEALS_TAB_ID,
    label: 'All Deals',
    source: 'public',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: FOR_YOU_TAB_ID,
    label: 'For You',
    source: 'recommended',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v3" />
        <path d="M5.64 5.64l2.12 2.12" />
        <path d="M3 12h3" />
        <path d="M18.36 5.64l-2.12 2.12" />
        <path d="M21 12h-3" />
        <path d="M12 21v-3" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    id: ACCOMMODATIONS_TAB_ID,
    label: 'Accommodations',
    source: 'accommodations',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: LOCAL_DEALS_TAB_ID,
    label: 'Local Deals',
    source: 'public',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  ...CATEGORIES.map((cat) => ({
    id: buildCategoryTabId(cat.value, cat.label),
    label: cat.label,
    source: 'public' as const,
    query: {
      category: cat.value,
      search: cat.label,
    },
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18M3 6h12M3 18h8" />
      </svg>
    ),
  })),
];

const getCategoryLabel = (category?: string | null) => {
  if (!category) return 'Other';
  return CATEGORIES.find((item) => item.value === category)?.label ?? category;
};

const sortDeals = (deals: IDealCard[], sortBy: ExploreSortOption) => {
  const nextDeals = [...deals];

  const getMinPrice = (dealPriceItem: IDealCard) => {
    return dealPriceItem.displayedPrice ?? dealPriceItem.originalPrice ?? 0;
  };

  switch (sortBy) {
    case 'Price: Low to High':
      return nextDeals.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    case 'Price: High to Low':
      return nextDeals.sort((a, b) => getMinPrice(b) - getMinPrice(a));
    case 'Most Dates':
      // Fallback since variants count is no longer exposed on listings
      return nextDeals;
    default:
      return nextDeals;
  }
};

const ExplorePage: React.FC = () => {
  const { user, isTraveller, hasPreferences } = useAuth();
  const canShowForYouTab = Boolean(user && isTraveller && hasPreferences);

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const visibleTabs = useMemo(
    () => EXPLORE_TABS.filter((tab) => {
      if (tab.id === FOR_YOU_TAB_ID) return canShowForYouTab;
      if (tab.id === LOCAL_DEALS_TAB_ID) return user?.country === 'Maldives';
      return true;
    }),
    [canShowForYouTab, user?.country]
  );

  const hasValidTabParam = tabParam ? visibleTabs.some((tab) => tab.id === tabParam) : false;

  const [activeTab, setActiveTab] = useState<string>(hasValidTabParam ? (tabParam as string) : ALL_DEALS_TAB_ID);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState<ExploreSortOption>((searchParams.get('sort') as ExploreSortOption) || DEFAULT_SORT);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page') || '1') || 1);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [hasInteractedWithFilters, setHasInteractedWithFilters] = useState(
    Boolean((tabParam && tabParam !== ALL_DEALS_TAB_ID) || (searchParams.get('search') || '').trim().length > 0)
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setDebouncedSearchQuery('');
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const effectiveActiveTab = !canShowForYouTab && activeTab === FOR_YOU_TAB_ID ? ALL_DEALS_TAB_ID : activeTab;

  const activeTabConfig = useMemo(
    () => visibleTabs.find((tab) => tab.id === effectiveActiveTab) || visibleTabs[0],
    [effectiveActiveTab, visibleTabs]
  );
  const isForYouTab = canShowForYouTab && activeTabConfig?.source === 'recommended';

  const updateSearchParams = (nextState: {
    activeTab: string;
    searchQuery: string;
    sortBy: ExploreSortOption;
    page: number;
  }) => {
    const params = new URLSearchParams();

    if (nextState.searchQuery.trim().length >= 2) {
      params.set('search', nextState.searchQuery.trim());
    }

    if (nextState.activeTab !== ALL_DEALS_TAB_ID) {
      params.set('tab', nextState.activeTab);
    }

    if (nextState.sortBy !== DEFAULT_SORT) {
      params.set('sort', nextState.sortBy);
    }

    if (nextState.page > 1) {
      params.set('page', String(nextState.page));
    }

    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    updateSearchParams({
      activeTab,
      searchQuery: debouncedSearchQuery,
      sortBy,
      page: currentPage,
    });
  }, [activeTab, debouncedSearchQuery, sortBy, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    if (value.trim().length > 0) {
      setHasInteractedWithFilters(true);
    } else {
      setHasInteractedWithFilters(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setShowSortMenu(false);
    setHasInteractedWithFilters(true);
  };

  const handleSortChange = (value: ExploreSortOption) => {
    setSortBy(value);
    setShowSortMenu(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const apiParams = useMemo(() => {
    const trimmedSearch = searchQuery.trim();
    const tabCategory = activeTabConfig.query?.category;
    const tabSearch = activeTabConfig.query?.search;
    const isLocalTab = activeTabConfig.id === LOCAL_DEALS_TAB_ID;
    const isAccommodationTab = activeTabConfig.id === ACCOMMODATIONS_TAB_ID;

    return {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      source: isAccommodationTab ? 'accommodations' as const : 'search' as const,
      ...(tabCategory ? { category: tabCategory } : {}),
      ...(trimmedSearch.length >= 2 ? { search: trimmedSearch } : tabSearch ? { search: tabSearch } : {}),
      ...(isLocalTab ? { isLocalOnly: true } : {}),
    };
  }, [activeTabConfig, currentPage, searchQuery]);

  const publicDealsState = usePublicDeals({
    ...apiParams,
    enabled: !isForYouTab,
  });

  const recommendedDealsState = useRecommendedDeals({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    enabled: isForYouTab,
  });

  const deals = isForYouTab ? recommendedDealsState.deals : publicDealsState.deals;
  const total = isForYouTab ? recommendedDealsState.total : publicDealsState.total;
  const loading = isForYouTab ? recommendedDealsState.loading : publicDealsState.loading;
  const error = isForYouTab ? recommendedDealsState.error : publicDealsState.error;

  const sortedDeals = useMemo(() => sortDeals(deals, sortBy), [deals, sortBy]);

  const groupedSections = useMemo(() => {
    if (isForYouTab) {
      return [{ key: 'recommended', title: 'AI Recommended', deals: sortedDeals }];
    }

    if (activeTabConfig.id === ACCOMMODATIONS_TAB_ID) {
      return [{ key: 'accommodations', title: 'Featured Accommodations', deals: sortedDeals }];
    }

    const groups = new Map<string, IDealCard[]>();

    sortedDeals.forEach((deal) => {
      const key = deal.category || 'Other';
      const bucket = groups.get(key) || [];
      bucket.push(deal);
      groups.set(key, bucket);
    });

    const orderedKeys = Array.from(groups.keys());

    return orderedKeys
      .filter((key) => groups.has(key))
      .map((key) => ({
        key,
        title: getCategoryLabel(key),
        deals: groups.get(key) || [],
      }));
  }, [isForYouTab, sortedDeals]);

  const shouldShowInitialCategoryRows =
    effectiveActiveTab === ALL_DEALS_TAB_ID &&
    searchQuery.trim().length < 2 &&
    !hasInteractedWithFilters;

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const categorySummary =
    effectiveActiveTab === ALL_DEALS_TAB_ID
      ? 'all categories'
      : isForYouTab
        ? 'AI recommendations'
        : activeTabConfig.label;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lushware.com/' },
      { '@type': 'ListItem', position: 2, name: 'Explore', item: 'https://lushware.com/explore' },
    ],
  };

  return (
    <div className="min-h-screen bg-(--app-bg)">
      <SEO
        title={`Explore ${categorySummary} — Maldives Travel Deals`}
        description={`Find the best ${categorySummary} in the Maldives. Browse exclusive deals, resorts, and local experiences.`}
        keywords={`Maldives deals, ${categorySummary}, Maldives travel, ${searchQuery}`}
        url={`/explore${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
        jsonLd={breadcrumbJsonLd}
      />
      <PageHeader
        title="Discover travel"
        highlightedWord="Deals"
        description="Browse curated travel experiences."
        backgroundImage="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=2000&auto=format&fit=crop"
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 relative z-10 pb-16">
        <ExploreFilters
          activeTab={effectiveActiveTab}
          tabs={visibleTabs}
          searchQuery={searchQuery}
          sortBy={sortBy}
          showSortMenu={showSortMenu}
          onSearchQueryChange={handleSearchChange}
          onTabChange={handleTabChange}
          onSortChange={handleSortChange}
          onToggleSortMenu={() => setShowSortMenu((value) => !value)}
        />

        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-[13px] text-slate-400 font-medium tracking-wide">
            {loading
              ? 'Analyzing deals...'
              : error
                ? 'Error loading results'
                : `${total} active deal${total !== 1 ? 's' : ''} matched in ${categorySummary}`}
          </p>
          {totalPages > 1 && (
            <p className="text-[12px] text-slate-400 font-medium tracking-wide">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {error && (
          <UserCard className="p-8 text-center mb-8">
            <p className="text-red-500 text-[14px] font-medium">{error}</p>
          </UserCard>
        )}

        {loading ? (
          shouldShowInitialCategoryRows ? (
            <div className="space-y-10">
              {visibleTabs.filter((tab) => tab.id !== ALL_DEALS_TAB_ID && tab.id !== FOR_YOU_TAB_ID).slice(0, 3).map((tab) => (
                <CategoryRow key={tab.id} title={tab.label} deals={[]} loading />
              ))}
            </div>
          ) : (
            <UserDealsGridSkeleton count={ITEMS_PER_PAGE} />
          )
        ) : sortedDeals.length === 0 ? (
          <UserCard className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-[#0e2a47] text-[18px] font-bold mb-1">No matches found</p>
            <p className="text-slate-400 text-[14px]">
              Try a different search term, category, or sort option.
            </p>
            <button
              onClick={() => {
                setActiveTab(ALL_DEALS_TAB_ID);
                setSearchQuery('');
                setSortBy(DEFAULT_SORT);
                setCurrentPage(1);
                setShowSortMenu(false);
                setHasInteractedWithFilters(false);
                setSearchParams(new URLSearchParams(), { replace: true });
              }}
              className="mt-6 px-6 py-2.5 bg-[#0e2a47] text-white rounded-xl text-xs font-bold hover:bg-[#1a3d5e] transition-all cursor-pointer"
            >
              Reset filters
            </button>
          </UserCard>
        ) : (
          shouldShowInitialCategoryRows ? (
            <div className="space-y-10">
              {groupedSections.map((section) => (
                <CategoryRow
                  key={section.key}
                  title={section.title}
                  deals={section.deals}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-6">
              {sortedDeals.map((deal) => (
                <div key={deal.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DealCard deal={deal} showAiMatch={isForYouTab} />
                </div>
              ))}
            </div>
          )
        )}

        {!loading && sortedDeals.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
