import { Router, Request, Response, NextFunction } from "express";
import * as service from "./community.service";
import { verifyToken, optionalAuth } from "../../middleware/auth.middleware";
import { 
  createPostSchema, 
  createCommentSchema, 
  postQuerySchema, 
  commentQuerySchema,
  updatePostSchema, 
  updateCommentSchema,
  postIdParamsSchema,
  commentIdParamsSchema,
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  UpdateCommentDto,
  PostQueryDto,
  CommentQueryDto
} from "./community.dto";
import { validateRequest } from "../../middleware/validate.middleware";
import type { AuthenticatedRequest } from "../../types/express/index";

const router = Router();

// ─── Posts ───

router.get(
  "/posts", 
  optionalAuth, 
  validateRequest({ query: postQuerySchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId || undefined;
      const query = req.query as unknown as PostQueryDto;
      const result = await service.getPosts({ ...query, userId });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/topics", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topics = await service.getTopics();
    res.json({ success: true, data: topics });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/posts", 
  verifyToken, 
  validateRequest({ body: createPostSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const body = req.body as CreatePostDto;
      const post = await service.createPost(userId, body);
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/posts/:id", 
  optionalAuth, 
  validateRequest({ params: postIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId || undefined;
      const post = await service.getPostById(id, userId);
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/posts/:id", 
  verifyToken, 
  validateRequest({ params: postIdParamsSchema, body: updatePostSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = (req as AuthenticatedRequest).userId;
      const body = req.body as UpdatePostDto;
      const post = await service.updatePost(userId, id, body);
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/posts/:id/like", 
  verifyToken, 
  validateRequest({ params: postIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = (req as AuthenticatedRequest).userId;
      const result = await service.toggleLikePost(userId, id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/posts/:id/report", 
  verifyToken, 
  validateRequest({ params: postIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.id as string;
      const userId = (req as AuthenticatedRequest).userId;
      const result = await service.reportPost(userId, postId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/posts/:id", 
  verifyToken, 
  validateRequest({ params: postIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = (req as AuthenticatedRequest).userId;
      await service.deletePost(userId, id);
      res.json({ success: true, message: "Post deleted" });
    } catch (error) {
      next(error);
    }
  }
);

// ─── Comments ───

router.get(
  "/posts/:id/comments", 
  optionalAuth, 
  validateRequest({ params: postIdParamsSchema, query: commentQuerySchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.id as string;
      const userId = req.userId || undefined;
      const query = req.query as unknown as CommentQueryDto;
      const result = await service.getCommentsByPostId(postId, { ...query, userId });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/posts/:id/comments", 
  verifyToken, 
  validateRequest({ params: postIdParamsSchema, body: createCommentSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.id as string;
      const userId = (req as AuthenticatedRequest).userId;
      const body = req.body as CreateCommentDto;
      const comment = await service.createComment(userId, postId, body);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/comments/:id", 
  verifyToken, 
  validateRequest({ params: commentIdParamsSchema, body: updateCommentSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = (req as AuthenticatedRequest).userId;
      const body = req.body as UpdateCommentDto;
      const comment = await service.updateComment(userId, id, body);
      res.json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/comments/:id/like", 
  verifyToken, 
  validateRequest({ params: commentIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id as string;
      const userId = (req as AuthenticatedRequest).userId;
      const result = await service.toggleLikeComment(userId, commentId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/comments/:id/report", 
  verifyToken, 
  validateRequest({ params: commentIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id as string;
      const userId = (req as AuthenticatedRequest).userId;
      const result = await service.reportComment(userId, commentId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/comments/:id", 
  verifyToken, 
  validateRequest({ params: commentIdParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = (req as AuthenticatedRequest).userId;
      await service.deleteComment(userId, id);
      res.json({ success: true, message: "Comment deleted" });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/comments/:id/replies", 
  optionalAuth, 
  validateRequest({ params: commentIdParamsSchema, query: commentQuerySchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id as string;
      const userId = req.userId || undefined;
      const query = req.query as unknown as CommentQueryDto;
      const result = await service.getRepliesByCommentId(commentId, { ...query, userId });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);


export default router;
