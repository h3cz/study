import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Prefer an explicit trusted origin over the request's Host header to prevent
// open-redirect attacks when the app sits behind a proxy or CDN.
const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  null;

function siteUrl(path: string, requestOrigin: string): string {
  return `${SITE_ORIGIN ?? requestOrigin}${path}`;
}

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/";
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Expired, already-used, or invalid magic-link — redirect to login with error banner
      const errorType = error.message?.toLowerCase().includes("expired")
        ? "link_expired"
        : "link_invalid";
      return NextResponse.redirect(
        siteUrl(`/login?error=${errorType}&next=${encodeURIComponent(next)}`, origin)
      );
    }
  }

  return NextResponse.redirect(siteUrl(next, origin));
}
