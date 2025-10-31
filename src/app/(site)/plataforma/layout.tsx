export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar, AdminSidebarMobile, type AdminNavItem } from "@/components/admin/sidebar";
import { db } from "@/lib/db";
import { AppRole } from "@/lib/roles";

const NAV_ITEMS: AdminNavItem[] = [
  { id: "produtos", label: "Produtos", icon: "produtos", href: "/plataforma" },
];

export default async function PlataformaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  let viewer = null as
    | {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        role: AppRole;
      }
    | null;

  if (session.user.id) {
    const record = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    if (record) {
      let image = record.image;
      if (!image && session.user.image) {
        await db.user.update({
          where: { id: record.id },
          data: { image: session.user.image },
        });
        image = session.user.image;
      }

      viewer = {
        id: record.id,
        name: record.name,
        email: record.email,
        image,
        role: (record.role ?? session.user.role ?? "LEAD") as AppRole,
      };
    }
  }

  const headerUser = viewer ?? session.user;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <AdminSidebarMobile items={NAV_ITEMS} />
        <div className="flex w-full gap-6">
          <AdminSidebar items={NAV_ITEMS} />
          <main className="flex-1 space-y-8">
            <AdminHeader user={headerUser} />
            <div className="pt-4">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
