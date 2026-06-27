import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/useAuth";
import { useChatRooms, useChatRoom, useChatAddons } from "../../../features/Chat/hooks";
import { 
  ChatSkeleton, 
  ChatAvatar, 
  ChatHeader, 
  MessageBubbleList, 
  MessageSquareIcon, 
  TagIcon 
} from "../../../features/Chat/components";
import type { IChatRoom, IMember, IViewCustomAddon } from "../../../features/Chat/types/chat.types";
import { format } from "date-fns";
import { ErrorHandler } from "../../../utils/error-handler";

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

export const ChatPage: React.FC = () => {
  const { chatId } = useParams();
  const { user, isMerchant, isAdmin } = useAuth();
  const isManagementView = isMerchant || isAdmin;

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

  // Hook 3: Addons API trigger states
  const { addAddon, removeAddon, isLoading: isSubmittingAddon } = useChatAddons(currentChatId);

  const [newMessage, setNewMessage] = useState("");
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [addonForm, setAddonForm] = useState({ name: "", price: "", details: "" });

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

  const handleAddAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonForm.name || !addonForm.price || !currentChatId) return;

    try {
      await addAddon({
        name: addonForm.name,
        price: parseFloat(addonForm.price),
        details: addonForm.details || undefined
      });
      setAddonForm({ name: "", price: "", details: "" });
      setShowAddonForm(false);
      roomsActions.refetch();
      roomActions.fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddon = async (addonId: string, addonName: string) => {
    if (!currentChatId) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to remove "${addonName}"? This will update the total price for the traveller.`);
    if (!confirmDelete) return;

    try {
      await removeAddon(addonId);
      roomsActions.refetch();
      roomActions.fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };



  if (chatsLoading) {
    return (
      <ChatSkeleton 
        isMobile={typeof window !== "undefined" && window.innerWidth < 768} 
        showMobileChat={showMobileChat} 
      />
    );
  }

  // Derived Merchant labels
  const activeChatHeader = activeChat ? getMerchantLabel(activeChat, user!.id) : null;
  const isTargetOnline = activeChat?.members?.some((m: IMember) => {
    const mId = m.userId || m.user?.id;
    return mId !== user?.id && activeRoomOnlineUsers.includes(mId);
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
                          <span className="bg-[#2dd4af] text-white text-[10px] font-bold min-w-4.5 h-4.5 rounded-full flex items-center justify-center px-1 animate-in zoom-in duration-300">
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

            {/* Merchant custom delete-addon supported list */}
            {(() => {
              const getAddons = (lock: IChatRoom["dealLock"] | IChatRoom["accommodationLock"]): IViewCustomAddon[] => {
                if (!lock?.customAddons) return [];
                if (Array.isArray(lock.customAddons)) return lock.customAddons;
                try {
                  if (typeof lock.customAddons === 'string') return JSON.parse(lock.customAddons);
                } catch (e) {
                  ErrorHandler.handle(e, { showToast: false });
                }
                return [];
              };

              const addons: IViewCustomAddon[] = [
                ...getAddons(activeChat.dealLock),
                ...getAddons(activeChat.accommodationLock)
              ];
              
              if (addons.length === 0) return null;

              const total = addons.reduce((sum: number, a: IViewCustomAddon) => sum + (a.price || 0), 0);

              return (
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-col gap-2 overflow-hidden shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)] shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#2dd4af]" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Pinned Add-ons
                    </span>
                    <div className="bg-[#2dd4af]/10 px-2 py-0.5 rounded-lg">
                      <span className="text-[10px] font-black text-[#25b898]">
                        TOTAL: ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                    {addons.map((addon: IViewCustomAddon, idx: number) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 shrink-0 shadow-sm hover:border-[#2dd4af]/30 transition-all group/addon relative"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#2dd4af]/10 flex items-center justify-center text-[#2dd4af]">
                          <TagIcon size={12} />
                        </div>
                        <div className="flex flex-col pr-2">
                          <span className="text-[12px] font-bold text-slate-800 leading-none">{addon.name}</span>
                          <span className="text-[10px] font-black text-[#2dd4af] mt-1">${addon.price}</span>
                        </div>
                        {isManagementView && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddon(addon.id, addon.name);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/addon:opacity-100 transition-opacity border-2 border-white shadow-sm cursor-pointer border-none"
                            title="Remove Addon"
                          >
                            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6L6 18M6 6l12 12" /></svg>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Addon Form Overlay */}
            <AnimatePresence>
              {showAddonForm && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6"
                >
                  <div className="w-full max-w-sm bg-[#0e2a47] rounded-3xl p-8 shadow-2xl text-white">
                    <h3 className="text-xl font-bold mb-1 text-white">Add Custom Extra</h3>
                    <p className="text-white/60 text-xs mb-6">This will update the total lock price for the customer.</p>
                    
                    <form onSubmit={handleAddAddon} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Addon Name</label>
                          <input 
                            type="text" required
                            placeholder="e.g. Guided Boat Tour"
                            value={addonForm.name}
                            onChange={e => setAddonForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2dd4af] transition-all text-white border-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Price (USD)</label>
                          <input 
                            type="number" required step="0.01"
                            placeholder="0.00"
                            value={addonForm.price}
                            onChange={e => setAddonForm(prev => ({ ...prev, price: e.target.value }))}
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2dd4af] transition-all text-white border-none"
                          />
                        </div>
                        <div className="col-span-1 flex items-end">
                          <p className="text-[10px] text-white/40 italic mb-2 leading-tight">Applied to total checkout.</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">Additional Details (Optional)</label>
                        <textarea 
                          rows={3}
                          placeholder="What is included in this price?"
                          value={addonForm.details}
                          onChange={e => setAddonForm(prev => ({ ...prev, details: e.target.value }))}
                          className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2dd4af] transition-all text-white resize-none border-none"
                        />
                      </div>
                      <div className="flex gap-3 pt-3">
                        <button 
                          type="button" onClick={() => setShowAddonForm(false)}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-all border-none cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" disabled={isSubmittingAddon}
                          className="flex-1 py-3 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] font-bold rounded-xl text-xs transition-all shadow-lg shadow-[#2dd4af]/20 border-none cursor-pointer"
                        >
                          {isSubmittingAddon ? "Adding..." : "Add to Lock"}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

            {/* Input Form with Custom Extra add button */}
            <div className="px-4 py-3 border-t bg-white flex items-center gap-3 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.01)]">
              {isManagementView && (activeChat.dealLockId || activeChat.accommodationLockId || activeChat.dealLock?.id || activeChat.accommodationLock?.id) && (
                <motion.button 
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  type="button" 
                  onClick={() => setShowAddonForm(true)}
                  className="w-10 h-10 bg-[#2dd4af]/10 text-[#2dd4af] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer"
                  title="Add Custom Extra"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </motion.button>
              )}
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend(e);
                }}
                placeholder={`Reply to ${activeChatHeader.customerName}...`}
                className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-[#2dd4af] outline-none transition-all duration-300"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!newMessage.trim() || !isConnected}
                className="w-10 h-10 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] hover:text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shrink-0 border-none cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </motion.button>
            </div>
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
