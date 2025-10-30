import Image from "next/image";

import { fetchHotmartProducts } from "@/lib/hotmart";

export default async function ProdutosPage() {
  let products = [] as Awaited<ReturnType<typeof fetchHotmartProducts>>;
  let errorMessage: string | null = null;

  try {
    products = await fetchHotmartProducts();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Nao foi possivel consultar a Hotmart agora.";
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold">Catalogo de produtos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Os dados abaixo sao carregados diretamente da API da Hotmart. Utilize esses detalhes para validar valores,
            checkout e copy.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {errorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {errorMessage}
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum produto foi encontrado na Hotmart com as credenciais informadas.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const price = (product.price || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });

              const checkoutUrl =
                product.checkoutUrl || (product.id ? `https://pay.hotmart.com/${product.id}` : undefined);

              return (
                <div
                  key={String(product.id)}
                  className="group relative h-64 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-900 text-white shadow-lg transition hover:shadow-xl dark:border-zinc-800"
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover opacity-70 transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-[#7B2CBF] via-[#5C1F8E] to-[#2B0141] opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between p-5">
                    <div>
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-wide text-white/90">
                        {product.id}
                      </span>
                      <h2 className="mt-3 text-xl font-semibold">{product.name}</h2>
                      <p className="mt-2 line-clamp-3 text-sm text-white/80">
                        {product.description ?? "Produto sem descricao."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span className="font-semibold">{price}</span>
                      {checkoutUrl ? (
                        <a
                          className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide hover:bg-white/20"
                          href={checkoutUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Checkout
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
