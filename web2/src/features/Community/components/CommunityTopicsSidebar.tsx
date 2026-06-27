import React, { useState, useEffect } from 'react';
import { getTopics } from '../api/community.api';

interface CommunityTopicsSidebarProps {
  onSelectTopic: (topic: string | undefined) => void;
  activeTopic?: string;
  isMobile?: boolean;
}

export const CommunityTopicsSidebar: React.FC<CommunityTopicsSidebarProps> = ({ onSelectTopic, activeTopic, isMobile }) => {
  const [topics, setTopics] = useState<{ topic: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await getTopics();
        if (res.success) {
          setTopics(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch topics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (isMobile) {
    if (loading) {
      return (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-32 bg-black/5 rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>
      );
    }

    if (topics.length === 0) return null;

    return (
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
        <button
          onClick={() => onSelectTopic(undefined)}
          className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
            !activeTopic 
              ? 'bg-[#2dd4af] text-white shadow-lg shadow-[#2dd4af]/20' 
              : 'bg-white text-[#0e2a47] border border-black/5 hover:border-[#2dd4af]/30 shadow-sm'
          }`}
        >
          <span className="font-bold text-[11px] uppercase tracking-wider">All Discussions</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${!activeTopic ? 'bg-white/20' : 'bg-black/5 text-[#8b919d]'}`}>
            {topics.reduce((acc, t) => acc + t.count, 0)}
          </span>
        </button>

        {topics.map((t) => (
          <button
            key={t.topic}
            onClick={() => onSelectTopic(t.topic)}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 ${
              activeTopic === t.topic 
                ? 'bg-[#2dd4af] text-white shadow-lg shadow-[#2dd4af]/20' 
                : 'bg-white text-[#0e2a47] border border-black/5 hover:border-[#2dd4af]/30 shadow-sm'
            }`}
          >
            <span className="font-bold text-[11px] uppercase tracking-wider">{t.topic}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTopic === t.topic ? 'bg-white/20' : 'bg-black/5 text-[#8b919d]'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/5 p-6 sticky top-24 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-[#2dd4af]/10 flex items-center justify-center text-[#2dd4af]">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[#0e2a47]">Top Travel Topics</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-black/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <p className="text-sm text-[#8b919d]">No topics found yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelectTopic(undefined)}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
              !activeTopic 
                ? 'bg-[#2dd4af] text-white shadow-lg shadow-[#2dd4af]/20' 
                : 'bg-transparent text-[#0e2a47] hover:bg-[#2dd4af]/5 hover:translate-x-1'
            }`}
          >
            <span className="font-bold text-sm uppercase tracking-wide">All Discussions</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${!activeTopic ? 'bg-white/20 text-white' : 'bg-black/5 text-[#8b919d]'}`}>
              {topics.reduce((acc, t) => acc + t.count, 0)}
            </span>
          </button>
          
          {topics.map((t) => (
            <button
              key={t.topic}
              onClick={() => onSelectTopic(t.topic)}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                activeTopic === t.topic 
                  ? 'bg-[#2dd4af] text-white shadow-lg shadow-[#2dd4af]/20' 
                  : 'bg-transparent text-[#0e2a47] hover:bg-[#2dd4af]/5 hover:translate-x-1'
              }`}
            >
              <span className="font-bold text-sm uppercase tracking-wide truncate pr-4">{t.topic}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTopic === t.topic ? 'bg-white/20 text-white' : 'bg-black/5 text-[#8b919d]'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
