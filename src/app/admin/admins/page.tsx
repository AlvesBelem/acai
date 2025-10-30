import { db } from "@/lib/db";
import { demoteToLead } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export default async function AdminsPage() {
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Administradores</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Confira quem possui acesso total a plataforma. Remova permissao quando necessario.
        </p>
      </header>

      <div className="space-y-4">
        {admins.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum administrador cadastrado.</p>
        ) : (
          admins.map((admin) => (
            <div
              key={admin.id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 px-4 py-4 shadow-sm dark:border-zinc-800"
            >
              <div>
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {admin.name ?? admin.email}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{admin.email}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Desde {new Date(admin.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <form action={demoteToLead} className="self-start">
                <input type="hidden" name="userId" value={admin.id} />
                <Button variant="outline" size="sm">
                  Remover acesso admin
                </Button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

