import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { CheckIcon, CheckCheckIcon } from "./ChatIcons";
import { TypingIndicator } from "./ChatLoaders";
import { SystemAddonCard } from "./SystemAddonCard";
import type { IMessage, IMember } from "../types/chat.types";

interface MessageBubbleListProps {
  messages: IMessage[];
  currentUserId: string;
  messagesLoading: boolean;
  loadingMore: boolean;
  someoneTyping: boolean;
  hasMore: boolean;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  activeChatMembers?: IMember[];
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageBubbleList: React.FC<MessageBubbleListProps> = ({
  messages,
  currentUserId,
  messagesLoading,
  loadingMore,
  someoneTyping,
  hasMore: _hasMore,
  onScroll,
  activeChatMembers = [],
  messagesContainerRef,
  messagesEndRef
}) => {
  return (
    <div
      ref={messagesContainerRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto min-h-0 p-5 space-y-4 relative bg-white/50"
    >
      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-[#2dd4af] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {messagesLoading ? (
        <div className="space-y-5 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <div className={`flex flex-col gap-1.5 ${i % 2 === 0 ? "items-end" : "items-start"}`}>
                {i % 2 !== 0 && <div className="animate-pulse bg-slate-200 rounded-full h-3 w-16 mb-1" />}
                <div className={`animate-pulse rounded-2xl ${
                  i % 2 === 0 ? "rounded-tr-none bg-[#0e2a47]/10" : "rounded-tl-none bg-slate-200"
                } h-14 ${
                  i === 1 ? "w-44" : i === 2 ? "w-64" : i === 3 ? "w-36" : i === 4 ? "w-56" : "w-48"
                }`} />
                <div className="animate-pulse bg-slate-200 h-2 w-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender.id === currentUserId;
            const hasRead = (msg.readBy || []).some(r => r.userId === currentUserId);
            const isUnread = !isMe && !hasRead;

            // Mark checkmarks as blue if the target user has read it
            const isReadByTarget = (msg.readBy || []).some(r => {
              if (r.userId === msg.sender.id) return false;
              // Ignore admins in blue check calculations so background admins don't mess up read status
              const member = activeChatMembers.find(m => m.userId === r.userId || m.user?.id === r.userId);
              return member ? !member.user?.isAdmin : true;
            });

            return (
              <motion.div
                key={msg.id}
                data-message-id={msg.id}
                data-unread={isUnread}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: msg.isOptimistic ? 0.65 : 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[68%] px-4 py-3 rounded-2xl shadow-sm ${
                  isMe
                    ? "bg-[#0e2a47] text-white rounded-tr-none"
                    : "bg-slate-100 text-slate-800 rounded-tl-none"
                }`}>
                  {!isMe && (
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-50">
                      {msg.sender?.isAdmin 
                        ? "Admin" 
                        : (msg.sender?.merchantProfile?.businessName ?? msg.sender?.name ?? "User")}
                    </p>
                  )}
                  {msg.content.includes("[System]") ? (
                    <SystemAddonCard content={msg.content} isMe={isMe} />
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">{msg.content}</p>
                  )}
                  <div className={`flex items-center gap-1 mt-1 justify-end ${
                    isMe ? "text-slate-300" : "text-slate-400"
                  }`}>
                    <span className="text-[10px]">
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </span>
                    {isMe && !msg.isOptimistic && (
                      <div className="flex items-center ml-0.5">
                        {isReadByTarget ? (
                          <CheckCheckIcon size={14} className="text-[#34B7F1]" />
                        ) : (
                          <CheckIcon size={14} className="text-slate-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {someoneTyping && <TypingIndicator key="typing" />}
        </AnimatePresence>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
