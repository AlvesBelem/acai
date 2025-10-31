export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/lib/db";
import { promoteToAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export default async function ClientesPage() {
  const leads = await db.user.findMany({
    where: { role: "LEAD" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Clientes (leads)</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Acompanhe os estabelecimentos interessados e promova parceiros estrategicos para administradores.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {leads.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum lead cadastrado por enquanto.</p>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80"
            >
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {lead.name ?? lead.email}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{lead.email}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Criado em {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
              </p>
              <form action={promoteToAdmin} className="mt-4">
                <input type="hidden" name="userId" value={lead.id} />
                <Button size="sm">Promover para admin</Button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

