import { NextResponse } from "next/server";

type AuthFn = () => Promise<{ user?: Record<string, unknown> } | null>;
type GetRedirectUrlFn = (session: { user?: Record<string, unknown> } | null, req: Request) => string | null;

export async function GET(request: Request) {
  // lazy import para evitar execução de efeitos colaterais durante o build
  const { auth, getRedirectUrl } = (await import("@/auth").catch(() => ({}))) as {
    auth?: AuthFn;
    getRedirectUrl?: GetRedirectUrlFn;
  };

  try {
    if (typeof auth !== "function") {
      return NextResponse.json({ error: "Auth não disponível" }, { status: 500 });
    }

    const session = await auth();

    // se houver uma função auxiliar para decidir a URL de redirect, use-a; caso contrário fallback simples
    let redirectUrl: string | null = null;
    if (typeof getRedirectUrl === "function") {
      redirectUrl = getRedirectUrl(session, request);
    } else {
      redirectUrl = session?.user ? "/" : "/login";
    }

    if (!redirectUrl) {
      return NextResponse.json({ error: "Nenhuma URL de redirect definida" }, { status: 400 });
    }

    // garante URL absoluta
    const dest = new URL(redirectUrl, request.url);
    return NextResponse.redirect(dest);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}