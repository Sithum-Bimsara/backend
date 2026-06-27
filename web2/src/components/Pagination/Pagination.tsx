import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-8 mb-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className={`p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
          currentPage === 1
            ? 'opacity-30 cursor-not-allowed border-transparent'
            : 'hover:bg-teal-50 hover:border-teal-200 text-[#0e2a47] border-slate-200'
        }`}
        aria-label="Previous page"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 sm:gap-1.5 mx-1 sm:mx-2">
        {pages.map((page, idx) => {
          const isEllipsis = typeof page === 'string';
          const isActive = page === currentPage;

          return (
            <button
              key={`${page}-${idx}`}
              onClick={() => !isEllipsis && onPageChange(page as number)}
              disabled={isEllipsis || loading}
              className={`min-w-10 h-10 sm:min-w-11 sm:h-11 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                isEllipsis
                  ? 'cursor-default text-slate-400'
                  : isActive
                  ? 'bg-linear-to-br from-[#2dd4af] to-[#0db898] text-white shadow-lg shadow-teal-200 cursor-default'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#0e2a47] border border-transparent hover:border-slate-200 cursor-pointer'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className={`p-2 rounded-xl transition-all duration-200 border cursor-pointer ${
          currentPage === totalPages
            ? 'opacity-30 cursor-not-allowed border-transparent'
            : 'hover:bg-teal-50 hover:border-teal-200 text-[#0e2a47] border-slate-200'
        }`}
        aria-label="Next page"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
