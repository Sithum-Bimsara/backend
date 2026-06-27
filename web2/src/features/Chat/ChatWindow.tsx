import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/useAuth";
import { useChatRoom, useChatAddons } from "./hooks";
import { useLockedDeal } from "../../context/locked-deal.context";
import {
  ChatHeader,
  MessageBubbleList,
  PinnedAddons,
} from "./components";

interface ChatWindowProps {
  chatRoomId: string;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onClose?: () => void;
  showBack?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chatRoomId,
  title,
  subtitle,
  onBack,
  onClose,
  showBack
}) => {
  const { user, isMerchant } = useAuth();
  const { refreshLockedDeal } = useLockedDeal();

  // ─── Hook-Driven Logic ────────────────────────────────────────────────────────
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
  } = useChatRoom(chatRoomId);

  const {
    addAddon,
    isProcessing: isAddonProcessing
  } = useChatAddons(chatRoomId);

  // ─── Local UI State ──────────────────────────────────────────────────────────
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    roomActions.handleTypingActivity(e.target.value);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoomId) return;
    roomActions.handleSend(newMessage);
    setNewMessage("");
  };

  const handleAddAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const details = formData.get("details") as string;

    if (!name || !priceStr) return;

    try {
      await addAddon({
        name,
        price: parseFloat(priceStr),
        details: details || undefined
      });
      setShowAddonForm(false);
      refreshLockedDeal();
      roomActions.fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  // Participant info derived from activeChat
  const otherParticipant = activeChat?.members?.find(m => m.user.id !== user?.id)?.user;
  const detectedMerchantName = activeChat?.members?.find(m => m.user.isMerchant)?.user?.merchantProfile?.businessName;
  const isOnline = otherParticipant ? activeRoomOnlineUsers.includes(otherParticipant.id) : false;

  // Merchant Permissions
  const merchantId = activeChat?.deal?.merchant?.userId || activeChat?.property?.merchant?.userId;
  const isMerchantOwner = !!merchantId && user?.id === merchantId;
  const canAddAddon = isMerchantOwner && (!!activeChat?.dealId || !!activeChat?.propertyId);

  // Header Labels
  const headerLabel = isMerchant
    ? (otherParticipant?.name || "Guest")
    : (detectedMerchantName || otherParticipant?.name || title || "Merchant");
  const headerContext = activeChat?.deal?.title || activeChat?.property?.name || subtitle || null;

  return (
    <div className="flex flex-col h-full bg-white relative">
      <ChatHeader
        customerName={headerLabel}
        contextName={headerContext}
        isConnected={true}
        isOnline={isOnline}
        onBack={showBack ? onBack : undefined}
      />

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 hover:bg-slate-100 rounded-full transition-colors border-none cursor-pointer text-slate-400 bg-transparent z-30"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      )}

      <PinnedAddons
        dealLock={activeChat?.dealLock}
        accommodationLock={activeChat?.accommodationLock}
      />

      {/* Addon Form Overlay */}
      <AnimatePresence>
        {showAddonForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-xs bg-[#0e2a47] rounded-3xl p-6 shadow-2xl text-white">
              <h3 className="text-lg font-bold mb-1">Add Custom Extra</h3>
              <p className="text-white/60 text-xs mb-5">This will update the total lock price.</p>

              <form onSubmit={handleAddAddon} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Addon Name</label>
                    <input name="name" type="text" required placeholder="e.g. Early Check-in" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2dd4af] transition-all text-white border-none" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Price (USD)</label>
                    <input name="price" type="number" required step="0.01" placeholder="0.00" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2dd4af] transition-all text-white border-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1">Details (Optional)</label>
                  <textarea name="details" rows={2} placeholder="Any specifics..." className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#2dd4af] transition-all text-white resize-none border-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddonForm(false)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-all border-none cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isAddonProcessing} className="flex-1 py-2.5 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] font-bold rounded-xl text-xs transition-all shadow-lg border-none cursor-pointer">
                    {isAddonProcessing ? "Adding..." : "Add to Lock"}
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
        activeChatMembers={activeChat?.members || []}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
      />

      <div className="px-4 py-3 border-t bg-white flex items-center gap-3 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.01)]">
        {canAddAddon && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => setShowAddonForm(true)}
            className="w-10 h-10 bg-[#2dd4af]/10 text-[#2dd4af] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </motion.button>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend(e);
          }}
          placeholder="Type your message..."
          className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-[#2dd4af] outline-none transition-all duration-300"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="w-10 h-10 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] hover:text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shrink-0 border-none cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </motion.button>
      </div>
    </div>
  );
};

export default ChatWindow;
