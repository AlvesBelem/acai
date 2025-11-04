"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppRole, ROLES } from "@/lib/roles";

function ensureAdmin(role?: AppRole | null) {
  if (role !== ROLES.ADMIN && role !== ROLES.SUPERUSER) {
    throw new Error("Acesso negado");
  }
}

export async function promoteToAdmin(formData: FormData) {
  const session = await auth();
  ensureAdmin(session?.user?.role ?? null);

  const userId = String(formData.get("userId"));
  await db.user.update({ where: { id: userId }, data: { role: ROLES.ADMIN } });

  revalidatePath("/admin");
  revalidatePath("/admin/admins");
  revalidatePath("/admin/clientes");
}

export async function demoteToLead(formData: FormData) {
  const session = await auth();
  ensureAdmin(session?.user?.role ?? null);

  const userId = String(formData.get("userId"));
  await db.user.update({ where: { id: userId }, data: { role: ROLES.LEAD } });

  revalidatePath("/admin");
  revalidatePath("/admin/admins");
  revalidatePath("/admin/clientes");
}

function optionalString(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function parseCurrencyToCents(value: FormDataEntryValue | null): number {
  if (value == null) return 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  const sanitized = raw.replace(/[^\d,.-]/g, "").replace(/\.(?=.*\.)/g, "").replace(",", ".");
  const parsed = Number(sanitized);
  if (!Number.isFinite(parsed)) {
    throw new Error("Informe um valor de preco valido.");
  }
  return Math.round(parsed * 100);
}

function parseBoolean(value: FormDataEntryValue | null, fallback = true) {
  if (value == null) return fallback;
  const normalized = String(value).toLowerCase();
  return normalized === "true" || normalized === "on" || normalized === "1";
}

function toProductPayload(formData: FormData, options?: { defaultActive?: boolean }) {
  const defaultActive = options?.defaultActive ?? true;
  const name = optionalString(formData.get("name"));
  const description = optionalString(formData.get("description"));
  const priceCents = parseCurrencyToCents(formData.get("price"));
  const hasIsActiveField = formData.has("isActive");
  const isActive = hasIsActiveField ? parseBoolean(formData.get("isActive"), defaultActive) : defaultActive;

  if (!name) {
    throw new Error("Informe um nome para o produto.");
  }
  if (!description) {
    throw new Error("Informe uma descricao para o produto.");
  }
  if (priceCents <= 0) {
    throw new Error("Informe um preco valido (acima de zero).");
  }

  return {
    name,
    description,
    priceCents,
    imageUrl: optionalString(formData.get("imageUrl")),
    checkoutUrl: optionalString(formData.get("checkoutUrl")),
    salesPageUrl: optionalString(formData.get("salesPageUrl")),
    externalId: optionalString(formData.get("externalId")),
    externalPlatform: optionalString(formData.get("externalPlatform")),
    isActive,
  };
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  ensureAdmin(session?.user?.role ?? null);

  const payload = toProductPayload(formData, { defaultActive: true });

  await db.product.create({
    data: {
      ...payload,
      userId: session?.user?.id ?? null,
    },
  });

  revalidatePath("/plataforma");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/produtos/cadastrar");
}

export async function updateProduct(formData: FormData) {
  const session = await auth();
  ensureAdmin(session?.user?.role ?? null);

  const idValue = formData.get("productId");
  const id = Number(idValue);
  if (!Number.isInteger(id)) {
    throw new Error("Produto invalido.");
  }

  const payload = toProductPayload(formData, { defaultActive: false });

  await db.product.update({
    where: { id },
    data: payload,
  });

  revalidatePath("/plataforma");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/produtos/cadastrar");
}

export async function deleteProduct(formData: FormData) {
  const session = await auth();
  ensureAdmin(session?.user?.role ?? null);

  const idValue = formData.get("productId");
  const id = Number(idValue);
  if (!Number.isInteger(id)) {
    throw new Error("Produto invalido.");
  }

  await db.product.delete({ where: { id } });

  revalidatePath("/plataforma");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/produtos/cadastrar");
}




