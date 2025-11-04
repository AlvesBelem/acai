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
};

type TokenWithRole = JWT & {
  role?: AppRole | null;
  picture?: string | null;
  phone?: string | null;
  locale?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  location?: string | null;
};

type GoogleLeadDetails = {
  phone?: string | null;
  locale?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  location?: string | null;
};

const GOOGLE_PEOPLE_FIELDS = "phoneNumbers,addresses,organizations,locales";
const GOOGLE_PEOPLE_ENDPOINT = `https://people.googleapis.com/v1/people/me?personFields=${encodeURIComponent(
  GOOGLE_PEOPLE_FIELDS
)}`;

function getPrimaryValue<T extends { metadata?: { primary?: boolean | null } }>(
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

  const response = await fetch(GOOGLE_PEOPLE_ENDPOINT, {
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

  const phone = getPrimaryValue(data.phoneNumbers, (item) => item.value ?? null);
  const location = getPrimaryValue(data.addresses, (item) => item.formattedValue ?? null);

  const organization = getPrimaryValue(data.organizations, (item) => item.name ?? null);
  const jobTitle = getPrimaryValue(data.organizations, (item) => item.title ?? null);
  const locale = getPrimaryValue(data.locales, (item) => item.value ?? null);

  if (!phone && !location && !organization && !jobTitle && !locale) {
    return null;
  }

  return {
    phone: phone ?? null,
    location: location ?? null,
    company: organization ?? null,
    jobTitle: jobTitle ?? null,
    locale: locale ?? null,
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
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
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
        const { id, role, image, phone, locale, company, jobTitle, location } = user as UserWithRole;
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
      } else if (!isEdgeRuntime() && typeof token.sub === "string") {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: {
            image: true,
            phone: true,
            locale: true,
            company: true,
            jobTitle: true,
            location: true,
          },
        });
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
          }
        } catch (error) {
          console.error("[auth] enrich-google-lead failed", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const { id, role, picture, phone, locale, company, jobTitle, location } = token as TokenWithRole;
        if (typeof id === "string") {
          session.user.id = id;
        }
        session.user.role = role ?? DEFAULT_ROLE;
        if (typeof picture === "string") {
          session.user.image = picture;
        }
        if (typeof phone === "string") {
          (session.user as Record<string, unknown>).phone = phone;
        }
        if (typeof locale === "string") {
          (session.user as Record<string, unknown>).locale = locale;
        }
        if (typeof company === "string") {
          (session.user as Record<string, unknown>).company = company;
        }
        if (typeof jobTitle === "string") {
          (session.user as Record<string, unknown>).jobTitle = jobTitle;
        }
        if (typeof location === "string") {
          (session.user as Record<string, unknown>).location = location;
        }
      }
      return session;
    },
  },
});
