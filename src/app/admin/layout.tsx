import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminSidebar, AdminSidebarMobile, type AdminNavItem } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { AppRole } from "@/lib/roles";

const NAV_ITEMS: AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/admin" },
  { id: "admins", label: "Administradores", icon: "admins", href: "/admin/admins" },
  { id: "clientes", label: "Clientes", icon: "clientes", href: "/admin/clientes" },
  { id: "produtos", label: "Produtos", icon: "produtos", href: "/admin/produtos" },
    { id: "integracoes", label: "Integracoes", icon: "integracao", href: "/admin/integracoes/hotmart" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role as AppRole | undefined;

  if (role !== "ADMIN") {
    redirect("/plataforma");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <AdminSidebarMobile items={NAV_ITEMS} />
        <div className="flex w-full gap-6">
          <AdminSidebar items={NAV_ITEMS} />
          <main className="flex-1 space-y-8">
            <AdminHeader user={session?.user ?? null} />
            <div className="pt-4">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}




