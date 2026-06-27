import React from 'react';

interface PostCommentsHeaderProps {
  commentsCount: number;
  onClose: () => void;
}

export const PostCommentsHeader: React.FC<PostCommentsHeaderProps> = ({
  commentsCount,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
      <div>
        <h3 className="text-base font-bold text-[#0e2a47]">Comments</h3>
        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">
          {commentsCount} {commentsCount === 1 ? 'Reply' : 'Replies'}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border-none cursor-pointer bg-transparent"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
