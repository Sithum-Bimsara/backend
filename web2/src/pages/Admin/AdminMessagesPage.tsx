import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/useAuth";
import { useChatRooms, useChatRoom } from "../../features/Chat/hooks";
import { 
  ChatSkeleton, 
  ChatAvatar, 
  ChatHeader, 
  ChatInputBar, 
  MessageBubbleList, 
  PinnedAddons, 
  MessageSquareIcon, 
  TagIcon 
} from "../../features/Chat/components";
import type { IChatRoom, IMember } from "../../features/Chat/types/chat.types";
import { format } from "date-fns";

const getTraveller = (physicalRoom: IChatRoom, myUserId: string): IMember["user"] | null => {
  const member = physicalRoom.members.find(
    (m: IMember) => m.user.id !== myUserId
  );
  return member?.user ?? null;
};

const getMerchantLabel = (physicalRoom: IChatRoom, myUserId: string) => {
  const otherUser = getTraveller(physicalRoom, myUserId);
  const customerName = otherUser?.isMerchant
    ? (otherUser.merchantProfile?.businessName ?? otherUser.name)
    : (otherUser?.name ?? "Customer");
  const contextName = physicalRoom.deal?.title ?? physicalRoom.property?.name ?? null;
  return { customerName, contextName };
};

const AdminMessagesPage: React.FC = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [prevChatId, setPrevChatId] = useState<string | undefined>(undefined);
  const currentChatId = selectedChatId || chatId || null;

  const [showMobileChat, setShowMobileChat] = useState(false);

  if (chatId !== prevChatId) {
    setPrevChatId(chatId);
    setSelectedChatId(chatId || null);
    if (chatId) {
      setShowMobileChat(true);
    }
  }

  // Hook 1: Sidebar Rooms list & real-time prepend
  const { 
    chats, 
    loading: chatsLoading, 
    isConnected, 
    actions: roomsActions 
  } = useChatRooms(currentChatId);

  // Hook 2: Active Room message list, scrolling, real-time events
  const {
    messages,
    activeChat,
    messagesLoading,
    loadingMore,
    hasMore,
    someoneTyping,
    onlineUsers: activeRoomOnlineUsers,
    messagesEndRef,
    messagesContainerRef,
    actions: roomActions
  } = useChatRoom(currentChatId, roomsActions.refetch);

  const [newMessage, setNewMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    roomActions.handleTypingActivity(e.target.value);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChatId) return;
    roomActions.handleSend(newMessage);
    setNewMessage("");
  };



  if (chatsLoading) {
    return (
      <ChatSkeleton 
        isMobile={typeof window !== "undefined" && window.innerWidth < 768} 
        showMobileChat={showMobileChat} 
      />
    );
  }

  // Derived Admin labels
  const activeChatHeader = activeChat ? getMerchantLabel(activeChat, user!.id) : null;
  const isTargetOnline = activeChat?.members?.some((m: IMember) => {
    const mId = m.userId || m.user?.id;
    return !!mId && mId !== user?.id && activeRoomOnlineUsers.includes(mId);
  }) ?? false;

  return (
    <div className="flex flex-1 h-full bg-white md:bg-slate-50 overflow-hidden relative">

      {/* ── Sidebar (Chat List) ─────────────────────────────────────────── */}
      <div className={`w-full md:w-80 h-full border-r bg-white flex flex-col shrink-0 transition-all duration-300 ${
        showMobileChat ? "hidden md:flex" : "flex"
      }`}>
        <div className="p-5 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-800">Messages</h1>
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isConnected ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-amber-400"}`} />
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-12 px-6">No conversations yet.</p>
          )}

          {chats.map((chat) => {
            const isActive = activeChat?.id === chat.id;
            const lastMsg = chat.lastMessage;
            const { customerName, contextName } = getMerchantLabel(chat, user!.id);

            return (
              <motion.div
                key={chat.id}
                whileHover={{ backgroundColor: isActive ? undefined : "#f8fafc" }}
                onClick={() => {
                  setSelectedChatId(chat.id);
                  roomsActions.markLocalAsRead(chat.id);
                  setShowMobileChat(true);
                }}
                className={`p-4 cursor-pointer border-b transition-colors ${
                  isActive ? "bg-slate-50 border-l-[3px] border-l-[#2dd4af]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <ChatAvatar name={customerName} isActive={isActive} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-semibold text-sm truncate ${isActive ? "text-[#0e2a47]" : "text-slate-900"}`}>
                        {customerName}
                      </h3>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {lastMsg && format(new Date(lastMsg.createdAt), "HH:mm")}
                        </span>
                        {chat.unreadCount ? chat.unreadCount > 0 && (
                          <span className="bg-[#2dd4af] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 animate-in zoom-in duration-300">
                            {chat.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {contextName && (
                      <span className={`inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full max-w-full truncate ${
                        isActive ? "bg-[#2dd4af]/10 text-[#2dd4af]" : "bg-slate-100 text-slate-500"
                      }`}>
                        <TagIcon size={9} />
                        {contextName}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {lastMsg?.content ?? "No messages yet"}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Main Chat Area ──────────────────────────────────────────────── */}
      <div className={`flex-1 h-full flex flex-col relative bg-white min-w-0 transition-transform duration-300 ${
        showMobileChat ? "flex" : "hidden md:flex"
      }`}>
        {activeChat && activeChatHeader ? (
          <>
            <ChatHeader 
              customerName={activeChatHeader.customerName}
              contextName={activeChatHeader.contextName}
              isConnected={isConnected}
              isOnline={isTargetOnline}
              memberCount={activeChat.members.length}
              onBack={() => setShowMobileChat(false)}
            />

            <PinnedAddons 
              dealLock={activeChat.dealLock}
              accommodationLock={activeChat.accommodationLock}
            />

            <MessageBubbleList 
              messages={messages}
              currentUserId={user?.id || ""}
              messagesLoading={messagesLoading}
              loadingMore={loadingMore}
              someoneTyping={someoneTyping}
              hasMore={hasMore}
              onScroll={roomActions.handleScroll}
              activeChatMembers={activeChat.members}
              messagesContainerRef={messagesContainerRef}
              messagesEndRef={messagesEndRef}
            />

            <ChatInputBar 
              value={newMessage}
              onChange={handleInputChange}
              onSubmit={handleSend}
              isConnected={isConnected}
              placeholder={`Reply to ${activeChatHeader.customerName}...`}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <motion.div
              className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <MessageSquareIcon size={36} />
            </motion.div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-600">Select a customer conversation</p>
              <p className="text-sm text-slate-400 mt-1">Each lock(deal or accommodation) has its own chat thread per customer</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminMessagesPage;
