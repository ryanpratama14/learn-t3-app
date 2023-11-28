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
        ? ({ path, error, ctx, input, type }) => {
            consoleError("tRPC failed");
            consoleError(`path: api.${path ?? "<no-path>"}.${type}`);
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            consoleError(`input: ${JSON.stringify(input) ?? null}`);
            consoleError(`code: ${error.code}`);
            consoleError(`message: ${error.message}`);
            consoleError(`session: ${JSON.stringify(ctx?.session?.user) ?? null}`);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
