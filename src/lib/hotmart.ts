import "server-only";

import { cache } from "react";

import { db } from "@/lib/db";

const DEFAULT_BASE_URL = process.env.HOTMART_API_BASE ?? "https://api-sec-v2.hotmart.com";

type RawHotmartProduct = Record<string, any> & {
  id?: number | string;
};

type RawHotmartSale = Record<string, any> & {
  id?: number | string;
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

export const getHotmartConfig = cache(async () => {
  const config = await (db as any).hotmartConfig?.findFirst?.({});
  if (config) return config;

  const envClientId = process.env.HOTMART_CLIENT_ID;
  const envClientSecret = process.env.HOTMART_CLIENT_SECRET;
  const envBasicToken = process.env.HOTMART_BASIC_TOKEN;

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
  return (db as any).hotmartConfig.upsert({
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

  const response = await fetch(`${baseUrl}${path}`, {
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

function getArrayFromResponse(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data?.items)) return data.data.items;
  if (Array.isArray(data.data?.content)) return data.data.content;
  if (Array.isArray(data.content)) return data.content;
  if (data.data?.data?.items && Array.isArray(data.data.data.items)) return data.data.data.items;
  return [];
}

export function normalizeHotmartProducts(data: any): NormalizedHotmartProduct[] {
  const items = getArrayFromResponse(data) as RawHotmartProduct[];

  return items
    .map((item) => {
      const rawId = item.id ?? item.product_id ?? item.product?.id ?? item.code ?? item.hid;
      if (!rawId) return null;
      const id = String(rawId);
      const name =
        item.name ?? item.product_name ?? item.displayName ?? item.title ?? `Produto ${id}`;
      const description =
        item.description ?? item.subtitle ?? item.resume ?? "Produto importado via Hotmart";
      const priceValue =
        Number(
          item.price?.value ??
            item.price ??
            item.list_price ??
            item.default_price ??
            item.amount ??
            0
        ) || 0;
      const imageUrl =
        item.imageUrl ?? item.thumbnail ?? item.small_thumbnail ?? item.cover ?? undefined;
      const checkoutUrl =
        item.sales_page_url ?? item.salesPageUrl ?? item.checkout_url ?? item.url ?? undefined;

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

export function normalizeHotmartSales(data: any): NormalizedHotmartSale[] {
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
        Number(
          item.value ??
            item.amount ??
            item.gross_value ??
            item.grossAmount ??
            item.purchase?.product?.price?.value ??
            item.commission?.value ??
            0
        ) || 0;
      const approvedAt =
        item.approved_date ??
        item.approvedAt ??
        item.purchase?.approved_date ??
        item.purchase?.approvedAt ??
        item.transaction_date ??
        item.date_approved ??
        item.date ??
        undefined;
      const status = item.status ?? item.purchase?.status ?? item.status_name;

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
