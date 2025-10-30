import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // lazy import para evitar efeitos colaterais na fase de build
  const { auth } = await import("@/auth");
  const { fetchHotmart } = await import("@/lib/hotmart");

  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = url.searchParams.get("page") ?? "1";
  const perPage = url.searchParams.get("perPage") ?? "20";

  try {
    const data = await fetchHotmart(`/rest/apiv3/product/list?page=${page}&rows=${perPage}`);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
