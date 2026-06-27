import { Prisma } from "@prisma/client";

export type CommunityPostWhereInput = Prisma.CommunityPostWhereInput;

// ─── Post Includes ───────────────────────────────────────────────────────────

export const postDetailedInclude = {
  media: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
      reports: true,
    },
  },
} satisfies Prisma.CommunityPostInclude;

export const postWithInteractionsInclude = (currentUserId?: string): Prisma.CommunityPostInclude => ({
  ...postDetailedInclude,
  ...(currentUserId
    ? {
        likes: {
          where: { userId: currentUserId },
          select: { id: true },
        },
        reports: {
          where: { userId: currentUserId },
          select: { id: true },
        },
      }
    : {}),
});

export type CommunityPostRecord = Prisma.CommunityPostGetPayload<{
  include: ReturnType<typeof postWithInteractionsInclude>;
}> & {
  likes?: { id: string }[];
  reports?: { id: string }[];
};

// ─── Comment Includes ────────────────────────────────────────────────────────

export const commentDetailedInclude = {
  media: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      likes: true,
      replies: true,
      reports: true,
    },
  },
} satisfies Prisma.CommunityCommentInclude;

export const commentWithInteractionsInclude = (currentUserId?: string): Prisma.CommunityCommentInclude => ({
  ...commentDetailedInclude,
  ...(currentUserId
    ? {
        likes: {
          where: { userId: currentUserId },
          select: { id: true },
        },
        reports: {
          where: { userId: currentUserId },
          select: { id: true },
        },
      }
    : {}),
});

export type CommunityCommentRecord = Prisma.CommunityCommentGetPayload<{
  include: ReturnType<typeof commentWithInteractionsInclude>;
}> & {
  likes?: { id: string }[];
  reports?: { id: string }[];
};

export type CommunityReportedCommentRecord = CommunityCommentRecord & {
  post?: {
    id: string;
    content: string;
    user?: {
      id: string;
      name: string | null;
    } | null;
  } | null;
};

// ─── Topic Types ─────────────────────────────────────────────────────────────

export interface CommunityTopicRecord {
  topic: string;
  count: number;
}

// ─── Admin Query Types ───────────────────────────────────────────────────────

export const adminCommunityPostIdSelect = {
  id: true,
} satisfies Prisma.CommunityPostSelect;

export type AdminCommunityPostIdRecord = Prisma.CommunityPostGetPayload<{
  select: typeof adminCommunityPostIdSelect;
}>;

export const adminCommunityCommentRootSelect = {
  id: true,
  postId: true,
} satisfies Prisma.CommunityCommentSelect;

export type AdminCommunityCommentRootRecord = Prisma.CommunityCommentGetPayload<{
  select: typeof adminCommunityCommentRootSelect;
}>;

export const adminCommunityCommentWithMediaSelect = {
  id: true,
  parentId: true,
  media: {
    select: { url: true },
  },
} satisfies Prisma.CommunityCommentSelect;

export type AdminCommunityCommentWithMediaRecord = Prisma.CommunityCommentGetPayload<{
  select: typeof adminCommunityCommentWithMediaSelect;
}>;


