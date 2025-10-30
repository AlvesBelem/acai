import { NextResponse } from "next/server";

type AuthFn = () => Promise<{ user?: { role?: string } } | null>;
type FetchHotmartFn = (path: string) => Promise<unknown>;

export async function GET(request: Request) {
  // lazy imports com casting para tipos explícitos (evita uso de `Function`)
  const { auth } = (await import("@/auth").catch(() => ({}))) as { auth?: AuthFn };
  const { fetchHotmart } = (await import("@/lib/hotmart").catch(() => ({}))) as { fetchHotmart?: FetchHotmartFn };

  try {
    if (typeof auth === "function") {
      const session = await auth();
      const role = session?.user?.role;
      if (role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
  } catch {
    return NextResponse.json({ error: "Erro na autenticação" }, { status: 500 });
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const perPage = url.searchParams.get("perPage") ?? "20";

  try {
    if (typeof fetchHotmart !== "function") {
      return NextResponse.json({ error: "fetchHotmart não disponível" }, { status: 500 });
    }

    const data = await fetchHotmart(`/rest/apiv3/sales?page=${page}&rows=${perPage}`);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
