import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  RichTextItemResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function getNotionDatabase(): Promise<PageObjectResponse[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) throw new Error("NOTION_DATABASE_ID is not set");

  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notionClient.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      if (page.object === "page") {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return pages;
}

export function extractTitle(page: PageObjectResponse): string {
  const titleProp = Object.values(page.properties).find(
    (p) => p.type === "title"
  );
  if (!titleProp || titleProp.type !== "title") return "Untitled";
  return titleProp.title.map((t: RichTextItemResponse) => t.plain_text).join("");
}

export function extractRichText(
  prop: { type: "rich_text"; rich_text: RichTextItemResponse[] } | undefined
): string {
  if (!prop) return "";
  return prop.rich_text.map((t: RichTextItemResponse) => t.plain_text).join("");
}

export function extractSelect(
  prop: { type: "select"; select: { name: string } | null } | undefined
): string | null {
  if (!prop || !prop.select) return null;
  return prop.select.name;
}

export function extractMultiSelect(
  prop:
    | { type: "multi_select"; multi_select: { name: string }[] }
    | undefined
): string[] {
  if (!prop) return [];
  return prop.multi_select.map((s) => s.name);
}

export async function getPageContent(pageId: string): Promise<string> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notionClient.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      if ("type" in block) {
        blocks.push(block as BlockObjectResponse);
      }
    }

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocksToMarkdown(blocks);
}

function richTextToString(richText: RichTextItemResponse[]): string {
  return richText.map((t) => t.plain_text).join("");
}

function blocksToMarkdown(blocks: BlockObjectResponse[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
        lines.push(richTextToString(block.paragraph.rich_text));
        lines.push("");
        break;
      case "heading_1":
        lines.push(`# ${richTextToString(block.heading_1.rich_text)}`);
        lines.push("");
        break;
      case "heading_2":
        lines.push(`## ${richTextToString(block.heading_2.rich_text)}`);
        lines.push("");
        break;
      case "heading_3":
        lines.push(`### ${richTextToString(block.heading_3.rich_text)}`);
        lines.push("");
        break;
      case "bulleted_list_item":
        lines.push(`- ${richTextToString(block.bulleted_list_item.rich_text)}`);
        break;
      case "numbered_list_item":
        lines.push(`1. ${richTextToString(block.numbered_list_item.rich_text)}`);
        break;
      case "quote":
        lines.push(`> ${richTextToString(block.quote.rich_text)}`);
        lines.push("");
        break;
      case "code":
        lines.push(`\`\`\`${block.code.language}`);
        lines.push(richTextToString(block.code.rich_text));
        lines.push("```");
        lines.push("");
        break;
      case "divider":
        lines.push("---");
        lines.push("");
        break;
      case "callout":
        lines.push(`> ${richTextToString(block.callout.rich_text)}`);
        lines.push("");
        break;
      case "toggle":
        lines.push(richTextToString(block.toggle.rich_text));
        lines.push("");
        break;
    }
  }

  return lines.join("\n").trim();
}
