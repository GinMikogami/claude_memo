import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  if (!q) {
    return NextResponse.json({ results: [], total: 0, q });
  }

  const where = {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
      { noteTags: { some: { tag: { name: { contains: q, mode: "insensitive" as const } } } } },
    ],
  };

  const [results, total] = await Promise.all([
    prisma.note.findMany({
      where,
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        updatedAt: true,
        category: { include: { parent: true } },
        noteTags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.note.count({ where }),
  ]);

  return NextResponse.json({ results, total, q, page, limit });
}
