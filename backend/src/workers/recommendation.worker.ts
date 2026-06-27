import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import * as aiService from '../modules/ai/ai-recommendation.service';

/**
 * RECOMMENDATION WORKER
 * Handles: Async recomputation of personalized deal feeds.
 */
export const recommendationWorker = new Worker(
  'recommendationQueue',
  async (job: Job<{ userId: string }>) => {
    const { id } = job;
    const { userId } = job.data;

    // 1. IDEMPOTENCY GUARD: Prevent redundant recomputation
    const lockKey = `processed:recommendation:${id}`;
    const isNew = await redisConnection.set(lockKey, '1', 'EX', 30, 'NX'); // 30 second TTL
    if (!isNew) {
      console.log(`[Worker:Recommendation] Skipping duplicate job: ${id}`);
      return;
    }

    console.log(`[Worker:Recommendation] Processing Job:${id} | User:${userId}`);

    try {
      const scoredDeals = await aiService.getScoredRecommendations(userId, 25);
      if (scoredDeals.length > 0) {
        await aiService.saveUserRecommendations(userId, scoredDeals);
      }
      // Remove lock on success
      await redisConnection.del(lockKey);
    } catch (error) {
      console.error(`[Worker:Recommendation] Error Job:${id}`, error);
      // Remove lock on failure
      await redisConnection.del(lockKey);
      throw error;
    }
  },
  { 
    connection: redisConnection,
    concurrency: 2
  }
);

recommendationWorker.on('failed', (job, err) => {
  console.error(`[Worker:Recommendation] FAILED Job:${job?.id} | Error: ${err.message}`);
});
