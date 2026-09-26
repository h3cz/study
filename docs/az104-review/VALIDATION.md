# Validation — 2026-09-25

| Checkout | Build | Lint | Unit tests | Chromium browser tests |
|---|---|---|---|---|
| Public PR review | Pass | Pass | 495 passed | 14 passed |
| Production integration | Pass | Pass | 597 passed | 14 passed |

Both builds include TypeScript checking. Browser coverage includes a 390px viewport, banner and changelog navigation, cert selection, all four Azure content counts, persistent dismissal, and real IndexedDB reseeding that preserves XP and a pre-existing Security+ flashcard schedule. Production smoke tests were updated for existing leaderboard wording, the consent overlay, and the signed-out admin login redirect; admin content remains inaccessible.

Builds used placeholder public Supabase configuration. Authenticated browser scenarios use test mocks; this does not verify live Supabase login, cloud synchronization or production deployment. Expected placeholder-host requests can produce server fetch errors during these local checks. No real user data was changed.

All 137 unique MCQ reference URLs were checked for HTTP availability; one outdated AzCopy URL was replaced with the current Microsoft service-principal guide. URL availability is separate from the editorial factual review.

The original hecz workspace and the existing secplus-quest working tree were left untouched. Work is in study-az104-review (public PR) and study-az104-production (production branch feat/az104-reviewed). These checks were recorded before publication; GitHub PR and Vercel deployment status track subsequent delivery.
