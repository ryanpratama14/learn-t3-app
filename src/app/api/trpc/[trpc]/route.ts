import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { LOCALE_TAG } from "~/trpc/shared";

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const consoleError = (error: string) => {
  console.error(
    `❌ ${new Date().toLocaleTimeString(LOCALE_TAG, { hour: "2-digit", minute: "2-digit", second: "2-digit" })} 👉 ${error}`
  );
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error, ctx }) => {
            consoleError("tRPC failed");
            consoleError(`path: ${path ?? "<no-path>"}`);
            consoleError(`code: ${error.code}, message: ${error.message}`);
            if (ctx?.session) consoleError(`user: ${JSON.stringify(ctx.session.user)}`);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
