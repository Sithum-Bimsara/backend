import React from 'react';

interface InventoryLoadingSkeletonProps {
  rows?: number;
  className?: string;
}

const InventoryLoadingSkeleton: React.FC<InventoryLoadingSkeletonProps> = ({
  rows = 5,
  className = ""
}) => {
  return (
    <div className={`space-y-2 animate-pulse mt-1 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-slate-100" />
      ))}
    </div>
  );
};

export default InventoryLoadingSkeleton;
