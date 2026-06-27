/**
 * ─── View Types (Output Only) ───
 * These interfaces represent the data structure coming FROM the backend.
 * They do NOT contain validation logic and are NOT used as input types.
 */

export interface IViewMerchantProfile {
  businessName: string;
}

export interface IViewUser {
  id: string;
  name: string;
  email?: string;
  isAdmin: boolean;
  isMerchant: boolean;
  isTraveller?: boolean;
  merchantProfile?: IViewMerchantProfile | null;
}

export interface IViewMessage {
  id: string;
  content: string;
  chatRoomId: string;
  createdAt: string; // ISO string from backend
  sender: {
    id: string;
    name: string;
    isAdmin: boolean;
    merchantProfile?: IViewMerchantProfile | null;
  };
  readBy?: {
    userId: string;
    readAt: string;
  }[];
}

export interface IViewCustomAddon {
  id: string;
  name: string;
  price: number;
  details?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IViewLockSummary {
  id: string;
  status: string;
  userId: string;
  customAddons: IViewCustomAddon[];
}

export interface IViewEntitySummary {
  id: string;
  title?: string;
  name?: string;
  merchant?: {
    userId: string;
  } | null;
}

export interface IViewChatRoomSummary {
  id: string;
  dealId?: string | null;
  propertyId?: string | null;
  lastMessageAt: string;
  unreadCount: number;
  deal?: IViewEntitySummary | null;
  property?: IViewEntitySummary | null;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; name: string };
  } | null;
  members: {
    user: IViewUser;
  }[];
}

export interface IViewChatRoomDetailed extends IViewChatRoomSummary {
  dealLock?: (IViewLockSummary & { 
    user: { name: string; email: string };
    deal: { title: string; merchant: { businessName: string; user: { id: string; name: string } } };
  }) | null;
  accommodationLock?: (IViewLockSummary & { 
    user: { name: string; email: string };
    property: { name: string; merchant: { businessName: string; user: { id: string; name: string } } };
  }) | null;
}

/**
 * ─── Legacy & Page Direct Types ───
 * Supporting old and new references transparently.
 */

export interface IMember {
  userId?: string;
  user: IViewUser;
}

export interface IMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    isAdmin?: boolean;
    merchantProfile?: IViewMerchantProfile | null;
  };
  readBy: {
    userId: string;
    readAt?: string;
  }[];
  isOptimistic?: boolean;
}

export interface IChatRoom {
  id: string;
  dealId?: string | null;
  propertyId?: string | null;
  lastMessageAt: string;
  unreadCount?: number;
  deal?: IViewEntitySummary | null;
  property?: IViewEntitySummary | null;
  lastMessage?: (IMessage | {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; name: string };
  }) | null;
  members: IMember[];
  dealLockId?: string | null;
  accommodationLockId?: string | null;
  dealLock?: (IViewLockSummary & { 
    user: { name: string; email: string };
    deal: { title: string; merchant: { businessName: string; user: { id: string; name: string } } };
  }) | null;
  accommodationLock?: (IViewLockSummary & { 
    user: { name: string; email: string };
    property: { name: string; merchant: { businessName: string; user: { id: string; name: string } } };
  }) | null;
}

/**
 * ─── Real-time Event Types ───
 */

export interface IViewTypingEvent {
  userId: string;
  isTyping: boolean;
  chatRoomId: string;
}

export interface IViewPresenceUpdateEvent {
  userId: string;
  status: "online" | "offline";
}
