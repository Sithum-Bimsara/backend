import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import * as aiService from '../modules/ai/ai-recommendation.service';
import { enqueueRecommendationJob } from '../queues/recommendationQueue';

/**
 * INTERACTION TRACKING WORKER
 * Handles: Async logging of deal/property interactions (locks/bookings) and AI interest signal propagation.
 */
export const interactionTrackingWorker = new Worker(
  'interactionTracking',
  async (job: Job<
    | { type: 'deal'; interaction: 'lock' | 'booking'; userId: string; dealId: string } 
    | { type: 'accommodation'; interaction: 'lock' | 'booking'; userId: string; propertyId: string }
  >) => {
    const { userId, interaction } = job.data;
    const score = interaction === 'lock' ? 5 : 10;

    try {
      if (job.data.type === 'deal') {
        const { dealId } = job.data;
        console.log(`[Worker:InteractionTracking] Processing Deal ${interaction} | Deal:${dealId} | User:${userId}`);
        await Promise.all([
          aiService.incrementDealStats(dealId, interaction),
          aiService.updateUserInterestFromDeal(userId, dealId, score),
          enqueueRecommendationJob(userId),
        ]);
      } else {
        const { propertyId } = job.data;
        console.log(`[Worker:InteractionTracking] Processing Acc ${interaction} | Property:${propertyId} | User:${userId}`);
        await Promise.all([
          aiService.incrementPropertyStats(propertyId, interaction),
          // TODO: Add updateUserInterestFromProperty if needed
          enqueueRecommendationJob(userId),
        ]);
      }
      
      console.log(`[Worker:InteractionTracking] AI Signals Propagated | User:${userId}`);
    } catch (error) {
      console.error(`[Worker:InteractionTracking] Error Job:${job.id}`, error);
      throw error;
    }
  },
  { 
    connection: redisConnection,
    concurrency: 5
  }
);

interactionTrackingWorker.on('failed', (job, err) => {
  console.error(`[Worker:InteractionTracking] FAILED Job:${job?.id} | Error: ${err.message}`);
});
