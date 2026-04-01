import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { logger } from "@/lib/logger";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({ path, error }) => {
      logger.error(
        {
          err: error,
          method: req.method,
          module: "trpc",
          path: path ?? "<no-path>",
          requestId: req.headers.get("x-request-id") ?? undefined,
        },
        "tRPC request failed",
      );
    },
  });

export { handler as GET, handler as POST };
