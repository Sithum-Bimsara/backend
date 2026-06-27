import React, { useEffect, useState } from "react";
import { AdminPageShell, AdminCard, Badge, AdminActionButton, AdminConfirmModal } from "../../features/Admin/components/AdminUI";
import { useAdminModeration } from "../../features/Admin/hooks/useAdminModeration";
import { ModerationCommentNode } from "../../features/Admin/components/ModerationCommentNode";
import { AdminModerationSkeleton } from "../../features/Admin/components/AdminModerationSkeleton";
import { AdminSearchBar } from "../../features/Admin/components/AdminSearchBar";



const AdminModerationPage: React.FC = () => {
  const {
    data: { reportedPosts, reportedComments, posts, selectedPostId, selectedPostComments, loadingComments },
    loading,
    error,
    actions: { loadModerationData, loadComments, removePost, removeComment, searchPosts, loadCommentReplies },
  } = useAdminModeration();

  const [confirmDeletePost, setConfirmDeletePost] = useState<{ id: string; name: string } | null>(null);
  const [confirmDeleteComment, setConfirmDeleteComment] = useState<{ id: string; name: string } | null>(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadModerationData();
  }, [loadModerationData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      void searchPosts(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery, searchPosts]);

  const sortedReportedPosts = [...reportedPosts].sort((a, b) => {
    const reportDiff = (b._count?.reports ?? 0) - (a._count?.reports ?? 0);
    if (reportDiff !== 0) return reportDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedReportedComments = [...reportedComments].sort((a, b) => {
    const reportDiff = (b._count?.reports ?? 0) - (a._count?.reports ?? 0);
    if (reportDiff !== 0) return reportDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedPosts = [...posts].sort((a, b) => {
    const reportDiff = (b._count?.reports ?? 0) - (a._count?.reports ?? 0);
    if (reportDiff !== 0) return reportDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedSelectedPostComments = [...selectedPostComments].sort((a, b) => {
    const reportDiff = (b._count?.reports ?? 0) - (a._count?.reports ?? 0);
    if (reportDiff !== 0) return reportDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <AdminPageShell title="Moderation" subtitle="Review reported content first, then inspect the wider community feed when needed">
      {loading && <AdminModerationSkeleton />}
      {error && !loading && <AdminCard className="p-4 text-rose-600">{error}</AdminCard>}

      {!loading && !error && (
        <div className="space-y-6">
          <AdminCard className="overflow-hidden border-rose-100 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="bg-linear-to-r from-rose-50 via-white to-amber-50 p-6 border-b border-slate-200">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-rose-700 border border-rose-100 text-xs font-semibold uppercase tracking-[0.16em]">
                    Priority Queue
                  </div>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">Reported content</h2>
                  <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                    All reported posts and comments are surfaced here first so you can review the most urgent issues without drilling into individual threads.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="red">{reportedPosts.length} reported posts</Badge>
                  <Badge tone="red">{reportedComments.length} reported comments</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-6 xl:border-r border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Reported Posts</h3>
                    <p className="text-sm text-slate-500">Sorted by report volume, then newest first.</p>
                  </div>
                  <Badge tone="indigo">{sortedReportedPosts.length}</Badge>
                </div>

                <div className="space-y-3 max-h-128 overflow-auto pr-1">
                  {sortedReportedPosts.length ? sortedReportedPosts.map((post) => (
                    <div key={post.id} className="rounded-2xl border border-rose-100 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-semibold text-slate-900">{post.user.name}</div>
                            {post.topic && <Badge tone="indigo">{post.topic}</Badge>}
                            <Badge tone="red">Reports: {post._count?.reports ?? 0}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 line-clamp-3">{post.content}</p>
                        </div>
                        <AdminActionButton onClick={() => setConfirmDeletePost({ id: post.id, name: post.user.name })} variant="danger">
                          Delete
                        </AdminActionButton>
                      </div>
                      <button
                        type="button"
                        onClick={() => void loadComments(post.id)}
                        className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold transition-colors ${selectedPostId === post.id ? 'text-emerald-700' : 'text-indigo-700 hover:text-indigo-800 hover:underline'}`}
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="M13 5l7 7-7 7" />
                        </svg>
                        {selectedPostId === post.id ? 'Thread open' : 'Inspect thread'}
                      </button>

                      {selectedPostId === post.id && (
                        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">Thread comments</div>
                              <div className="mt-1 text-sm font-semibold text-slate-900">Loaded for this reported post</div>
                            </div>
                            {!loadingComments && <Badge tone="indigo">{selectedPostComments.length} replies</Badge>}
                          </div>

                          <div className="mt-3 space-y-2 max-h-72 overflow-auto pr-1">
                            {loadingComments ? (
                              <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-400">
                                <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Loading replies...</span>
                              </div>
                            ) : selectedPostComments.length ? selectedPostComments.map((comment) => (
                              <div key={comment.id} className="rounded-xl border border-white/70 bg-white p-3 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-slate-900 text-sm">{comment.user.name}</div>
                                    <div className="mt-1 text-xs text-slate-500 line-clamp-3">{comment.content}</div>
                                    {(comment._count?.reports ?? 0) > 0 && (
                                      <div className="mt-2"><Badge tone="red">Reports: {comment._count.reports}</Badge></div>
                                    )}
                                  </div>
                                  <AdminActionButton onClick={() => setConfirmDeleteComment({ id: comment.id, name: comment.user.name })} variant="danger" showArrow={false}>
                                    Delete
                                  </AdminActionButton>
                                </div>
                              </div>
                            )) : (
                              <div className="rounded-xl border border-dashed border-indigo-200 bg-white/70 p-4 text-sm text-slate-500">
                                No comments in this thread yet.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <div className="text-sm font-semibold text-slate-700">No reported posts</div>
                      <p className="mt-1 text-sm text-slate-500">Reported posts will appear here automatically.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Reported Comments</h3>
                    <p className="text-sm text-slate-500">All reported replies across the community.</p>
                  </div>
                  <Badge tone="indigo">{sortedReportedComments.length}</Badge>
                </div>

                <div className="space-y-3 max-h-128 overflow-auto pr-1">
                  {sortedReportedComments.length ? sortedReportedComments.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border border-rose-100 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-semibold text-slate-900">{comment.user.name}</div>
                            <Badge tone="red">Reports: {comment._count?.reports ?? 0}</Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 line-clamp-3">{comment.content}</p>
                          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">On post:</span> {comment.post.content}
                          </div>
                        </div>
                        <AdminActionButton onClick={() => setConfirmDeleteComment({ id: comment.id, name: comment.user.name })} variant="danger">
                          Delete
                        </AdminActionButton>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <div className="text-sm font-semibold text-slate-700">No reported comments</div>
                      <p className="mt-1 text-sm text-slate-500">Reported comments will appear here automatically.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AdminCard>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AdminCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Posts</h2>
                  <p className="mt-1 text-sm text-slate-500">Secondary feed for browsing the wider community context.</p>
                </div>
                <Badge tone="indigo">{posts.length} items</Badge>
              </div>

              {/* Sleek Search Bar */}
              <AdminSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by post/comment content, topic, or author..."
              />

              <div className="space-y-3 max-h-152 overflow-auto pr-1">
                {sortedPosts.map((post) => (
                  <div key={post.id} className="border border-slate-200 rounded-2xl p-4 bg-white">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900">{post.user.name}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-3">{post.content}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.topic && <Badge tone="indigo">{post.topic}</Badge>}
                        {(post._count?.reports ?? 0) > 0 && <Badge tone="red">Reports: {post._count.reports}</Badge>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => void loadComments(post.id)}
                        className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${selectedPostId === post.id ? 'text-emerald-700' : 'text-indigo-700 hover:text-indigo-800 hover:underline'}`}
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="M13 5l7 7-7 7" />
                        </svg>
                        {selectedPostId === post.id ? 'Comments open' : 'Inspect comments'}
                      </button>

                      <AdminActionButton onClick={() => setConfirmDeletePost({ id: post.id, name: post.user.name })} variant="danger" showArrow={false}>
                        Delete
                      </AdminActionButton>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            <AdminCard className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Comments for selected post</h2>
                  <p className="mt-1 text-sm text-slate-500">Click Inspect comments to load the thread here.</p>
                </div>
                {selectedPostId && (
                  <Badge tone="indigo">Thread selected</Badge>
                )}
              </div>

              {selectedPostId && (
                <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">Active post</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {sortedPosts.find((post) => post.id === selectedPostId)?.content || "Selected post"}
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3 max-h-152 overflow-auto pr-1">
                {loadingComments ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                    <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Fetching community replies...</span>
                  </div>
                ) : (
                  <>
                    {sortedSelectedPostComments.map((comment) => (
                      <ModerationCommentNode
                        key={comment.id}
                        comment={comment}
                        onDeleteComment={(c) => setConfirmDeleteComment({ id: c.id, name: c.user.name })}
                        deletedCommentIds={deletedCommentIds}
                        loadCommentReplies={loadCommentReplies}
                      />
                    ))}
                    {!selectedPostComments.length && (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                        No comments loaded yet.
                      </div>
                    )}
                  </>
                )}
              </div>
            </AdminCard>

          </div>
        </div>
      )}

      <AdminConfirmModal
        isOpen={!!confirmDeletePost}
        title="Delete Community Post"
        message={confirmDeletePost ? `Are you sure you want to delete the post by ${confirmDeletePost.name}? This will also remove related comments and media.` : ""}
        confirmLabel="Delete Post"
        tone="danger"
        onConfirm={async () => {
          if (!confirmDeletePost) return;
          await removePost(confirmDeletePost.id);
          setConfirmDeletePost(null);
        }}
        onCancel={() => setConfirmDeletePost(null)}
      />

      <AdminConfirmModal
        isOpen={!!confirmDeleteComment}
        title="Delete Comment"
        message={confirmDeleteComment ? `Are you sure you want to delete the comment by ${confirmDeleteComment.name}?` : ""}
        confirmLabel="Delete Comment"
        tone="danger"
        onConfirm={async () => {
          if (!confirmDeleteComment) return;
          await removeComment(confirmDeleteComment.id);
          setDeletedCommentIds(prev => [...prev, confirmDeleteComment.id]);
          setConfirmDeleteComment(null);
        }}
        onCancel={() => setConfirmDeleteComment(null)}
      />
    </AdminPageShell>
  );
};

export default AdminModerationPage;
