import { api } from "../../../lib/api";
import type { 
  InitiateChatDto, 
  SendMessageDto, 
  AddAddonDto, 
  MarkAsReadDto, 
  ChatMessagesQueryDto 
} from "../dtos/chat.dtos";
import type { 
  IViewChatRoomSummary, 
  IViewChatRoomDetailed, 
  IViewMessage 
} from "../types/chat.types";

/**
 * ─── Chat API Layer ───
 * Pure data fetching. No UI logic or state.
 * Inputs: DTO types
 * Outputs: View types
 */
export const chatApi = {
  /**
   * Get all chat rooms for the current user.
   * GET /chat/my-chats
   */
  getMyChats: async (): Promise<IViewChatRoomSummary[]> => {
    const response = await api.get<IViewChatRoomSummary[]>("/chat/my-chats");
    return response.data;
  },

  /**
   * Get messages for a specific chat room.
   * GET /chat/:chatId/messages
   */
  getMessages: async (chatId: string, query?: string | ChatMessagesQueryDto): Promise<IViewMessage[]> => {
    const params = typeof query === "string" ? { cursor: query } : query;
    const response = await api.get<IViewMessage[]>(`/chat/${chatId}/messages`, {
      params
    });
    return response.data;
  },

  /**
   * Initiate a chat for a specific lock.
   * POST /chat/initiate
   */
  initiateChat: async (data: InitiateChatDto): Promise<IViewChatRoomDetailed> => {
    const response = await api.post<IViewChatRoomDetailed>("/chat/initiate", data);
    return response.data;
  },

  /**
   * Send a new message to a chat room.
   * POST /chat/:chatId/message
   */
  sendMessage: async (chatId: string, data: SendMessageDto): Promise<IViewMessage> => {
    const response = await api.post<IViewMessage>(`/chat/${chatId}/message`, data);
    return response.data;
  },

  /**
   * Mark messages as read.
   * POST /chat/:chatId/read
   */
  markAsRead: async (chatId: string, data: MarkAsReadDto): Promise<void> => {
    await api.post(`/chat/${chatId}/read`, data);
  },

  /**
   * Add a custom addon (Merchant only).
   * POST /chat/:chatId/addon
   */
  addAddon: async (chatId: string, data: AddAddonDto): Promise<IViewMessage> => {
    const response = await api.post<IViewMessage>(`/chat/${chatId}/addon`, data);
    return response.data;
  },

  /**
   * Remove a custom addon (Merchant only).
   * DELETE /chat/:chatId/addon/:addonId
   */
  removeAddon: async (chatId: string, addonId: string): Promise<IViewMessage> => {
    const response = await api.delete<IViewMessage>(`/chat/${chatId}/addon/${addonId}`);
    return response.data;
  }
};
