import { prisma } from "../../config/prisma";
import { getSriLankaTime } from "../../utils/timezone";
import { 
  ChatRoomDetailed, 
  MessageWithSender, 
  ChatRoomSummary, 
  CustomAddonDetailed,
  chatRoomDetailedInclude,
  messageWithSenderInclude,
  chatRoomSummaryInclude,
  customAddonDetailedInclude
} from "./chat.types";

/**
 * Finds an existing chat room for a SPECIFIC traveller + deal/property combo.
 */
export const findExistingChat = async (
  userId: string,
  dealLockId?: string,
  accommodationLockId?: string
): Promise<ChatRoomDetailed | null> => {
  return prisma.chatRoom.findFirst({
    where: {
      dealLockId: dealLockId ?? undefined,
      accommodationLockId: accommodationLockId ?? undefined,
      members: {
        some: { userId },
      },
    },
    include: chatRoomDetailedInclude,
  });
};

export const createChatWithMembers = async (
  roomData: { 
    dealId?: string; 
    propertyId?: string;
    dealLockId?: string;
    accommodationLockId?: string;
  },
  userIds: string[]
) => {
  return prisma.$transaction(async (tx) => {
    const room = await tx.chatRoom.create({
      data: {
        dealId: roomData.dealId ?? null,
        propertyId: roomData.propertyId ?? null,
        dealLockId: roomData.dealLockId ?? null,
        accommodationLockId: roomData.accommodationLockId ?? null,
        createdAt: getSriLankaTime(),
        updatedAt: getSriLankaTime(),
        lastMessageAt: getSriLankaTime(),
      },
    });

    await tx.chatMember.createMany({
      data: userIds.map((userId) => ({ 
        chatRoomId: room.id, 
        userId, 
        joinedAt: getSriLankaTime() 
      })),
      skipDuplicates: true,
    });

    return room;
  });
};

export const addMembers = async (chatRoomId: string, userIds: string[]) => {
  return prisma.chatMember.createMany({
    data: userIds.map((userId) => ({ 
      chatRoomId, 
      userId, 
      joinedAt: getSriLankaTime() 
    })),
    skipDuplicates: true,
  });
};

export const findChatById = async (chatRoomId: string, userId: string): Promise<ChatRoomDetailed | null> => {
  return prisma.chatRoom.findFirst({
    where: {
      id: chatRoomId,
      members: { some: { userId } },
    },
    include: chatRoomDetailedInclude,
  });
};

export const getMessages = async (chatRoomId: string, cursor?: string, limit = 15): Promise<MessageWithSender[]> => {
  return prisma.message.findMany({
    where: { chatRoomId },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    include: messageWithSenderInclude,
  });
};

export const saveMessage = async (chatRoomId: string, senderId: string, content: string): Promise<MessageWithSender> => {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { chatRoomId, senderId, content, createdAt: getSriLankaTime() },
      include: messageWithSenderInclude,
    }),
    prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { 
        lastMessageAt: getSriLankaTime(),
        updatedAt: getSriLankaTime() 
      },
    }),
  ]);
  return message;
};

export const markAsRead = async (messageIds: string[], userId: string) => {
  return prisma.messageRead.createMany({
    data: messageIds.map((id) => ({ messageId: id, userId, readAt: getSriLankaTime() })),
    skipDuplicates: true,
  });
};

export const getAllPlatformChats = async (userId: string): Promise<ChatRoomSummary[]> => {
  return prisma.chatRoom.findMany({
    where: {
      messages: { some: {} },
    },
    include: chatRoomSummaryInclude(userId),
    orderBy: { lastMessageAt: "desc" },
  });
};

export const getUserChats = async (userId: string): Promise<ChatRoomSummary[]> => {
  return prisma.chatRoom.findMany({
    where: {
      members: { some: { userId } },
      messages: { some: {} },
    },
    include: chatRoomSummaryInclude(userId),
    orderBy: { lastMessageAt: "desc" },
  });
};

/**
 * Fetches a single chat room in the same shape as the sidebar list (ChatRoomSummary).
 * Used to emit the full room payload to participants after a new room is created.
 */
export const findChatRoomSummaryById = async (chatRoomId: string, userId: string): Promise<ChatRoomSummary> => {
  return prisma.chatRoom.findUniqueOrThrow({
    where: { id: chatRoomId },
    include: chatRoomSummaryInclude(userId),
  });
};

export const createCustomAddonAndUpdateLock = async (data: {
  name: string;
  price: number;
  details?: string;
  dealLockId?: string | null;
  accommodationLockId?: string | null;
}) => {
  return prisma.$transaction([
    prisma.customAddon.create({
      data: {
        ...data,
        addedAt: getSriLankaTime(),
      },
    }),
    ...(data.dealLockId ? [
      prisma.dealLock.update({
        where: { id: data.dealLockId },
        data: { updatedAt: getSriLankaTime() },
      }),
    ] : []),
    ...(data.accommodationLockId ? [
      prisma.accommodationLock.update({
        where: { id: data.accommodationLockId },
        data: { updatedAt: getSriLankaTime() },
      }),
    ] : []),
  ]);
};

export const getCustomAddonWithRelations = async (addonId: string): Promise<CustomAddonDetailed | null> => {
  return prisma.customAddon.findUnique({
    where: { id: addonId },
    include: customAddonDetailedInclude,
  });
};

export const deleteCustomAddonAndUpdateLock = async (addonId: string, lockData: {
  dealLockId?: string | null;
  accommodationLockId?: string | null;
}) => {
  return prisma.$transaction([
    prisma.customAddon.delete({ where: { id: addonId } }),
    ...(lockData.dealLockId ? [
      prisma.dealLock.update({
        where: { id: lockData.dealLockId },
        data: { updatedAt: getSriLankaTime() },
      }),
    ] : []),
    ...(lockData.accommodationLockId ? [
      prisma.accommodationLock.update({
        where: { id: lockData.accommodationLockId },
        data: { updatedAt: getSriLankaTime() },
      }),
    ] : []),
  ]);
};

export const getMessageCount = async (chatRoomId: string): Promise<number> => {
  return prisma.message.count({ where: { chatRoomId } });
};

export const getUnreadMessageCount = async (chatRoomId: string, userId: string) => {
  return prisma.message.count({
    where: {
      chatRoomId,
      senderId: { not: userId },
      readBy: { none: { userId } },
    },
  });
};

