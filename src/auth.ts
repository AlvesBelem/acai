import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { db } from "@/lib/db";
import { AppRole, DEFAULT_ROLE } from "@/lib/roles";

type UserWithRole = AdapterUser & { role?: AppRole | null };
type TokenWithRole = JWT & { role?: AppRole | null };

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const { id, role } = user as UserWithRole;
        token.id = id;
        token.role = role ?? DEFAULT_ROLE;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const { id, role } = token as TokenWithRole;
        if (typeof id === "string") {
          session.user.id = id;
        }
        session.user.role = role ?? DEFAULT_ROLE;
      }
      return session;
    },
  },
});
