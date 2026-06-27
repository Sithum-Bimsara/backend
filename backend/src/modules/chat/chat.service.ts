import * as chatRepository from "./chat.repository";
import { getLockForChatContext as getDealLockForChat } from "../deals/services/deal-lock.service";
import { getLockForChatContext as getAccommodationLockForChat } from "../accommodation/services/accommodation-lock.service";
import { getUserIsAdmin, getAdmins } from "../user-profile/user-profile.service";
import { enqueueChatNotification, enqueueAdminChatInitiation, cancelChatNotification } from "../../queues/notificationQueue";
import { emitToRoom, isUserInRoom, emitToUser } from "./chat.io";
import { ChatRoomDetailed, ChatRoomSummary, MessageWithSender } from "./chat.types";
import { MerchantVerificationStatus, LockStatus } from "./chat.enums";
import { NotFoundException } from "../../exceptions/not-found.exception";
import { BadRequestException } from "../../exceptions/bad-request.exception";
import { UnauthorizedException } from "../../exceptions/unauthorized.exception";

/**
 * Initiates a chat room for a specific lock (deal or accommodation).
 * If a chat already exists, returns it. Otherwise, creates a new one with participants.
 */
export const initiateChat = async (
  userId: string,
  dealLockId?: string,
  accommodationLockId?: string
): Promise<ChatRoomDetailed | null> => {
  // 1. Check if chat already exists for this specific lock
  let chat = await chatRepository.findExistingChat(userId, dealLockId, accommodationLockId);

  if (!chat) {
    // 2. Resolve participants and context
    const admins = await getAdmins();
    const adminIds = admins.map(a => a.id);

    let merchantUserId: string | null = null;
    let travellerUserId: string | null = null;
    let finalDealId: string | undefined;
    let finalPropertyId: string | undefined;

    // If initiated from a specific lock, pull info securely through service boundaries
    if (dealLockId) {
      const lock = await getDealLockForChat(dealLockId, userId);
      merchantUserId = lock?.deal?.merchant.userId ?? null;
      travellerUserId = lock?.userId ?? null;
      finalDealId = lock?.dealId ?? undefined;
    } else if (accommodationLockId) {
      const lock = await getAccommodationLockForChat(accommodationLockId, userId);
      merchantUserId = lock?.property?.merchant.userId ?? null;
      travellerUserId = lock?.userId ?? null;
      finalPropertyId = lock?.propertyId ?? undefined;
    }

    // 3. Create room and add members
    const participants = new Set([userId, ...adminIds]);
    if (merchantUserId) participants.add(merchantUserId);
    if (travellerUserId) participants.add(travellerUserId);

    const room = await chatRepository.createChatWithMembers(
      {
        dealId: finalDealId,
        propertyId: finalPropertyId,
        dealLockId,
        accommodationLockId
      },
      Array.from(participants)
    );

    // 4. Fetch again with full member data
    chat = await chatRepository.findChatById(room.id, userId);

    // 5. Notify all admins about the new chat initiation
    if (chat) {
      const traveller = chat.dealLock?.user || chat.accommodationLock?.user;
      const merchant = chat.dealLock?.deal?.merchant?.user || chat.accommodationLock?.property?.merchant?.user;
      const businessName = chat.dealLock?.deal?.merchant?.businessName || chat.accommodationLock?.property?.merchant?.businessName;
      const contextName = chat.dealLock?.deal?.title || chat.accommodationLock?.property?.name;
      const contextType = chat.dealLock ? 'deal' : 'accommodation';

      if (traveller && merchant && contextName) {
        console.log(`[ChatService] Notifying ${admins.length} admins about new chat initiation: ${chat.id}`);
        for (const admin of admins) {
          if (admin.email) {
            await enqueueAdminChatInitiation({
              recipientEmail: admin.email,
              travellerName: traveller.name,
              travellerEmail: traveller.email,
              merchantName: merchant.name,
              merchantEmail: merchant.email,
              businessName,
              contextType: contextType as 'deal' | 'accommodation',
              contextName,
              chatId: chat.id
            });
          }
        }
      }
    }
  }

  return chat;
};

/**
 * Adds a custom addon to a chat session.
 * Only verified merchants who own the lock can perform this action.
 */
