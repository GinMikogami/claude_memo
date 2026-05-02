import { prisma } from "@/lib/prisma";
import {
  getNotionDatabase,
  getPageContent,
  extractTitle,
  extractSelect,
  extractMultiSelect,
} from "@/lib/notion";
import { generateSummary } from "./ai-summary";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { SyncResult } from "@/types";

export async function syncFromNotion(): Promise<SyncResult> {
  let synced = 0;
  let errors = 0;

  const pages = await getNotionDatabase();

  for (const page of pages) {
    try {
      await syncPage(page);
      synced++;
    } catch (err) {
      console.error(`Failed to sync page ${page.id}:`, err);
      errors++;
    }
  }

  return {
    synced,
    errors,
    message: `Synced ${synced} notes, ${errors} errors.`,
  };
}

async function syncPage(page: PageObjectResponse): Promise<void> {
  const title = extractTitle(page);
  const lastEdited = new Date(page.last_edited_time);

  // Skip if unchanged
  const existing = await prisma.note.findUnique({
    where: { notionPageId: page.id },
    select: { id: true, notionUpdatedAt: true },
  });

  if (
    existing?.notionUpdatedAt &&
    existing.notionUpdatedAt >= lastEdited
  ) {
    return;
  }

  const content = await getPageContent(page.id);
  const summary = await generateSummary(content);

  // Resolve category
  const categoryProp = page.properties["Category"] ?? page.properties["カテゴリ"];
  const subCategoryProp = page.properties["SubCategory"] ?? page.properties["サブカテゴリ"];

  const categoryName = extractSelect(
    categoryProp?.type === "select" ? (categoryProp as { type: "select"; select: { name: string } | null }) : undefined
  );
  const subCategoryName = extractSelect(
    subCategoryProp?.type === "select" ? (subCategoryProp as { type: "select"; select: { name: string } | null }) : undefined
  );

  const categoryId = await resolveCategory(categoryName, subCategoryName);

  // Resolve tags
  const tagsProp = page.properties["Tags"] ?? page.properties["タグ"];
  const tagNames = extractMultiSelect(
    tagsProp?.type === "multi_select" ? (tagsProp as { type: "multi_select"; multi_select: { name: string }[] }) : undefined
  );
  const tagIds = await resolveTags(tagNames);

  if (existing) {
    await prisma.note.update({
      where: { id: existing.id },
      data: {
        title,
        content,
        summary,
        categoryId,
        notionUpdatedAt: lastEdited,
        noteTags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
  } else {
    await prisma.note.create({
      data: {
        notionPageId: page.id,
        title,
        content,
        summary,
        categoryId,
        notionUpdatedAt: lastEdited,
        noteTags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
  }
}

async function resolveCategory(
  parentName: string | null,
  childName: string | null
): Promise<number | null> {
  if (!parentName) return null;

  // upsert with nullable unique fields is unreliable — use findFirst + create
  let parent = await prisma.category.findFirst({
    where: { name: parentName, parentId: null },
  });
  if (!parent) {
    parent = await prisma.category.create({ data: { name: parentName } });
  }

  if (!childName) return parent.id;

  let child = await prisma.category.findFirst({
    where: { name: childName, parentId: parent.id },
  });
  if (!child) {
    child = await prisma.category.create({ data: { name: childName, parentId: parent.id } });
  }

  return child.id;
}

async function resolveTags(names: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const name of names) {
    const tag = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    ids.push(tag.id);
  }
  return ids;
}
