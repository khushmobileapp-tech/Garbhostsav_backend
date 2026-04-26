import cors from "cors";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { startNotificationScheduler, stopNotificationScheduler } from "./jobs/notificationScheduler.js";
import { prisma } from "./lib/prisma.js";

app.use(cors({
  origin: "*", // for testing only
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
  startNotificationScheduler();
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${env.port} is already in use. Stop the other server or change PORT.`);
    process.exit(1);
  }

  console.error("Failed to start server:", error);
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  stopNotificationScheduler();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
