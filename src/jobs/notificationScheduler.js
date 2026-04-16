import { env } from "../config/env.js";
import { notificationEngineService } from "../services/notificationEngine.service.js";

let timer = null;
let isRunning = false;

async function runJobs() {
  if (isRunning) {
    return;
  }

  isRunning = true;

  try {
    const now = new Date();
    await notificationEngineService.runAll(now);
  } catch (error) {
    console.error("Notification scheduler error:", error);
  } finally {
    isRunning = false;
  }
}

export function startNotificationScheduler() {
  if (!env.notificationSchedulerEnabled || timer) {
    return;
  }

  timer = setInterval(runJobs, 60 * 1000);

  runJobs().catch((error) => {
    console.error("Failed to run initial notification jobs:", error);
  });
}

export function stopNotificationScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
