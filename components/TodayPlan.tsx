"use client";

import Link from "next/link";
import type { TodayPlan as TodayPlanData, TodayPlanItem } from "@/lib/today";

interface TodayPlanProps {
  plan: TodayPlanData;
  context?: string;
}

export function TodayPlan({ plan, context }: TodayPlanProps) {
  const { items, totalEstMinutes, completedCount } = plan;

  // All-done empty state
  if (items.length > 0 && completedCount === items.length) {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "4px",
          border: "1px solid var(--border)",
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: "13px",
            color: "var(--fg-muted)",
            letterSpacing: "0.03em",
          }}
        >
          ✓ All done for today · come back tomorrow
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "4px",
        border: "1px solid var(--border)",
        padding: "20px 24px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "14px" }}>
        <div className="flex items-center justify-between gap-3">
          <p
            className="font-mono"
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
            }}
          >
            Today&apos;s plan
            {totalEstMinutes > 0 && (
              <span style={{ color: "var(--fg-subtle)" }}> · ~{totalEstMinutes} min</span>
            )}
          </p>
        </div>
        {context && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--fg-subtle)",
              fontFamily: "var(--font-sans)",
              lineHeight: 1.35,
              marginTop: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {context}
          </p>
        )}
      </div>

      {/* Item list */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item, i) => (
          <PlanRow key={item.kind} item={item} isFirst={i === 0} />
        ))}
      </div>

      {/* Footer */}
      <p
        className="font-mono"
        style={{
          fontSize: "11px",
          color: "var(--fg-subtle)",
          marginTop: "12px",
          letterSpacing: "0.04em",
        }}
      >
        {completedCount} of {items.length} done
      </p>
    </div>
  );
}

function PlanRow({ item, isFirst }: { item: TodayPlanItem; isFirst: boolean }) {
  const isDone = !!item.done;

  return (
    <Link
      href={item.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 0",
        borderTop: isFirst ? "none" : "1px solid var(--border)",
        textDecoration: "none",
        transition: "transform 80ms ease-out",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
      }}
    >
      {/* Done indicator — filled amber circle or empty ring */}
      <span
        style={{
          flexShrink: 0,
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: isDone ? "var(--accent)" : "transparent",
          border: `1.5px solid ${isDone ? "var(--accent)" : "var(--border-strong)"}`,
          display: "inline-block",
        }}
      />

      {/* Label + detail */}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: "13px",
            color: isDone ? "var(--fg-muted)" : "var(--fg)",
            textDecoration: isDone ? "line-through" : "none",
            fontFamily: "var(--font-sans)",
          }}
        >
          {item.label}
        </span>
        {item.detail && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--fg-subtle)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {" · "}
            {item.detail}
          </span>
        )}
      </span>

      {/* Est time */}
      <span
        className="font-mono"
        style={{
          flexShrink: 0,
          fontSize: "12px",
          color: isDone ? "var(--fg-subtle)" : "var(--fg-muted)",
          letterSpacing: "0.03em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {item.estMinutes > 0 ? `${item.estMinutes}m` : "—"}
      </span>
    </Link>
  );
}
