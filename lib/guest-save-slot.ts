const GUEST_ID_KEY = "hecz.study.guestId.v1";
const GUEST_CLAIM_PREFIX = "hecz.study.guestClaimedFor.v1.";

type SavePromptEvent = "shown" | "clicked";

function makeGuestId(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getGuestId(): string {
  const existing = localStorage.getItem(GUEST_ID_KEY);
  if (existing) return existing;
  const next = makeGuestId();
  localStorage.setItem(GUEST_ID_KEY, next);
  return next;
}

function getExistingGuestId(): string | null {
  return localStorage.getItem(GUEST_ID_KEY);
}

function postJson(path: string, body: string): void {
  if ("sendBeacon" in navigator) {
    const sent = navigator.sendBeacon(path, new Blob([body], { type: "application/json" }));
    if (sent) return;
  }
  fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function recordGuestSavePrompt(event: SavePromptEvent, path: string): void {
  postJson("/api/guest/save-prompt", JSON.stringify({ guestId: getGuestId(), event, path }));
}

export function maybeClaimGuestDevice(userId: string): void {
  const guestId = getExistingGuestId();
  if (!guestId) return;
  const claimKey = `${GUEST_CLAIM_PREFIX}${userId}`;
  if (localStorage.getItem(claimKey) === guestId) return;
  localStorage.setItem(claimKey, guestId);
  postJson("/api/guest/claim", JSON.stringify({ guestId }));
}
