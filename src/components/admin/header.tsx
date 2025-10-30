"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppRole, ROLES } from "@/lib/roles";

type AdminHeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: AppRole | null;
  } | null;
};

export function AdminHeader({ user }: AdminHeaderProps) {
  const [pending, startTransition] = useTransition();

  const initials = user?.name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "AC";
  const role = user?.role ?? ROLES.LEAD;

  const handleSignOut = () => {
    startTransition(() => {
      void signOut({ callbackUrl: "/" });
    });
  };

  return (
    <header className="rounded-3xl border border-zinc-200 bg-white/80 px-6 py-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {user?.image ? <AvatarImage src={user.image} alt={user.name ?? "Usuario"} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {user?.name ?? "Administrador"}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email ?? "Sem email"}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {role === "ADMIN" ? "Administrador" : "Lead"}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={pending}
          className="self-start border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {pending ? "Saindo..." : "Sair"}
        </Button>
      </div>
    </header>
  );
}


