# hecz / study Showcase Template

Use this as the quick fill-in version for a portfolio page, GitHub profile, launch post, or case study.

## One-Liner

`TODO: hecz / study is ...`

Example:

> hecz / study is an offline-first CompTIA exam trainer with adaptive quizzes, spaced repetition, sync, and friend duels.

## Why I Built It

`TODO: What problem did you notice? Why did existing tools feel wrong?`

Prompts:

- I was frustrated by:
- The user I had in mind was:
- The behavior I wanted to encourage was:

## What It Does

- `TODO: Core feature 1`
- `TODO: Core feature 2`
- `TODO: Core feature 3`
- `TODO: Core feature 4`

Suggested bullets:

- Personalized dashboard with predicted score, streaks, weak objectives, and next action.
- Adaptive question practice weighted toward weak areas and recent misses.
- FSRS review, wrong-answer recovery, bookmarked questions, and PBQ-style drills.
- Optional sign-in with Supabase sync, plus local-first progress for guests.
- 1v1 duels with agreed rules, timers, and server-authoritative scoring.

## Technical Highlights

- Frontend:
- Data/storage:
- Auth/sync:
- Realtime/competition:
- Testing/deployment:

Suggested version:

- Next.js App Router, React, TypeScript, and a PWA shell.
- IndexedDB/Dexie for local-first progress, Supabase for optional cloud sync.
- Supabase migrations and RLS policies for auth-protected data.
- Server-authoritative duel scoring through API routes and SQL RPCs.
- Vitest, Playwright, GitHub Actions, and Vercel deployment.

## Interesting Engineering Decisions

`TODO: 2-4 short paragraphs. Explain tradeoffs, not just tools.`

Prompts:

- Why local-first?
- Why FSRS?
- Why server-authoritative duels?
- Why keep guests usable before sign-in?

## Screenshots / Demo

- GIF: `public/brand/study-showcase.gif`
- Social preview: `public/brand/github-social-preview.jpg`
- Live app: `https://study.hecz.dev`
- Public repo: `https://github.com/h3cz/study`

## What I Learned

`TODO: Make this personal. What changed in your product/engineering taste?`

Prompts:

- I got better at:
- I underestimated:
- The thing I would design differently now:
- The part I am proudest of:

## What Is Next

- `TODO`
- `TODO`
- `TODO`

Suggested next steps:

- Add a few real walkthrough screenshots from signed-in flows.
- Tighten onboarding around first weak-objective diagnosis.
- Add more explanation after duel rounds for learning, not just scoring.
- Expand study-agent docs with a copy-paste setup example.
