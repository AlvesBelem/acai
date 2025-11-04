import { DefaultSession } from "next-auth";

type AppRole = "SUPERUSER" | "ADMIN" | "LEAD";

type LeadDetails = {
  phone?: string | null;
  locale?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  location?: string | null;
};

declare module "next-auth" {
  interface User extends LeadDetails {
    role?: AppRole | null;
  }

  interface Session {
    user: DefaultSession["user"] &
      LeadDetails & {
        id?: string;
        role?: AppRole | null;
      };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends LeadDetails {
    id?: string;
    role?: AppRole | null;
  }
}

export {};
