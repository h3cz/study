"use client";

import { useEffect, useRef, useState } from "react";
import type { DailyTrend } from "@/lib/trend";
import { fillGaps } from "@/lib/trend";

interface TooltipState {
  x: number;
  y: number;
  date: string;
  score: number;
  sessions: number;
}

interface TrendChartProps {
  trend: DailyTrend[];
  days?: number;
}

export function TrendChart({ trend, days = 30 }: TrendChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = setTimeout(() => setReducedMotion(mq.matches), 0);
    return () => clearTimeout(timer);
  }, []);

  if (trend.length === 0) {
    return (
      <div
        style={{
          height: "80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          color: "var(--fg-muted)",
          fontSize: "13px",
          fontFamily: "var(--font-sans)",
          lineHeight: "24px",
          textAlign: "center",
        }}
      >
        <span>You haven&apos;t taken any quizzes yet.</span>
        <span style={{ fontSize: "12px", color: "var(--fg-subtle)" }}>Each quiz updates this trend and your predicted score.</span>
      </div>
    );
  }

  const filled = fillGaps(trend, days);
  const W = 400; // viewBox width
  const H = 80;
  const PAD_LEFT = 4;
  const PAD_RIGHT = 4;
  const PAD_TOP = 8;
  const PAD_BOTTOM = 8;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  function toX(i: number): number {
    return PAD_LEFT + (i / (days - 1)) * chartW;
  }
  function toY(score: number): number {
    return PAD_TOP + chartH - (score / 100) * chartH;
  }

  // Build polyline points from non-null consecutive segments
  // We split into segments so gaps don't draw connecting lines
  const segments: Array<Array<{ x: number; y: number; entry: DailyTrend }>> = [];
  let current: Array<{ x: number; y: number; entry: DailyTrend }> = [];

  filled.forEach((entry, i) => {
    if (entry !== null) {
      current.push({ x: toX(i), y: toY(entry.avgScore), entry });
    } else {
      if (current.length > 0) {
        segments.push(current);
        current = [];
      }
    }
  });
  if (current.length > 0) segments.push(current);

  // All non-null points for dots
  const dots: Array<{ x: number; y: number; entry: DailyTrend; idx: number }> = [];
  filled.forEach((entry, i) => {
    if (entry !== null) {
      dots.push({ x: toX(i), y: toY(entry.avgScore), entry, idx: i });
    }
  });

  const gridY50 = toY(50);

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;

    // Find nearest dot
    let nearest: (typeof dots)[0] | null = null;
    let minDist = Infinity;
    for (const dot of dots) {
      const dist = Math.abs(dot.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        nearest = dot;
      }
    }

    if (nearest && minDist < (chartW / days) * 2) {
      const screenX = rect.left + (nearest.x / W) * rect.width;
      const screenY = rect.top + (nearest.y / H) * rect.height;
      setTooltip({
        x: screenX,
        y: screenY,
        date: nearest.entry.date,
        score: nearest.entry.avgScore,
        sessions: nearest.entry.sessions,
      });
    } else {
      setTooltip(null);
    }
  }

  function formatDate(dateKey: string): string {
    const d = new Date(dateKey + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", width: "100%", height: "80px", overflow: "visible" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        aria-label="30-day quiz score trend"
        role="img"
      >
        {/* 50% gridline */}
        <line
          x1={PAD_LEFT}
          y1={gridY50}
          x2={W - PAD_RIGHT}
          y2={gridY50}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
          style={{ "--grid-dark": "rgba(255,255,255,0.06)" } as React.CSSProperties}
          className="trend-grid"
        />

        {/* Line segments */}
        {segments.map((seg, si) => {
          if (seg.length < 2) return null;
          const pts = seg.map((p) => `${p.x},${p.y}`).join(" ");
          return (
            <polyline
              key={si}
              points={pts}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={
                reducedMotion
                  ? undefined
                  : { animation: "none" }
              }
            />
          );
        })}

        {/* Single-point dots for isolated days */}
        {segments
          .filter((seg) => seg.length === 1)
          .map((seg, si) => (
            <circle
              key={`iso-${si}`}
              cx={seg[0].x}
              cy={seg[0].y}
              r={2.5}
              fill="var(--accent)"
              stroke="var(--bg)"
              strokeWidth="1.5"
            />
          ))}

        {/* Dots on every data point */}
        {dots.map((dot) => (
          <circle
            key={dot.idx}
            cx={dot.x}
            cy={dot.y}
            r={2.5}
            fill="var(--accent)"
            stroke="var(--bg)"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 48,
            transform: "translateX(-50%)",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-sm)",
            padding: "5px 9px",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color: "var(--fg)",
            pointerEvents: "none",
            zIndex: 200,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ color: "var(--fg-muted)", marginBottom: "1px" }}>
            {formatDate(tooltip.date)}
          </div>
          <div>
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>{tooltip.score}%</span>
            <span style={{ color: "var(--fg-muted)", marginLeft: "5px" }}>
              {tooltip.sessions} session{tooltip.sessions !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
