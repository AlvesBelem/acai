import "server-only";

import { cache } from "react";

import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

const env = globalThis.process?.env;
const DEFAULT_BASE_URL = env?.HOTMART_API_BASE ?? "https://api-sec-v2.hotmart.com";

type UnknownRecord = Record<string, unknown>;

type HotmartPrice = {
  value?: number | string | null;
  [key: string]: unknown;
};

type RawHotmartProduct = {
  id?: number | string;
  product_id?: number | string;
  product?: { id?: number | string } | null;
  code?: string | number;
  hid?: string | number;
  name?: string;
  product_name?: string;
  displayName?: string;
  title?: string;
  description?: string;
  subtitle?: string;
  resume?: string;
  price?: HotmartPrice | number | string | null;
  list_price?: number | string | null;
  default_price?: number | string | null;
  amount?: number | string | null;
  imageUrl?: string;
  thumbnail?: string;
  small_thumbnail?: string;
  cover?: string;
  sales_page_url?: string;
  salesPageUrl?: string;
  checkout_url?: string;
  url?: string;
  [key: string]: unknown;
};

type RawHotmartSale = {
  id?: number | string;
  sale_id?: number | string;
  transaction?: number | string;
  purchase_code?: number | string;
  purchase?: {
    code?: number | string;
    approved_date?: string;
    approvedAt?: string;
    status?: string;
    product?: { price?: HotmartPrice | number | string | null } | null;
  } | null;
  value?: number | string | null;
  amount?: number | string | null;
  gross_value?: number | string | null;
  grossAmount?: number | string | null;
  commission?: { value?: number | string | null } | null;
  status?: string;
  status_name?: string;
  approved_date?: string;
  approvedAt?: string;
  transaction_date?: string;
  date_approved?: string;
  date?: string;
  [key: string]: unknown;
};

export type NormalizedHotmartProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  checkoutUrl?: string;
};

