import { db } from "@/lib/db";
import { invites } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let note: string | null = null;

  // Increment usage count and fetch note in one go
  try {
    const result = await db
      .update(invites)
      .set({
        used_count: sql`${invites.used_count} + 1`,
      } as any)
      .where(eq(invites.code, code) as any)
      .returning({ note: invites.note } as any);

    if (result && result[0]) {
      note = result[0].note;
    }
  } catch (error) {
    console.error("Failed to track invite usage:", error);
  }

  // Redirect to main page with ref code and UTM parameters
  const url = new URL("/main", request.url);
  url.searchParams.set("ref", code);
  url.searchParams.set("utm_source", "offline");
  url.searchParams.set("utm_medium", "sticker");
  
  if (note) {
    url.searchParams.set("utm_campaign", note);
  }

  return NextResponse.redirect(url);
}
