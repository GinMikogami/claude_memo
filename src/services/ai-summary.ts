/**
 * AI summary service - currently uses extractive summarization.
 * Replace generateSummary() internals to swap in any LLM (Claude, GPT, etc.).
 */

export async function generateSummary(content: string): Promise<string> {
  if (!content || content.trim().length === 0) return "";

  // Strip markdown syntax for cleaner summarization
  const plainText = content
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^[-*>]\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();

  if (plainText.length <= 200) return plainText;

  // Extract first 1–3 meaningful sentences up to ~200 chars
  const sentences = plainText.match(/[^。！？.!?]+[。！？.!?]?/g) ?? [];
  let summary = "";

  for (const sentence of sentences) {
    const candidate = (summary + sentence).trim();
    if (candidate.length > 200) break;
    summary = candidate;
  }

  if (!summary) {
    summary = plainText.slice(0, 200) + "…";
  }

  return summary.trim();
}
