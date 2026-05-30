import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { createBot } from "./bot/bot.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Start Telegram bot if token is available
const botToken = process.env["BOT_TOKEN"];
if (botToken) {
  const bot = createBot(botToken, logger);
  bot.launch({ dropPendingUpdates: true }).then(() => {
    logger.info("Telegram bot launched");
  }).catch(err => {
    logger.error({ err }, "Failed to launch bot");
  });

  // Graceful shutdown
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
} else {
  logger.warn("BOT_TOKEN not set — Telegram bot disabled");
}

export default app;
