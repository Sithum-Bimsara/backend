import { useState, useCallback } from "react";
import { chatApi } from "../api/chat.api";
import type { InitiateChatDto } from "../dtos/chat.dtos";
import { toast } from "react-hot-toast";

/**
 * Hook for global chat operations (e.g. initiating a new chat).
 * Bridges the UI/Context with the API Layer.
 */
export function useChatOperations() {
  const [isInitiating, setIsInitiating] = useState(false);

  const initiateChat = useCallback(async (params: InitiateChatDto) => {
    try {
      setIsInitiating(true);
      const res = await chatApi.initiateChat(params);
      return res;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start chat";
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsInitiating(false);
    }
  }, []);

  return {
    initiateChat,
    isInitiating
  };
}
