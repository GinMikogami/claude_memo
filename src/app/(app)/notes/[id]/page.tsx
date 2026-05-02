import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TagList } from "@/components/TagList";
import { SummaryCard } from "@/components/SummaryCard";
import { MarkdownCopyButton } from "@/components/MarkdownCopyButton";
import { RelatedNotes } from "@/components/RelatedNotes";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function NoteDetailPage({ params }: Props) {
  const { id } = await params;
  const noteId = parseInt(id);

  if (isNaN(noteId)) notFound();

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      category: { include: { parent: true } },
      noteTags: { include: { tag: true } },
    },
  });

  if (!note) notFound();

  const tags = note.noteTags.map((nt) => nt.tag);

  // Related notes: same category or overlapping tags
  const tagIds = tags.map((t) => t.id);
  const related = await prisma.note.findMany({
    where: {
      id: { not: note.id },
      OR: [
        note.categoryId ? { categoryId: note.categoryId } : {},
        tagIds.length > 0 ? { noteTags: { some: { tagId: { in: tagIds } } } } : {},
      ].filter((c) => Object.keys(c).length > 0),
    },
    take: 6,
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "メモ一覧", href: "/notes" },
    ...(note.category
      ? [
          note.category.parent
            ? { label: note.category.parent.name, href: `/categories/${note.category.parentId}` }
            : null,
          { label: note.category.name, href: `/categories/${note.category.id}` },
        ].filter(Boolean)
      : []),
    { label: note.title },
  ] as { label: string; href?: string }[];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-8">
        {/* Main content */}
        <article className="flex-1 min-w-0 space-y-6">
          <div className="space-y-3">
            <Breadcrumb crumbs={crumbs} />
            <h1 className="text-3xl font-bold leading-tight">{note.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {note.category && (
                <span>
                  {note.category.parent ? `${note.category.parent.name} › ` : ""}
                  {note.category.name}
                </span>
              )}
              <span>更新: {formatDate(note.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {tags.length > 0 && <TagList tags={tags} />}
              <MarkdownCopyButton
                title={note.title}
                content={note.content}
                tags={tags.map((t) => t.name)}
              />
            </div>
          </div>

          {note.summary && <SummaryCard summary={note.summary} />}

          <div className="prose-wiki max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
          </div>
        </article>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-6 space-y-4">
            <RelatedNotes notes={related} />
          </div>
        </aside>
      </div>
    </div>
  );
}
