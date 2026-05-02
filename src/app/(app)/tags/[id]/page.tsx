import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NoteCard } from "@/components/NoteCard";
import { Breadcrumb } from "@/components/Breadcrumb";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: Props) {
  const { id } = await params;
  const tagId = parseInt(id);
  if (isNaN(tagId)) notFound();

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) notFound();

  const notes = await prisma.note.findMany({
    where: { noteTags: { some: { tagId } } },
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

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: `#${tag.name}` }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">#{tag.name}</h1>
          <p className="text-sm text-muted-foreground">{notes.length} 件</p>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-muted-foreground">このタグのメモはありません。</p>
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
