import React from "react";
import { UserIcon } from "./ChatIcons";

interface ChatAvatarProps {
  name: string;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({ 
  name, 
  isActive = false, 
  size = "md" 
}) => {
  const firstLetter = name ? name[0].toUpperCase() : "?";
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };

  return (
    <div className={`rounded-full flex items-center justify-center font-black shrink-0 select-none transition-all duration-300 ${
      sizeClasses[size]
    } ${
      isActive 
        ? "bg-[#2dd4af] text-white shadow-lg shadow-[#2dd4af]/20 scale-105" 
        : "bg-slate-100 text-[#0e2a47]"
    }`}>
      {name ? firstLetter : <UserIcon size={size === "sm" ? 14 : 16} />}
    </div>
  );
};
