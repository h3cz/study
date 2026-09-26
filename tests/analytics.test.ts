import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn(), opt_in_capturing: vi.fn(), opt_out_capturing: vi.fn() }));
vi.mock("posthog-js", () => ({ default: sdk }));
let storage: Map<string, string>;
beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  storage = new Map();
  vi.stubGlobal("window", { location: { origin: "https://study.hecz.dev" }, dispatchEvent: vi.fn() });
  vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) });
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_placeholder");
  vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://us.i.posthog.com");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("consent-gated Study analytics", () => {
  it("does not initialize or send events before consent or after refusal", async () => {
    const { track, trackPage, writeConsent } = await import("@/lib/analytics");
    await track("study_session_started"); await trackPage("/quiz");
    writeConsent("denied"); await track("study_session_completed");
    expect(sdk.init).not.toHaveBeenCalled(); expect(sdk.capture).not.toHaveBeenCalled();
  });
  it("stays inert when the project key is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    storage.set("hecz.analytics.consent.v1", "granted");
    const { track } = await import("@/lib/analytics");
    await track("study_session_started");
    expect(sdk.init).not.toHaveBeenCalled();
  });
  it("does not guess a project region when the host is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "");
    storage.set("hecz.analytics.consent.v1", "granted");
    const { track } = await import("@/lib/analytics");
    await track("study_session_started");
    expect(sdk.init).not.toHaveBeenCalled();
  });
  it("initializes once, removes private values and tracks subsequent App Router pages", async () => {
    const { writeConsent, track, trackPage } = await import("@/lib/analytics");
    writeConsent("granted");
    await trackPage("/quiz?token=secret&answer=B");
    await trackPage("/r/private-share-token?utm_source=test");
    await track("study_session_completed", { ...{ answer: "B", score: 100, query: "private text" }, cert_id: "az-104", mode: "case-study" });
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.capture).toHaveBeenNthCalledWith(1, "$pageview", expect.objectContaining({ $pathname: "/quiz", $current_url: "https://study.hecz.dev/quiz" }));
    expect(sdk.capture).toHaveBeenNthCalledWith(2, "$pageview", expect.objectContaining({ $pathname: "/r/:token" }));
    expect(sdk.capture.mock.calls[2][1]).not.toHaveProperty("answer");
    expect(sdk.capture.mock.calls[2][1]).not.toHaveProperty("score");
    expect(sdk.capture.mock.calls[2][1]).not.toHaveProperty("query");
    expect(sdk.init.mock.calls[0][1]).toMatchObject({ autocapture: false, disable_session_recording: true, person_profiles: "never" });
  });
  it("does not send a pending event if consent is withdrawn during initialization", async () => {
    const { writeConsent, track } = await import("@/lib/analytics");
    writeConsent("granted");
    const pending = track("study_session_started");
    writeConsent("denied");
    await pending;
    expect(sdk.capture).not.toHaveBeenCalled();
  });
  it("scrubs URLs added by the SDK and rejects sends after revocation", async () => {
    const { writeConsent, track } = await import("@/lib/analytics");
    writeConsent("granted"); await track("search_used", { destination: "/quiz?answer=B" });
    const beforeSend = sdk.init.mock.calls[0][1].before_send as (event: { properties: Record<string, unknown> }) => { properties: Record<string, unknown> } | null;
    const event = { properties: { $initial_current_url: "https://study.hecz.dev/c/private?email=secret", $referrer: "https://example.com/?email=secret", utm_term: "private search", $initial_utm_source: "private value", gclid: "click-id" } };
    expect(beforeSend(event)?.properties).toEqual({ $initial_current_url: "https://study.hecz.dev/c/:token", $referrer: "https://example.com/" });
    writeConsent("denied");
    expect(beforeSend(event)).toBeNull();
    expect(sdk.opt_out_capturing).toHaveBeenCalled();
  });
});
