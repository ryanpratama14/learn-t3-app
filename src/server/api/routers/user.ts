import { hash } from "argon2";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { prismaExclude, type RouterOutputs, THROW_TRPC_ERROR, THROW_OK } from "@/trpc/shared";
import { schema } from "@/server/api/schema/schema";
import { z } from "zod";
import { getDateExpiry } from "@/lib/utils";
import { env } from "@/env";

export const userRouter = createTRPCRouter({
  register: publicProcedure.input(schema.login).mutation(async ({ input, ctx }) => {
    const data = await ctx.db.user.findUnique({ where: { email: input.email } });
    if (data) return THROW_TRPC_ERROR("CONFLICT");
    const hashedPassword = await hash(input.password);
    await ctx.db.user.create({ data: { email: input.email, password: hashedPassword } });
    return THROW_OK("CREATED");
  }),

  detail: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.user.findFirst({
      where: { id: ctx.session.user.id },
      select: { image: true, ...prismaExclude("User", ["password"]) },
    });
    if (!data) THROW_TRPC_ERROR("NOT_FOUND");
    return data;
  }),

  forgotPassword: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ ctx, input }) => {
    const data = await ctx.db.user.findFirst({ where: { email: input.email } });
    if (!data) return THROW_TRPC_ERROR("NOT_FOUND");
    const hashedToken = await hash(data.id);
    const { email } = await ctx.db.user.update({
      where: { id: data.id },
      data: { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: getDateExpiry() },
    });
    await fetch(`${env.NEXTAUTH_URL}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token: hashedToken }),
    });
    return THROW_OK("OK");
  }),

  isForgotPasswordTokenExpired: publicProcedure.input(z.object({ token: z.string() })).query(async ({ ctx, input }) => {
    const data = await ctx.db.user.findUnique({ where: { forgotPasswordToken: input.token } });
    if (!data?.forgotPasswordTokenExpiry || data.forgotPasswordTokenExpiry < new Date()) return true;
    return false;
  }),

  updatePassword: publicProcedure
    .input(z.object({ token: z.string(), newPassword: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await hash(input.newPassword);
      const data = await ctx.db.user.update({
        where: { forgotPasswordToken: input.token },
        data: { password: hashedPassword },
      });
      if (!data) return THROW_TRPC_ERROR("NOT_FOUND");
      await ctx.db.user.update({
        where: { forgotPasswordToken: input.token },
        data: { forgotPasswordToken: null, forgotPasswordTokenExpiry: null },
      });
      return THROW_OK("ACCEPTED");
    }),

  message: publicProcedure.query(() => ({ message: "Public message" })),

  secretMessage: publicProcedure.query(() => ({ message: "Secret message" })),
});

// outputs
export type User = RouterOutputs["user"]["detail"];
