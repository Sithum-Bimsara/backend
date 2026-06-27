import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const viewTrackingQueue = new Queue('viewTracking', {
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

/**
 * Enqueues a non-blocking view tracking job.
 * Uses a debounced ID to prevent redundant writes from rapid rapid navigation.
 */
export const enqueueViewTrackingJob = async (data: { 
  userId?: string | null; 
  dealId: string;
}) => {
  const { userId, dealId } = data;
  
  // Job ID for debouncing (unique to user-deal pair or guest-deal pair)
  const debounceKey = userId ? `view-${userId}-${dealId}` : `view-guest-${dealId}-${Date.now()}`;
  
  try {
    await viewTrackingQueue.add(
      'process-view',
      data,
      {
        jobId: userId ? debounceKey : undefined, // Only debounce registered users
        delay: 2000, // 2-second debounce 
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  } catch (err) {
    console.error(`[Queue:ViewTracking] Failed to enqueue for Deal:${dealId}:`, err);
  }
};
