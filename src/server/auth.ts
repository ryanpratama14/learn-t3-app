import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type DefaultSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verify } from "argon2";
import { env } from "@/env";
import { db } from "@/server/db";
import { schema } from "@/server/api/schema/schema";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isSuperAdmin: boolean;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  pages: { signIn: "/" },
  adapter: PrismaAdapter(db),
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => ({ ...token, ...user }),
    session: async ({ session, token }) => {
      const isSuperAdmin = token.roleId === 2 ? true : false;
      return { ...session, user: { ...session.user, id: token.id, isSuperAdmin } };
    },
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const parsedCredentials = schema.login.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await db.user.findFirst({ where: { email } });
          if (!user) return null;
          const passwordsMatch = await verify(user.password, password);
          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions);
