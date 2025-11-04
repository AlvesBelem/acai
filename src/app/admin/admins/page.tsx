export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { demoteToLead } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

function normalizePhone(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length === 11 ? `+55${digits}` : digits.startsWith("+") ? digits : `+${digits}`;
}

function buildMissingFields(admin: Awaited<ReturnType<typeof db.user.findMany>>[number]) {
  const missing: string[] = [];
  if (!admin.phone) missing.push("Telefone");
  if (!admin.company) missing.push("Empresa");
  if (!admin.jobTitle) missing.push("Cargo");
  if (!admin.location) missing.push("Local");
  return missing;
}

export default async function AdminsPage() {
  const session = await auth();
  if (session?.user?.role !== ROLES.SUPERUSER) {
    redirect("/admin");
  }

  const adminsRaw = await db.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
  });
  const admins = adminsRaw
    .map((admin) => {
      const missing = buildMissingFields(admin);
      const normalizedPhone = normalizePhone(admin.phone);
      const whatsappUrl = normalizedPhone ? `https://wa.me/${normalizedPhone}` : null;
      const source = (admin as { source?: string | null }).source ?? "Google OAuth";
      return { ...admin, missing, normalizedPhone, whatsappUrl, source };
    })
    .sort((a, b) => {
      if (a.missing.length !== b.missing.length) {
        return b.missing.length - a.missing.length;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
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
              <div className="flex flex-col gap-1">
                <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  {admin.name ?? admin.email}
                </p>
                <a
                  className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
                  href={`mailto:${admin.email}`}
                >
                  {admin.email}
                </a>
                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {admin.source ?? "Google OAuth"}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5",
                      admin.missing.length === 0
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    )}
                  >
                    {admin.missing.length === 0
                      ? "Perfil completo"
                      : `Faltam: ${admin.missing.join(", ")}`}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Desde {new Date(admin.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                {admin.phone ? (
                  <a
                    className="flex items-center gap-2 text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
                    href={`tel:${admin.phone}`}
                  >
                    Telefone: {admin.phone}
                  </a>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Telefone nao informado</p>
                )}
                {admin.company || admin.jobTitle ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {admin.company ?? "Empresa nao informada"}
                    {admin.jobTitle ? ` - ${admin.jobTitle}` : ""}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Empresa/Cargo nao informados</p>
                )}
                {admin.location ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Local: {admin.location}</p>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Local nao informado</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={`mailto:${admin.email}`}>Enviar email</a>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant={admin.whatsappUrl ? "default" : "outline"}
                  className={cn(!admin.whatsappUrl && "pointer-events-none opacity-60")}
                >
                  <a href={admin.whatsappUrl ?? "#"} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </Button>
                <form action={demoteToLead}>
                  <input type="hidden" name="userId" value={admin.id} />
                  <Button variant="outline" size="sm">
                    Remover acesso admin
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

