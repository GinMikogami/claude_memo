import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type RelatedNote = {
  id: number;
  title: string;
  updatedAt: Date;
};

type Props = {
  notes: RelatedNote[];
};

export function RelatedNotes({ notes }: Props) {
  if (notes.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">関連メモ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="flex items-start gap-2 text-sm hover:text-primary transition-colors group"
          >
            <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary" />
            <span className="line-clamp-2">{note.title}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
