export const dynamic = "force-dynamic";
export const revalidate = 0;

import { db } from "@/lib/db";
import { promoteToAdmin } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function normalizePhone(phone?: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return digits.length === 11 ? `+55${digits}` : digits.startsWith("+") ? digits : `+${digits}`;
}

function buildMissingFields(lead: Awaited<ReturnType<typeof db.user.findMany>>[number]) {
  const missing: string[] = [];
  if (!lead.phone) missing.push("Telefone");
  if (!lead.company) missing.push("Empresa");
  if (!lead.jobTitle) missing.push("Cargo");
  if (!lead.location) missing.push("Local");
  if (!lead.locale) missing.push("Idioma");
  return missing;
}

export default async function ClientesPage() {
  const leads = await db.user.findMany({
    where: { role: "LEAD" },
    orderBy: { createdAt: "desc" },
  });

  const sortedLeads = leads
    .map((lead) => {
      const missing = buildMissingFields(lead);
      const normalizedPhone = normalizePhone(lead.phone);
      const whatsappUrl = normalizedPhone ? `https://wa.me/${normalizedPhone}` : null;
      const source = (lead as { source?: string | null }).source ?? "Google OAuth";
      return {
        ...lead,
        missing,
        normalizedPhone,
        whatsappUrl,
        source,
      };
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
        <h1 className="text-2xl font-semibold">Clientes (leads)</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Acompanhe os estabelecimentos interessados e promova parceiros estrategicos para administradores.
          </p>
        </header>

      <div className="grid gap-4 md:grid-cols-2">
        {sortedLeads.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum lead cadastrado por enquanto.</p>
        ) : (
          sortedLeads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80"
            >
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {lead.name ?? lead.email}
                </p>
                <a
                  className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
                  href={`mailto:${lead.email}`}
                >
                  {lead.email}
                </a>
                <div className="mt-1 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {lead.source ?? "Google OAuth"}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5",
                      lead.missing.length === 0
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    )}
                  >
                    {lead.missing.length === 0
                      ? "Perfil completo"
                      : `Faltam: ${lead.missing.join(", ")}`}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                {lead.phone ? (
                  <a
                    className="flex items-center gap-2 text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
                    href={`tel:${lead.phone}`}
                  >
                    Telefone: {lead.phone}
                  </a>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Telefone nao informado</p>
                )}
                {lead.company || lead.jobTitle ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {lead.company ?? "Empresa nao informada"}
                    {lead.jobTitle ? ` - ${lead.jobTitle}` : ""}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Empresa/Cargo nao informados</p>
                )}
                {lead.location ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Local: {lead.location}</p>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Local nao informado</p>
                )}
                {lead.locale ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Idioma: {lead.locale}</p>
                ) : null}
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Criado em {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={`mailto:${lead.email}`}>Enviar email</a>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant={lead.whatsappUrl ? "default" : "outline"}
                  className={cn(!lead.whatsappUrl && "pointer-events-none opacity-60")}
                >
                  <a href={lead.whatsappUrl ?? "#"} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </Button>
                <form action={promoteToAdmin}>
                  <input type="hidden" name="userId" value={lead.id} />
                  <Button size="sm">Promover para admin</Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}







