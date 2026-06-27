import { Router, Request, Response, NextFunction } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { requireMerchant } from "../../middleware/merchant.middleware";
import { validateRequest } from "../../middleware/validate.middleware";
import * as chatService from "./chat.service";
import { 
  initiateChatSchema, 
  sendMessageSchema, 
  addAddonSchema, 
  messageResponseSchema, 
  messageListResponseSchema, 
  chatListResponseSchema,
  chatRoomParamsSchema,
  chatMessagesQuerySchema,
  markAsReadSchema,
  removeAddonParamsSchema,
  InitiateChatInput,
  SendMessageInput,
  AddAddonInput,
  MarkAsReadInput
} from "./chat.dtos";
import { AuthenticatedRequest } from "../../types/express/index";

const router = Router();

/**
 * Apply authentication middleware to all chat routes.
 * Ensures req.userId is available.
 */
router.use(verifyToken);

/**
 * @route   POST /chat/initiate
 * @desc    Initiate a new chat or retrieve existing one for a deal/accommodation lock.
 * @access  Authenticated Users
 */
router.post("/initiate", validateRequest({ body: initiateChatSchema }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = authReq.body as InitiateChatInput;
    const chat = await chatService.initiateChat(
      authReq.userId,
      data.dealLockId,
      data.accommodationLockId
    );
    res.json(chat);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /chat/my-chats
 * @desc    Get list of chat rooms for the current user (Traveller, Merchant, or Admin).
 * @access  Authenticated Users
 */
router.get("/my-chats", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const chats = await chatService.getMyChats(authReq.userId);
    res.json(chatListResponseSchema.parse(chats));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /chat/:chatId/messages
 * @desc    Get paginated messages for a specific chat room.
 * @access  Participants or Admin
 */
router.get(
  "/:chatId/messages", 
  validateRequest({ params: chatRoomParamsSchema, query: chatMessagesQuerySchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const messages = await chatService.getMessages(
        authReq.params.chatId as string, 
        authReq.userId, 
        authReq.query.cursor as string | undefined
      );
      res.json(messageListResponseSchema.parse(messages));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /chat/:chatId/message
 * @desc    Send a new message to a chat room.
 * @access  Participants or Admin
 */
router.post(
  "/:chatId/message", 
  validateRequest({ params: chatRoomParamsSchema, body: sendMessageSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = authReq.body as SendMessageInput;
      const message = await chatService.sendMessage(
        authReq.params.chatId as string, 
        authReq.userId, 
        data.content
      );
      res.json(messageResponseSchema.parse(message));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /chat/:chatId/read
 * @desc    Mark a list of messages as read.
 * @access  Participants or Admin
 */
router.post(
  "/:chatId/read", 
  validateRequest({ params: chatRoomParamsSchema, body: markAsReadSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = authReq.body as MarkAsReadInput;
      await chatService.markAsRead(
        authReq.params.chatId as string, 
        authReq.userId, 
        data.messageIds
      );
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /chat/:chatId/addon
 * @desc    Merchant adds a custom addon to the booking associated with the chat.
 * @access  Verified Merchant Participant
 */
router.post(
  "/:chatId/addon", 
  requireMerchant, 
  validateRequest({ params: chatRoomParamsSchema, body: addAddonSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = authReq.body as AddAddonInput;
      const result = await chatService.addCustomAddon(
        authReq.params.chatId as string, 
        authReq.userId, 
        data,
        authReq.merchantVerificationStatus,
        authReq.merchantProfileId
      );
      res.json(messageResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /chat/:chatId/addon/:addonId
 * @desc    Merchant removes a previously added custom addon.
 * @access  Verified Merchant Participant
 */
router.delete(
  "/:chatId/addon/:addonId", 
  requireMerchant, 
  validateRequest({ params: removeAddonParamsSchema }), 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await chatService.removeCustomAddon(
        authReq.params.chatId as string, 
        authReq.params.addonId as string, 
        authReq.userId,
        authReq.merchantVerificationStatus,
        authReq.merchantProfileId
      );
      res.json(messageResponseSchema.parse(result));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
