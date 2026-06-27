import { motion } from "framer-motion";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
);

export const ChatSkeleton = ({ isMobile, showMobileChat }: { isMobile: boolean, showMobileChat: boolean }) => (
  <div className="flex h-full bg-white overflow-hidden">
    {/* Sidebar Skeleton */}
    <div className={`w-full md:w-80 border-r flex flex-col shrink-0 ${isMobile && showMobileChat ? "hidden" : "flex"}`}>
      <div className="p-5 border-b">
        <Skeleton className="h-7 w-32 mb-4" />
        <Skeleton className="h-8 w-full rounded-full" />
      </div>
      <div className="flex-1 p-4 space-y-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Main Chat Skeleton */}
    <div className={`flex-1 flex flex-col ${isMobile && !showMobileChat ? "hidden" : "flex"}`}>
      <div className="p-4 border-b flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex-1 p-6 space-y-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex flex-col ${i % 2 === 0 ? "items-end" : "items-start"} space-y-2`}>
            <Skeleton className={`h-12 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-2xl ${i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"}`} />
            <Skeleton className="h-2 w-12" />
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  </div>
);

export const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex justify-start my-2"
  >
    <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
    </div>
  </motion.div>
);
