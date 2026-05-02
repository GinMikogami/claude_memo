import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagList } from "./TagList";
import { formatDate } from "@/lib/utils";
import type { NoteListItem } from "@/types";

type Props = {
  note: NoteListItem;
};

export function NoteCard({ note }: Props) {
  const tags = note.noteTags.map((nt) => nt.tag);

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
            {note.title}
          </CardTitle>
          {note.category && (
            <p className="text-xs text-muted-foreground mt-1">
              {note.category.parent ? `${note.category.parent.name} › ` : ""}
              {note.category.name}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {note.summary && (
            <p className="text-sm text-muted-foreground line-clamp-3">{note.summary}</p>
          )}
          {tags.length > 0 && <TagList tags={tags} />}
          <p className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
