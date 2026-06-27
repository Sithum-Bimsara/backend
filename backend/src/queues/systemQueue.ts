import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const systemQueue = new Queue('system', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});

let systemInitialized = false;

/**
 * Ensures system repeatable jobs are registered correctly and only once.
 * Cleans up old repeatable jobs to prevent duplicates across restarts.
 */
export const initSystemRepeatableJobs = async () => {
  if (systemInitialized) return;

  try {
    // 1. Clean up existing repeatable jobs to ensure a clean slate
    const repeatableJobs = await systemQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await systemQueue.removeRepeatableByKey(job.key);
    }

    // 2. Register fresh repeatable jobs with stable IDs
    // Refresh Trending Pool every 5 mins
    await systemQueue.add('refresh-trending-pool', {}, {
      repeat: { pattern: '*/5 * * * *' },
      jobId: 'system-refresh-trending-pool'
    });

    // Release Expired Locks every 5 mins
    await systemQueue.add('release-expired-locks', {}, {
      repeat: { pattern: '*/5 * * * *' },
      jobId: 'system-release-expired-locks'
    });

    systemInitialized = true;
    console.log('[Queue] System repeatable jobs initialized safely.');
  } catch (err) {
    console.error('[Queue] Failed to initialize system repeatable jobs:', err);
  }
};
