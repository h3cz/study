# Optional Study analytics

PostHog is loaded only after the learner allows usage analytics. An absent public project key or ingestion host leaves the integration inert. The connector in an AI assistant and the Vercel project integration are separate connections: installing an assistant connector alone does not configure this app.

## Activate a project

Connect the intended PostHog project to the Vercel project that serves Study, or configure its public project token and matching ingestion host before building:

```dotenv
NEXT_PUBLIC_POSTHOG_KEY=<public-project-token>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Use `https://eu.i.posthog.com` for an EU project. The host must match the project's region; the code does not guess one. Never use a personal API key or service credential in a `NEXT_PUBLIC_` variable. Check the environment-variable names produced by the Vercel integration and map them to the names above if needed. Public Next.js variables are embedded at build time, so changing them requires a new deployment. Configure preview and production deliberately; a separate preview project avoids mixing test traffic into production.

References: [PostHog Next.js setup](https://posthog.com/docs/libraries/next-js), [Vercel marketplace integration](https://posthog.com/docs/integrations/vercel-marketplace).

After deployment, allow analytics on `/privacy`, navigate between pages, and finish a short practice quiz. Verify `$pageview`, `study_session_started` and `study_session_completed` in the intended project's live events, filtered by `app = study`. Confirm URLs contain no query strings, answers or share tokens. Turn analytics off and verify new actions no longer arrive. Local mocked tests prove code behavior, not receipt by a real PostHog project.

## Event inventory

| Event | Trigger | Allowed context |
|---|---|---|
| `$pageview` | App Router path changes after consent | Sanitized pathname and current URL |
| `study_session_started` | Practice quiz loads | `cert_id`, `mode` |
| `study_session_completed` | Practice quiz completes | `cert_id`, `mode` |
| `onboarding_step_completed` | Instrumented onboarding step | `step` |
| `nav_item_clicked` | Desktop navigation item | `destination` |
| `search_used` | Command chosen in search | `destination` |
| `install_prompt_shown` | Eligible install invitation appears | `surface` |
| `install_prompt_clicked` | Install action selected | `surface` |
| `install_prompt_dismissed` | Install invitation dismissed | `surface` |
| `sync_failed` | First queued-operation failure | `surface` |
| `retry_requested` | Learner retries loading a quiz | `surface` |

These support practice start-to-completion, case-study adoption, navigation usage, installation interactions and sync-retry trends. They do not yet measure all mock-exam or flashcard sessions. Consent is requested outside focused study and onboarding routes, so first-time onboarding is not a complete measurable funnel. Reopening a saved quiz on a new page load can emit another start; interpret starts as openings, not unique saved sessions.

## Data boundaries

No answer choices, scores, typed search text, email/user identifiers, session recordings or automatic DOM capture are sent by these events. The SDK may include standard device, browser and anonymous session metadata. Cross-subdomain cookies, automatic exceptions, performance collection, surveys and person profiles are disabled. Query strings and `/r/` or `/c/` share tokens are removed from explicit route properties and SDK URL defaults. The SDK and event calls recheck consent during initialization and sending. Privacy choices apply to this browser and can be changed on `/privacy`.

Quiz progress and optional Supabase account sync are separate application data flows. Disabling usage analytics does not erase local learning progress or disable requested account synchronization.

## Release status

This feature branch contains the integration, not a production activation. A real public project token and ingestion host must be connected, then receipt verified after deployment. No production token is stored in this repository.
