import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { 
  SendBookingTicketEmailInput, 
  SendAccommodationBookingEmailInput,
  SendChatNotificationEmailInput,
  SendAdminChatInitiationEmailInput
} from '../modules/email/email.service';

export type NotificationJobData = 
  | { type: 'deal-updated'; dealId: string }
  | { type: 'booking-ticket'; data: SendBookingTicketEmailInput }
  | { type: 'accommodation-confirmation'; data: SendAccommodationBookingEmailInput }
  | { type: 'chat-notification'; data: SendChatNotificationEmailInput }
  | { type: 'admin-chat-initiation'; data: SendAdminChatInitiationEmailInput };

export const notificationQueue = new Queue('notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const enqueueDealUpdatedNotification = async (dealId: string) => {
  try {
    await notificationQueue.add('deal-updated', { type: 'deal-updated', dealId });
    console.log(`[Queue] Notification enqueued for deal update: ${dealId}`);
  } catch (err) {
    console.error(`[Queue] Failed to enqueue notification for ${dealId}:`, err);
  }
};

export const enqueueBookingTicketJob = async (data: SendBookingTicketEmailInput) => {
  try {
    await notificationQueue.add('booking-ticket', { type: 'booking-ticket', data });
  } catch (err) {
    console.error(`[Queue] Failed to enqueue booking ticket for ${data.bookingId}:`, err);
  }
};

export const enqueueStayConfirmationJob = async (data: SendAccommodationBookingEmailInput) => {
  try {
    await notificationQueue.add('accommodation-confirmation', { type: 'accommodation-confirmation', data });
  } catch (err) {
    console.error(`[Queue] Failed to enqueue stay confirmation for ${data.bookingId}:`, err);
  }
};

export const enqueueChatNotification = async (data: SendChatNotificationEmailInput) => {
  try {
    const jobId = `chat-notif:${data.chatId}:${data.recipientEmail}`;
    
    // ── Latest Message Wins ──
    // We look for an existing pending job. If found, we remove it.
    // This allows the new job to reset the 5-minute timer and update the content.
    const existingJob = await notificationQueue.getJob(jobId);
    if (existingJob) {
      await existingJob.remove();
      console.log(`[Queue] Updated pending chat notification for ${data.recipientEmail} in chat ${data.chatId}`);
    }

    await notificationQueue.add('chat-notification', { type: 'chat-notification', data }, { 
      jobId, 
      delay: 5 * 60 * 1000, // Reset the 5-minute "Grace Period" buffer
    });
  } catch (err) {
    console.error(`[Queue] Failed to enqueue chat notification for ${data.recipientEmail}:`, err);
  }
};

/**
 * Removes a pending chat notification from the queue.
 * Used when a user comes online/joins the chat room before the grace period ends.
 */
export const cancelChatNotification = async (chatId: string, recipientEmail: string) => {
  try {
    const jobId = `chat-notif:${chatId}:${recipientEmail}`;
    const job = await notificationQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`[Queue] Cancelled pending chat notification for ${recipientEmail} in chat ${chatId}`);
    }
  } catch (err) {
    console.error(`[Queue] Failed to cancel chat notification:`, err);
  }
};

export const enqueueAdminChatInitiation = async (data: SendAdminChatInitiationEmailInput) => {
  try {
    const jobId = `admin-chat-init:${data.chatId}:${data.recipientEmail}`;
    await notificationQueue.add('admin-chat-initiation', { type: 'admin-chat-initiation', data }, { jobId });
  } catch (err) {
    console.error(`[Queue] Failed to enqueue admin chat initiation for ${data.recipientEmail}:`, err);
  }
};
