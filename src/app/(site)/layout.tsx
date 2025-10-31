export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Navbar } from "@/components/navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />
      <main className="min-h-[calc(100dvh-56px)]">{children}</main>
    </div>
  );
}
