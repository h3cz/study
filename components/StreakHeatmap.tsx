"use client";

import { useState } from "react";
import type { HeatmapDay } from "@/lib/heatmap";

// Cell dimensions
const CELL_DESKTOP = 12;
const CELL_MOBILE = 10;
const GAP = 2;
const COLS = 13; // weeks
const ROWS = 7;  // days of week

// Amber intensity palette matching the design system
const LEVEL_COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "var(--border)",
  1: "rgba(245,166,35,0.25)",
  2: "rgba(245,166,35,0.50)",
  3: "rgba(245,166,35,0.75)",
  4: "var(--accent)",
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_SHOW = new Set([1, 3, 5]); // M, W, F indices

function formatTooltip(day: HeatmapDay): string {
  const d = new Date(day.date + "T00:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const date = d.getDate();
  return `${weekday} ${month} ${date} · ${day.count} session${day.count !== 1 ? "s" : ""}`;
}

function getMonthLabels(
  days: HeatmapDay[],
  cellSize: number
): { label: string; x: number }[] {
  // Group days into 13-week columns (col 0 = oldest)
  // days is sorted oldest-first, length = 91 (13*7)
  const labels: { label: string; x: number }[] = [];
  let lastMonth = -1;
  for (let col = 0; col < COLS; col++) {
    const idx = col * ROWS;
    if (idx >= days.length) break;
    const d = new Date(days[idx].date + "T00:00:00");
    const month = d.getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      labels.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        x: col * (cellSize + GAP),
      });
    }
  }
  return labels;
}

interface Props {
  days: HeatmapDay[];
  /** Pass true when rendered at mobile breakpoint */
  mobile?: boolean;
}

export function StreakHeatmap({ days, mobile = false }: Props) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const cellSize = mobile ? CELL_MOBILE : CELL_DESKTOP;

  const hasActivity = days.some((d) => d.count > 0);

  if (!hasActivity) {
    return (
      <p
        style={{
          fontSize: "13px",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-sans)",
          textAlign: "center",
          padding: "16px 0",
        }}
      >
        Take a quiz to start your study streak
      </p>
    );
  }

  // Pad days to exactly 91 entries (13 cols × 7 rows) — prepend empties if needed
  const padded: (HeatmapDay | null)[] = [];
  const needed = COLS * ROWS;
  const pad = needed - days.length;
  for (let i = 0; i < pad; i++) padded.push(null);
  padded.push(...days);

  // Build 13 columns of 7 days each (col 0 = oldest week)
  const cols: (HeatmapDay | null)[][] = [];
  for (let col = 0; col < COLS; col++) {
    cols.push(padded.slice(col * ROWS, col * ROWS + ROWS));
  }

  const LABEL_WIDTH = 14; // px reserved for weekday labels on the left
  const svgWidth = LABEL_WIDTH + COLS * (cellSize + GAP) - GAP;
  const MONTH_ROW_H = 14;
  const svgHeight = MONTH_ROW_H + ROWS * (cellSize + GAP) - GAP;

  // Month labels using the non-null days
  const nonNullDays = padded.filter((d): d is HeatmapDay => d !== null);
  const monthLabels = getMonthLabels(nonNullDays, cellSize);

  return (
    <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: "block", overflow: "visible" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Month labels */}
        {monthLabels.map(({ label, x }) => (
          <text
            key={`${label}-${x}`}
            x={LABEL_WIDTH + x}
            y={10}
            fontSize={9}
            fill="var(--fg-subtle)"
            fontFamily="var(--font-sans)"
          >
            {label}
          </text>
        ))}

        {/* Weekday labels (M/W/F) */}
        {WEEKDAY_LABELS.map((lbl, row) =>
          WEEKDAY_SHOW.has(row) ? (
            <text
              key={row}
              x={LABEL_WIDTH - 3}
              y={MONTH_ROW_H + row * (cellSize + GAP) + cellSize - 2}
              fontSize={9}
              fill="var(--fg-subtle)"
              fontFamily="var(--font-sans)"
              textAnchor="end"
            >
              {lbl}
            </text>
          ) : null
        )}

        {/* Grid cells */}
        {cols.map((colDays, col) =>
          colDays.map((day, row) => {
            const x = LABEL_WIDTH + col * (cellSize + GAP);
            const y = MONTH_ROW_H + row * (cellSize + GAP);
            const level = day?.level ?? 0;
            return (
              <rect
                key={`${col}-${row}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={LEVEL_COLORS[level as 0 | 1 | 2 | 3 | 4]}
                style={{ cursor: day ? "pointer" : "default" }}
                onMouseEnter={
                  day
                    ? (e) => {
                        const svgEl = (e.currentTarget as SVGRectElement).closest("svg");
                        const rect = svgEl?.getBoundingClientRect();
                        const cellRect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
                        setTooltip({
                          text: formatTooltip(day),
                          x: cellRect.left - (rect?.left ?? 0) + cellSize / 2,
                          y: cellRect.top - (rect?.top ?? 0) - 4,
                        });
                      }
                    : undefined
                }
              />
            );
          })
        )}
      </svg>

      {/* Tooltip — absolutely positioned over the SVG */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color: "var(--fg)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 50,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
