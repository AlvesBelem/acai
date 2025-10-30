import { auth } from "@/auth";
import { ProductCard } from "@/components/product-card";
import { fetchHotmartProducts } from "@/lib/hotmart";

export default async function PlataformaPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  let products = [] as Awaited<ReturnType<typeof fetchHotmartProducts>>;\n  let errorMessage: string | null = null;\n  try {\n    products = await fetchHotmartProducts();\n  } catch (error) {\n    errorMessage = error instanceof Error ? error.message : "Nao foi possivel consultar a Hotmart agora.";\n  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-2xl font-semibold">Produtos</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Pague com seguranca via links Hotmart.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">\n        {errorMessage ? (\n          <div className="col-span-full rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">\n            {errorMessage}\n          </div>\n        ) : products.map((product) => {
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

