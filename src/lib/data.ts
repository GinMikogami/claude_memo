import { prisma } from "./prisma";
import type { CategoryWithChildren } from "@/types";

export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  const all = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const map = new Map<number, CategoryWithChildren>();
  for (const c of all) {
    map.set(c.id, { ...c, children: [] });
  }

  const roots: CategoryWithChildren[] = [];
  for (const c of Array.from(map.values())) {
    if (c.parentId === null) {
      roots.push(c);
    } else {
      map.get(c.parentId)?.children.push(c);
    }
  }

  return roots;
}
