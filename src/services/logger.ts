import pino from "pino";
import { config } from "@/config/env.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  ...(config.NODE_ENV === "dev" && {
    transport: {
      target: "pino/file",
      options: { destination: 1 },
    },
  }),
});