export const addCustomAddon = async (
  chatRoomId: string,
  merchantUserId: string,
  addon: { name: string; price: number; details?: string },
  verificationStatus?: string,
  merchantProfileId?: string
): Promise<MessageWithSender> => {
  if (verificationStatus !== MerchantVerificationStatus.VERIFIED) {
    throw new BadRequestException("Only verified merchants can add addons. Please complete your verification process.");
  }

  // 1. Verify chat and find the associated lock
  const chat = await chatRepository.findChatById(chatRoomId, merchantUserId);
  if (!chat) throw new NotFoundException("Chat room not found or unauthorized");

  const lockId = chat.dealLockId || chat.accommodationLockId;
  if (!lockId) throw new BadRequestException("This chat is not associated with an active lock");

  // Check if this merchant owns the lock
  const merchantIdFromLock = chat.dealLock?.deal?.merchantId || chat.accommodationLock?.property?.merchantId;
  if (merchantProfileId && merchantIdFromLock && merchantIdFromLock !== merchantProfileId) {
    throw new UnauthorizedException("Security Alert: You do not have permission to modify this booking lock.");
  }

  // 2. Create the new addon record and update lock
  await chatRepository.createCustomAddonAndUpdateLock({
    name: addon.name,
    price: addon.price,
    details: addon.details,
    dealLockId: chat.dealLockId,
    accommodationLockId: chat.accommodationLockId
  });

  // 3. Send a system message to the chat
  const content = `📢 [System] Merchant added a custom addon: "${addon.name}" for $${addon.price}${addon.details ? ` (${addon.details})` : ""}. Total price will be updated accordingly.`;
  return sendMessage(chatRoomId, merchantUserId, content, chat);
};

/**
 * Removes a custom addon from a chat session.
 */
export const removeCustomAddon = async (
  chatRoomId: string,
  addonId: string,
  merchantUserId: string,
  verificationStatus?: string,
  merchantProfileId?: string
): Promise<MessageWithSender> => {
  if (verificationStatus !== MerchantVerificationStatus.VERIFIED) {
    throw new BadRequestException("Only verified merchants can remove addons. Please complete your verification process.");
  }

  // 1. Fetch addon with relations
  const addon = await chatRepository.getCustomAddonWithRelations(addonId);
  if (!addon) throw new NotFoundException("Addon not found");

  // Safely resolve the associated lock and chat room
  const dealLock = addon.dealLock;
  const accommodationLock = addon.accommodationLock;
  const chatRoomFromAddon = (dealLock?.chatRooms?.[0] || accommodationLock?.chatRooms?.[0]) as { id: string } | null | undefined;

  if (!chatRoomFromAddon || chatRoomFromAddon.id !== chatRoomId) {
    throw new BadRequestException("Security Alert: This addon does not belong to the specified chat room.");
  }

  // Check ownership
  const merchantIdFromLock = dealLock?.deal?.merchantId || accommodationLock?.property?.merchantId;
  if (merchantProfileId && merchantIdFromLock !== merchantProfileId) {
    throw new UnauthorizedException("Security Alert: You do not have permission to modify this booking lock.");
  }

  const status = (dealLock?.status || accommodationLock?.status) as string;
  if (status === LockStatus.CONVERTED) {
    throw new BadRequestException("Action Denied: Cannot remove addon because this lock has already been converted to a confirmed booking.");
  }

  if (addon.dealBookingId || addon.accommodationBookingId) {
    throw new BadRequestException("Critical Error: This addon is already part of a finalized booking and cannot be removed.");
  }

  // 2. Delete and update lock
  await chatRepository.deleteCustomAddonAndUpdateLock(addonId, {
    dealLockId: addon.dealLockId,
    accommodationLockId: addon.accommodationLockId
  });

  // 3. Send system message
  const content = `📢 [System] Merchant removed the custom addon: "${addon.name}". Total price has been updated accordingly.`;
  const chat = await chatRepository.findChatById(chatRoomId, merchantUserId);
  return sendMessage(chatRoomId, merchantUserId, content, chat);
};

/**
 * Retrieves messages for a chat room with pagination.
 */
export const getMessages = async (chatRoomId: string, userId: string, cursor?: string): Promise<MessageWithSender[]> => {
  const isAdmin = await getUserIsAdmin(userId);
  const chat = await chatRepository.findChatById(chatRoomId, userId);
  if (!chat && !isAdmin) throw new UnauthorizedException("Unauthorized or chat not found");
  return chatRepository.getMessages(chatRoomId, cursor);
};

/**
 * Sends a message to a chat room and notifies other participants.
 */
