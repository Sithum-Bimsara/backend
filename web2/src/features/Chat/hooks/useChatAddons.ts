import { useState } from "react";
import { chatApi } from "../api/chat.api";
import type { AddAddonDto } from "../dtos/chat.dtos";
import { toast } from "react-hot-toast";

/**
 * Hook for managing custom addons within a chat (Merchant logic).
 * Follows the pattern of managing loading states for specific actions.
 */
export function useChatAddons(chatId: string | null) {
  const [loadingApis, setLoadingApis] = useState<string[]>([]);

  const setApiLoading = (apiName: string, isLoading: boolean) => {
    setLoadingApis(prev => 
      isLoading ? [...prev, apiName] : prev.filter(a => a !== apiName)
    );
  };

  const addAddon = async (data: AddAddonDto) => {
    if (!chatId) return;
    try {
      setApiLoading("addAddon", true);
      const response = await chatApi.addAddon(chatId, data);
      toast.success("Addon added successfully");
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add addon";
      toast.error(errorMessage);
      throw err;
    } finally {
      setApiLoading("addAddon", false);
    }
  };

  const removeAddon = async (addonId: string) => {
    if (!chatId) return;
    try {
      setApiLoading("removeAddon", true);
      const response = await chatApi.removeAddon(chatId, addonId);
      toast.success("Addon removed successfully");
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove addon";
      toast.error(errorMessage);
      throw err;
    } finally {
      setApiLoading("removeAddon", false);
    }
  };

  return {
    addAddon,
    removeAddon,
    isLoading: loadingApis.length > 0,
    isProcessing: loadingApis.length > 0,
    loadingApis
  };
}
