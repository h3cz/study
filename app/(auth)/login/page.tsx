"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  link_expired: "That magic link has expired. Please request a new one.",
  link_invalid: "That magic link is invalid or has already been used. Please request a new one.",
};

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/";
  return raw;
}

function LoginInner() {
  const searchParams = useSearchParams();
  const authErrorParam = searchParams.get("error");
  const nextPath = safeNextPath(searchParams.get("next"));
  const claim = searchParams.get("claim");
  const isSaveClaim = claim === "guest-run" || claim === "guest-slot";
  const isMultiplayer = nextPath === "/play" || nextPath.startsWith("/play/");
  const callbackUrl = `/auth/callback?next=${encodeURIComponent(nextPath)}`;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}${callbackUrl}` },
    });
    // On success the browser redirects to Google; only reset on error.
    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const origin = window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}${callbackUrl}`,
        shouldCreateUser: true,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="sr-only">Check your email</h1>
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "32px 28px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
              marginBottom: "12px",
            }}
          >
            Check your email
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "var(--fg)",
              fontFamily: "var(--font-sans)",
              lineHeight: "24px",
              marginBottom: "6px",
            }}
          >
            Magic link sent to{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{email}</span>.
          </p>
          <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: "22px" }}>
            Click it to sign in — no password needed. Check your spam folder if it doesn&apos;t arrive within a minute.
          </p>
        </div>
      </div>
    );
  }

  const subtitle = isSaveClaim ? "save your progress or sign in" : "sign in to continue";
  const googleLabel = isSaveClaim ? "Save with Google" : "Continue with Google";
  const intro = isSaveClaim
    ? "Use the same browser you studied in. One link connects this device to an account and syncs future XP, streaks, scores, reviews, bookmarks, and teams."
    : isMultiplayer
      ? "Sign in to unlock multiplayer, keep duel results, and return right back to Versus."
      : "Sign in to sync XP, streaks, scores, reviews, bookmarks, and teams across devices.";
  const emailPlaceholder = isSaveClaim ? "email for your account" : "email address";
  const submitLabel = isSaveClaim ? "Email me a save link" : "Email me a sign-in link";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <h1 className="sr-only">Sign in to hecz / study</h1>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>hecz</span>
              <span style={{ color: "var(--fg-muted)", margin: "0 3px" }}>/</span>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}>study</span>
            </CardTitle>
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", marginTop: "4px" }}>
              {subtitle}
            </p>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full !h-11 mb-4 gap-2"
            disabled={googleLoading || loading}
            onClick={handleGoogle}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            {googleLoading ? "Redirecting…" : googleLabel}
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "11px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.08em" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            {intro}
          </p>
          {authErrorParam && AUTH_ERROR_MESSAGES[authErrorParam] && (
            <div
              style={{
                marginBottom: "12px",
                padding: "10px 12px",
                background: "rgba(245,166,35,0.10)",
                border: "1px solid rgba(245,166,35,0.35)",
                borderRadius: "var(--r-sm)",
                fontSize: "13px",
                color: "var(--fg)",
                fontFamily: "var(--font-sans)",
                lineHeight: "1.5",
              }}
            >
              {AUTH_ERROR_MESSAGES[authErrorParam]}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              // 16px font + 44px height: no iOS focus auto-zoom, comfortable tap target.
              style={{ height: "44px", fontSize: "16px" }}
            />
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <Button type="submit" className="w-full !h-11" disabled={loading || googleLoading}>
              {loading ? "Sending…" : submitLabel}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
        Loading…
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
