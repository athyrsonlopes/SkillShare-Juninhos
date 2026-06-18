import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import prisma from "./lib/prisma";
import { logger } from "./lib/logger";
import { env } from "./lib/env";
import { initializeSocket } from "./socket";
import { startReminderScheduler } from "./services/reminder.service";

async function bootstrap() {
  await prisma.$connect();

  const server = http.createServer(app);
  initializeSocket(server);
  startReminderScheduler();

  server.listen(env.port, () => {
    logger.success(`Servidor rodando em http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  logger.error("Falha ao iniciar o servidor", error instanceof Error ? error.stack : error);
  process.exit(1);
});
