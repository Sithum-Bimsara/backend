import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const recommendationQueue = new Queue('recommendationQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true, // TASK 2
    removeOnFail: true,     // TASK 2
  },
});

export type RecommendationJobSource = "cold-start" | undefined;

/**
 * TASK 2 & 3: Deduplicate and Debounce Jobs Per User
 * Enqueues a debounced recommendation job for a user.
 * Using a consistent jobId prevents duplicate jobs from being queued if one is already pending.
 */
export const enqueueRecommendationJob = async (
  userId: string, 
  options?: { source?: RecommendationJobSource }
) => {
  if (!userId) return;

  const source = options?.source;
  const jobId = `recommendation-${userId}`;
  
  try {
    // Check if the job is already active or waiting to prevent unnecessary overhead
    const existingJob = await recommendationQueue.getJob(jobId);
    
    if (existingJob) {
      const state = await existingJob.getState();
      
      // If this is a high-priority "cold-start", we upgrade any existing pending job
      if (source === "cold-start") {
        if (state === "delayed" || state === "waiting") {
          await existingJob.changePriority({ priority: 1 });
          if (state === "delayed") {
            await existingJob.promote();
          }
          return;
        }
      }

      if (state === 'delayed' || state === 'waiting' || state === 'active') {
        // Job is already in flight or planned, skip adding another
        return;
      }
    }

    await recommendationQueue.add(
      "compute",
      { userId },
      { 
        jobId, 
        priority: source === "cold-start" ? 1 : undefined,
        delay: source === "cold-start" ? 0 : 3000, // 3 seconds debounce for default jobs
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  } catch (err) {
    console.error(`[Queue:Recommendation] Failed to enqueue for ${userId}:`, err);
  }
};

