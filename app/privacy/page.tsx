import type { Metadata } from "next";
import { AnalyticsPreferences } from "@/components/AnalyticsConsent";

export const metadata: Metadata = { title: "Privacy — hecz / study" };
export default function PrivacyPage() {
  return <article className="max-w-2xl space-y-5">
    <h1 className="font-display text-3xl">Privacy and analytics</h1>
    <p>You can practice without enabling analytics. Your browser stores study progress locally; signing in lets the app sync progress through Supabase.</p>
    <h2 className="text-xl">Optional usage analytics</h2>
    <p>Only after you allow it, Study loads PostHog to measure page visits, browser/device information and named actions such as starting or completing a session. Shared-link tokens and URL queries are removed from analytics URLs. Study does not send your answers, scores or typed search text to PostHog. Session recording and automatic click capture are disabled.</p>
    <p>These analytics describe consenting browsers, not every learner. The app also stores operational records for account synchronization, guest device continuity and multiplayer. Those records are separate from PostHog.</p>
    <h2 className="text-xl">Change your choice</h2>
    <p>Turning analytics off stops future collection in this browser. It does not delete events already collected. Your study progress is preserved.</p>
    <AnalyticsPreferences />
    <p>For help with account data or deletion, contact Hecz through <a className="underline" href="https://hecz.dev">hecz.dev</a>.</p>
  </article>;
}
