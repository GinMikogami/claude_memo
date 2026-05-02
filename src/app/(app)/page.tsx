import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NoteCard } from "@/components/NoteCard";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [recentNotes, recentlyAdded, popularTags] = await Promise.all([
    prisma.note.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
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
    prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.tag.findMany({
      include: { _count: { select: { noteTags: true } } },
      orderBy: { noteTags: { _count: "desc" } },
      take: 20,
    }),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">ダッシュボード</h1>
        <p className="text-muted-foreground text-sm">Knowledge Base へようこそ</p>
      </div>

      {/* Recently updated */}
      <section>
        <h2 className="text-lg font-semibold mb-4">最近更新されたメモ</h2>
        {recentNotes.length === 0 ? (
          <p className="text-muted-foreground text-sm">まだメモがありません。Notion同期を実行してください。</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recently added */}
        <section>
          <h2 className="text-lg font-semibold mb-4">最近追加されたメモ</h2>
          {recentlyAdded.length === 0 ? (
            <p className="text-muted-foreground text-sm">なし</p>
          ) : (
            <ul className="space-y-2">
              {recentlyAdded.map((note) => (
                <li key={note.id}>
                  <Link
                    href={`/notes/${note.id}`}
                    className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                  >
                    <span className="truncate flex-1 mr-2">{note.title}</span>
                    <span className="text-muted-foreground shrink-0">{formatDate(note.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Popular tags */}
        <section>
          <h2 className="text-lg font-semibold mb-4">人気タグ</h2>
          {popularTags.length === 0 ? (
            <p className="text-muted-foreground text-sm">タグなし</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.id}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/60 transition-colors">
                    #{tag.name}
                    <span className="ml-1 text-muted-foreground text-xs">({tag._count.noteTags})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
