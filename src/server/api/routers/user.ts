import { hash } from "bcrypt";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { prismaExclude, THROW_ERROR, THROW_OK } from "~/trpc/shared";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(4) }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (data) THROW_ERROR("CONFLICT");
      await ctx.db.user.create({ data: { email: input.email, password: await hash(input.password, 10) } });
      return THROW_OK("ACCEPTED");
    }),

  detail: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findFirst({ where: { id: ctx.session.user.id }, select: prismaExclude("User", ["password"]) });
  }),

  message: publicProcedure.query(() => ({ message: "Public message" })),

  secretMessage: publicProcedure.query(() => ({ message: "Secret message" })),
});
