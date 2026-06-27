import React, { useRef } from "react";
import { motion } from "framer-motion";
import { SendIcon } from "./ChatIcons";

interface ChatInputBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  isDisabled?: boolean;
  isConnected?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your message...",
  isDisabled = false,
  isConnected = true
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isDisabled || !isConnected) return;
    onSubmit(e);
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 py-3 border-t bg-white flex items-center gap-3 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.01)]"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={isDisabled || !isConnected}
        className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-[#2dd4af] outline-none transition-all duration-300 disabled:opacity-50"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={!value.trim() || isDisabled || !isConnected}
        className="w-10 h-10 bg-[#2dd4af] hover:bg-[#25b898] text-[#0e2a47] hover:text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shrink-0 border-none cursor-pointer"
      >
        <SendIcon size={16} />
      </motion.button>
    </form>
  );
};
