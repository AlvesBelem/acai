export const dynamic = "force-dynamic";
export const revalidate = 0;


export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
