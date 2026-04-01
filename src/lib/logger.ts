import "server-only";

import pino from "pino";

import { env } from "~/env";

const transport =
  env.NODE_ENV === "development"
    ? pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      })
    : undefined;

export const logger = pino(
  {
    level: env.LOG_LEVEL,
    base: {
      env: env.NODE_ENV,
      service: "next-full-stack",
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport,
);
