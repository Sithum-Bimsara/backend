import { useState, useEffect, useCallback, useRef } from "react";
import { chatApi } from "../api/chat.api";
import type { IChatRoom, IMessage } from "../types/chat.types";
import { getSocket } from "../../../lib/socket";
import { useAuth } from "../../../context/useAuth";

export function useChatRooms(currentChatId: string | null) {
  const { user } = useAuth();
  const [chats, setChats] = useState<IChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const currentChatIdRef = useRef(currentChatId);
  currentChatIdRef.current = currentChatId;

  // Connection State
  useEffect(() => {
    const socket = getSocket();
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const data = await chatApi.getMyChats();
      // Ensure correct initial sorting
      const sorted = [...data].sort((a, b) => {
        const timeA = new Date(a.lastMessage?.createdAt || a.lastMessageAt || 0).getTime();
        const timeB = new Date(b.lastMessage?.createdAt || b.lastMessageAt || 0).getTime();
        return timeB - timeA;
      });
      setChats(sorted);
    } catch (err) {
      console.error("[useChatRooms] Failed to fetch chats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Global socket listener for new messages (updates lastMessage & sorts/counts)
  useEffect(() => {
    const socket = getSocket();

    const handleGlobalNewMessage = (msg: IMessage & { chatRoomId: string }) => {
      setChats((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== msg.chatRoomId) return c;
          
          const isActive = currentChatIdRef.current === msg.chatRoomId;
          const isFromMe = msg.sender.id === user?.id;
          const unreadIncrement = (!isActive && !isFromMe) ? 1 : 0;
          
          return {
            ...c,
            lastMessage: msg,
            lastMessageAt: msg.createdAt,
            unreadCount: (c.unreadCount || 0) + unreadIncrement
          };
        });

        // WhatsApp-style: sort chats so the one with the newest message is at the top
        return [...updated].sort((a, b) => {
          const timeA = new Date(a.lastMessage?.createdAt || a.lastMessageAt || 0).getTime();
          const timeB = new Date(b.lastMessage?.createdAt || b.lastMessageAt || 0).getTime();
          return timeB - timeA;
        });
      });
    };

    socket.on("new_message", handleGlobalNewMessage);
    return () => {
      socket.off("new_message", handleGlobalNewMessage);
    };
  }, [user?.id]);

  // Global socket listener for dynamically created new chat rooms
  useEffect(() => {
    const socket = getSocket();

    const handleNewChatRoom = (newRoom: IChatRoom & { unreadCount?: number }) => {
      setChats((prev) => {
        if (prev.some((c) => c.id === newRoom.id)) return prev;
        
        const initializedRoom = {
          ...newRoom,
          unreadCount: newRoom.unreadCount ?? 1
        };
        return [initializedRoom, ...prev];
      });
    };

    socket.on("new_chat_room", handleNewChatRoom);
    return () => {
      socket.off("new_chat_room", handleNewChatRoom);
    };
  }, []);

  return {
    chats,
    loading,
    isConnected,
    onlineUsers,
    setOnlineUsers,
    actions: {
      refetch: fetchChats,
      setChats,
      markLocalAsRead: (roomId: string) => {
        setChats(prev => prev.map(c => c.id === roomId ? { ...c, unreadCount: 0 } : c));
      }
    }
  };
}
