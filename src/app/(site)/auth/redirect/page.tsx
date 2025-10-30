import { auth } from "@/auth";
import { DEFAULT_ROLE } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const role = session.user.role ?? DEFAULT_ROLE;
  redirect(role === "ADMIN" ? "/admin" : "/plataforma");
}

