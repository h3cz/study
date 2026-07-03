// Shared response helpers for /api/study-buddy/* routes.
// Centralizes: no-store caching, JSON typing, CORS (specific origins, never *),
// and a consistent error shape that NEVER includes the token (security review #5).

import type { AuthErr } from "./auth";

// Reads of the user's OWN data via PAT carry no cookies, so CORS is not a
// credential-leak vector here, but we still avoid wildcard and reflect only the
// known study.hecz.dev origin (security review #9). Header-only API clients
// (OpenClaw, curl) ignore CORS entirely.
const ALLOWED_ORIGIN = "https://study.hecz.dev";

function baseHeaders(origin: string | null): HeadersInit {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    Vary: "Origin",
  };
}

export function ok(body: unknown, req: Request): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...baseHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
  });
}

export function fail(err: AuthErr | { status: number; error: string; retryAfter?: number }, req: Request): Response {
  const headers: Record<string, string> = {
    ...(baseHeaders(req.headers.get("origin")) as Record<string, string>),
    "Content-Type": "application/json",
  };
  if (err.retryAfter) headers["Retry-After"] = String(err.retryAfter);
  return new Response(JSON.stringify({ error: err.error }), {
    status: err.status,
    headers,
  });
}

export function preflight(req: Request): Response {
  return new Response(null, { status: 204, headers: baseHeaders(req.headers.get("origin")) });
}
