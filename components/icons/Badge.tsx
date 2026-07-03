import type { ReactElement } from "react";

/**
 * Badge — geometric medallion and domain mastery ring badges.
 *
 * LevelBadge: rounded-square seal with level number in Fraunces.
 *   - Levels 1-4: outline only (--border-strong stroke, no fill)
 *   - Levels 5-9: amber-tinted fill (rgba(245,166,35,0.15))
 *   - Levels 10+: solid amber fill with dark text
 * 48×48 native, scales via size prop.
 *
 * DomainMasteryBadge: domain glyph inside a progress ring.
 *   - Ring fills clockwise proportional to mastery (0..1)
 *   - <80% mastery: grey ring; ≥80%: amber ring
 * 40×40 native, scales via size prop.
 *
 * No animation (prefers-reduced-motion safe, Terminal-Editorial restraint).
 */

// ─── LevelBadge ─────────────────────────────────────────────────────────────

interface LevelBadgeProps {
  level: number;
  size?: number;
}

export function LevelBadge({ level, size = 48 }: LevelBadgeProps) {
  const tier: "outline" | "tinted" | "solid" =
    level >= 10 ? "solid" : level >= 5 ? "tinted" : "outline";

  const fillColor =
    tier === "solid"
      ? "#F5A623"
      : tier === "tinted"
        ? "rgba(245,166,35,0.15)"
        : "transparent";

  const strokeColor =
    tier === "solid" ? "#F5A623" : "var(--border-strong)";

  const textColor =
    tier === "solid" ? "var(--accent-fg, #0B0D0E)" : "var(--fg)";

  // Font size scales with level digit count and badge size
  const digits = String(level).length;
  const baseFontSize = digits >= 3 ? 13 : digits === 2 ? 15 : 18;
  const scaledFontSize = Math.round((baseFontSize * size) / 48);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Level ${level}`}
      role="img"
    >
      {/* Rounded-square seal — 8px corner radius in a 48 viewBox */}
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="8"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      {/* Subtle inner decorative frame for tinted/solid tiers */}
      {tier !== "outline" && (
        <rect
          x="8"
          y="8"
          width="32"
          height="32"
          rx="5"
          fill="none"
          stroke={tier === "solid" ? "rgba(11,13,14,0.2)" : "rgba(245,166,35,0.25)"}
          strokeWidth="1"
        />
      )}
      {/* Level number in Fraunces */}
      <text
        x="24"
        y="24"
        dominantBaseline="central"
        textAnchor="middle"
        fontFamily="var(--font-display, serif)"
        fontSize={scaledFontSize}
        fontWeight="400"
        fill={textColor}
        style={{ fontVariationSettings: '"opsz" 48' }}
      >
        {level}
      </text>
    </svg>
  );
}

// ─── DomainMasteryBadge ──────────────────────────────────────────────────────

interface DomainMasteryBadgeProps {
  domain: 1 | 2 | 3 | 4 | 5;
  mastery: number; // 0..1
  size?: number;
}

/**
 * Builds an SVG arc path for a progress ring segment.
 * cx,cy = center; r = radius; startAngle = -90 (12 o'clock); sweep in degrees.
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  sweepDeg: number
): string {
  if (sweepDeg <= 0) return "";
  // Clamp to avoid full-circle degenerate case
  const clampedSweep = Math.min(sweepDeg, 359.99);
  const startRad = -Math.PI / 2; // 12 o'clock
  const endRad = startRad + (clampedSweep * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = clampedSweep > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

// Inline path data for each domain at 16×16 within a 40×40 viewBox (centered)
function DomainGlyphInline({ domain }: { domain: 1 | 2 | 3 | 4 | 5 }): ReactElement {
  // All paths are scaled to fit a ~16×16 box centered at (20,20) in a 40×40 viewBox
  // Original glyphs are 24×24; scale factor ≈ 0.667, offset = 20 - 8 = 12
  const offset = 12;
  const s = (v: number) => (v * 16) / 24 + offset; // scale + translate

  if (domain === 1) {
    // Shield: "M12 3L4 6.5V12c0 4 3.5 7.2 8 8.5 4.5-1.3 8-4.5 8-8.5V6.5L12 3z"
    // Scaled: each x,y → (x*16/24)+12, (y*16/24)+12
    return (
      <path
        d={`M${s(12)} ${s(3)}L${s(4)} ${s(6.5)}V${s(12)}c0 ${(4*16)/24} ${(3.5*16)/24} ${(7.2*16)/24} ${(8*16)/24} ${(8.5*16)/24} ${(4.5*16)/24} ${-(1.3*16)/24} ${(8*16)/24} ${-(4.5*16)/24} ${(8*16)/24} ${-(8.5*16)/24}V${s(6.5)}L${s(12)} ${s(3)}z`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  }

  if (domain === 2) {
    return (
      <>
        <ellipse cx={s(12)} cy={s(13)} rx={(4 * 16) / 24} ry={(5 * 16) / 24} stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx={s(12)} cy={s(7)} r={(2 * 16) / 24} stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d={`M${s(10)} ${s(5.5)}L${s(8.5)} ${s(4)}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d={`M${s(14)} ${s(5.5)}L${s(15.5)} ${s(4)}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d={`M${s(8)} ${s(13)}H${s(5)}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d={`M${s(16)} ${s(13)}H${s(19)}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    );
  }

  if (domain === 3) {
    return (
      <>
        <path d={`M${s(4)} ${s(17)}l${(8 * 16) / 24} ${(3.5 * 16) / 24} ${(8 * 16) / 24} ${-(3.5 * 16) / 24}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M${s(4)} ${s(13)}l${(8 * 16) / 24} ${(3.5 * 16) / 24} ${(8 * 16) / 24} ${-(3.5 * 16) / 24}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={`M${s(4)} ${s(9)}l${(8 * 16) / 24} ${-(3.5 * 16) / 24} ${(8 * 16) / 24} ${(3.5 * 16) / 24} ${-(8 * 16) / 24} ${(3.5 * 16) / 24}Z`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    );
  }

  if (domain === 4) {
    const r1 = (8.5 * 16) / 24;
    const r2 = (4.5 * 16) / 24;
    const cx = s(12);
    const cy = s(12);
    return (
      <>
        <circle cx={cx} cy={cy} r={r1} stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx={cx} cy={cy} r={r2} stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
        <circle cx={cx} cy={cy} r={(1 * 16) / 24} fill="currentColor" />
        <path d={`M${cx} ${cy}L${s(18.5)} ${s(6.5)}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    );
  }

  // domain === 5
  const rw = (14 * 16) / 24;
  const rh = (16 * 16) / 24;
  const rx5 = s(5);
  const ry5 = s(5);
  return (
    <>
      <rect x={rx5} y={ry5} width={rw} height={rh} rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d={`M${s(9)} ${s(5)}V${s(4)}a${(1 * 16) / 24} ${(1 * 16) / 24} 0 0 1 ${(1 * 16) / 24} ${-(1 * 16) / 24}h${(4 * 16) / 24}a${(1 * 16) / 24} ${(1 * 16) / 24} 0 0 1 ${(1 * 16) / 24} ${(1 * 16) / 24}v${(1 * 16) / 24}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d={`M${s(8.5)} ${s(11)}l${(1.5 * 16) / 24} ${(1.5 * 16) / 24} ${(3 * 16) / 24} ${-(3 * 16) / 24}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${s(8.5)} ${s(15.5)}h${(7 * 16) / 24}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

export function DomainMasteryBadge({
  domain,
  mastery,
  size = 40,
}: DomainMasteryBadgeProps) {
  const mastered = mastery >= 0.8;
  const ringColor = mastered ? "#F5A623" : "var(--border-strong)";
  const trackColor = "var(--border)";

  // Ring geometry in 40×40 viewBox
  const cx = 20;
  const cy = 20;
  const r = 17; // ring radius
  const sweep = mastery * 360;
  const arcPath = describeArc(cx, cy, r, sweep);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Domain ${domain} mastery: ${Math.round(mastery * 100)}%`}
      role="img"
    >
      {/* Track ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={trackColor}
        strokeWidth="2"
        fill="none"
      />
      {/* Filled arc — clockwise from 12 o'clock */}
      {mastery > 0 && (
        <path
          d={arcPath}
          stroke={ringColor}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {/* Domain glyph centered */}
      <g style={{ color: mastered ? "#F5A623" : "var(--fg-muted)" }}>
        <DomainGlyphInline domain={domain} />
      </g>
    </svg>
  );
}
