"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { seedDb, db } from "@/lib/db";
import { getCert, liveCerts, DEFAULT_CERT_ID } from "@/lib/certs";

// Default exam date = 12 weeks from today
function defaultExamDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 84);
  return d.toISOString().slice(0, 10);
}

type SessionLength = 10 | 20 | 30;

function formatExamDateLabel(value: string): string {
  if (!value) return "Not set yet";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not set yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function SetupSummary({
  certId,
  examDate,
  sessionMinutes,
  step,
}: {
  certId: string;
  examDate: string;
  sessionMinutes: SessionLength;
  step: number;
}) {
  const cert = getCert(certId);
  const items = [
    { label: "Exam", value: cert.version },
    { label: "Date", value: formatExamDateLabel(examDate) },
    { label: "Daily", value: `${sessionMinutes} min` },
    { label: "Setup", value: `${step}/4` },
  ];

  return (
    <div
      aria-label="Study setup summary"
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        background: "var(--bg)",
        padding: "12px",
        marginBottom: "24px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-sans)",
          marginBottom: "10px",
        }}
      >
        Your study profile
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "10px",
        }}
      >
        {items.map((item) => (
          <div key={item.label}>
            <p
              className="font-mono"
              style={{
                fontSize: "10px",
                color: "var(--fg-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "2px",
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "var(--fg)",
                fontFamily: "var(--font-sans)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [certId, setCertId] = useState<string>(DEFAULT_CERT_ID);
  const [examDate, setExamDate] = useState(defaultExamDate());
  const [sessionMinutes, setSessionMinutes] = useState<SessionLength>(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      await seedDb();
      const state = await db.userState.get(1);
      if (state?.onboardedAt) {
        router.replace("/");
        return;
      }
      setLoading(false);
    }
    check();
  }, [router]);

  async function saveAndFinish(goCalibrate: boolean) {
    const state = await db.userState.get(1);
    // Spread the existing state first so onboarding never drops fields the seed
    // or earlier flows set (predictedScore, dailyGoalQuestions, streak-freeze
    // inventory, confidence/audio prefs, etc.). Only the onboarding fields below
    // are overwritten.
    await db.userState.put({
      ...state,
      id: 1,
      xp: state?.xp ?? 0,
      level: state?.level ?? 0,
      streak: state?.streak ?? 0,
      totalStudyDays: state?.totalStudyDays ?? 0,
      activeCertId: certId,
      examDate,
      dailySessionMinutes: sessionMinutes,
      onboardedAt: Date.now(),
    });
    // Hard-navigate (not router.push) so the persistent NavBar — and its
    // CertSwitcher, which reads activeCertId once on mount — re-reads the cert
    // just chosen. A soft push keeps the layout mounted, leaving the switcher
    // stuck on the default cert until the next full reload.
    if (goCalibrate) {
      window.location.assign("/quiz?mode=calibration&n=5");
    } else {
      window.location.assign("/");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)", fontFamily: "var(--font-sans)", fontSize: "14px" }}>
        Loading…
      </div>
    );
  }

  const selectedCert = getCert(certId);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          padding: "32px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "18px" }}>
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
            }}
          >
            Step {step} of 4
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: n === step ? "var(--accent)" : "var(--border-strong)",
                  display: "inline-block",
                  transition: "background 200ms",
                }}
              />
            ))}
          </div>
        </div>

        <SetupSummary
          certId={certId}
          examDate={examDate}
          sessionMinutes={sessionMinutes}
          step={step}
        />

        {/* Step 1: Certification selection */}
        {step === 1 && (
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Free CompTIA exam prep
            </p>
            <h1
              className="font-display"
              style={{
                fontSize: "28px",
                fontWeight: 400,
                color: "var(--fg)",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              Which certification are you studying for?
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--fg-muted)",
                marginBottom: "24px",
                lineHeight: 1.5,
                fontFamily: "var(--font-sans)",
              }}
            >
              Pick your exam — you can switch anytime in Settings.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {liveCerts().map((cert) => (
                <button
                  key={cert.id}
                  onClick={() => setCertId(cert.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "2px",
                    minHeight: "52px",
                    padding: "10px 16px",
                    border: `1px solid ${certId === cert.id ? "var(--accent)" : "var(--border-strong)"}`,
                    borderRadius: "var(--r-sm)",
                    background: certId === cert.id ? "rgba(245,166,35,0.08)" : "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--fg)" }}>
                    {cert.fullName} · {cert.version}
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--fg-muted)" }}>{cert.tagline}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  height: "44px",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Exam date */}
        {step === 2 && (
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Free {selectedCert.version} prep
            </p>
            <h1
              className="font-display"
              style={{
                fontSize: "28px",
                fontWeight: 400,
                color: "var(--fg)",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              When are you taking your exam?
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--fg-muted)",
                marginBottom: "24px",
                lineHeight: 1.5,
                fontFamily: "var(--font-sans)",
              }}
            >
              We&apos;ll pace your study plan around this date. You can change it anytime in settings.
            </p>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              style={{
                width: "100%",
                height: "48px",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--r-sm)",
                padding: "0 12px",
                // 16px avoids iOS focus auto-zoom on the date field.
                fontSize: "16px",
                fontFamily: "var(--font-mono)",
                color: "var(--fg)",
                background: "var(--bg)",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  height: "44px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  padding: "0 16px",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  flex: 1,
                  height: "44px",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Set date →
              </button>
              <button
                onClick={() => { setExamDate(""); setStep(3); }}
                style={{
                  height: "44px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  padding: "0 16px",
                }}
              >
                I&apos;ll set it later
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Daily session length */}
        {step === 3 && (
          <div>
            <h1
              className="font-display"
              style={{
                fontSize: "28px",
                fontWeight: 400,
                color: "var(--fg)",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              How long do you want to study daily?
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--fg-muted)",
                marginBottom: "24px",
                lineHeight: 1.5,
                fontFamily: "var(--font-sans)",
              }}
            >
              You can adjust this any time.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(
                [
                  { minutes: 10 as SessionLength, label: "10 min", sub: "daily quiz only", recommended: true },
                  { minutes: 20 as SessionLength, label: "20 min", sub: "quiz + flashcards", recommended: false },
                  { minutes: 30 as SessionLength, label: "30 min", sub: "deep session", recommended: false },
                ] as { minutes: SessionLength; label: string; sub: string; recommended: boolean }[]
              ).map(({ minutes, label, sub, recommended }) => (
                <button
                  key={minutes}
                  onClick={() => setSessionMinutes(minutes)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "52px",
                    padding: "0 16px",
                    border: `1px solid ${sessionMinutes === minutes ? "var(--accent)" : "var(--border-strong)"}`,
                    borderRadius: "var(--r-sm)",
                    background: sessionMinutes === minutes ? "rgba(245,166,35,0.08)" : "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    textAlign: "left",
                  }}
                >
                  <span>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--fg)" }}>{label}</span>
                    <span style={{ fontSize: "13px", color: "var(--fg-muted)", marginLeft: "8px" }}>· {sub}</span>
                  </span>
                  {recommended && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                        background: "rgba(245,166,35,0.12)",
                        borderRadius: "var(--r-sm)",
                        padding: "2px 6px",
                      }}
                    >
                      Recommended
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  height: "44px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  padding: "0 16px",
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                style={{
                  flex: 1,
                  height: "44px",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Welcome / calibration */}
        {step === 4 && (
          <div>
            <h1
              className="font-display"
              style={{
                fontSize: "28px",
                fontWeight: 400,
                color: "var(--fg)",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              You&apos;re all set.
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "var(--fg-muted)",
                marginBottom: "28px",
                lineHeight: 1.5,
                fontFamily: "var(--font-sans)",
              }}
            >
              Your first dashboard will use {selectedCert.version}, {sessionMinutes}-minute sessions, and your exam date to recommend the next useful drill.
            </p>
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)",
                background: "var(--bg)",
                padding: "12px 14px",
                marginBottom: "18px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--fg)",
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Start with a 5-question check-in so the app can spot weak objectives before it builds your review loop.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => saveAndFinish(true)}
                style={{
                  width: "100%",
                  height: "44px",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Yes, run the check-in
              </button>
              <button
                onClick={() => saveAndFinish(false)}
                style={{
                  width: "100%",
                  height: "44px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Skip, take me to the dashboard
              </button>
            </div>
            <button
              onClick={() => setStep(3)}
              style={{
                display: "block",
                marginTop: "12px",
                background: "none",
                border: "none",
                color: "var(--fg-muted)",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
