import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getCert, DEFAULT_CERT_ID } from "@/lib/certs";

export const runtime = "edge";

const W = 1200;
const H = 630;

function clampScore(raw: string | null): number {
  const n = parseInt(raw ?? "", 10);
  if (isNaN(n)) return 700;
  return Math.max(100, Math.min(900, n));
}

async function loadFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const score = clampScore(searchParams.get("score"));
    const kind = searchParams.get("kind") === "mock" ? "mock" : "predicted";
    const streakRaw = searchParams.get("streak");
    const streak = streakRaw ? parseInt(streakRaw, 10) : null;
    const streakVal = streak !== null && !isNaN(streak) && streak > 0 ? streak : null;
    const passedRaw = searchParams.get("passed");
    const passed = passedRaw === "true" ? true : passedRaw === "false" ? false : null;

    // Resolve the cert so the pass line + label match the cert being shared
    // (defaults to Security+, keeping existing share links byte-identical).
    const cert = getCert(searchParams.get("cert") || DEFAULT_CERT_ID);
    const PASS = cert.passingScore;
    const MIN = cert.scoreMin;
    const MAX = cert.scoreMax;

    const label =
      kind === "mock"
        ? "MOCK EXAM RESULT"
        : `PREDICTED ${cert.name.toUpperCase()} SCORE`;

    // Fetch Fraunces (serif for big number) and Inter Tight (sans for labels)
    // Falls back gracefully — route will never 500 even if fonts fail.
    const [frauncesBuf, interTightBuf] = await Promise.all([
      loadFont(
        "https://fonts.gstatic.com/s/fraunces/v31/6NUh8FyLNQOQZAnv9bYEvDiIdE9Eqcbpxqs.woff"
      ),
      loadFont(
        "https://fonts.gstatic.com/s/intertight/v7/NGSnv5HMAFg6IuGlBNMjxJEL2VmU3NS7Z2mjDw-qXCRToK8EPg.woff"
      ),
    ]);

    const fonts: {
      name: string;
      data: ArrayBuffer;
      weight: 400 | 700;
      style: "normal";
    }[] = [];
    if (frauncesBuf) fonts.push({ name: "Fraunces", data: frauncesBuf, weight: 400, style: "normal" });
    if (interTightBuf) fonts.push({ name: "InterTight", data: interTightBuf, weight: 400, style: "normal" });

    const displayFont = frauncesBuf ? "Fraunces" : "Georgia, serif";
    const sansFont = interTightBuf ? "InterTight" : "system-ui, sans-serif";
    const monoFont = "monospace";

    // Amber and color tokens
    const BG = "#0B0D0E";
    const AMBER = "#F5A623";
    const FG = "#E8E6E0";
    const FG_MUTED = "#7C7A74";
    const FG_SUBTLE = "#4F4D48";
    const SUCCESS = "#5FB37C";
    const ERROR = "#E55C5C";
    const BORDER = "rgba(255,255,255,0.08)";

    // Pass/fail display for mock kind
    let passNode = null;
    if (kind === "mock" && passed !== null) {
      if (passed) {
        passNode = (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(95,179,124,0.15)",
              border: `1px solid ${SUCCESS}`,
              borderRadius: "4px",
              padding: "5px 14px",
              fontFamily: monoFont,
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: SUCCESS,
              alignSelf: "center",
            }}
          >
            PASS
          </div>
        );
      } else {
        passNode = (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(229,92,92,0.12)",
              border: `1px solid ${ERROR}`,
              borderRadius: "4px",
              padding: "5px 14px",
              fontFamily: monoFont,
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: ERROR,
              alignSelf: "center",
            }}
          >
            KEEP GOING
          </div>
        );
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            width: W,
            height: H,
            background: BG,
            display: "flex",
            flexDirection: "column",
            padding: "60px 72px",
            position: "relative",
            fontFamily: sansFont,
          }}
        >
          {/* ASCII grid texture — top-right corner, radial dot pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "360px",
              height: "360px",
              backgroundImage:
                "radial-gradient(rgba(245,166,35,0.07) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              opacity: 0.7,
              display: "flex",
            }}
          />

          {/* Top section: label + streak */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px",
            }}
          >
            <span
              style={{
                fontFamily: monoFont,
                fontSize: "13px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: FG_MUTED,
              }}
            >
              {label}
            </span>

            {streakVal !== null && (
              <span
                style={{
                  fontFamily: monoFont,
                  fontSize: "13px",
                  letterSpacing: "0.08em",
                  color: AMBER,
                  background: "rgba(245,166,35,0.12)",
                  border: `1px solid rgba(245,166,35,0.35)`,
                  borderRadius: "4px",
                  padding: "4px 12px",
                  display: "flex",
                }}
              >
                🔥 {streakVal} day streak
              </span>
            )}
          </div>

          {/* Hero score */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontFamily: displayFont,
                fontSize: "168px",
                fontWeight: 400,
                color: AMBER,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {score}
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingBottom: "16px",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontFamily: monoFont,
                  fontSize: "36px",
                  color: FG_MUTED,
                  fontWeight: 400,
                  lineHeight: 1,
                }}
              >
                / 900
              </span>
              {passNode}
            </div>
          </div>

          {/* Hairline + threshold reference */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "auto",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: BORDER,
                display: "flex",
              }}
            />
            <span
              style={{
                fontFamily: monoFont,
                fontSize: "11px",
                letterSpacing: "0.1em",
                color: FG_SUBTLE,
                whiteSpace: "nowrap",
              }}
            >
              {PASS} TO PASS
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: BORDER,
                display: "flex",
              }}
            />
          </div>

          {/* Score bar — subtle pass threshold marker */}
          <div
            style={{
              position: "relative",
              height: "3px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "2px",
              marginTop: "10px",
              marginBottom: "auto",
              display: "flex",
            }}
          >
            {/* Filled progress */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${((score - MIN) / (MAX - MIN)) * 100}%`,
                background: score >= PASS ? SUCCESS : AMBER,
                borderRadius: "2px",
                display: "flex",
              }}
            />
            {/* pass-line marker */}
            <div
              style={{
                position: "absolute",
                left: `${((PASS - MIN) / (MAX - MIN)) * 100}%`,
                top: "-4px",
                width: "1px",
                height: "11px",
                background: "rgba(245,166,35,0.5)",
                display: "flex",
              }}
            />
          </div>

          {/* Bottom bar: wordmark + URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: `1px solid ${BORDER}`,
            }}
          >
            {/* hecz / study wordmark */}
            <span
              style={{
                fontFamily: sansFont,
                fontSize: "22px",
                fontWeight: 700,
                color: FG,
                letterSpacing: "-0.02em",
                display: "flex",
                gap: "0px",
              }}
            >
              hecz
              <span style={{ color: AMBER }}>{" / "}</span>
              study
            </span>

            <span
              style={{
                fontFamily: monoFont,
                fontSize: "13px",
                color: FG_MUTED,
                letterSpacing: "0.06em",
              }}
            >
              study.hecz.dev
            </span>
          </div>
        </div>
      ),
      {
        width: W,
        height: H,
        fonts: fonts.length > 0 ? fonts : undefined,
      }
    );
  } catch (err) {
    console.error("[share-card] render error:", err);
    return new Response("Failed to generate share card", { status: 500 });
  }
}
