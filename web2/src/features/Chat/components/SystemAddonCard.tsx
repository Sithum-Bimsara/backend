import { CheckCheckIcon } from "./ChatIcons";

export const SystemAddonCard = ({ content, isMe }: { content: string, isMe: boolean }) => {
  const nameMatch = content.match(/added a custom addon: "([^"]+)"/);
  const priceMatch = content.match(/for \$([0-9.]+)/);
  const detailsMatch = content.match(/\(([^)]+)\)/);

  if (!nameMatch || !priceMatch) return <p className="text-sm leading-relaxed">{content}</p>;

  const name = nameMatch[1];
  const price = priceMatch[1];
  const details = detailsMatch ? detailsMatch[1] : null;

  return (
    <div className={`${isMe ? "bg-white/10 border-white/10" : "bg-[#0e2a47]/5 border-[#0e2a47]/10"} backdrop-blur-sm rounded-xl p-4 border shadow-inner my-2 overflow-hidden relative group text-left`}>
      <div className="absolute top-0 right-0 p-2 opacity-20">
         <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={isMe ? "text-white" : "text-[#0e2a47]"}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /></svg>
      </div>
      <div className="flex justify-between items-start mb-2 relative z-10 gap-4">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isMe ? "text-[#2dd4af]" : "text-[#25b898]"} mb-1 block`}>New Extra Added</span>
          <h4 className={`text-base font-bold leading-tight ${isMe ? "text-white" : "text-[#0e2a47]"}`}>{name}</h4>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-[10px] uppercase font-bold tracking-widest block ${isMe ? "text-white/40" : "text-[#0e2a47]/40"}`}>Price</span>
          <span className={`text-lg font-black ${isMe ? "text-white" : "text-[#0e2a47]"}`}>${price}</span>
        </div>
      </div>
      {details && (
        <p className={`text-xs italic border-l-2 pl-2 mt-2 relative z-10 ${isMe ? "text-white/60 border-[#2dd4af]/30" : "text-slate-500 border-[#25b898]/30"}`}>
          {details}
        </p>
      )}
      <div className={`mt-3 pt-3 border-t flex items-center gap-2 relative z-10 ${isMe ? "border-white/5" : "border-[#0e2a47]/5"}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isMe ? "bg-[#2dd4af]/20 text-[#2dd4af]" : "bg-[#25b898]/20 text-[#25b898]"}`}>
          <CheckCheckIcon size={10} />
        </div>
        <span className={`text-[10px] font-bold ${isMe ? "text-white/40" : "text-[#0e2a47]/40"}`}>Added to booking lock automatically</span>
      </div>
    </div>
  );
};
