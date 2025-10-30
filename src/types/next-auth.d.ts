import { DefaultSession } from "next-auth";

type AppRole = "ADMIN" | "LEAD";

declare module "next-auth" {
  interface User {
    role?: AppRole | null;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: AppRole | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole | null;
  }
}

export {};
