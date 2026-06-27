import { recommendationQueue } from "../src/queues/recommendationQueue";
import { redisConnection } from "../src/config/redis";

async function main() {
  console.log("=== INSPECTING RECOMMENDATION QUEUE ===");
  
  const [waiting, active, delayed, failed] = await Promise.all([
    recommendationQueue.getWaiting(),
    recommendationQueue.getActive(),
    recommendationQueue.getDelayed(),
    recommendationQueue.getFailed(),
  ]);

  console.log(`Waiting jobs: ${waiting.length}`);
  waiting.forEach(j => console.log(`  Job ID: ${j.id} | Data: ${JSON.stringify(j.data)}`));

  console.log(`Active jobs: ${active.length}`);
  active.forEach(j => console.log(`  Job ID: ${j.id} | Data: ${JSON.stringify(j.data)}`));

  console.log(`Delayed jobs: ${delayed.length}`);
  delayed.forEach(j => console.log(`  Job ID: ${j.id} | Data: ${JSON.stringify(j.data)}`));

  console.log(`Failed jobs: ${failed.length}`);
  failed.forEach(j => console.log(`  Job ID: ${j.id} | FailedReason: ${j.failedReason} | Data: ${JSON.stringify(j.data)}`));
}

main()
  .catch(e => console.error(e))
  .finally(() => redisConnection.disconnect());
