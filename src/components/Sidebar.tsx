"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CategoryTree } from "./CategoryTree";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { CategoryWithChildren } from "@/types";

type Props = {
  categories: CategoryWithChildren[];
  currentCategoryId?: number;
};

export function Sidebar({ categories, currentCategoryId }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync-notion", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "同期完了", description: data.message });
      } else {
        toast({ variant: "destructive", title: "同期エラー", description: data.error });
      }
    } catch {
      toast({ variant: "destructive", title: "同期エラー", description: "ネットワークエラーが発生しました。" });
    } finally {
      setSyncing(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-3">
          <FileText className="h-5 w-5 text-primary" />
          Knowledge Base
        </Link>
        <SearchBar placeholder="検索..." />
      </div>

      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
          >
            <Home className="h-4 w-4" />
            ダッシュボード
          </Link>
          <Link
            href="/notes"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"
          >
            <FileText className="h-4 w-4" />
            すべてのメモ
          </Link>
        </nav>

        <Separator className="mx-3" />

        <div className="p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            カテゴリ
          </p>
          {categories.length > 0 ? (
            <CategoryTree categories={categories} currentCategoryId={currentCategoryId} />
          ) : (
            <p className="text-xs text-muted-foreground px-3">カテゴリなし</p>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          {syncing ? "同期中..." : "Notion同期"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-72 bg-background border-r shadow-lg transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r bg-card h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}
