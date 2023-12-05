import { hash, verify } from "argon2";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { prismaExclude, type RouterInputs, type RouterOutputs, THROW_TRPC_ERROR, THROW_OK } from "@/trpc/shared";
import { schema } from "@/server/api/schema/schema";
import { z } from "zod";
import { getExpiryDate, getNewDate } from "@/lib/utils";
import { env } from "@/env";

export const userRouter = createTRPCRouter({
  register: publicProcedure.input(schema.register).mutation(async ({ input, ctx }) => {
    const data = await ctx.db.user.findUnique({ where: { email: input.email } });
    if (data) return THROW_TRPC_ERROR("CONFLICT");
    await ctx.db.user.create({ data: { email: input.email, password: await hash(input.password) } });
    return THROW_OK("CREATED");
  }),

  detail: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { image: true, ...prismaExclude("User", ["password"]) },
    });
    if (!data) return THROW_TRPC_ERROR("NOT_FOUND");
    return data;
  }),

  isTokenValid: publicProcedure.input(z.object({ token: z.string() })).query(async ({ ctx, input }) => {
    const data = await ctx.db.token.findUnique({ where: { token: input.token } });
    if (!data || data.expirationDate < getNewDate()) return true;
    return false;
  }),

  verifyEmail: publicProcedure.input(z.object({ token: z.string() })).mutation(async ({ ctx, input }) => {
    const data = await ctx.db.token.findUnique({ where: { token: input.token } });
    if (!data) return THROW_TRPC_ERROR("NOT_FOUND");
    await ctx.db.$transaction([
      ctx.db.user.update({ where: { id: data.userId }, data: { emailVerified: getNewDate() } }),
      ctx.db.token.update({ where: { id: data.id }, data: { expirationDate: getNewDate() } }),
    ]);
    return THROW_OK("OK");
  }),

  sendVerificationEmail: protectedProcedure
    .input(z.object({ email: schema.email, type: schema.emailType.default("VERIFY_EMAIL") }))
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (!data) return THROW_TRPC_ERROR("NOT_FOUND");
      if (data.emailVerified) return THROW_TRPC_ERROR("CONFLICT");

      const hashedToken = (await hash(data.id)).replace(/\+/g, "");
      await ctx.db.token.create({ data: { token: hashedToken, expirationDate: getExpiryDate(), userId: data.id } });

      const res = await fetch(`${env.NEXT_PUBLIC_API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, token: hashedToken, type: input.type }),
      });
      if (!res.ok) {
        console.error(await res.json());
        return THROW_TRPC_ERROR("INTERNAL_SERVER_ERROR");
      }
      return THROW_OK("OK");
    }),

  updatePassword: publicProcedure
    .input(z.object({ token: z.string(), newPassword: schema.password }))
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.db.token.findUnique({ where: { token: input.token } });
      if (!data) return THROW_TRPC_ERROR("NOT_FOUND");
      await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: data.userId },
          data: { password: await hash(input.newPassword), passwordChanged: getNewDate() },
        }),
        ctx.db.token.update({ where: { token: input.token }, data: { expirationDate: getNewDate() } }),
      ]);
      return THROW_OK("OK");
    }),

  sendForgotPasswordEmail: publicProcedure
    .input(z.object({ email: schema.email, type: schema.emailType.default("FORGOT_PASSWORD") }))
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (!data) return THROW_TRPC_ERROR("NOT_FOUND");

      const hashedToken = (await hash(data.id)).replace(/\+/g, "");
      await ctx.db.token.create({ data: { token: hashedToken, expirationDate: getExpiryDate(), userId: data.id } });

      const res = await fetch(`${env.NEXT_PUBLIC_API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, token: hashedToken, type: input.type }),
      });
      if (!res.ok) {
        console.error(await res.json());
        return THROW_TRPC_ERROR("INTERNAL_SERVER_ERROR");
      }
      return THROW_OK("OK");
    }),

  changePassword: protectedProcedure
    .input(z.object({ oldPassword: schema.password, newPassword: schema.password, confirmPassword: schema.password }))
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.user.findUnique({ where: { id: ctx.session.user.id } });
      if (!data) return THROW_TRPC_ERROR("NOT_FOUND");

      const isOldPasswordValid = await verify(data.password, input.oldPassword);
      if (!isOldPasswordValid) return THROW_TRPC_ERROR("BAD_REQUEST", "Old password is wrong");

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { password: await hash(input.newPassword), passwordChanged: getNewDate() },
      });
      return THROW_OK("OK");
    }),

  message: publicProcedure.mutation(() => THROW_OK("CREATED")),

  secretMessage: publicProcedure.query(() => ({ message: "Secret message" })),
});

// outputs
export type User = RouterOutputs["user"]["detail"];
// export type UserList = RouterOutputs["user"]["list"];

// inputs
export type UserDetailInput = RouterInputs["user"]["detail"];
export type UserChangePasswordInput = RouterInputs["user"]["changePassword"];
