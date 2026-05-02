"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryWithChildren } from "@/types";

type Props = {
  categories: CategoryWithChildren[];
  currentCategoryId?: number;
};

export function CategoryTree({ categories, currentCategoryId }: Props) {
  return (
    <ul className="space-y-0.5">
      {categories.map((cat) => (
        <CategoryNode key={cat.id} category={cat} currentCategoryId={currentCategoryId} depth={0} />
      ))}
    </ul>
  );
}

type NodeProps = {
  category: CategoryWithChildren;
  currentCategoryId?: number;
  depth: number;
};

function CategoryNode({ category, currentCategoryId, depth }: NodeProps) {
  const hasChildren = category.children.length > 0;
  const isActive = category.id === currentCategoryId;
  const childActive = category.children.some((c) => c.id === currentCategoryId);
  const [open, setOpen] = useState(isActive || childActive);

  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-1 rounded-md text-sm transition-colors",
          isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px`, paddingRight: "8px", paddingTop: "4px", paddingBottom: "4px" }}
      >
        {hasChildren ? (
          <button
            onClick={() => setOpen(!open)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={open ? "閉じる" : "開く"}
          >
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {open ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <Link href={`/categories/${category.id}`} className="flex-1 truncate">
          {category.name}
        </Link>
      </div>
      {hasChildren && open && (
        <ul className="mt-0.5 space-y-0.5">
          {category.children.map((child) => (
            <CategoryNode key={child.id} category={child} currentCategoryId={currentCategoryId} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
