import loadEnv from "../config/env";
loadEnv();

import { initSystemRepeatableJobs } from "../queues/systemQueue";

// Import workers to start them
import "./recommendation.worker";
import "./system.worker";
import "./notification.worker";
import "./viewTracking.worker";
import "./lockTracking.worker";

let initialized = false;

const start = async () => {
  if (initialized) return;
  console.log("🚀 Background Worker Process Starting...");
  
  // Initialize self-scheduling jobs (Safe/Idempotent)
  await initSystemRepeatableJobs();
  
  initialized = true;
  console.log("✅ All workers active and repeatable jobs scheduled.");
};

start().catch(err => {
  console.error("❌ CRITICAL: Worker process failed to start", err);
  process.exit(1);
});
