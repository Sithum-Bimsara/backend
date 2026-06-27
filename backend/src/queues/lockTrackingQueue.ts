import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const interactionTrackingQueue = new Queue('interactionTracking', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  },
});

export type InteractionType = 'lock' | 'booking';

/**
 * Enqueues a non-blocking interaction tracking job.
 * Handles AI stats and interest propagation for locks and bookings.
 */
export const enqueueInteractionTrackingJob = async (data: 
  | { type: 'deal'; interaction: InteractionType; userId: string; dealId: string }
  | { type: 'accommodation'; interaction: InteractionType; userId: string; propertyId: string }
) => {
  try {
    await interactionTrackingQueue.add(
      'process-interaction',
      data,
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  } catch (err) {
    const id = data.type === 'deal' ? data.dealId : data.propertyId;
    console.error(`[Queue:InteractionTracking] Failed to enqueue for ${data.type}:${id}:`, err);
  }
};
