import { auth } from "@/auth";
import { ProductCard } from "@/components/product-card";
import { fetchHotmartProducts } from "@/lib/hotmart";

export default async function PlataformaPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const products = await fetchHotmartProducts();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-2xl font-semibold">Produtos</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Pague com seguranca via links Hotmart.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const priceCents = Math.round((product.price || 0) * 100);
          const checkoutUrl = product.checkoutUrl || (product.id ? `https://pay.hotmart.com/${product.id}` : undefined);
          const id = Number(product.id);

          return (
            <ProductCard
              key={`hotmart-${product.id}`}
              product={{
                id: Number.isFinite(id) ? id : 0,
                name: product.name,
                description: product.description ?? "Produto da Hotmart",
                priceCents,
                imageUrl: product.imageUrl,
                checkoutUrl,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
