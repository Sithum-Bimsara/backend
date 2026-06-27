import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import * as aiService from '../modules/ai/ai-recommendation.service';
import { releaseExpiredLocks } from '../modules/deals/repositories/deal-lock.repository';

/**
 * SYSTEM WORKER
 * Handles: Trending pool refresh AND expired lock releases.
 */
export const systemWorker = new Worker(
  'system',
  async (job: Job) => {
    const { id, name } = job;

    // 1. IDEMPOTENCY GUARD: Prevent double execution of the exact same job instance
    const lockKey = `processed:system:${id}`;
    const isNew = await redisConnection.set(lockKey, '1', 'EX', 3600, 'NX'); // 1 hour TTL
    if (!isNew) {
      console.log(`[Worker:System] Skipping already processed job: ${id}`);
      return;
    }

    console.log(`[Worker:System] Executing Job:${id} | Name:${name}`);

    try {
      if (name === 'refresh-trending-pool') {
        await aiService.getTrendingDealsCandidatePool();
      }
      else if (name === 'release-expired-locks') {
        await releaseExpiredLocks();
      }
      else {
        console.warn(`[Worker:System] Unknown job name: ${name}`);
      }
    } catch (error) {
      console.error(`[Worker:System] Error in Job:${id}`, error);
      // Remove lock on failure to allow retry if configured
      await redisConnection.del(lockKey);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1 // Crucial for 2GB VPS & DB safety
  }
);

systemWorker.on('failed', (job, err) => {
  console.error(`[Worker:System] FAILED Job:${job?.id} | Error: ${err.message}`);
});
