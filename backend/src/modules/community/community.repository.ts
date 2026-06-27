import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

import { 
  CommunityPostRecord, 
  CommunityCommentRecord,
  CommunityReportedCommentRecord,
  postWithInteractionsInclude,
  commentWithInteractionsInclude,
  postDetailedInclude,
  commentDetailedInclude,
  CommunityPostWhereInput,
} from "./community.types";
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
  PostQueryDto,
  CommentQueryDto,
} from "./community.dto";

// ─── Post Repository ─────────────────────────────────────────────────────────

export const createPost = async (userId: string, data: CreatePostDto): Promise<CommunityPostRecord> => {
  return prisma.communityPost.create({
    data: {
      userId,
      content: data.content,
      topic: data.topic,
      media: data.mediaUrls?.length
        ? {
            create: data.mediaUrls.map((url) => ({ url })),
          }
        : undefined,
    },
    include: postDetailedInclude,
  }) as unknown as Promise<CommunityPostRecord>;
};

export const getPosts = async (params: PostQueryDto & { currentUserId?: string }): Promise<{ items: CommunityPostRecord[]; nextCursor: string | null; total: number }> => {
  const { limit, cursor, currentUserId, reportFirst, search, topic, skip, take } = params;

  const where: Prisma.CommunityPostWhereInput = {};

  if (topic) where.topic = topic;

  if (search) {
    const terms = search.trim().split(/\s+/).filter(Boolean);
    if (terms.length > 0) {
      where.OR = [
        ...terms.map(term => ({ content: { contains: term, mode: "insensitive" as const } })),
        ...terms.map(term => ({ topic: { contains: term, mode: "insensitive" as const } })),
        ...terms.map(term => ({ user: { name: { contains: term, mode: "insensitive" as const } } })),
        ...terms.map(term => ({ 
          comments: { 
            some: { 
              content: { contains: term, mode: "insensitive" as const } 
            } 
          } 
        })),
        ...terms.map(term => ({ 
          comments: { 
            some: { 
              user: { 
                name: { contains: term, mode: "insensitive" as const } 
              } 
            } 
          } 
        })),
      ];
    }
  }

  const isOffsetMode = skip !== undefined || take !== undefined;
  const prismaTake = isOffsetMode ? (take ?? 5) : (limit + 1);
  const prismaSkip = isOffsetMode ? (skip ?? 0) : (cursor ? 1 : 0);
  const prismaCursor = isOffsetMode ? undefined : (cursor ? { id: cursor } : undefined);

  const [items, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      take: prismaTake,
      cursor: prismaCursor,
      skip: prismaSkip,
      orderBy: reportFirst
        ? [{ reports: { _count: "desc" } }, { createdAt: "desc" }]
        : { createdAt: "desc" },
      include: postWithInteractionsInclude(currentUserId),
    }) as unknown as Promise<CommunityPostRecord[]>,
    prisma.communityPost.count({ where }),
  ]);

  let nextCursor: string | null = null;
  if (!isOffsetMode && items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  } else if (isOffsetMode && items.length === (take ?? 5) && (skip ?? 0) + items.length < total) {
    nextCursor = items[items.length - 1]?.id || null;
  }

  return { items, nextCursor, total };
};

export const getPostById = async (id: string, currentUserId?: string): Promise<CommunityPostRecord | null> => {
  return prisma.communityPost.findUnique({
    where: { id },
    include: postWithInteractionsInclude(currentUserId),
  }) as unknown as Promise<CommunityPostRecord | null>;
};

export const updatePost = async (id: string, data: UpdatePostDto): Promise<CommunityPostRecord> => {
  return prisma.communityPost.update({
    where: { id },
    data: {
      content: data.content,
      topic: data.topic,
    },
    include: postDetailedInclude,
  }) as unknown as Promise<CommunityPostRecord>;
};

export const deletePost = async (id: string) => {
  return prisma.communityPost.delete({ where: { id } });
};

