import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import * as repo from '../modules/deals/repositories/deals.repository';
import * as aiService from '../modules/ai/ai-recommendation.service';
import { enqueueRecommendationJob } from '../queues/recommendationQueue';

/**
 * VIEW TRACKING WORKER
 * Handles: Async logging of deal views and AI interest signal propagation.
 */
export const viewTrackingWorker = new Worker(
  'viewTracking',
  async (job: Job<{ userId: string | null; dealId: string }>) => {
    const { id } = job;
    const { userId, dealId } = job.data;

    // 1. IDEMPOTENCY GUARD: Prevent double-counting the exact same job instance
    const lockKey = `processed:view:${id}`;
    const isNew = await redisConnection.set(lockKey, '1', 'EX', 3600, 'NX');
    if (!isNew) {
      console.log(`[Worker:ViewTracking] Skipping duplicate job instance: ${id}`);
      return;
    }

    try {
      console.log(`[Worker:ViewTracking] Processing Signal | Deal:${dealId} | User:${userId ?? 'Guest'}`);

      // 2. Log the view event (includes deduplication logic inside the repo)
      const viewEvent = await repo.createDealViewEvent({ userId, dealId });
      
      // If viewEvent is null, it means it's a rapid duplicate view flagged by the query layer
      const shouldApplySignals = userId ? Boolean(viewEvent) : true;

      if (shouldApplySignals) {
        // 3. Atomically propagate AI signals
        await Promise.all([
          aiService.incrementDealStats(dealId, 'view'),
          userId ? aiService.updateUserInterestFromDeal(userId, dealId, 1) : Promise.resolve(),
          userId ? enqueueRecommendationJob(userId) : Promise.resolve(),
        ]);
        
        console.log(`[Worker:ViewTracking] AI Signals Propagated | Deal:${dealId}`);
      }
    } catch (error) {
      console.error(`[Worker:ViewTracking] Error Job:${id}`, error);
      // Delete lock on failure to allow BullMQ retries
      await redisConnection.del(lockKey);
      throw error;
    }
  },
  { 
    connection: redisConnection,
    concurrency: 3 // Optimized for I/O bound DB writes
  }
);

viewTrackingWorker.on('failed', (job, err) => {
  console.error(`[Worker:ViewTracking] FAILED Job:${job?.id} | Error: ${err.message}`);
});
