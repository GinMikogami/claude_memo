import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/types";

type Props = {
  tags: Tag[];
  className?: string;
};

export function TagList({ tags, className }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {tags.map((tag) => (
        <Link key={tag.id} href={`/tags/${tag.id}`}>
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/60 transition-colors">
            #{tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
