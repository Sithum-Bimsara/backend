import React, { useState, useCallback } from 'react';
import { useCommunityPosts } from '../../../features/Community/hooks/useCommunityPosts';
import CreatePostModal from '../../../features/Community/components/CreatePostModal';
import { AuthPromptModal } from '../../../features/Community/components/AuthPromptModal';
import PostItem from '../../../features/Community/components/PostItem';
import { CommunitySearchBar } from '../../../features/Community/components/CommunitySearchBar';
import { CommunityTopicsSidebar } from '../../../features/Community/components/CommunityTopicsSidebar';
import type { ICommunityPost } from '../../../features/Community/types/community.types';
import type { CreatePostDto } from '../../../features/Community/dtos/community.dtos';
import { UserCommunityFeedSkeleton } from '../../../components/UserUI';
import { useAuth } from '../../../context/useAuth';
import SEO from '../../../components/SEO';
import PageHeader from '../../../components/PageHeader';
import Pagination from '../../../components/Pagination/Pagination';

const POSTS_PER_PAGE = 5;

const CommunityFeedPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | undefined>();
  const [refreshSidebarKey, setRefreshSidebarKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();

  const {
    posts,
    total,
    loading,
    createPost,
    toggleLike,
    deletePost
  } = useCommunityPosts(
    currentPage,
    POSTS_PER_PAGE,
    searchQuery,
    activeTopic,
    'pagination'
  );

  // Handlers to reset page and scroll when filters change
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleTopicSelect = useCallback((topic: string | undefined) => {
    setActiveTopic(topic);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }, []);

  const handleCreatePost = async (data: CreatePostDto) => {
    const success = await createPost(data);
    if (success) {
      setRefreshSidebarKey(prev => prev + 1);
    }
    return success;
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://lushware.com/' },
      { '@type': 'ListItem', position: 2, name: 'Community', item: 'https://lushware.com/community' },
    ],
  };

  return (
    <div className="min-h-screen bg-(--app-bg) pt-0 animate-in fade-in duration-500 font-sans">
      <SEO
        title={activeTopic ? `${activeTopic} — Maldives Travel Community` : 'Maldives Travel Community & Tips'}
        description="Connect with fellow travelers in the Maldives. Share experiences, ask questions, and discover local tips in our community hub."
        keywords={`Maldives community, Maldives travel tips, ${activeTopic || 'travel experiences'}`}
        url="/community"
        jsonLd={breadcrumbJsonLd}
      />
      <PageHeader
        title="Community"
        highlightedWord="Hub"
        description="Connect, share, and discover with fellow travelers around the globe"
        backgroundImage="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2000&auto=format&fit=crop"
      >
        <button
          onClick={() => {
            if (!user) {
              setShowAuthPrompt(true);
              return;
            }

            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] font-semibold text-[13px] rounded-full shadow-lg transition-all shadow-[#2dd4af]/20 hover:-translate-y-0.5 shrink-0 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          Write a post
        </button>
      </PageHeader>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 py-8">
        {/* Left Column (Posts feed) */}
        <div className="lg:col-span-2">
          <CommunitySearchBar onSearch={handleSearch} />

          {/* Mobile Topics Scrollbar */}
          <div className="lg:hidden mt-6 mb-2">
            <CommunityTopicsSidebar
              onSelectTopic={handleTopicSelect}
              activeTopic={activeTopic}
              key={`mobile-${refreshSidebarKey}`}
              isMobile={true}
            />
          </div>
          {activeTopic && (
            <div className="mb-6 flex items-center justify-between bg-white px-6 py-4 rounded-3xl border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-[#8b919d] uppercase tracking-widest">Active Topic:</span>
                <span className="px-3 py-1 bg-[#2dd4af]/10 text-[#2dd4af] font-bold text-xs rounded-full uppercase truncate max-w-50">
                  {activeTopic}
                </span>
              </div>
              <button
                onClick={() => handleTopicSelect(undefined)}
                className="text-[11px] font-bold text-[#ff4c4c] hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Posts List or Loading State */}
          {loading && posts.length === 0 ? (
            <UserCommunityFeedSkeleton count={3} />
          ) : posts.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                <span>Community Posts (Page {currentPage} — showing {posts.length} of {total})</span>
              </div>
              <div className="space-y-6 animate-in fade-in duration-300">
                {posts.map((post: ICommunityPost) => (
                  <PostItem key={post.id} post={post} onToggleLike={toggleLike} onDeletePost={deletePost} />
                ))}
              </div>

              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalItems={total}
                itemsPerPage={POSTS_PER_PAGE}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-black/5">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#8b919d]">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <p className="text-[#0e2a47] font-bold text-lg mb-1">No posts found</p>
              <p className="text-[#8b919d] text-sm">Be the first to share something about {activeTopic || 'your trip'}!</p>
            </div>
          )}
        </div>

        {/* Right Column (Topics Sidebar) */}
        <div className="hidden lg:block">
          <CommunityTopicsSidebar
            onSelectTopic={handleTopicSelect}
            activeTopic={activeTopic}
            key={refreshSidebarKey}
          />
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal isOpen={isModalOpen && !!user} onClose={() => setIsModalOpen(false)} onSubmit={handleCreatePost} />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        title="Sign In to Write a Post"
        message="Join the community to share travel experiences, ask questions, and post deals with fellow travelers."
        action="write a post"
      />
    </div>
  );
};

export default CommunityFeedPage;
