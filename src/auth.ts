import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { db } from "@/lib/db";
import { AppRole, DEFAULT_ROLE } from "@/lib/roles";

type UserWithRole = AdapterUser & { role?: AppRole | null };
type TokenWithRole = JWT & { role?: AppRole | null; picture?: string | null };

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
        const { id, role, image } = user as UserWithRole;
        token.id = id;
        token.role = role ?? DEFAULT_ROLE;
        if (typeof image === "string" && image.length > 0) {
          token.picture = image;
        }
      } else if (!token.picture && typeof token.sub === "string") {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { image: true },
        });
        if (dbUser?.image) {
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const { id, role, picture } = token as TokenWithRole;
        if (typeof id === "string") {
          session.user.id = id;
        }
        session.user.role = role ?? DEFAULT_ROLE;
        if (typeof picture === "string") {
          session.user.image = picture;
        }
      }
      return session;
    },
  },
});
