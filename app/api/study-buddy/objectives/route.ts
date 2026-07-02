import { authenticate } from "@/lib/study-buddy/auth";
import { getObjectiveTree } from "@/lib/study-buddy/objectives";
import { ok, fail, preflight } from "@/lib/study-buddy/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(req: Request) {
  return preflight(req);
}

// Static cert tree (domains, weights, objective codes + names) for grounding the
// tutor. No question text, no user data. PAT-gated so it counts toward the rate
// cap and requires a valid key.
export async function GET(req: Request) {
  const auth = await authenticate(req);
  if (!auth.ok) return fail(auth, req);
  return ok({ certId: "secplus-sy0-701", domains: getObjectiveTree() }, req);
}
