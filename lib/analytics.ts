"use client";

import type { PostHog } from "posthog-js";

export type Consent = "granted" | "denied" | "unset";
export const CONSENT_EVENT = "study:analytics-consent";
const CONSENT_KEY = "hecz.analytics.consent.v1";
export type StudyEvent = "study_session_started" | "study_session_completed" | "onboarding_step_completed" | "nav_item_clicked" | "search_used" | "install_prompt_shown" | "install_prompt_clicked" | "install_prompt_dismissed" | "sync_failed" | "retry_requested";
export type StudyProperties = { cert_id?: string; mode?: string; step?: number; destination?: string; surface?: string };

export function readConsent(): Consent {
  if (typeof window === "undefined") return "unset";
  try { const value = localStorage.getItem(CONSENT_KEY); return value === "granted" || value === "denied" ? value : "unset"; }
  catch { return "unset"; }
}

export function writeConsent(value: Exclude<Consent, "unset">) {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { return; }
  if (value === "denied") client?.opt_out_capturing();
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Never put search text, tokens, question answers or scores into telemetry. */
export function analyticsPath(pathname: string): string {
  const path = pathname.split(/[?#]/)[0];
  return path.replace(/^\/(r|c)\/[^/]+/, "/$1/:token");
}

export function studyProperties(props: StudyProperties = {}) {
  return Object.fromEntries(Object.entries(props).filter(([key, value]) =>
    ["cert_id", "mode", "step", "destination", "surface"].includes(key) &&
    (typeof value === "string" || typeof value === "number")
  ).map(([key, value]) => [key, key === "destination" ? analyticsPath(String(value)) : value]));
}

let client: PostHog | undefined;
let pending: Promise<PostHog | undefined> | undefined;

async function getClient(): Promise<PostHog | undefined> {
  if (typeof window === "undefined" || readConsent() !== "granted") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) return;
  if (client) { client.opt_in_capturing({ captureEventName: false }); return client; }
  if (!pending) {
    pending = import("posthog-js").then(({ default: posthog }) => {
      // Consent may have changed while the lazy chunk was loading.
      if (readConsent() !== "granted") return;
      posthog.init(key, {
        api_host: host,
        autocapture: false,
        capture_pageview: false, // App Router bridge below sends sanitized paths.
        capture_pageleave: false,
        capture_exceptions: false,
        capture_performance: false,
        disable_session_recording: true,
        disable_surveys: true,
        save_campaign_params: false,
        save_referrer: false,
        person_profiles: "never",
        cross_subdomain_cookie: false,
        persistence: "localStorage+cookie",
        before_send: event => {
          if (!event || readConsent() !== "granted") return null;
          // Campaign/click identifiers can copy arbitrary query-string values.
          for (const key of Object.keys(event.properties)) {
            if (/^(?:\$initial_)?(?:utm_|gclid|fbclid|msclkid|dclid|gbraid|wbraid|ttclid|twclid|li_fat_id|mc_cid)/.test(key)) {
              delete event.properties[key];
            }
          }
          // SDK defaults can add URLs independently of our explicit properties.
          for (const key of ["$current_url", "$initial_current_url", "$referrer", "$initial_referrer"]) {
            const value = event.properties[key];
            if (typeof value === "string") {
              try { const url = new URL(value); event.properties[key] = url.origin + analyticsPath(url.pathname); }
              catch { delete event.properties[key]; }
            }
          }
          return event;
        },
      });
      client = posthog;
      return client;
    }).catch(() => undefined).finally(() => { pending = undefined; });
  }
  return pending;
}

export async function track(event: StudyEvent, props?: StudyProperties) {
  const ph = await getClient();
  if (readConsent() === "granted") ph?.capture(event, { ...studyProperties(props), app: "study", app_version: "az104-workstream-1" });
}

export async function trackPage(pathname: string) {
  const ph = await getClient();
  if (readConsent() === "granted") ph?.capture("$pageview", {
    $current_url: window.location.origin + analyticsPath(pathname),
    $pathname: analyticsPath(pathname), app: "study", app_version: "az104-workstream-1",
  });
}
