import { db } from "@/lib/db";
import { fetchHotmartSalesHistory } from "@/lib/hotmart";
import { cn } from "@/lib/utils";

function subDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - amount);
  return result;
}

function formatISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatLabel(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

async function getDashboardData() {
  const [leadsCount, adminCount, productCount] = await Promise.all([
    db.user.count({ where: { role: "LEAD" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.product.count(),
  ]);

  let sales = [] as Awaited<ReturnType<typeof fetchHotmartSalesHistory>>;
  try {
    const end = new Date();
    const start = subDays(end, 6);
    sales = await fetchHotmartSalesHistory({
      startDate: formatISODate(start),
      endDate: formatISODate(end),
      rows: 200,
    });
  } catch (error) {
    sales = [];
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount ?? 0), 0);
  const salesCount = sales.length;

  const todayKey = formatISODate(new Date());
  const todaySales = sales.filter((sale) => sale.approvedAt?.startsWith(todayKey)).length;

  const labels: string[] = [];
  const weeklyMap = new Map<string, { count: number; amount: number }>();

  for (let i = 6; i >= 0; i -= 1) {
    const date = subDays(new Date(), i);
    const key = formatISODate(date);
    weeklyMap.set(key, { count: 0, amount: 0 });
    labels.push(key);
  }

  for (const sale of sales) {
    if (!sale.approvedAt) continue;
    const key = sale.approvedAt.slice(0, 10);
    if (weeklyMap.has(key)) {
      const entry = weeklyMap.get(key)!;
      entry.count += 1;
      entry.amount += sale.amount ?? 0;
      weeklyMap.set(key, entry);
    }
  }

  const weeklySales = labels.map((key) => ({
    label: formatLabel(new Date(key)),
    value: weeklyMap.get(key)?.count ?? 0,
  }));

  return {
    leadsCount,
    adminCount,
    productCount,
    salesCount,
    totalRevenue,
    todaySales,
    weeklySales,
  };
}

export default async function AdminDashboardPage() {
  const { leadsCount, adminCount, productCount, salesCount, totalRevenue, todaySales, weeklySales } =
    await getDashboardData();

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Leads ativos"
          value={`${leadsCount}`}
          subtitle={`Administradores: ${adminCount}`}
        />
        <SummaryCard title="Produtos" value={`${productCount}`} subtitle="Ofertas sincronizadas" />
        <SummaryCard title="Vendas (7 dias)" value={`${salesCount}`} subtitle="Total de pedidos aprovados" />
        <SummaryCard
          title="Faturamento (7 dias)"
          value={totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          subtitle={`Vendas hoje: ${todaySales}`}
          accent
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 lg:col-span-2">
          <h2 className="text-lg font-semibold">Vendas Hotmart (7 dias)</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Dados atualizados diretamente da API da Hotmart.
          </p>
          <div className="mt-8 grid grid-cols-7 gap-3">
            {weeklySales.map((day) => (
              <div key={day.label} className="flex flex-col items-center gap-2">
                <div
                  className="flex h-24 w-10 items-end justify-center rounded-full bg-zinc-100 p-1 dark:bg-zinc-800"
                >
                  <div
                    className="w-full rounded-full bg-gradient-to-b from-[#7B2CBF] to-[#5C1F8E]"
                    style={{ height: `${Math.min(day.value * 15, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
          <h2 className="text-lg font-semibold">Checklist rapido</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
            <li>- Confirme as credenciais da Hotmart e renove tokens periodicamente.</li>
            <li>- Sincronize produtos para manter o catalogo atualizado.</li>
            <li>- Acompanhe vendas por dia e valide com o time financeiro.</li>
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
        accent && "bg-gradient-to-br from-[#7B2CBF] via-[#5C1F8E] to-[#2B0141] text-white dark:border-transparent"
      )}
    >
      <p className={cn("text-sm font-semibold text-zinc-500 dark:text-zinc-400", accent && "text-white/70")}>{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className={cn("mt-1 text-xs text-zinc-500 dark:text-zinc-400", accent && "text-white/80")}>{subtitle}</p>
    </div>
  );
}
