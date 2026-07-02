// GET /api/admin/me — capability probe for the nav: is the signed-in user an
// allow-listed admin? Returns {isAdmin} (never 403) so the avatar menu can show
// the Admin link only to the owner without leaking the dashboard's existence.
import { getAdminUser } from "@/lib/admin/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const admin = await getAdminUser();
  return new Response(JSON.stringify({ isAdmin: admin !== null }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
}
