import { z } from "zod";

/**
 * Request DTO for initiating a chat
 */
export const initiateChatSchema = z.object({
  dealLockId: z.uuid().optional(),
  accommodationLockId: z.uuid().optional(),
}).refine(data => data.dealLockId || data.accommodationLockId, {
  message: "Provide either a Deal Lock ID or an Accommodation Lock ID to initiate a chat",
});

/**
 * Request DTO for sending a message
 */
export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

/**
 * Request DTO for adding a custom addon
 */
export const addAddonSchema = z.object({
  name: z.string().min(1, "Addon name is required"),
  price: z.number().min(0, "Price must be a non-negative number"),
  details: z.string().optional(),
});

/**
 * Request params for routes identifying a chat room
 */
export const chatRoomParamsSchema = z.object({
  chatId: z.uuid(),
});

/**
 * Request params for removing an addon
 */
export const removeAddonParamsSchema = chatRoomParamsSchema.extend({
  addonId: z.uuid(),
});

/**
 * Request query for fetching messages
 */
export const chatMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
});

/**
 * Request body for marking messages as read
 */
export const markAsReadSchema = z.object({
  messageIds: z.array(z.uuid()),
});

/**
 * Response DTO for a message
 */
export const messageResponseSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  chatRoomId: z.uuid(),
  createdAt: z.date(),
  sender: z.object({
    id: z.uuid(),
    name: z.string(),
    isAdmin: z.boolean(),
    merchantProfile: z.object({
      businessName: z.string(),
    }).nullable().optional(),
  }),
});

/**
 * Response DTO for a list of messages
 */
export const messageListResponseSchema = z.array(messageResponseSchema);

/**
 * Response DTO for a chat room summary (list view)
 */
export const chatRoomSummarySchema = z.object({
  id: z.uuid(),
  dealId: z.uuid().nullable().optional(),
  propertyId: z.uuid().nullable().optional(),
  lastMessageAt: z.date(),
  unreadCount: z.number().optional(),
  deal: z.object({ id: z.uuid(), title: z.string() }).nullable().optional(),
  property: z.object({ id: z.uuid(), name: z.string() }).nullable().optional(),
  lastMessage: z.object({
    id: z.uuid(),
    content: z.string(),
    createdAt: z.date(),
    sender: z.object({ id: z.uuid(), name: z.string() }),
  }).nullable().optional(),
  members: z.array(z.object({
    user: z.object({
      id: z.uuid(),
      name: z.string(),
      isAdmin: z.boolean(),
      isMerchant: z.boolean(),
      merchantProfile: z.object({ businessName: z.string() }).nullable().optional(),
    }),
  })),
});

/**
 * Response DTO for a list of chats
 */
export const chatListResponseSchema = z.array(chatRoomSummarySchema);

/**
 * Type exports
 */
export type InitiateChatInput = z.infer<typeof initiateChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type AddAddonInput = z.infer<typeof addAddonSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type MessageListResponse = z.infer<typeof messageListResponseSchema>;
export type ChatRoomSummaryDto = z.infer<typeof chatRoomSummarySchema>;
export type ChatListResponse = z.infer<typeof chatListResponseSchema>;

