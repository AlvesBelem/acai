import Link from "next/link";
import { auth } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButton } from "@/components/auth-button";
import { AppRole } from "@/lib/roles";

export async function Navbar() {
  const session = await auth();
  const role = session?.user?.role as AppRole | undefined;
  const isAdmin = role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <nav className="flex items-center gap-4 text-sm">
          <Link className="font-semibold" href="/">
            Açaí Coleta
          </Link>
          <Link className="text-zinc-600 hover:underline dark:text-zinc-400" href="/plataforma">
            Plataforma
          </Link>
          {isAdmin && (
            <Link className="text-zinc-600 hover:underline dark:text-zinc-400" href="/admin">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthButton authed={!!session?.user} />
        </div>
      </div>
    </header>
  );
}
