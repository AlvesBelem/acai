import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ProductDTO = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  imageUrl?: string | null;
  checkoutUrl?: string | null;
};

export function ProductCard({ product }: { product: ProductDTO }) {
  const price = (product.priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {product.imageUrl ? (
          <div className="relative mb-3 aspect-video overflow-hidden rounded-md border">
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          </div>
        ) : null}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-semibold">{price}</span>
          {product.checkoutUrl ? (
            <Button asChild>
              <a href={product.checkoutUrl} target="_blank" rel="noopener noreferrer">
                Comprar
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

