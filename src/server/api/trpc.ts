import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { THROW_TRPC_ERROR, transformer } from "@/trpc/shared";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerAuthSession();
  return { db, session, ...opts };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const enforceAdminIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || ctx.session.user.roleId !== 1) return THROW_TRPC_ERROR("UNAUTHORIZED");
  return next({ ctx: { session: { ...ctx.session, user: ctx.session.user } } });
});

const enforceSuperAdminIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || ctx.session.user.roleId !== 2) return THROW_TRPC_ERROR("UNAUTHORIZED");
  return next({ ctx: { session: { ...ctx.session, user: ctx.session.user } } });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const adminProcedure = t.procedure.use(enforceAdminIsAuthed);
export const superAdminProcedure = t.procedure.use(enforceSuperAdminIsAuthed);
