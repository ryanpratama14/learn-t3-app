import { TRPCError } from "@trpc/server";
import { hash } from "bcrypt";
import { z } from "zod";
import { prismaExclude } from "~/helper/utils";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(4) }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (data) throw new TRPCError({ code: "CONFLICT" });
      const hashedPassword = await hash(input.password, 10);
      await ctx.db.user.create({
        data: { email: input.email, password: hashedPassword },
      });
      return "Account created";
    }),

  detail: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findFirst({ where: { id: ctx.session.user.id }, select: prismaExclude("User", ["password"]) });
  }),

  message: publicProcedure.query(() => {
    return {
      message: "Public message",
    };
  }),

  secretMessage: protectedProcedure.query(() => {
    return {
      message: "Public message",
    };
  }),
});
