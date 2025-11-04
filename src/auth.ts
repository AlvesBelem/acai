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
const env = (globalThis.process?.env ?? {}) as Record<string, string | undefined>;
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

function getPrimaryValue<T extends { metadata?: { primary?: boolean | null } | null | undefined }>(
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
  return typeof (globalThis as unknown as { EdgeRuntime?: string | undefined }).EdgeRuntime === "string";
}

async function fetchGoogleLeadDetails(accessToken: string): Promise<GoogleLeadDetails | null> {
  if (!accessToken) return null;

  const fetchApi = typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : null;
  if (!fetchApi) {
    return null;
  }

  const response = await fetchApi(GOOGLE_PEOPLE_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    return null;
  }

  type PeoplePhone = { value?: string | null; metadata?: { primary?: boolean | null } | null };
  type PeopleAddress = {
    formattedValue?: string | null;
    metadata?: { primary?: boolean | null } | null;
  };
  type PeopleOrg = {
    name?: string | null;
    title?: string | null;
    metadata?: { primary?: boolean | null } | null;
  };
  type PeopleLocale = { value?: string | null; metadata?: { primary?: boolean | null } | null };

  const data = (await response.json()) as {
    phoneNumbers?: PeoplePhone[] | null;
    addresses?: PeopleAddress[] | null;
    organizations?: PeopleOrg[] | null;
    locales?: PeopleLocale[] | null;
  };

  const phone = getPrimaryValue<PeoplePhone>(data.phoneNumbers, (item) => item.value ?? null);
  const location = getPrimaryValue<PeopleAddress>(data.addresses, (item) => item.formattedValue ?? null);

  const organization = getPrimaryValue<PeopleOrg>(data.organizations, (item) => item.name ?? null);
  const jobTitle = getPrimaryValue<PeopleOrg>(data.organizations, (item) => item.title ?? null);
  const locale = getPrimaryValue<PeopleLocale>(data.locales, (item) => item.value ?? null);

  if (!phone && !location && !organization && !jobTitle && !locale) {
    return null;
  }

  return {
    phone: phone ?? null,
    location: location ?? null,
    company: organization ?? null,
    jobTitle: jobTitle ?? null,
    locale: locale ?? null,
    source: "Google People API",
  };
}

async function updateLeadDetailsFromGoogle(userId: string, details: GoogleLeadDetails) {
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

  await db.user.update({
    where: { id: userId },
    data: payload,
  });
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    updateAge: 60 * 60 * 24, // renova a cada 24h
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
        const { id, role, image, phone, locale, company, jobTitle, location, source } = user as UserWithRole;
        token.id = id;
        token.role = role ?? DEFAULT_ROLE;
        if (typeof image === "string" && image.length > 0) {
          token.picture = image;
        }
        if (typeof phone === "string" && phone.length > 0) {
          token.phone = phone;
        }
        if (typeof locale === "string" && locale.length > 0) {
          token.locale = locale;
        }
        if (typeof company === "string" && company.length > 0) {
          token.company = company;
        }
        if (typeof jobTitle === "string" && jobTitle.length > 0) {
          token.jobTitle = jobTitle;
        }
        if (typeof location === "string" && location.length > 0) {
          token.location = location;
        }
        if (typeof source === "string" && source.length > 0) {
          token.source = source;
        }
      } else if (!isEdgeRuntime() && typeof token.sub === "string") {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
        });
        const dbSource = (dbUser as { source?: string | null } | null)?.source ?? null;
        if (!token.picture && dbUser?.image) {
          token.picture = dbUser.image;
        }
        if (!token.phone && dbUser?.phone) {
          token.phone = dbUser.phone;
        }
        if (!token.locale && dbUser?.locale) {
          token.locale = dbUser.locale;
        }
        if (!token.company && dbUser?.company) {
          token.company = dbUser.company;
        }
        if (!token.jobTitle && dbUser?.jobTitle) {
          token.jobTitle = dbUser.jobTitle;
        }
        if (!token.location && dbUser?.location) {
          token.location = dbUser.location;
        }
        if (!token.source && dbSource) {
          token.source = dbSource;
        }
      }

      if (!token.source) {
        token.source = "Google OAuth";
      }

      if (
        account?.provider === "google" &&
        typeof account.access_token === "string" &&
        typeof token.sub === "string"
      ) {
        try {
          const details = await fetchGoogleLeadDetails(account.access_token);
          if (details) {
            if (!isEdgeRuntime()) {
              await updateLeadDetailsFromGoogle(token.sub, details);
            }
            if (details.phone) token.phone = details.phone;
            if (details.locale) token.locale = details.locale;
            if (details.company) token.company = details.company;
            if (details.jobTitle) token.jobTitle = details.jobTitle;
            if (details.location) token.location = details.location;
            if (details.source) token.source = details.source;
          }
        } catch (error) {
          globalThis.console?.error?.("[auth] enrich-google-lead failed", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const { id, role, picture, phone, locale, company, jobTitle, location, source } =
          token as TokenWithRole;
        if (typeof id === "string") {
          session.user.id = id;
        }
        session.user.role = role ?? DEFAULT_ROLE;
        if (typeof picture === "string") {
          session.user.image = picture;
        }
        if (typeof phone === "string") {
          session.user.phone = phone;
        }
        if (typeof locale === "string") {
          session.user.locale = locale;
        }
        if (typeof company === "string") {
          session.user.company = company;
        }
        if (typeof jobTitle === "string") {
          session.user.jobTitle = jobTitle;
        }
        if (typeof location === "string") {
          session.user.location = location;
        }
        if (typeof source === "string") {
          session.user.source = source;
        }
      }
      return session;
    },
  },
});

