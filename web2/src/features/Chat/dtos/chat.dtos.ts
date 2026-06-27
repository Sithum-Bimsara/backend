import { z } from "zod";

/**
 * ─── Request Payloads (Input Validation) ───
 */

/**
 * Request DTO for initiating a chat
 */
export const initiateChatSchema = z.object({
  dealLockId: z.string().uuid().optional(),
  accommodationLockId: z.string().uuid().optional(),
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
 * Request query for fetching messages (Pagination)
 */
export const chatMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
});

/**
 * Request body for marking messages as read
 */
export const markAsReadSchema = z.object({
  messageIds: z.array(z.string().uuid()),
});

/**
 * ─── Type Exports (Inferred from Schemas) ───
 */

export type InitiateChatDto = z.infer<typeof initiateChatSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type AddAddonDto = z.infer<typeof addAddonSchema>;
export type ChatMessagesQueryDto = z.infer<typeof chatMessagesQuerySchema>;
export type MarkAsReadDto = z.infer<typeof markAsReadSchema>;
