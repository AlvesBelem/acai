import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { db } from "@/lib/db";
import { AppRole, DEFAULT_ROLE } from "@/lib/roles";

type UserWithRole = AdapterUser & {
  role?: AppRole | null;
  phone?: string | null;
  locale?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  source?: string | null;
};

type TokenWithRole = JWT & {
  role?: AppRole | null;
  picture?: string | null;
  phone?: string | null;
  locale?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  source?: string | null;
};

type GoogleLeadDetails = {
  phone?: string | null;
  locale?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  source?: string | null;
};

const GOOGLE_PEOPLE_FIELDS = "phoneNumbers,addresses,organizations,locales";
const GOOGLE_PEOPLE_ENDPOINT = `https://people.googleapis.com/v1/people/me?personFields=${encodeURIComponent(
  GOOGLE_PEOPLE_FIELDS
)}`;

const env = process.env;

const GOOGLE_CLIENT_ID = env.AUTH_GOOGLE_ID;
const GOOGLE_CLIENT_SECRET = env.AUTH_GOOGLE_SECRET;
const AUTH_SECRET = env.AUTH_SECRET;

if (!GOOGLE_CLIENT_ID) {
  throw new Error("AUTH_GOOGLE_ID is not set in the environment.");
}

if (!GOOGLE_CLIENT_SECRET) {
  throw new Error("AUTH_GOOGLE_SECRET is not set in the environment.");
}

if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET is not set in the environment.");
}

function getPrimaryValue<
  T extends { metadata?: { primary?: boolean | null } | null | undefined }
>(
  items: T[] | null | undefined,
  getValue: (item: T) => string | null | undefined
) {
  if (!items || items.length === 0) return null;
  const primary = items.find((item) => item.metadata?.primary);
  const candidate = primary ?? items[0];
  const value = candidate ? getValue(candidate) : null;
  return value && value.trim().length > 0 ? value.trim() : null;
}

function isEdgeRuntime() {
  return typeof (globalThis as any).EdgeRuntime === "string";
}

function isServerRuntime() {
  return (
    typeof window === "undefined" &&
    !isEdgeRuntime() &&
    process.env.NODE_ENV !== "production"
  );
}

async function fetchGoogleLeadDetails(
  accessToken: string
): Promise<GoogleLeadDetails | null> {
  if (!accessToken || typeof fetch !== "function") return null;

  try {
    const response = await fetch(GOOGLE_PEOPLE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      phoneNumbers?:
        | { value?: string | null; metadata?: { primary?: boolean } | null }[]
        | null;
      addresses?:
        | {
            formattedValue?: string | null;
            metadata?: { primary?: boolean } | null;
          }[]
        | null;
      organizations?:
        | {
            name?: string | null;
            title?: string | null;
            metadata?: { primary?: boolean } | null;
          }[]
        | null;
      locales?:
        | { value?: string | null; metadata?: { primary?: boolean } | null }[]
        | null;
    };

    const phone = getPrimaryValue(
      data.phoneNumbers,
      (item) => item.value ?? null
    );
    const location = getPrimaryValue(
      data.addresses,
      (item) => item.formattedValue ?? null
    );
    const company = getPrimaryValue(
      data.organizations,
      (item) => item.name ?? null
    );
    const jobTitle = getPrimaryValue(
      data.organizations,
      (item) => item.title ?? null
    );
    const locale = getPrimaryValue(data.locales, (item) => item.value ?? null);

    if (!phone && !location && !company && !jobTitle && !locale) return null;

    return {
      phone,
      location,
      company,
      jobTitle,
      locale,
      source: "Google People API",
    };
  } catch (error) {
    console.error("[auth] fetchGoogleLeadDetails error", error);
    return null;
  }
}

async function updateLeadDetailsFromGoogle(
  userId: string,
  details: GoogleLeadDetails
) {
  if (isEdgeRuntime()) return;

  const payload = {
    phone: details.phone ?? null,
    locale: details.locale ?? null,
    company: details.company ?? null,
    jobTitle: details.jobTitle ?? null,
    location: details.location ?? null,
    source: details.source ?? null,
  };

  const hasAny = Object.values(payload).some((value) => value !== null);
  if (!hasAny) return;

  try {
    await db.user.update({
      where: { id: userId },
      data: payload,
    });
  } catch (error) {
    console.error("[auth] updateLeadDetailsFromGoogle error", error);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    updateAge: 60 * 60 * 24, // atualiza a cada 24h
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  providers: [
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/user.phonenumbers.read https://www.googleapis.com/auth/user.addresses.read https://www.googleapis.com/auth/user.organization.read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const {
          id,
          role,
          image,
          phone,
          locale,
          company,
          jobTitle,
          location,
          source,
        } = user as UserWithRole;
        token.id = id;
        token.role = role ?? DEFAULT_ROLE;
        token.picture = image ?? undefined;
        token.phone = phone ?? undefined;
        token.locale = locale ?? undefined;
        token.company = company ?? undefined;
        token.jobTitle = jobTitle ?? undefined;
        token.location = location ?? undefined;
        token.source = source ?? "Google OAuth";
      } else if (!isEdgeRuntime() && typeof token.sub === "string") {
        const dbUser = await db.user.findUnique({ where: { id: token.sub } });
        if (dbUser) {
          token.picture = token.picture ?? dbUser.image ?? undefined;
          token.phone = token.phone ?? dbUser.phone ?? undefined;
          token.locale = token.locale ?? dbUser.locale ?? undefined;
          token.company = token.company ?? dbUser.company ?? undefined;
          token.jobTitle = token.jobTitle ?? dbUser.jobTitle ?? undefined;
          token.location = token.location ?? dbUser.location ?? undefined;
          token.source = token.source ?? dbUser.source ?? "Google OAuth";
        }
      }

      // Só busca os dados adicionais se for server runtime (não build) e ambiente seguro
      if (
        isServerRuntime() &&
        account?.provider === "google" &&
        typeof account.access_token === "string" &&
        typeof token.sub === "string"
      ) {
        try {
          const details = await fetchGoogleLeadDetails(account.access_token);
          if (details) {
            await updateLeadDetailsFromGoogle(token.sub, details);
            token.phone = details.phone ?? token.phone;
            token.locale = details.locale ?? token.locale;
            token.company = details.company ?? token.company;
            token.jobTitle = details.jobTitle ?? token.jobTitle;
            token.location = details.location ?? token.location;
            token.source = details.source ?? token.source;
          }
        } catch (error) {
          console.error("[auth] enrich-google-lead failed", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const t = token as TokenWithRole;
        session.user.id = t.id as string;
        session.user.role = t.role ?? DEFAULT_ROLE;
        session.user.image = t.picture ?? null;
        session.user.phone = t.phone ?? null;
        session.user.locale = t.locale ?? null;
        session.user.company = t.company ?? null;
        session.user.jobTitle = t.jobTitle ?? null;
        session.user.location = t.location ?? null;
        session.user.source = t.source ?? null;
      }
      return session;
    },
  },
});
