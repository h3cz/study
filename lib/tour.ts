import { driver } from "driver.js";
import type { DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import type { CertMeta } from "@/lib/certs";

export const TOUR_VERSION = 1;

export function getDashboardTourSteps(cert: CertMeta): DriveStep[] {
  // Heaviest domain drives the "study the big-weight domain" pitch — Sec+ has
  // Security Operations at 28%, but every cert weights differently, so derive it.
  const topDomain = cert.domains.reduce<CertMeta["domains"][number] | null>(
    (max, d) => (!max || d.weight > max.weight ? d : max),
    null
  );
  const domainPitch = topDomain
    ? `${cert.name} weights domains unequally — ${topDomain.name} is ${Math.round(topDomain.weight * 100)}% of the test. Stronger here = bigger score lift.`
    : "Domains are weighted unequally. Strengthening a heavy-weight domain lifts your score the most.";

  return [
    {
      element: "[data-tour='predicted-score']",
      popover: {
        title: "Your predicted exam score",
        description: `Updates with every quiz. ${cert.scoreMin}-${cert.scoreMax} scale, ${cert.passingScore} passes ${cert.name}.`,
        side: "bottom",
      },
    },
    {
      element: "[data-tour='streak']",
      popover: {
        title: "Daily streak",
        description: "Study any day to keep it. Earn ❄️ freezes every 7 days to cover one missed day automatically.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='today-plan']",
      popover: {
        title: "Today's plan",
        description: "Your daily anchor. Tap a row to start that activity.",
        side: "left",
      },
    },
    {
      element: "[data-tour='domain-mastery']",
      popover: {
        title: "Per-domain mastery",
        description: domainPitch,
        side: "top",
      },
    },
    {
      element: "[data-tour='mock-exam']",
      popover: {
        title: "Full mock exam",
        description: "90 questions, 90 minutes, no explanations until the end — same as the real test. Do 2-3 before exam day.",
        side: "top",
      },
    },
    {
      element: "[data-tour='nav-library']",
      popover: {
        title: "Library + resources",
        description: "Browse every domain, every flashcard, the acronym list, Professor Messer videos, and curated study links.",
        side: "bottom",
      },
    },
    {
      element: "[data-tour='theme-toggle']",
      popover: {
        title: "One last thing",
        description: "Press t anywhere to toggle theme. Press ? for the full keyboard-shortcut list. Good luck — you got this.",
        side: "bottom",
      },
    },
  ];
}

export function shouldShowTour(): boolean {
  try {
    const seen = localStorage.getItem("tourSeenVersion");
    return seen !== String(TOUR_VERSION);
  } catch {
    return false;
  }
}

export function markTourSeen(): void {
  try {
    localStorage.setItem("tourSeenVersion", String(TOUR_VERSION));
  } catch {
    // ignore
  }
}

export function startDashboardTour(cert: CertMeta, onComplete?: () => void): void {
  // Defer until the dashboard has painted its data widgets, THEN filter steps
  // to only those whose target element actually exists in the DOM right now.
  // Mobile hides the desktop nav (nav-library, theme-toggle) and some widgets
  // render conditionally — a missing target must never stall the whole tour.
  setTimeout(() => {
    const liveSteps = getDashboardTourSteps(cert).filter((s) => {
      const sel = typeof s.element === "string" ? s.element : null;
      return !sel || (typeof document !== "undefined" && !!document.querySelector(sel));
    });

    if (liveSteps.length === 0) {
      // Nothing to highlight (e.g. data not loaded) — mark seen so we don't loop.
      markTourSeen();
      onComplete?.();
      return;
    }

    const d = driver({
      showProgress: true,
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Done",
      onDestroyed: () => {
        markTourSeen();
        onComplete?.();
      },
      steps: liveSteps,
    });
    d.drive();
  }, 400);
}
