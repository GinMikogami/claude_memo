import { NextResponse } from "next/server";
import { syncFromNotion } from "@/services/sync";

export async function POST() {
  try {
    const result = await syncFromNotion();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: "Sync failed", details: String(err) },
      { status: 500 }
    );
  }
}
