// Pure-SVG sparkline. No interactivity → renders fine as a Server Component
// (no "use client"). Hand-rolled like components/TrendChart.tsx — zero deps.

interface SparklineProps {
  points: number[];
  /** Stroke/area color. Defaults to the app accent. */
  color?: string;
}

const W = 200;
const H = 48;
const PAD = 3;

export function Sparkline({ points, color = "var(--accent)" }: SparklineProps) {
  if (points.length === 0) {
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", width: "100%", height: `${H}px` }}
        role="img"
        aria-label="No data"
      />
    );
  }

  const max = Math.max(...points, 1);
  const n = points.length;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;

  const toX = (i: number): number => (n === 1 ? W / 2 : PAD + (i / (n - 1)) * chartW);
  const toY = (v: number): number => PAD + chartH - (v / max) * chartH;

  const linePts = points.map((v, i) => `${toX(i).toFixed(2)},${toY(v).toFixed(2)}`).join(" ");
  // Closed area: line, then down to the baseline and back to the start.
  const areaPts = `${PAD},${H - PAD} ${linePts} ${(W - PAD).toFixed(2)},${H - PAD}`;
  const gradientId = `spark-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: `${H}px` }}
      role="img"
      aria-label="30-day trend"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gradientId})`} stroke="none" />
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
