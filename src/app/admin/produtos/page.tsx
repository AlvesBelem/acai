export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

function formatDate(date: Date) {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminProdutosPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Catalogo de produtos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Visualize rapidamente todos os cards cadastrados. Utilize o link abaixo para incluir ou editar produtos.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/cadastrar">Cadastrar produto</Link>
        </Button>
      </header>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/80 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
          Nenhum produto cadastrado no momento.{" "}
          <Link href="/admin/produtos/cadastrar" className="font-semibold underline">
            Clique aqui para cadastrar o primeiro.
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const statusLabel = product.isActive ? "Ativo" : "Inativo";
            const timestamp = formatDate(product.updatedAt ?? product.createdAt);
            return (
              <div
                key={product.id}
                className="space-y-3 rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    priceCents: product.priceCents,
                    imageUrl: product.imageUrl,
                    checkoutUrl: product.checkoutUrl,
                    salesPageUrl: product.salesPageUrl,
                  }}
                />
                <div className="flex flex-col gap-1 rounded-2xl bg-zinc-100/70 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                  <span className="font-semibold">
                    {statusLabel} - {(product.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                  <span>
                    {product.externalPlatform ?? "Plataforma manual"}
                    {product.externalId ? ` - ID ${product.externalId}` : ""}
                  </span>
                  <span>Atualizado em {timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
