"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppRole, ROLES } from "@/lib/roles";
import { fetchHotmartProducts } from "@/lib/hotmart";

function ensureAdmin(role?: AppRole | null) {
  if (role !== "ADMIN") {
    throw new Error("Acesso negado");
  }
}

export async function saveHotmartConfig(formData: FormData) {
  const session = await auth();
  ensureAdmin(session?.user?.role ?? null);

  const clientId = String(formData.get("clientId") || "").trim();
  const clientSecret = String(formData.get("clientSecret") || "").trim();
  const basicToken = String(formData.get("basicToken") || "").trim();
  const webhookSecret = ((formData.get("webhookSecret") as string) || "").trim() || null;

  if (!clientId || !clientSecret || !basicToken) {
    throw new Error("Preencha clientId, clientSecret e basicToken");
  }

  await (db as any).hotmartConfig.upsert({
    where: { id: "singleton" },
    update: {
      clientId,
      clientSecret,
      basicToken,
      webhookSecret,
    },
    create: {
      id: "singleton",
      clientId,
      clientSecret,
      basicToken,
      webhookSecret,
    },
  });

  revalidatePath("/admin/integracoes/hotmart");
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
export async function syncHotmartProducts() {
  const session = await auth();
  ensureAdmin(session?.user?.role ?? null);

  let products = [] as Awaited<ReturnType<typeof fetchHotmartProducts>>;
  try {
    products = await fetchHotmartProducts();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar Hotmart";
    throw new Error(message);
  }

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const priceCents = Math.round((product.price || 0) * 100);
    const description = product.description || "Produto sincronizado via Hotmart";
    const checkoutUrl =
      product.checkoutUrl || (product.id ? `https://pay.hotmart.com/${product.id}` : undefined);

    const existing = await db.product.findFirst({
      where: { hotmartProductId: product.id },
    });

    const payload = {
      name: product.name,
      description,
      priceCents,
      imageUrl: product.imageUrl,
      checkoutUrl,
      hotmartProductId: product.id,
    } as const;

    if (existing) {
      await db.product.update({ where: { id: existing.id }, data: payload });
      updated += 1;
    } else {
      await db.product.create({ data: payload });
      created += 1;
    }
  }

  revalidatePath("/plataforma");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");

  return { created, updated, total: created + updated };
}




