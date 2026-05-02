import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NoteCard } from "@/components/NoteCard";
import { SearchBar } from "@/components/SearchBar";
import { Breadcrumb } from "@/components/Breadcrumb";

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const skip = (page - 1) * PAGE_SIZE;

  const where = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { content: { contains: q, mode: "insensitive" as const } },
          { noteTags: { some: { tag: { name: { contains: q, mode: "insensitive" as const } } } } },
        ],
      }
    : undefined;

  const [notes, total] = q
    ? await Promise.all([
        prisma.note.findMany({
          where,
          orderBy: { updatedAt: "desc" },
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
        prisma.note.count({ where }),
      ])
    : [[], 0];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "検索" }]} />
        <h1 className="text-2xl font-bold">検索</h1>
      </div>

      <SearchBar defaultValue={q} placeholder="タイトル・本文・タグで検索..." />

      {q && (
        <p className="text-sm text-muted-foreground">
          「{q}」の検索結果: {total} 件
        </p>
      )}

      {!q && (
        <p className="text-muted-foreground text-sm">キーワードを入力してください。</p>
      )}

      {q && notes.length === 0 && (
        <p className="text-muted-foreground">「{q}」に一致するメモは見つかりませんでした。</p>
      )}

      {notes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {page > 1 && (
            <Link href={`?q=${encodeURIComponent(q)}&page=${page - 1}`} className="px-3 py-1.5 rounded border text-sm hover:bg-muted">
              前へ
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`?q=${encodeURIComponent(q)}&page=${page + 1}`} className="px-3 py-1.5 rounded border text-sm hover:bg-muted">
              次へ
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
