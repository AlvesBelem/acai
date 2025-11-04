import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ProductDTO = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  imageUrl?: string | null;
  checkoutUrl?: string | null;
  salesPageUrl?: string | null;
};

export function ProductCard({ product }: { product: ProductDTO }) {
  const price = (product.priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const checkoutUrl = product.checkoutUrl ?? null;
  const salesPageUrl = product.salesPageUrl ?? null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {product.imageUrl ? (
          <div className="mb-3 aspect-video overflow-hidden rounded-md border">
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{product.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-base font-semibold">{price}</span>
          <div className="flex gap-2">
            {checkoutUrl ? (
              <Button asChild>
                <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                  Comprar Agora!
                </a>
              </Button>
            ) : null}
            {!checkoutUrl && salesPageUrl ? (
              <Button asChild variant="outline">
                <a href={salesPageUrl} target="_blank" rel="noopener noreferrer">
                  Ver oferta
                </a>
              </Button>
            ) : null}
            {checkoutUrl && salesPageUrl ? (
              <Button asChild variant="outline">
                <a href={salesPageUrl} target="_blank" rel="noopener noreferrer">
                  Pagina de vendas
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
