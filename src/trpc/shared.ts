import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import SuperJSON from "superjson";
import { type AppRouter } from "~/server/api/root";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const getUrl = () => {
  return getBaseUrl() + "/api/trpc";
};

export const transformer = SuperJSON;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
