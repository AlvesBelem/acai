import type { HotmartConfig } from "@prisma/client";

import { db } from "@/lib/db";
import { getHotmartConfig } from "@/lib/hotmart";
import { saveHotmartConfig } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

async function loadConfig(): Promise<HotmartConfig | null> {
  const config = await db.hotmartConfig.findFirst();
  if (config) {
    return config;
  }
  return getHotmartConfig();
}

export default async function HotmartIntegracaoPage() {
  const config = await loadConfig();

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Integracao Hotmart</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Cadastre as credenciais da API da Hotmart para sincronizar produtos e vendas.
        </p>
      </header>

      <form action={saveHotmartConfig} className="space-y-4">
        <div>
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            name="clientId"
            defaultValue={config?.clientId ?? ""}
            placeholder="client_id"
            required
          />
        </div>
        <div>
          <Label htmlFor="clientSecret">Client Secret</Label>
          <Input
            id="clientSecret"
            name="clientSecret"
            type="password"
            defaultValue={config?.clientSecret ?? ""}
            placeholder="client_secret"
            required
          />
        </div>
        <div>
          <Label htmlFor="basicToken">Basic token (Base64)</Label>
          <Input
            id="basicToken"
            name="basicToken"
            type="password"
            defaultValue={config?.basicToken ?? ""}
            placeholder="Base64(clientId:clientSecret)"
            required
          />
        </div>
        <div>
          <Label htmlFor="webhookSecret">Webhook secret (opcional)</Label>
          <Input
            id="webhookSecret"
            name="webhookSecret"
            defaultValue={config?.webhookSecret ?? ""}
            placeholder="Segredo para validar webhooks"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit">Salvar credenciais</Button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Apos salvar, utilize a API em /api/hotmart para sincronizacao.
          </span>
        </div>
      </form>
    </div>
  );
}



