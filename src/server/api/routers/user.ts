import { hash } from "argon2";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { prismaExclude, type RouterOutputs, THROW_TRPC_ERROR, THROW_OK } from "@/trpc/shared";
import { schema } from "@/server/api/schema/schema";

export const userRouter = createTRPCRouter({
  register: publicProcedure.input(schema.login).mutation(async ({ input, ctx }) => {
    const data = await ctx.db.user.findUnique({ where: { email: input.email } });
    if (data) THROW_TRPC_ERROR("CONFLICT");
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

  message: publicProcedure.query(() => ({ message: "Public message" })),

  secretMessage: publicProcedure.query(() => ({ message: "Secret message" })),
});

// outputs
export type User = RouterOutputs["user"]["detail"];
