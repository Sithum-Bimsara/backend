import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./ChatWindow";
import type { InitiateChatDto } from "./dtos/chat.dtos";
import { useChatOperations } from "./hooks/useChatOperations";

interface ChatContextType {
  isOpen: boolean;
  activeRoomId: string | null;
  openChat: (roomId?: string | null) => void;
  closeChat: () => void;
  initiateChat: (params: InitiateChatDto) => Promise<void>;
  isInitiating: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { initiateChat: apiInitiateChat, isInitiating } = useChatOperations();

  const openChat = useCallback((physicalRoomId: string | null = null) => {
    setActiveRoomId(physicalRoomId);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveRoomId(null);
  }, []);

  const initiateChat = useCallback(async (params: InitiateChatDto) => {
    try {
      const res = await apiInitiateChat(params);
      openChat(res.id);
    } catch (err) {
      // Error is handled by the hook (toast)
    }
  }, [apiInitiateChat, openChat]);

  return (
    <ChatContext.Provider value={{ 
      isOpen, 
      activeRoomId, 
      openChat, 
      closeChat, 
      initiateChat, 
      isInitiating 
    }}>
      {children}
      <AnimatePresence>
        {isOpen && activeRoomId && (
          <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChat}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-[92vh] sm:h-[600px] sm:max-w-md bg-white rounded-t-[1.75rem] sm:rounded-[1.75rem] shadow-2xl overflow-hidden flex flex-col z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-center pt-3 pb-2 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-slate-200" />
              </div>
              <ChatWindow
                chatRoomId={activeRoomId}
                showBack={false}
                onClose={closeChat}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
