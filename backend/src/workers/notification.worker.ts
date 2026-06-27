import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import * as dealsRepo from '../modules/deals/repositories/deals.repository';
import {
  sendDealUpdateNotification,
  sendBookingTicketEmail,
  sendAccommodationBookingEmail,
  sendChatNotificationEmail,
  sendAdminChatInitiationEmail
} from '../modules/email/email.service';
import { NotificationJobData } from '../queues/notificationQueue';

/**
 * NOTIFICATION WORKER
 * Handles: Real-time event notifications (e.g., deal updates, booking tickets).
 */
export const notificationWorker = new Worker(
  'notifications',
  async (job: Job<NotificationJobData>) => {
    const { id } = job;
    const jobData = job.data;

    // 1. IDEMPOTENCY GUARD: Prevent double sending of emails
    const lockKey = `processed:notifications:${id}`;
    const isNew = await redisConnection.set(lockKey, '1', 'EX', 86400, 'NX'); // 24 hour TTL
    if (!isNew) {
      console.log(`[Worker:Notifications] Skipping already processed job: ${id}`);
      return;
    }

    try {
      switch (jobData.type) {
        case 'deal-updated': {
          const { dealId } = jobData;
          console.log(`[Worker:Notifications] Dispatching Deal Update | Deal:${dealId}`);
          const deal = await dealsRepo.getDealById(dealId);
          if (!deal) return;

          const lockedUsers = await dealsRepo.getLockedUsersForDeal(dealId);
          for (const user of lockedUsers) {
            await sendDealUpdateNotification({
              recipientEmail: user.email,
              customerName: user.name,
              dealTitle: deal.title || "Untitled Deal",
              dealId: deal.id,
            }).catch(e => console.error(`[Worker:Notifications] Email Error User:${user.email}`, e));
          }
          break;
        }

        case 'booking-ticket': {
          console.log(`[Worker:Notifications] Dispatching Booking Ticket | Booking:${jobData.data.bookingId}`);
          await sendBookingTicketEmail(jobData.data);
          break;
        }

        case 'accommodation-confirmation': {
          console.log(`[Worker:Notifications] Dispatching Stay Confirmation | Booking:${jobData.data.bookingId}`);
          await sendAccommodationBookingEmail(jobData.data);
          break;
        }

        case 'chat-notification': {
          console.log(`[Worker:Notifications] Dispatching Chat Notification | Chat:${jobData.data.chatId} | Recipient:${jobData.data.recipientEmail}`);
          await sendChatNotificationEmail(jobData.data);
          break;
        }

        case 'admin-chat-initiation': {
          console.log(`[Worker:Notifications] Dispatching Admin Chat Initiation | Chat:${jobData.data.chatId}`);
          await sendAdminChatInitiationEmail(jobData.data);
          break;
        }
      }
    } catch (error) {
      console.error(`[Worker:Notifications] Error Job:${id}`, error);
      // Remove lock on failure to allow retry
      await redisConnection.del(lockKey);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5 // Purely I/O bound tasks
  }
);

notificationWorker.on('failed', (job, err) => {
  console.error(`[Worker:Notifications] FAILED Job:${job?.id} | Error: ${err.message}`);
});
