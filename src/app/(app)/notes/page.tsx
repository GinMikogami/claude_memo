import { prisma } from "@/lib/prisma";
import { NoteCard } from "@/components/NoteCard";
import { Breadcrumb } from "@/components/Breadcrumb";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ page?: string; sort?: string }>;
};

const PAGE_SIZE = 18;

export default async function NotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const sort = params.sort === "created" ? "createdAt" : "updatedAt";
  const skip = (page - 1) * PAGE_SIZE;

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      orderBy: { [sort]: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        summary: true,
        categoryId: true,
        updatedAt: true,
        category: { include: { parent: true } },
        noteTags: { include: { tag: true } },
      },
    }),
    prisma.note.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "すべてのメモ" }]} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">すべてのメモ</h1>
          <p className="text-sm text-muted-foreground">{total} 件</p>
        </div>
        <div className="flex gap-2 text-sm">
          <a href="?sort=updated" className={`hover:text-primary ${sort === "updatedAt" ? "font-medium text-primary" : "text-muted-foreground"}`}>更新順</a>
          <span className="text-muted-foreground">|</span>
          <a href="?sort=created" className={`hover:text-primary ${sort === "createdAt" ? "font-medium text-primary" : "text-muted-foreground"}`}>作成順</a>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-muted-foreground">メモがありません。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {page > 1 && (
            <a href={`?page=${page - 1}&sort=${params.sort ?? ""}`} className="px-3 py-1.5 rounded border text-sm hover:bg-muted">
              前へ
            </a>
          )}
          <span className="px-3 py-1.5 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a href={`?page=${page + 1}&sort=${params.sort ?? ""}`} className="px-3 py-1.5 rounded border text-sm hover:bg-muted">
              次へ
            </a>
          )}
        </div>
      )}
    </div>
  );
}
