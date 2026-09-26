"use client";

export function LoadError({ retry }: { retry: () => void }) {
  return <section role="alert" className="p-6 border border-[var(--border-strong)] rounded-[var(--r-md)] bg-[var(--surface)] space-y-3">
    <h1 className="text-xl font-semibold">We couldn’t load your practice</h1>
    <p className="text-[var(--fg-muted)]">Your saved progress has not been cleared. Try again; if the problem continues, check that this browser allows site storage.</p>
    <button type="button" className="min-h-11 px-5 rounded-[var(--r-sm)] bg-[var(--accent)] text-[var(--accent-fg)]" onClick={retry}>Try again</button>
  </section>;
}
