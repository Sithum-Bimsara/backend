import { z } from "zod";

// ─── Base Layer ──────────────────────────────────────────────────────────────

export const mediaSchema = z.object({
  id: z.string(),
  url: z.string().url(),
});

export const userSlimSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// ─── Post Schemas ────────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty"),
  topic: z.string().min(1, "Topic is required"),
  mediaUrls: z.array(z.string().url()).optional(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).optional(),
  topic: z.string().min(1).optional(),
  mediaUrls: z.array(z.url()).optional(),
});

export const viewPostSchema = z.object({
  id: z.string(),
  content: z.string(),
  topic: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()).optional(),
  user: userSlimSchema,
  media: z.array(mediaSchema).default([]),
  _count: z.object({
    likes: z.number(),
    comments: z.number(),
    reports: z.number(),
  }),
  isLiked: z.boolean().default(false),
  isReported: z.boolean().default(false),
});

export const postQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).optional().default(0),
  take: z.coerce.number().int().min(1).max(50).optional().default(5),
  limit: z.coerce.number().int().min(1).max(50).default(5),
  cursor: z.uuid().optional(),
  search: z.string().optional(),
  topic: z.string().optional(),
  reportFirst: z.coerce.boolean().optional().default(false),
});

export const paginatedPostResponseSchema = z.object({
  items: z.array(viewPostSchema),
  nextCursor: z.uuid().nullable(),
  total: z.number().default(0),
});

// ─── Comment Schemas ─────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
  parentId: z.uuid().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

export const viewCommentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  parentId: z.string().nullable(),
  content: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()).optional(),
  user: userSlimSchema,
  media: z.array(mediaSchema).default([]),
  _count: z.object({
    likes: z.number(),
    replies: z.number(),
    reports: z.number(),
  }),
  isLiked: z.boolean().default(false),
  isReported: z.boolean().default(false),
});

export const viewReportedCommentSchema = viewCommentSchema.extend({
  post: z.object({
    id: z.string(),
    content: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string().nullable(),
    }).nullish(),
  }).nullish(),
});

export const commentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.uuid().optional(),
  reportFirst: z.coerce.boolean().optional().default(false),
});

export const paginatedCommentResponseSchema = z.object({
  items: z.array(viewCommentSchema),
  nextCursor: z.uuid().nullable(),
});

// ─── Topic Schemas ───────────────────────────────────────────────────────────

export const viewTopicSchema = z.object({
  topic: z.string(),
  count: z.number(),
});

// ─── Params Schemas ─────────────────────────────────────────────────────────

export const postIdParamsSchema = z.object({ id: z.uuid("Invalid post ID") });
export const commentIdParamsSchema = z.object({ id: z.uuid("Invalid comment ID") });

// ─── Type Exports ────────────────────────────────────────────────────────────

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type ViewPostDto = z.infer<typeof viewPostSchema>;
export type PostQueryDto = z.infer<typeof postQuerySchema>;
export type PaginatedPostResponseDto = z.infer<typeof paginatedPostResponseSchema>;

export type CreateCommentDto = z.infer<typeof createCommentSchema>;
export type UpdateCommentDto = z.infer<typeof updateCommentSchema>;
export type ViewCommentDto = z.infer<typeof viewCommentSchema>;
export type ViewReportedCommentDto = z.infer<typeof viewReportedCommentSchema>;
export type CommentQueryDto = z.infer<typeof commentQuerySchema>;
export type PaginatedCommentResponseDto = z.infer<typeof paginatedCommentResponseSchema>;

export type ViewTopicDto = z.infer<typeof viewTopicSchema>;