export const toggleLikePost = async (userId: string, postId: string) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.communityLike.findFirst({
      where: { userId, postId, commentId: null },
    });

    if (existing) {
      await tx.communityLike.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      await tx.communityLike.create({
        data: { userId, postId },
      });
      return { liked: true };
    }
  });
};

export const reportPost = async (userId: string, postId: string) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.communityPostReport.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      return { reported: false, alreadyReported: true };
    }

    await tx.communityPostReport.create({
      data: { userId, postId },
    });

    const reportCount = await tx.communityPostReport.count({ where: { postId } });
    return { reported: true, alreadyReported: false, reportCount };
  });
};

// ─── Comment Repository ──────────────────────────────────────────────────────

export const createComment = async (userId: string, postId: string, data: CreateCommentDto): Promise<CommunityCommentRecord> => {
  return prisma.communityComment.create({
    data: {
      userId,
      postId,
      content: data.content,
      parentId: data.parentId || null,
      media: data.mediaUrls?.length
        ? {
            create: data.mediaUrls.map((url) => ({ url })),
          }
        : undefined,
    },
    include: commentDetailedInclude,
  }) as unknown as Promise<CommunityCommentRecord>;
};

export const getCommentsByPostId = async (
  postId: string, 
  params: CommentQueryDto & { currentUserId?: string }
): Promise<{ items: CommunityCommentRecord[]; nextCursor: string | null }> => {
  const { limit, cursor, currentUserId, reportFirst } = params;

  const items = await prisma.communityComment.findMany({
    where: { postId, parentId: null },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: reportFirst
      ? [{ reports: { _count: "desc" } }, { createdAt: "desc" }]
      : { createdAt: "desc" },
    include: commentWithInteractionsInclude(currentUserId),
  }) as unknown as CommunityCommentRecord[];

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }

  return { items, nextCursor };
};

export const getRepliesByCommentId = async (
  parentId: string, 
  params: CommentQueryDto & { currentUserId?: string }
): Promise<{ items: CommunityCommentRecord[]; nextCursor: string | null }> => {
  const { limit, cursor, currentUserId } = params;

  const items = await prisma.communityComment.findMany({
    where: { parentId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: "asc" },
    include: commentWithInteractionsInclude(currentUserId),
  }) as unknown as CommunityCommentRecord[];

  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    nextCursor = nextItem!.id;
  }

  return { items, nextCursor };
};

export const getCommentById = async (id: string, currentUserId?: string): Promise<CommunityCommentRecord | null> => {
  return prisma.communityComment.findUnique({
    where: { id },
    include: commentWithInteractionsInclude(currentUserId),
  }) as unknown as Promise<CommunityCommentRecord | null>;
};

export const updateComment = async (id: string, data: UpdateCommentDto): Promise<CommunityCommentRecord> => {
  return prisma.communityComment.update({
    where: { id },
    data: {
      content: data.content,
    },
    include: commentDetailedInclude,
  }) as unknown as Promise<CommunityCommentRecord>;
};

export const deleteComment = async (id: string) => {
  return prisma.communityComment.delete({ where: { id } });
};

export const toggleLikeComment = async (userId: string, commentId: string) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.communityLike.findFirst({
      where: { userId, commentId, postId: null },
    });

    if (existing) {
      await tx.communityLike.delete({ where: { id: existing.id } });
      const count = await tx.communityLike.count({ where: { commentId } });
      return { liked: false, likeCount: count };
    } else {
      await tx.communityLike.create({
        data: { userId, commentId },
      });
      const count = await tx.communityLike.count({ where: { commentId } });
      return { liked: true, likeCount: count };
    }
  });
};

export const reportComment = async (userId: string, commentId: string) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.communityCommentReport.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing) {
      return { reported: false, alreadyReported: true };
    }

    await tx.communityCommentReport.create({
      data: { userId, commentId },
    });

    const reportCount = await tx.communityCommentReport.count({ where: { commentId } });
    return { reported: true, alreadyReported: false, reportCount };
  });
};


// ─── Media Repository ────────────────────────────────────────────────────────

export const getPostMedia = async (postId: string) => {
  return prisma.communityMedia.findMany({ where: { postId } });
};

