# hecz / study

![hecz / study showcase](public/brand/study-showcase.gif)

An offline-first study-lab starter that turns your own notes and allowed resources into a personal loop: practice, review, compete, sync, repeat.

[Live app](https://study.hecz.dev) · [Lab hub](https://study.hecz.dev/lab) · [Changelog](docs/CHANGELOG.md) · [Hecz.dev Lab](docs/HECZ_DEV_STUDY_LAB.md) · [Classroom Lab](docs/HECZ_CLASS_LAB.md) · [Build your bank](docs/BUILD_YOUR_BANK.md) · [Import format](docs/IMPORT_FORMAT.md) · [Class pack](public/docs/class-pack-template.zip)

Built with Next.js, React, TypeScript, IndexedDB, Supabase, FSRS, Vitest, and Playwright.

## Why This Exists

Most cert study tools feel like static question banks. hecz / study is built around momentum: answer a few questions, learn what changed, recover weak spots, and get the next useful action without turning study into a spreadsheet.

The public version is intentionally a starter kit. It ships the study engine, a tiny original demo bank, and docs for creating your own question bank from class notes, labs, official objectives, and resources you are allowed to use.

Your real learning bank should be yours.

## What It Does

- Personal dashboard with predicted score, streaks, exam date pressure, weak areas, and a "Study this next" recommendation.
- Adaptive practice weighted toward weak domains, recent misses, and scheduled review.
- FSRS flashcards, MCQ review queues, wrong-answer recovery, bookmarks, PBQ drills, and acronym trainers.
- Multi-cert coverage for Security+ SY0-701, Network+ N10-009, A+ 220-1101, and A+ 220-1102.
- Local-first IndexedDB progress with optional Supabase auth and cloud sync.
- 1v1 duels with agreed question count, timer settings, rules preview, and server-authoritative scoring.
- HTTP study-agent surface for tools such as Cursor, OpenClaw, or personal scripts.

## Bring Your Own Bank

The open-source repo does not include a full private or personal question bank. That is deliberate.

Use it as a lab:

- Clone the app.
- Import JSON/CSV from `/import` in local development or an enabled lab fork, or edit `content/local-bank.ts` if you prefer code.
- Add original questions, flashcards, PBQ-style drills, and acronyms.
- Track sources and licenses.
- Run short sessions and improve weak explanations after misses.

Start here:

- [Build your own question bank](docs/BUILD_YOUR_BANK.md)
- [Live lab hub](https://study.hecz.dev/lab)
- [Product changelog](https://study.hecz.dev/changelog)
- [Question bank format](docs/IMPORT_FORMAT.md)
- [Hecz.dev branded lab](docs/HECZ_DEV_STUDY_LAB.md)
- [Class study lab](docs/CLASS_LAB.md)
- [Hecz branded lab guide](docs/HECZ_CLASS_LAB.md)
- [Downloadable class pack](public/docs/class-pack-template.zip)
- [Hecz.dev brand deck](public/docs/hecz-dev-study-lab-deck.pptx)
- [Classroom presentation deck](public/docs/hecz-study-lab-deck.pptx)

Do not add exam dumps, leaked questions, copied paid-course banks, or private material you do not have permission to reuse.

## Technical Highlights

- Local-first product architecture keeps the core study loop fast and available without sign-in.
- Adaptive learning combines practice history, FSRS review, wrong-answer recovery, and weak-objective recommendations.
- Server-authoritative competition keeps duel timing, scoring, XP, and round advancement fair.
- Supabase migrations, RLS-backed tables, and server-only service-role paths keep privileged data access scoped.
- CI covers linting, unit tests, browser smoke tests, and production builds.

## What I Learned

This project is practice in building product loops, not just screens. The hard parts have been deciding what the learner should do next, making offline progress feel trustworthy, keeping competition clear, and separating the reusable engine from private learning content.

Personal notes to fill in later:

- Why I built it: `TODO`
- Hardest tradeoff: `TODO`
- Favorite implementation detail: `TODO`
- What I would improve next: `TODO`

<details>
<summary>Run locally</summary>

Prerequisite: Node.js 22+.

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

Useful scripts:

```bash
npm run lint
npm test
npm run e2e
npm run build
```

</details>

<details>
<summary>Environment variables</summary>

The app runs locally without cloud sync. Optional server features use environment variables in `.env.local`, which is intentionally ignored by Git.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ENABLE_BANK_IMPORT=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
INTERNAL_SHARED_SECRET=
```

`NEXT_PUBLIC_ENABLE_BANK_IMPORT=true` enables `/import` in production builds for lab forks. Local development enables bank import automatically; the official production app leaves it disabled.

Never commit real `.env*` files or QA output containing secret values.

</details>

<details>
<summary>Project structure</summary>

```text
app/                  Next.js routes and API handlers
components/           Shared UI and study components
content/              Seeded certification content
docs/                 Architecture and feature notes
lib/                  Local DB, mastery, quiz, sync, and recommendation logic
public-starter/       Barebones content used for the open-source snapshot
public/               Static assets, manifest, service worker, public docs
tests/                Vitest unit tests
e2e/                  Playwright smoke tests
supabase/             SQL migrations and edge functions
```

</details>

## Status

This is an active build. The public app is usable, and the study loop, content coverage, sync behavior, competition flow, and agent connection story are still evolving.
