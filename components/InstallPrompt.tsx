"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, readConsent, track } from "@/lib/analytics";
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
export function InstallPrompt() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [consentReady, setConsentReady] = useState(false);
  const [show, setShow] = useState<"ios" | "browser" | null>(null);
  const [failed, setFailed] = useState(false);
  const suppressed = /^\/(quiz|exam|flashcards|drill|pbq|voice|play|login|auth|onboarding|privacy)(\/|$)/.test(pathname);
  useEffect(() => {
    const update = () => setConsentReady(readConsent() !== "unset");
    const timer = setTimeout(update, 0);
    const capture = (event: Event) => { event.preventDefault(); setDeferred(event as InstallEvent); };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener(CONSENT_EVENT, update);
    window.addEventListener("storage", update);
    try { localStorage.setItem("visitCount", String(Number(localStorage.getItem("visitCount") || 0) + 1)); } catch { /* Optional invitation. */ }
    return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener(CONSENT_EVENT, update); window.removeEventListener("storage", update); };
  }, []);
  useEffect(() => {
    if (!consentReady || suppressed || window.matchMedia("(display-mode: standalone)").matches) return;
    try {
      if (Date.now() - Number(localStorage.getItem("installDismissedAt") || 0) < 14 * 86400000) return;
      if (Number(localStorage.getItem("visitCount")) < 2 && !localStorage.getItem("study.completedSession")) return;
    } catch { return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (!ios && !deferred) return;
    const timer = setTimeout(() => { setShow(ios ? "ios" : "browser"); void track("install_prompt_shown"); }, 2500);
    return () => clearTimeout(timer);
  }, [consentReady, suppressed, deferred, pathname]);
  function dismiss() {
    try { localStorage.setItem("installDismissedAt", String(Date.now())); } catch { /* Nothing to persist. */ }
    setShow(null);
    void track("install_prompt_dismissed");
  }
  async function install() {
    if (!deferred) return;
    void track("install_prompt_clicked");
    try { await deferred.prompt(); await deferred.userChoice; setDeferred(null); setShow(null); }
    catch { setFailed(true); }
  }
  if (!show || suppressed || !consentReady) return null;
  return <aside className="install-prompt-card fixed left-4 right-4 ml-auto z-60 max-w-[320px] p-4 bg-[var(--surface)] border border-[var(--border-strong)] rounded-[var(--r-md)]" aria-label="Install Study">
    <p className="text-sm">{show === "ios" ? "Tap Share, then Add to Home Screen to install hecz / study." : "Keep Azure and CompTIA practice on your home screen with hecz / study."}</p>
    {failed && <p role="status" className="text-sm mt-2">Installation couldn’t start. You can also use your browser’s install menu.</p>}
    <div className="flex gap-2 mt-3">
      {show === "browser" && <button className="min-h-11 px-4 bg-[var(--accent)] text-[var(--accent-fg)] rounded-[var(--r-sm)]" onClick={() => void install()}>Install</button>}
      <button className="min-h-11 px-4 border border-[var(--border-strong)] rounded-[var(--r-sm)]" onClick={dismiss}>Not now</button>
    </div>
  </aside>;
}