export const getCommentMedia = async (commentId: string) => {
  return prisma.communityMedia.findMany({ where: { commentId } });
};

export const deleteMediaByUrl = async (urls: string[]) => {
  return prisma.communityMedia.deleteMany({ where: { url: { in: urls } } });
};

export const addMediaToPost = async (postId: string, mediaUrls: string[]) => {
  return prisma.communityMedia.createMany({
    data: mediaUrls.map((url) => ({ url, postId })),
  });
};

export const addMediaToComment = async (commentId: string, mediaUrls: string[]) => {
  return prisma.communityMedia.createMany({
    data: mediaUrls.map((url) => ({ url, commentId })),
  });
};

export const getAllCommentsMediaByPostId = async (postId: string) => {
  const comments = await prisma.communityComment.findMany({
    where: { postId },
    include: { media: true },
  });
  return comments.flatMap((c) => c.media);
};

export const getCommentTreeMedia = async (commentId: string) => {
  const media: { url: string }[] = await prisma.$queryRaw`
    WITH RECURSIVE comment_tree AS (
      SELECT id FROM "CommunityComment" WHERE id = ${commentId}
      UNION ALL
      SELECT c.id FROM "CommunityComment" c
      INNER JOIN comment_tree ct ON c."parentId" = ct.id
    )
    SELECT m.url FROM "CommunityMedia" m
    INNER JOIN comment_tree ct ON m."commentId" = ct.id
  `;
  return media;
};

// ─── Topic Repository ────────────────────────────────────────────────────────

export const getTopics = async (): Promise<{ topic: string; count: number }[]> => {
  const topics: { topic: string; count: BigInt }[] = await prisma.$queryRaw`
    SELECT 
        topic,
        CAST(COUNT(*) AS BIGINT) as count
    FROM "CommunityPost"
    WHERE topic IS NOT NULL
    GROUP BY topic
    ORDER BY count DESC
    LIMIT 15
  `;

  return topics.map((t) => ({
    topic: t.topic,
    count: Number(t.count),
  }));
};

export const getPostOwnerInfo = async (postId: string) => {
  return prisma.communityPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      content: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

// ─── Admin/Global Queries ───

export const countCommunityPosts = async (where?: CommunityPostWhereInput): Promise<number> => {
  return prisma.communityPost.count({ where });
};


// ─── Admin Moderation Functions ──────────────────────────────────────────────

export const getReportedPostsAdmin = async (params: { limit: number; page: number }) => {
  const { limit, page } = params;
  const items = await prisma.communityPost.findMany({
    where: { reports: { some: {} } },
    take: limit,
    skip: (page - 1) * limit,
    orderBy: [{ reports: { _count: "desc" } }, { createdAt: "desc" }],
    include: postDetailedInclude,
  }) as unknown as CommunityPostRecord[];

  return { items };
};

export const getCommentsByPostIdAdmin = async (
  postId: string,
  params: { limit: number; page: number; reportFirst?: boolean }
) => {
  const { limit, page, reportFirst } = params;
  const items = await prisma.communityComment.findMany({
    where: { postId, parentId: null },
    take: limit,
    skip: (page - 1) * limit,
    orderBy: reportFirst
      ? [{ reports: { _count: "desc" } }, { createdAt: "desc" }]
      : { createdAt: "desc" },
    include: commentDetailedInclude,
  }) as unknown as CommunityCommentRecord[];

  return { items };
};

export const getReportedCommentsAdmin = async (
  params: { limit: number; page: number }
): Promise<{ items: CommunityReportedCommentRecord[] }> => {
  const { limit, page } = params;
  const items = await prisma.communityComment.findMany({
    where: { reports: { some: {} } },
    take: limit,
    skip: (page - 1) * limit,
    orderBy: [{ reports: { _count: "desc" } }, { createdAt: "desc" }],
    include: {
      ...commentDetailedInclude,
      post: {
        select: {
          id: true,
          content: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  }) as unknown as CommunityReportedCommentRecord[];

  return { items };
};
