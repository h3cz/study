"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CONSENT_EVENT, readConsent, trackPage, writeConsent, type Consent } from "@/lib/analytics";

export function AnalyticsConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent | null>(null);
  useEffect(() => {
    const update = () => setConsent(readConsent());
    const timer = setTimeout(update, 0);
    window.addEventListener(CONSENT_EVENT, update);
    window.addEventListener("storage", update);
    return () => { clearTimeout(timer); window.removeEventListener(CONSENT_EVENT, update); window.removeEventListener("storage", update); };
  }, []);
  useEffect(() => { if (consent === "granted") void trackPage(pathname); }, [pathname, consent]);
  const focused = /^\/(quiz|exam|flashcards|drill|pbq|voice|onboarding|login|auth|play)(\/|$)/.test(pathname);
  if (consent !== "unset" || focused) return null;
  return <aside className="analytics-consent" aria-label="Optional usage analytics">
    <p>Help improve Study? Allow page visits and named actions, such as starting or finishing practice. No answers, scores, typed text or session recordings.</p>
    <div className="flex gap-2 flex-wrap mt-3">
      <button className="min-h-11 px-4 bg-[var(--accent)] text-[var(--accent-fg)] rounded-[var(--r-sm)]" onClick={() => writeConsent("granted")}>Allow analytics</button>
      <button className="min-h-11 px-4 border border-[var(--border-strong)] rounded-[var(--r-sm)]" onClick={() => writeConsent("denied")}>No thanks</button>
      <Link className="min-h-11 inline-flex items-center underline text-sm" href="/privacy">Privacy</Link>
    </div>
  </aside>;
}

export function AnalyticsPreferences() {
  const [status, setStatus] = useState("");
  function update(value: "granted" | "denied") {
    writeConsent(value);
    setStatus(readConsent() === value
      ? value === "granted" ? "Usage analytics allowed on this browser." : "Usage analytics turned off on this browser."
      : "Your browser could not save this choice. Analytics stays off without consent.");
  }
  return <div>
    <div className="flex flex-wrap gap-3">
      <button className="min-h-11 px-4 border rounded-[var(--r-sm)]" onClick={() => update("granted")}>Allow usage analytics</button>
      <button className="min-h-11 px-4 border rounded-[var(--r-sm)]" onClick={() => update("denied")}>Turn analytics off</button>
    </div>
    <p className="text-sm mt-3" role="status">{status}</p>
  </div>;
}
