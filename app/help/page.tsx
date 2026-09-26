import Link from "next/link";
export default function HelpPage() {
  return <article className="max-w-2xl space-y-5">
    <h1 className="font-display text-3xl">Help with Study</h1>
    <h2 className="text-xl">Save your progress</h2>
    <p>Guest progress belongs to this browser. Sign in to sync supported study records across devices. Clearing browser storage removes local progress; export or sync it first.</p>
    <h2 className="text-xl">Something won’t load?</h2>
    <p>Try the page’s Retry action, check your connection and confirm that site storage is allowed. Avoid clearing storage as a first troubleshooting step.</p>
    <h2 className="text-xl">Question feedback</h2>
    <p>Use the report control beside a question. Include its stable ID when contacting Hecz. Microsoft Learn links beneath AZ-104 answers explain the source facts.</p>
    <div className="flex gap-4 flex-wrap"><Link href="/settings" className="underline">Settings</Link><Link href="/privacy" className="underline">Privacy</Link><Link href="/changelog" className="underline">What’s new</Link><a href="https://hecz.dev" className="underline">Contact Hecz</a></div>
  </article>;
}
