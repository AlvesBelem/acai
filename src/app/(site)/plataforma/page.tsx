export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { ProductCard } from "@/components/product-card";

export default async function PlataformaPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold">Catalogo de produtos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Todos os produtos abaixo foram cadastrados manualmente pela equipe, com links oficiais de checkout e pagina
            de vendas. Clique para ser direcionado ao local desejado com seguranca.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {products.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Ainda nao temos produtos publicados. Volte em breve para conhecer novas ofertas.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
