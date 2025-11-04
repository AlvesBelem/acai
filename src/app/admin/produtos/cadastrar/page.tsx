export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/lib/db";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

import { Button } from "@/components/ui/button";

function formatCurrency(priceCents: number) {
  return (priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CadastrarProdutoPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Cadastrar produto manualmente</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Inclua novos itens com imagem, preco e links oficiais. Todos os dados sao exibidos na plataforma e no
            catalogo administrativo.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/produtos">Ver catalogo</Link>
        </Button>
      </header>

      <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
        <h2 className="text-lg font-semibold">Cadastrar novo produto</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Utilize a(s) URLs de checkout ou pagina de vendas da plataforma escolhida. Imagens podem ser um link publico
          ou um Data URL (ex.: imagem base64 gerada pelo Canva).
        </p>
        <form action={createProduct} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" placeholder="Nome do produto" required />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="price">Preco (R$)</Label>
            <Input id="price" name="price" type="text" inputMode="decimal" placeholder="197,00" required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Descricao</Label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
              placeholder="Resumo da oferta e principais beneficios."
            />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="externalPlatform">Plataforma</Label>
            <Input id="externalPlatform" name="externalPlatform" placeholder="Hotmart, Kiwify, Monetizze..." />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="externalId">ID na plataforma</Label>
            <Input id="externalId" name="externalId" placeholder="Identificador ou codigo do produto" />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="checkoutUrl">Link do checkout</Label>
            <Input id="checkoutUrl" name="checkoutUrl" type="url" placeholder="https://..." />
          </div>
          <div className="md:col-span-1">
            <Label htmlFor="salesPageUrl">Pagina de vendas</Label>
            <Input id="salesPageUrl" name="salesPageUrl" type="url" placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="imageUrl">Imagem (URL ou Data URL)</Label>
            <textarea
              id="imageUrl"
              name="imageUrl"
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
              placeholder="Cole um link publico ou data:image/png;base64,..."
            />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked
                className="h-4 w-4 rounded border border-zinc-300 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
              />
              Produto ativo na plataforma
            </label>
            <Button type="submit">Salvar produto</Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Produtos cadastrados</h2>
        {products.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum produto cadastrado ainda. Utilize o formulario acima para criar o primeiro item do catalogo.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {products.map((product) => (
              <form
                key={product.id}
                action={updateProduct}
                className="space-y-4 rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <input type="hidden" name="productId" value={product.id} />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase text-zinc-400 dark:text-zinc-500">ID interno</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">{product.id}</span>
                </div>
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor={`product-name-${product.id}`}>Nome</Label>
                    <Input
                      id={`product-name-${product.id}`}
                      name="name"
                      defaultValue={product.name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`product-price-${product.id}`}>Preco (R$)</Label>
                    <Input
                      id={`product-price-${product.id}`}
                      name="price"
                      type="text"
                      inputMode="decimal"
                      defaultValue={(product.priceCents / 100).toFixed(2)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`product-description-${product.id}`}>Descricao</Label>
                    <textarea
                      id={`product-description-${product.id}`}
                      name="description"
                      rows={3}
                      defaultValue={product.description}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
                      required
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`product-platform-${product.id}`}>Plataforma</Label>
                      <Input
                        id={`product-platform-${product.id}`}
                        name="externalPlatform"
                        defaultValue={product.externalPlatform ?? ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`product-external-${product.id}`}>ID na plataforma</Label>
                      <Input
                        id={`product-external-${product.id}`}
                        name="externalId"
                        defaultValue={product.externalId ?? ""}
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`product-checkout-${product.id}`}>Checkout</Label>
                      <Input
                        id={`product-checkout-${product.id}`}
                        name="checkoutUrl"
                        type="url"
                        defaultValue={product.checkoutUrl ?? ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`product-sales-${product.id}`}>Pagina de vendas</Label>
                      <Input
                        id={`product-sales-${product.id}`}
                        name="salesPageUrl"
                        type="url"
                        defaultValue={product.salesPageUrl ?? ""}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`product-image-${product.id}`}>Imagem (URL ou Data URL)</Label>
                    <textarea
                      id={`product-image-${product.id}`}
                      name="imageUrl"
                      rows={3}
                      defaultValue={product.imageUrl ?? ""}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
                    />
                  </div>
                  {product.imageUrl ? (
                    <div className="flex justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-h-40 w-full rounded-2xl object-cover"
                      />
                    </div>
                  ) : null}
                  <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      name="isActive"
                      value="true"
                      defaultChecked={product.isActive}
                      className="h-4 w-4 rounded border border-zinc-300 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    Produto ativo na plataforma
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Atualizado em {new Date(product.updatedAt ?? product.createdAt).toLocaleString("pt-BR")}
                  {product.externalPlatform ? ` - ${product.externalPlatform}` : ""}
                  {product.externalId ? ` - ID: ${product.externalId}` : ""}
                  </div>
                  <div className="flex gap-2">
                <Button type="submit" size="sm">
                      Salvar alteracoes
                    </Button>
                    <Button
                      type="submit"
                      formAction={deleteProduct}
                      variant="outline"
                      size="sm"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <p>
                    Valor exibido na plataforma: <strong>{formatCurrency(product.priceCents)}</strong>
                  </p>
                  {product.checkoutUrl ? <p>Checkout: {product.checkoutUrl}</p> : null}
                  {product.salesPageUrl ? <p>Pagina de vendas: {product.salesPageUrl}</p> : null}
                </div>
              </form>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}



