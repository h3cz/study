"use client";

/**
 * ScoreRing — 270° arc gauge for the predicted exam score (100–900 scale).
 *
 * Design spec:
 * - 270° arc drawn from 135° (bottom-left) clockwise to 45° (bottom-right).
 * - Fill proportional to (score − 100) / 800.
 * - Color: amber (--accent) below 750 pass line, green (--success) at/above 750.
 * - 750-pass notch + "PASS" label rendered at the correct angular position.
 * - Score number (Fraunces) + "/900" (JetBrains Mono) centred inside the ring.
 * - Animated fill on mount via requestAnimationFrame; respects prefers-reduced-motion.
 * - score === null → empty ghost ring + "Take a quiz" prompt.
 * - Responsive: 160px mobile, 200px desktop (controlled by the caller via `size`).
 * - Fully accessible: role="img" aria-label on the SVG.
 */

import { useEffect, useRef, useState } from "react";

interface ScoreRingProps {
  /** Actual target score (null = no data yet). */
  score: number | null;
  /** Animated display value driven from parent (null = not started). */
  displayScore: number | null;
  /** Diameter of the ring in px — parent sets 160 (mobile) or 200 (desktop). */
  size?: number;
  /** Pass line for the active cert (defaults to the Sec+ 750 line). */
  passScore?: number;
  /** Bottom of the score scale (defaults to 100). */
  scoreMin?: number;
  /** Top of the score scale (defaults to 900). */
  scoreMax?: number;
}

/**
 * Convert a score on [scoreMin, scoreMax] to a fraction on [0, 1].
 */
function scoreFraction(s: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (s - min) / (max - min)));
}

/**
 * Map a fraction [0, 1] along the 270° arc to an SVG (x, y) coordinate.
 *
 * Arc: starts at 135° (7 o'clock position) sweeping clockwise 270° to 45°.
 * Angle in standard math convention increases counter-clockwise, but SVG y-axis
 * is flipped, so clockwise in SVG means we add to the angle in the formula.
 *
 * startAngle = 135° (in degrees from positive x-axis, SVG convention)
 * totalSweep = 270°
 */