export const sendMessage = async (
  chatRoomId: string,
  senderId: string,
  content: string,
  existingChat?: ChatRoomDetailed | null
): Promise<MessageWithSender> => {
  let chat = existingChat;

  if (!chat) {
    const isAdmin = await getUserIsAdmin(senderId);
    chat = await chatRepository.findChatById(chatRoomId, senderId);

    if (!chat && isAdmin) {
      await chatRepository.addMembers(chatRoomId, [senderId]);
      chat = await chatRepository.findChatById(chatRoomId, senderId);
    }
  }

  if (!chat) throw new NotFoundException("Unauthorized or chat room not found");

  const message = await chatRepository.saveMessage(chatRoomId, senderId, content);

  emitToRoom(chatRoomId, "new_message", {
    ...message,
    chatRoomId,
  });

  // ── First-message detection: push new_chat_room to all participants' sidebars ──
  // This is the WhatsApp pattern — the sidebar card only appears when the first
  // real message is sent, not when the room is silently created by initiateChat.
  //
  // IMPORTANT: We emit unreadCount: 0 for everyone here.
  // The new_message event (emitted just below via emitToRoom / emitToUser)
  // is the single source of truth for unread counts. handleGlobalNewMessage
  // on the frontend increments it to 1. Emitting 1 here would cause a
  // double-count (card shows 2 for the very first message).
  try {
    const totalMessages = await chatRepository.getMessageCount(chatRoomId);
    if (totalMessages === 1) {
      const roomSummary = await chatRepository.findChatRoomSummaryById(chatRoomId, senderId);
      for (const member of chat.members) {
        const participantId = member.userId;
        if (!participantId) continue;
        emitToUser(participantId, "new_chat_room", {
          ...roomSummary,
          lastMessage: roomSummary.messages?.[0] || null,
          unreadCount: 0
        });
      }
      console.log(`[ChatService] First message in room ${chatRoomId} — emitted new_chat_room to ${chat.members.length} participants`);
    }
  } catch (firstMsgErr) {
    // Non-fatal — sidebar will still update on next fetch
    console.error("[ChatService] Failed to emit new_chat_room on first message:", firstMsgErr);
  }

  // Target only the "other" side (Merchant/Traveller)
  // Admins sending messages notify both sides.
  const merchantUserId = chat.dealLock?.deal?.merchant?.user?.id || chat.accommodationLock?.property?.merchant?.user?.id;
  const travellerUserId = chat.dealLock?.userId || chat.accommodationLock?.userId;

  const sender = chat.members.find(m => m.userId === senderId)?.user;
  let recipientIds: string[] = [];

  if (sender?.isAdmin) {
    // Admin sends to both Merchant and Traveller
    if (merchantUserId) recipientIds.push(merchantUserId);
    if (travellerUserId) recipientIds.push(travellerUserId);
  } else if (senderId === merchantUserId) {
    // Merchant sends to Traveller
    if (travellerUserId) recipientIds.push(travellerUserId);
  } else if (senderId === travellerUserId) {
    // Traveller sends to Merchant
    if (merchantUserId) recipientIds.push(merchantUserId);
  }

  // Remove sender from recipients and get unique IDs
  const uniqueRecipients = [...new Set(recipientIds.filter(id => id !== senderId))];

  for (const recipientId of uniqueRecipients) {
    const member = chat.members.find(m => m.userId === recipientId);
    if (!member || member.user?.isAdmin) continue; // Never notify admins via email

    const isOnline = await isUserInRoom(chatRoomId, recipientId);
    if (isOnline) continue;

    const email = member.user?.email;
    if (email) {
      console.log(`[ChatService] User ${recipientId} is offline. Queuing email notification to ${email}`);
      await enqueueChatNotification({
        chatId: chatRoomId,
        messageContent: content,
        senderName: message.sender.name,
        recipientEmail: email,
        recipientName: member.user?.name,
      });
    }

    // Also emit to the recipient's personal room for sidebar updates
    emitToUser(recipientId, "new_message", { ...message, chatRoomId });
  }

  return message;
};

/**
 * Marks specific messages as read by a user.
 */
export const markAsRead = async (chatRoomId: string, userId: string, messageIds: string[]) => {
  const isAdmin = await getUserIsAdmin(userId);
  const chat = await chatRepository.findChatById(chatRoomId, userId);
  if (!chat && !isAdmin) throw new UnauthorizedException("Unauthorized access to chat room.");

  const result = await chatRepository.markAsRead(messageIds, userId);

  // ── Cancel on Read ──
  // If the user has marked messages as read, they are active in the room.
  // We should cancel any pending "offline" email notifications for them.
  const userEmail = chat?.members.find(m => m.userId === userId)?.user?.email;
  if (userEmail) {
    await cancelChatNotification(chatRoomId, userEmail);
  }

  emitToRoom(chatRoomId, "messages_read", {
    chatRoomId,
    userId,
    messageIds
  });

  return result;
};

/**
 * Retrieves all chat rooms for a user with unread counts.
 */
export const getMyChats = async (userId: string): Promise<ChatRoomSummary[]> => {
  const isAdmin = await getUserIsAdmin(userId);
  let chats: ChatRoomSummary[];

  if (isAdmin) {
    chats = await chatRepository.getAllPlatformChats(userId);
  } else {
    chats = await chatRepository.getUserChats(userId);
  }

  return chats.map(chat => ({
    ...chat,
    unreadCount: chat._count?.messages || 0,
    lastMessage: chat.messages?.[0] || null
  }));
};

