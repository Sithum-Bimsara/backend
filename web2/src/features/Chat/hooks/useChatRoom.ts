import { useState, useEffect, useCallback, useRef } from "react";
import { chatApi } from "../api/chat.api";
import { useChatRealtime, emitTyping } from "../useChatRealtime";
import type { IMessage, IChatRoom } from "../types/chat.types";
import { useAuth } from "../../../context/useAuth";
import { useLockedDeal } from "../../../context/locked-deal.context";
import { getSocket } from "../../../lib/socket";

export function useChatRoom(chatRoomId: string | null, onChatsUpdate?: () => void) {
  const { user } = useAuth();
  const { refreshLockedDeal } = useLockedDeal();
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [activeChat, setActiveChat] = useState<IChatRoom | null>(null);
  
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [someoneTyping, setSomeoneTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);
  const readStateRef = useRef<Set<string>>(new Set());

  // Stable references for handlers
  const activeChatIdRef = useRef(chatRoomId);
  activeChatIdRef.current = chatRoomId;

  const fetchMessages = useCallback(async (id: string, cursor?: string) => {
    if (cursor) setLoadingMore(true);
    else {
      setMessagesLoading(true);
      setMessages([]); // Clear list for correct skeletons
    }

    try {
      const data = await chatApi.getMessages(id, cursor);
      const newMessages = data.reverse() as unknown as IMessage[];
      
      if (cursor) {
        const container = messagesContainerRef.current;
        const prevScrollHeight = container?.scrollHeight || 0;

        setMessages(prev => [...newMessages, ...prev]);

        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
          }
        }, 0);
      } else {
        setMessages(newMessages);
      }
      
      setHasMore(newMessages.length === 15);
    } catch (err) {
      console.error("[useChatRoom] Failed to fetch messages:", err);
    } finally {
      setMessagesLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchRoomDetails = useCallback(async (id: string) => {
    try {
      const rooms = await chatApi.getMyChats();
      const current = rooms.find(r => r.id === id);
      if (current) {
        setActiveChat(current as unknown as IChatRoom);
      }
    } catch (err) {
      console.error("[useChatRoom] Failed to fetch room details:", err);
    }
  }, []);

  // Sync details and messages on chat room change
  useEffect(() => {
    if (chatRoomId) {
      setHasMore(true);
      isFirstLoad.current = true;
      readStateRef.current.clear();
      fetchRoomDetails(chatRoomId);
      fetchMessages(chatRoomId);
    } else {
      setMessages([]);
      setActiveChat(null);
    }
  }, [chatRoomId, fetchMessages, fetchRoomDetails]);

  // Scroll to bottom on initial message load
  useEffect(() => {
    if (isFirstLoad.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      isFirstLoad.current = false;
    }
  }, [messages]);

  // Real-time message handlers
  const handleNewMessage = useCallback((msg: IMessage & { chatRoomId: string }) => {
    if (msg.chatRoomId !== activeChatIdRef.current) return;

    const container = messagesContainerRef.current;
    const isAtBottom = container ? (container.scrollHeight - container.scrollTop <= container.clientHeight + 100) : true;

    setMessages((prev) => {
      // Filter out matching optimistic messages
      const filtered = prev.filter(
        (m) => !(m.isOptimistic && m.content === msg.content && m.sender.id === msg.sender.id)
      );
      if (filtered.some((m) => m.id === msg.id)) return filtered;

      // Real-time synchronization for custom pricing adjustments/addons
      if (msg.content.includes("[System]") && (
        msg.content.toLowerCase().includes("added a custom addon") || 
        msg.content.toLowerCase().includes("removed the custom addon")
      )) {
        refreshLockedDeal();
        if (chatRoomId) {
          fetchRoomDetails(chatRoomId);
        }
        onChatsUpdate?.();
      }

      const updated = [...filtered, msg];
      return updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    if (isAtBottom) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [chatRoomId, fetchRoomDetails, onChatsUpdate, refreshLockedDeal]);

  const handleUserTyping = useCallback((data: { userId: string; isTyping: boolean }) => {
    if (data.userId === user?.id) return;
    setSomeoneTyping(data.isTyping);
  }, [user?.id]);

  const handleMessagesRead = useCallback((data: { userId: string; messageIds: string[] }) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (data.messageIds.includes(m.id)) {
          const alreadyRead = (m.readBy || []).some((r) => r.userId === data.userId);
          if (!alreadyRead) {
            return { ...m, readBy: [...(m.readBy || []), { userId: data.userId }] };
          }
        }
        return m;
      })
    );
  }, []);

  const handlePresenceUpdate = useCallback((data: { userId: string; status: "online" | "offline" }) => {
    setOnlineUsers((prev) => {
      if (data.status === "online") return prev.includes(data.userId) ? prev : [...prev, data.userId];
      return prev.filter(id => id !== data.userId);
    });
  }, []);

  const handleRoomPresence = useCallback((data: { onlineUserIds: string[] }) => {
    setOnlineUsers(data.onlineUserIds);
  }, []);

  useChatRealtime(
    chatRoomId || "",
    handleNewMessage,
    handleUserTyping,
    handleMessagesRead,
    handlePresenceUpdate,
    handleRoomPresence
  );

  // Mark messages as read using intersection observer
  const markMessagesAsRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0 || !chatRoomId || !user) return;
    try {
      await chatApi.markAsRead(chatRoomId, { messageIds: ids });
      
      // Update local read states immediately for standard me tick display
      setMessages(prev => prev.map(m => ids.includes(m.id) ? { ...m, readBy: [...(m.readBy || []), { userId: user.id }] } : m));
      
      // Notify parent list to zero out unread bubble
      onChatsUpdate?.();
    } catch (err) {
      console.error("[useChatRoom] Failed to mark messages as read:", err);
    }
  }, [chatRoomId, user, onChatsUpdate]);

  useEffect(() => {
    if (messagesLoading || messages.length === 0 || !chatRoomId || !user) return;

    const unreadIds = messages
      .filter(m => m.sender.id !== user.id && !(m.readBy || []).some(r => r.userId === user.id))
      .map(m => m.id);

    if (unreadIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleIds = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.getAttribute("data-message-id"))
          .filter((id): id is string => !!id && !readStateRef.current.has(id));

        if (visibleIds.length > 0) {
          visibleIds.forEach(id => readStateRef.current.add(id));
          markMessagesAsRead(visibleIds);
        }
      },
      { threshold: 0.5 }
    );

    const elements = document.querySelectorAll("[data-unread='true']");
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [messages, messagesLoading, chatRoomId, markMessagesAsRead, user]);

  // Actions
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop <= 5 && hasMore && !loadingMore && !messagesLoading && chatRoomId && messages.length > 0) {
      const oldestId = messages[0]?.id;
      if (oldestId && !oldestId.startsWith("optimistic")) {
        fetchMessages(chatRoomId, oldestId);
      }
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim() || !chatRoomId || !user) return;

    const optimistic: IMessage = {
      id: `optimistic-${Date.now()}`,
      content: text,
      createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name, isAdmin: user.isAdmin, merchantProfile: user.merchantProfile },
      readBy: [],
      isOptimistic: true,
    };

    setMessages(prev => [...prev, optimistic]);
    
    // Trigger emit typing off
    emitTyping(chatRoomId, false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Send via socket
    getSocket().emit("send_message", { chatRoomId, content: text });

    // Scroll to bottom immediately
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleTypingActivity = (_text: string) => {
    if (!chatRoomId) return;
    emitTyping(chatRoomId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(chatRoomId, false), 2000);
  };

  return {
    messages,
    activeChat,
    messagesLoading,
    loadingMore,
    hasMore,
    someoneTyping,
    onlineUsers,
    messagesEndRef,
    messagesContainerRef,
    actions: {
      handleScroll,
      handleSend,
      handleTypingActivity,
      fetchDetails: () => chatRoomId && fetchRoomDetails(chatRoomId)
    }
  };
}
