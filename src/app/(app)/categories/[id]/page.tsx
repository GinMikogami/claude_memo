import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NoteCard } from "@/components/NoteCard";
import { Breadcrumb } from "@/components/Breadcrumb";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const catId = parseInt(id);
  if (isNaN(catId)) notFound();

  const category = await prisma.category.findUnique({
    where: { id: catId },
    include: { parent: true, children: true },
  });

  if (!category) notFound();

  // Notes in this category or any child category
  const childIds = category.children.map((c) => c.id);
  const notes = await prisma.note.findMany({
    where: { categoryId: { in: [catId, ...childIds] } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      summary: true,
      categoryId: true,
      updatedAt: true,
      category: { include: { parent: true } },
      noteTags: { include: { tag: true } },
    },
  });

  const crumbs = [
    { label: "Home", href: "/" },
    ...(category.parent
      ? [{ label: category.parent.name, href: `/categories/${category.parent.id}` }]
      : []),
    { label: category.name },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <Breadcrumb crumbs={crumbs} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="text-sm text-muted-foreground">{notes.length} 件</p>
        </div>
      </div>

      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {category.children.map((child) => (
            <a
              key={child.id}
              href={`/categories/${child.id}`}
              className="px-3 py-1.5 rounded-full border text-sm hover:bg-muted transition-colors"
            >
              {child.name}
            </a>
          ))}
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-muted-foreground">このカテゴリにメモはありません。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
