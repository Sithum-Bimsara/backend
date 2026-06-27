import React from 'react';
import DealCard from '../../../features/Deals/components/DealCard';
import type { IDealCard } from '../../../features/Deals/types/deals.types';
import { UserDealCardSkeleton } from '../../../components/UserUI';

interface CategoryRowProps {
  title: string;
  deals: IDealCard[];
  loading?: boolean;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ title, deals, loading = false }) => {
  if (!loading && deals.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[22px] md:text-[26px] font-bold text-[#0e2a47] leading-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {loading ? 'Loading deals...' : `${deals.length} deal${deals.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-[320px] shrink-0 snap-start">
                <UserDealCardSkeleton />
              </div>
            ))
          : deals.map((deal) => (
              <div key={deal.id} className="w-[320px] shrink-0 snap-start">
                <DealCard deal={deal} />
              </div>
            ))}
      </div>
    </section>
  );
};

export default CategoryRow;
