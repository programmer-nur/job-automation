import { app } from "./app.js";
import { config } from "@/config/env.js";
import { prisma } from "@/services/prisma.js";
import { logger } from "@/services/logger.js";

async function main() {
  const server = app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, "Server started");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.fatal(err, "Failed to start server");
  process.exit(1);
});