export type NormalizedHotmartSale = {
  id: string;
  amount: number;
  approvedAt?: string;
  status?: string;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function getNumericValue(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (isRecord(value) && "value" in value) {
    return getNumericValue((value as HotmartPrice).value ?? null);
  }
  return null;
}

export const getHotmartConfig = cache(async () => {
  try {
    const config = await db.hotmartConfig.findFirst({});
    if (config) return config;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      const logger = globalThis.console;
      logger?.warn?.(
        "[hotmart] Prisma unavailable during getHotmartConfig, falling back to env.",
        error.message,
      );
    } else {
      throw error;
    }
  }

  const envClientId = env?.HOTMART_CLIENT_ID;
  const envClientSecret = env?.HOTMART_CLIENT_SECRET;
  const envBasicToken = env?.HOTMART_BASIC_TOKEN;

  if (!envClientId || !envClientSecret || !envBasicToken) {
    return null;
  }

  return {
    id: "env",
    clientId: envClientId,
    clientSecret: envClientSecret,
    basicToken: envBasicToken,
    webhookSecret: null,
    accessToken: null,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});

export async function upsertHotmartConfig(input: {
  clientId: string;
  clientSecret: string;
  basicToken: string;
  webhookSecret?: string | null;
}) {
  return db.hotmartConfig.upsert({
    where: { id: "singleton" },
    update: {
      clientId: input.clientId,
      clientSecret: input.clientSecret,
      basicToken: input.basicToken,
      webhookSecret: input.webhookSecret ?? null,
    },
    create: {
      id: "singleton",
      clientId: input.clientId,
      clientSecret: input.clientSecret,
      basicToken: input.basicToken,
      webhookSecret: input.webhookSecret ?? null,
    },
  });
}

export async function fetchHotmart<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = DEFAULT_BASE_URL.replace(/\/$/, "");
  const config = await getHotmartConfig();
  const token = config?.basicToken;

  if (!token) {
    throw new Error("Hotmart credentials not configured");
  }

  const response = await globalThis.fetch(`${baseUrl}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Hotmart API error (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

function getArrayFromResponse(data: unknown): unknown[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (isRecord(data)) {
    if (Array.isArray(data.items)) return data.items;

    if (Array.isArray(data.content)) return data.content;

    const nestedData = data.data;
    if (isRecord(nestedData)) {
      if (Array.isArray(nestedData.items)) return nestedData.items;
      if (Array.isArray(nestedData.content)) return nestedData.content;

      const deeperData = nestedData.data;
      if (isRecord(deeperData) && Array.isArray(deeperData.items)) {
        return deeperData.items;
      }
    }
  }
  return [];
}

export function normalizeHotmartProducts(data: unknown): NormalizedHotmartProduct[] {
  const items = getArrayFromResponse(data) as RawHotmartProduct[];

  return items
    .map((item) => {
      const rawId = item.id ?? item.product_id ?? item.product?.id ?? item.code ?? item.hid;
      if (!rawId) return null;
      const id = String(rawId);
      const name =
        getString(item.name) ??
        getString(item.product_name) ??
        getString(item.displayName) ??
        getString(item.title) ??
        `Produto ${id}`;
      const description =
        getString(item.description) ??
        getString(item.subtitle) ??
        getString(item.resume) ??
        "Produto importado via Hotmart";
      const priceValue =
        getNumericValue(item.price) ??
        getNumericValue(item.list_price) ??
        getNumericValue(item.default_price) ??
        getNumericValue(item.amount) ??
        0;
      const imageUrl =
        getString(item.imageUrl) ??
        getString(item.thumbnail) ??
        getString(item.small_thumbnail) ??
        getString(item.cover);
      const checkoutUrl =
        getString(item.sales_page_url) ??
        getString(item.salesPageUrl) ??
        getString(item.checkout_url) ??
        getString(item.url);

      return {
        id,
        name,
        description,
        price: priceValue,
        imageUrl,
        checkoutUrl,
      } satisfies NormalizedHotmartProduct;
    })
    .filter(Boolean) as NormalizedHotmartProduct[];
}

export function normalizeHotmartSales(data: unknown): NormalizedHotmartSale[] {
  const items = getArrayFromResponse(data) as RawHotmartSale[];

  return items
    .map((item, index) => {
      const rawId =
        item.id ??
        item.sale_id ??
        item.transaction ??
        item.purchase_code ??
        item.purchase?.code ??
        index;
      const id = String(rawId);
      const amountValue =
        getNumericValue(item.value) ??
        getNumericValue(item.amount) ??
        getNumericValue(item.gross_value) ??
        getNumericValue(item.grossAmount) ??
        getNumericValue(item.purchase?.product?.price) ??
        getNumericValue(item.commission?.value) ??
        0;
      const approvedAt =
        getString(item.approved_date) ??
        getString(item.approvedAt) ??
        getString(item.purchase?.approved_date) ??
        getString(item.purchase?.approvedAt) ??
        getString(item.transaction_date) ??
        getString(item.date_approved) ??
        getString(item.date);
      const status =
        getString(item.status) ?? getString(item.purchase?.status) ?? getString(item.status_name);

      return {
        id,
        amount: amountValue,
        approvedAt,
        status,
      } satisfies NormalizedHotmartSale;
    })
    .filter(Boolean) as NormalizedHotmartSale[];
}

export async function fetchHotmartProducts(page = 1, rows = 200) {
  const query = new URLSearchParams({ page: String(page), rows: String(rows) });
  const data = await fetchHotmart(`/rest/apiv3/product/list?${query.toString()}`);
  return normalizeHotmartProducts(data);
}

export async function fetchHotmartSalesHistory(params: {
  startDate?: string;
  endDate?: string;
  page?: number;
  rows?: number;
} = {}) {
  const query = new URLSearchParams();
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  query.set("page", String(params.page ?? 1));
  query.set("rows", String(params.rows ?? 50));

  const data = await fetchHotmart(`/rest/apiv3/sales/history?${query.toString()}`);
  return normalizeHotmartSales(data);
}
