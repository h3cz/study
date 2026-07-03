import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Prefer an explicit trusted origin over the request's Host header.
const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  null;

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${SITE_ORIGIN ?? origin}/login`);
}
