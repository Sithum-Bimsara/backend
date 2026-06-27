import React from 'react';
import { motion } from 'framer-motion';
import { type Island } from '../../../../constants/islands';

interface IslandCardProps {
  island: Island;
  onClick: () => void;
}

export const IslandCard: React.FC<IslandCardProps> = ({ island, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-[0_15px_30px_rgba(14,42,71,0.06)] border border-slate-100/50 bg-white"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={island.image || 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?q=80&w=1200&auto=format&fit=crop'}
          alt={island.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0e2a47]/95 via-[#0e2a47]/45 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
      </div>

      {island.vibe && (
        <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
          <span className="text-[10px] font-bold text-white tracking-wider">
            {island.vibe}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 z-20 flex flex-col justify-end h-1/2">
        <span className="text-[10px] font-extrabold tracking-widest text-[#2dd4af] uppercase mb-1">
          {island.atoll}
        </span>
        <h3 className="text-xl font-bold text-white font-['Playfair_Display',serif]">
          {island.name}
        </h3>
        <p className="text-xs text-white/70 line-clamp-2 mt-2 leading-relaxed font-medium">
          {island.description}
        </p>

        {island.highlights && island.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
            {island.highlights.slice(0, 2).map((hl, i) => (
              <span
                key={i}
                className="text-[9px] font-semibold text-white/80 bg-white/10 px-2 py-0.5 rounded-md"
              >
                {hl}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#2dd4af]/30 rounded-3xl z-30 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
};
