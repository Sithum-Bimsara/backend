import { Prisma } from "@prisma/client";

/**
 * ─── Chat Room Detailed ───
 */

export const chatRoomDetailedInclude = Prisma.validator<Prisma.ChatRoomInclude>()({
  dealLock: { 
    select: { 
      id: true, 
      status: true, 
      userId: true, 
      customAddons: true, 
      user: { select: { name: true, email: true } },
      deal: { 
        select: { 
          title: true,
          merchantId: true, 
          merchant: { 
            select: { 
              businessName: true,
              user: { select: { id: true, name: true, email: true } } 
            } 
          } 
        } 
      } 
    } 
  },
  accommodationLock: { 
    select: { 
      id: true, 
      status: true, 
      userId: true, 
      customAddons: true, 
      user: { select: { name: true, email: true } },
      property: { 
        select: { 
          name: true,
          merchantId: true, 
          merchant: { 
            select: { 
              businessName: true,
              user: { select: { id: true, name: true, email: true } } 
            } 
          } 
        } 
      } 
    } 
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          isMerchant: true,
          isTraveller: true,
        },
      },
    },
  },
});

export type ChatRoomDetailed = Prisma.ChatRoomGetPayload<{
  include: typeof chatRoomDetailedInclude;
}>;

/**
 * ─── Message With Sender ───
 */

export const messageWithSenderInclude = Prisma.validator<Prisma.MessageInclude>()({
  sender: { 
    select: { 
      id: true, 
      name: true, 
      isAdmin: true,
      merchantProfile: { select: { businessName: true } }
    } 
  },
  readBy: true,
});

export type MessageWithSender = Prisma.MessageGetPayload<{
  include: typeof messageWithSenderInclude;
}>;

/**
 * ─── Chat Room Summary (Sidebar) ───
 */

export const chatRoomSummaryInclude = (userId: string): Prisma.ChatRoomInclude => ({
  deal: { select: { id: true, title: true } },
  property: { select: { id: true, name: true } },
  dealLock: { select: { id: true, status: true, userId: true, customAddons: true } },
  accommodationLock: { select: { id: true, status: true, userId: true, customAddons: true } },
  messages: {
    take: 1,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      sender: { select: { id: true, name: true } },
    },
  },
  members: {
    select: {
      user: {
        select: {
          id: true,
          name: true,
          isAdmin: true,
          isMerchant: true,
          merchantProfile: { select: { businessName: true } },
        },
      },
    },
  },
  _count: {
    select: {
      messages: {
        where: {
          senderId: { not: userId },
          readBy: { none: { userId } },
        },
      },
    },
  },
});

export type ChatRoomSummary = Prisma.ChatRoomGetPayload<{
  include: ReturnType<typeof chatRoomSummaryInclude>;
}> & { unreadCount?: number };

/**
 * ─── Custom Addon Detailed ───
 */

export const customAddonDetailedInclude = Prisma.validator<Prisma.CustomAddonInclude>()({
  dealLock: { 
    include: { 
      deal: true,
      chatRooms: true
    } 
  },
  accommodationLock: { 
    include: { 
      property: true,
      chatRooms: true
    } 
  }
});

export type CustomAddonDetailed = Prisma.CustomAddonGetPayload<{
  include: typeof customAddonDetailedInclude;
}>;
