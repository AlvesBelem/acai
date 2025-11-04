export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

async function getDashboardData() {
  const [leadsCount, adminCount, productCount, activeCount, activeSum, recentProducts] = await Promise.all([
    db.user.count({ where: { role: "LEAD" } }),
    db.user.count({ where: { role: { in: ["ADMIN", "SUPERUSER"] } } }),
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.product.aggregate({
      where: { isActive: true },
      _sum: { priceCents: true },
    }),
    db.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        externalPlatform: true,
        externalId: true,
        priceCents: true,
        isActive: true,
        updatedAt: true,
      },
    }),
  ]);

  const inactiveCount = productCount - activeCount;
  const catalogValueCents = activeSum._sum.priceCents ?? 0;

  return {
    leadsCount,
    adminCount,
    productCount,
    activeCount,
    inactiveCount,
    catalogValueCents,
    recentProducts,
  };
}

export default async function AdminDashboardPage() {
  const { leadsCount, adminCount, productCount, activeCount, inactiveCount, catalogValueCents, recentProducts } =
    await getDashboardData();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Leads ativos"
          value={`${leadsCount}`}
          subtitle={`Administradores: ${adminCount}`}
        />
        <SummaryCard title="Produtos ativos" value={`${activeCount}`} subtitle="Publicados na plataforma" />
        <SummaryCard title="Produtos inativos" value={`${inactiveCount}`} subtitle="Disponiveis para ajustes" />
        <SummaryCard
          title="Valor do catálogo"
          value={(catalogValueCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          subtitle={`${productCount} produto${productCount === 1 ? "" : "s"} cadastrados`}
          accent
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 lg:col-span-2">
          <div>
            <h2 className="text-lg font-semibold">Ultimas atualizacoes do catalogo</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Acompanhe os produtos editados recentemente e valide links, precos e status de publicacao.
            </p>
          </div>
          <div className="space-y-4">
            {recentProducts.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ainda nao ha produtos cadastrados. Utilize a aba &quot;Produtos&quot; para criar a primeira oferta.
              </p>
            ) : (
              recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col justify-between gap-2 rounded-2xl border border-zinc-200 bg-white/80 px-4 py-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/80 md:flex-row md:items-center"
                >
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">{product.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {product.externalPlatform ?? "Plataforma manual"}
                      {product.externalId ? ` - ID ${product.externalId}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      {product.isActive ? "Ativo" : "Inativo"} -{" "}
                      {(product.priceCents / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <span>
                      Atualizado em{" "}
                      {new Date(product.updatedAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
          <h2 className="text-lg font-semibold">Checklist rapido</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
            <li>- Revise periodicamente os links de checkout e pagina de vendas.</li>
            <li>- Atualize precos e descricoes conforme campanhas vigentes.</li>
            <li>- Utilize imagens em Data URL ou links confiaveis para evitar quedas.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90",
        accent && "bg-linear-to-br from-[#7B2CBF] via-[#5C1F8E] to-[#2B0141] text-white dark:border-transparent"
      )}
    >
      <p className={cn("text-sm font-semibold text-zinc-500 dark:text-zinc-400", accent && "text-white/70")}>{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className={cn("mt-1 text-xs text-zinc-500 dark:text-zinc-400", accent && "text-white/80")}>{subtitle}</p>
    </div>
  );
}