function arcPoint(fraction: number, cx: number, cy: number, r: number) {
  const startDeg = 135;
  const sweepDeg = 270;
  const deg = startDeg + fraction * sweepDeg;
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Build the SVG `d` attribute for an arc from fraction 0 to `endFraction`.
 */
function arcPath(
  endFraction: number,
  cx: number,
  cy: number,
  r: number
): string {
  if (endFraction <= 0) return "";

  const start = arcPoint(0, cx, cy, r);
  const end = arcPoint(endFraction, cx, cy, r);

  // large-arc-flag: 1 if the arc spans more than 180°
  const sweepAngle = endFraction * 270;
  const largeArc = sweepAngle > 180 ? 1 : 0;
  // Clockwise sweep
  const sweep = 1;

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

/**
 * Full track path (270°) for the grey background arc.
 *
 * Reuses the same single-arc builder as the fill so the track and fill are
 * always geometrically identical. (An earlier two-segment version used a wrong
 * large-arc flag on the second half, which rendered the right side as broken
 * stubs.)
 */
function trackPath(cx: number, cy: number, r: number): string {
  return arcPath(1, cx, cy, r);
}

export function ScoreRing({
  score,
  displayScore,
  size = 200,
  passScore = 750,
  scoreMin = 100,
  scoreMax = 900,
}: ScoreRingProps) {
  // The animated fraction we draw — driven by displayScore from the parent.
  const targetFraction =
    displayScore !== null ? scoreFraction(displayScore, scoreMin, scoreMax) : 0;

  // On reduced-motion: skip animation and go straight to the target.
  const reducedMotionRef = useRef<boolean>(false);
  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Local animated fill fraction (0 → targetFraction).
  const [animFraction, setAnimFraction] = useState<number>(0);
  const animRef = useRef<number | null>(null);
  const prevTargetRef = useRef<number>(0);

  useEffect(() => {
    if (targetFraction === 0) {
      const timer = setTimeout(() => setAnimFraction(0), 0);
      return () => clearTimeout(timer);
    }
    if (reducedMotionRef.current) {
      const timer = setTimeout(() => setAnimFraction(targetFraction), 0);
      return () => clearTimeout(timer);
    }

    const from = prevTargetRef.current;
    const to = targetFraction;
    prevTargetRef.current = to;

    if (from === to) return;

    const duration = 700; // ms — matches the score count-up in page.tsx
    const startTime = new Date().getTime();

    function tick() {
      const now = new Date().getTime();
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic — same easing as the score counter
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimFraction(from + (to - from) * eased);
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick);
      }
    }
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [targetFraction]);

  // Ring geometry
  const strokeWidth = size * 0.07; // 7% of diameter
  const padding = strokeWidth / 2 + 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - padding;

  // Pass line (default 750)
  const passFraction = scoreFraction(passScore, scoreMin, scoreMax);
  // Notch: short tick perpendicular to the arc (outward)
  const notchAngleDeg = 135 + passFraction * 270;
  const notchAngleRad = (notchAngleDeg * Math.PI) / 180;
  const notchLen = strokeWidth * 0.9;
  const notchX1 = cx + (r - notchLen / 2) * Math.cos(notchAngleRad);
  const notchY1 = cy + (r - notchLen / 2) * Math.sin(notchAngleRad);
  const notchX2 = cx + (r + notchLen / 2) * Math.cos(notchAngleRad);
  const notchY2 = cy + (r + notchLen / 2) * Math.sin(notchAngleRad);
  // "PASS" label — sits just INSIDE the ring band near the notch. Placing it
  // outside at the 3-o'clock notch pushed it past the right edge of the square
  // viewBox (clipping "PASS" to "P."), so it lives inside the hollow instead.
  const passLabelR = r - strokeWidth * 0.95;
  const passLabelX = cx + passLabelR * Math.cos(notchAngleRad);
  const passLabelY = cy + passLabelR * Math.sin(notchAngleRad);

  // Determine fill color: amber below pass, green at/above pass
  const isAbovePass =
    displayScore !== null && displayScore >= passScore;
  const fillColor = isAbovePass ? "var(--success)" : "var(--accent)";

  // The animated arc path
  const filledArc = arcPath(animFraction, cx, cy, r);
  const trackArc = trackPath(cx, cy, r);

  // Accessibility label
  const ariaLabel =
    score === null
      ? "Score ring — no score yet, take a quiz to see a prediction"
      : `Predicted exam score: ${score} out of ${scoreMax}${score >= passScore ? `, above the ${passScore} pass line` : `, below the ${passScore} pass line`}`;

  const labelFontSize = size * 0.28; // score number
  const subFontSize = size * 0.09; // "/900"
  const passFontSize = Math.max(7, size * 0.055); // "PASS" label

  if (score === null) {
    // Ghost / empty state
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <svg
          role="img"
          aria-label={ariaLabel}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: "block" }}
        >
          {/* Track */}
          <path
            d={trackArc}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Ghost centre text */}
          <text
            x={cx}
            y={cy - subFontSize * 0.4}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontSize: labelFontSize * 0.55,
              fill: "var(--fg-subtle)",
              fontWeight: 400,
            }}
          >
            —
          </text>
        </svg>
        <span
          style={{
            fontSize: "11px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Take a quiz to unlock
        </span>
      </div>
    );
  }

  // Normal state
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Track — full 270° ghost arc */}
      <path
        d={trackArc}
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Filled arc */}
      {filledArc && (
        <path
          d={filledArc}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}

      {/* Pass-line notch */}
      <line
        x1={notchX1}
        y1={notchY1}
        x2={notchX2}
        y2={notchY2}
        stroke="var(--fg)"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
      />

      {/* "PASS" label near the notch */}
      <text
        x={passLabelX}
        y={passLabelY}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "var(--font-mono), 'Courier New', monospace",
          fontSize: passFontSize,
          fill: "var(--fg-subtle)",
          letterSpacing: "0.06em",
          fontWeight: 600,
        }}
      >
        PASS
      </text>

      {/* Score number — big Fraunces display numeral */}
      <text
        x={cx}
        y={cy - subFontSize * 0.6}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: labelFontSize,
          fill: "var(--fg)",
          fontWeight: 400,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {displayScore ?? score}
      </text>

      {/* "/900" sub-label */}
      <text
        x={cx}
        y={cy + labelFontSize * 0.38}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: "var(--font-mono), 'Courier New', monospace",
          fontSize: subFontSize,
          fill: "var(--fg-muted)",
          fontWeight: 400,
        }}
      >
        / {scoreMax}
      </text>
    </svg>
  );
}
