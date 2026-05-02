import { Sidebar } from "@/components/Sidebar";
import { getCategoryTree } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategoryTree();

  return (
    <div className="flex min-h-screen">
      <Sidebar categories={categories} />
      <main className="flex-1 min-w-0 pt-12 md:pt-0">
        {children}
      </main>
    </div>
  );
}
