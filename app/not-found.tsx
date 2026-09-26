import Link from "next/link";
export default function NotFound() {
  return <section className="space-y-4 py-12">
    <p className="font-mono text-[var(--accent)]">404</p>
    <h1 className="font-display text-3xl">This page isn’t here</h1>
    <p className="text-[var(--fg-muted)]">The link may be outdated. Your saved study progress is still available.</p>
    <Link className="inline-flex min-h-11 items-center px-4 bg-[var(--accent)] text-[var(--accent-fg)] rounded-[var(--r-sm)]" href="/practice">Find practice</Link>
  </section>;
}
