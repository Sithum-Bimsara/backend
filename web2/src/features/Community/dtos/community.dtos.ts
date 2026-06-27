import { z } from "zod";

//////////////////////////////////////////////////////
// CREATE POST
//////////////////////////////////////////////////////

export const createPostSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty").max(1000, "Content is too long"),
  mediaUrls: z.array(z.string().url("Invalid media URL")).optional(),
  topic: z.string().min(1, "Topic is required"),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;

//////////////////////////////////////////////////////
// CREATE COMMENT
//////////////////////////////////////////////////////

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
  parentId: z.string().uuid("Invalid parent comment ID").optional(),
  mediaUrls: z.array(z.string().url("Invalid media URL")).optional(),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;

//////////////////////////////////////////////////////
// PAGINATION
//////////////////////////////////////////////////////

export interface GetCommunityPostsParamsDto {
  skip?: number;
  take?: number;
  reportFirst?: boolean;
  search?: string;
  topic?: string;
}
