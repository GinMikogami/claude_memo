"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Props = {
  title: string;
  content: string;
  tags: string[];
};

export function MarkdownCopyButton({ title, content, tags }: Props) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    const md = [
      `# ${title}`,
      "",
      content,
      "",
      "## Tags",
      tags.join(", "),
    ].join("\n");

    await navigator.clipboard.writeText(md);
    setCopied(true);
    toast({ title: "コピーしました", description: "Markdownをクリップボードにコピーしました。" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "コピー済み" : "Markdownコピー"}
    </Button>
  );
}
