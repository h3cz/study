"use client";

import { rankTier } from "@/lib/rewards";

/**
 * RankBadge — a compact pill showing a user's rank tier derived from their
 * predicted score. Tier label is colored per the tier; pass-ready and above
 * (crown:true) get a small amber crown glyph before the label.
 * Renders nothing when score is null, except a faint "Unranked" at size "md".
 *
 * `passingScore` (default 750 — the SY0-701 line) sets where the crowned
 * pass-ready tier begins, so non-Security+ users get the correct crown line.
 */
interface RankBadgeProps {
  score: number | null;
  size?: "sm" | "md";
  passingScore?: number;
}

// Minimal stroke/fill crown — amber/gold. 1.5px stroke language to match the
// other icons in components/icons/.
function Crown({ px }: { px: number }) {
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block" }}
    >
      <path
        d="M2 5.5l2.5 2L8 3l3.5 4.5 2.5-2L13 12H3L2 5.5z"
        fill="#F5A623"
        stroke="#F5A623"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M3 13.5h10" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function RankBadge({ score, size = "md", passingScore = 750 }: RankBadgeProps) {
  const tier = rankTier(score, passingScore);

  if (!tier) {
    if (size === "md") {
      return (
        <span
          className="font-mono"
          style={{
            fontSize: "10px",
            letterSpacing: "0.06em",
            color: "var(--fg-subtle)",
            textTransform: "uppercase",
          }}
        >
          Unranked
        </span>
      );
    }
    return null;
  }

  const sm = size === "sm";
  const crownPx = sm ? 11 : 14;

  return (
    <span
      title={`Rank: ${tier.label}${tier.crown ? " · pass-ready" : ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: sm ? "3px" : "5px",
        background: "var(--surface-2)",
        border: `1px solid ${tier.color}`,
        borderRadius: "999px",
        padding: sm ? "1px 7px" : "2px 10px",
        whiteSpace: "nowrap",
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {tier.crown && <Crown px={crownPx} />}
      <span
        className="font-mono"
        style={{
          fontSize: sm ? "10px" : "11px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: tier.color,
          textTransform: "uppercase",
        }}
      >
        {tier.label}
      </span>
    </span>
  );
}

export default RankBadge;
