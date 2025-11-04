export const runtime = "nodejs"; // ✅ necessário!
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { handlers } from "@/auth";
export const { GET, POST } = handlers;
