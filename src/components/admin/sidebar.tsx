"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Menu,
  ChevronsLeft,
  ChevronsRight,
  X,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Package,
  PlusCircle,
  Layers,
} from "lucide-react";
import { usePathname } from "next/navigation";

const ICON_MAP = {
  dashboard: LayoutDashboard,
  admins: ShieldCheck,
  clientes: Users,
  produtos: Package,
  create: PlusCircle,
  integracao: Layers,
} as const;

export type AdminNavIconKey = keyof typeof ICON_MAP;

export type AdminNavItem = {
  id: string;
  label: string;
  icon: AdminNavIconKey;
  href: string;
};

export function AdminSidebar({ items }: { items: AdminNavItem[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const activeMap = useMemo(() => {
    return items.reduce<Record<string, boolean>>((acc, item) => {
      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
      acc[item.id] = active;
      return acc;
    }, {});
  }, [items, pathname]);

  return (
    <aside
      className={cn(
        "relative hidden flex-col rounded-3xl border border-zinc-200 bg-white/90 p-4 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900/90 md:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between">
        {!collapsed ? (
          <div className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Menu
          </div>
        ) : (
          <span className="sr-only">Menu</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((prev) => !prev)}
          className="h-9 w-9 border border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          <span className="sr-only">Alternar menu</span>
        </Button>
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-medium text-zinc-600 transition hover:border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                collapsed && "justify-center",
                activeMap[item.id] &&
                  "border-zinc-200 bg-zinc-100 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function AdminSidebarMobile({ items }: { items: AdminNavItem[] }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prev) => !prev);

  const close = () => setOpen(false);
  const pathname = usePathname();
  useEffect(() => {
    close();
  }, [pathname]);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Menu
          </p>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Administracao</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="admin-mobile-sidebar"
          className="h-9 w-9 border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Abrir menu</span>
        </Button>
      </div>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-200",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
      />
      <nav
        id="admin-mobile-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col gap-2 border-r border-zinc-200 bg-white/95 p-4 shadow-lg transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-900/95",
          open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Navegacao
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            className="h-9 w-9 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Fechar menu</span>
          </Button>
        </div>
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={close}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                active && "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
