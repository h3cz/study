import { expect, test, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const AUTH_USER_ID = "00000000-0000-4000-8000-000000000123";

function envValue(name: string): string | null {
  if (process.env[name]) return process.env[name] ?? null;
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return null;
  const line = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim() : null;
}

function supabaseProjectRef(): string {
  const rawUrl = envValue("NEXT_PUBLIC_SUPABASE_URL") ?? "https://placeholder.supabase.co";
  return new URL(rawUrl).hostname.split(".")[0] || "placeholder";
}

function base64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function mockSignedInSupabase(page: Page) {
  const nowSeconds = Math.floor(new Date().getTime() / 1000);
  const user = {
    id: AUTH_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: "qa@example.test",
    email_confirmed_at: new Date().toISOString(),
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const session = {
    access_token: "test-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: nowSeconds + 3600,
    refresh_token: "test-refresh-token",
    user,
  };
  const storageKey = `sb-${supabaseProjectRef()}-auth-token`;
  const cookieValue = `base64-${base64Url(JSON.stringify(session))}`;

  await page.context().addCookies([
    {
      name: storageKey,
      value: cookieValue,
      url: "http://127.0.0.1:3100",
      sameSite: "Lax",
      httpOnly: false,
      secure: false,
    },
  ]);

  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    { key: storageKey, value: session }
  );
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
      if (url === "/api/admin/me" || url.endsWith("/api/admin/me")) {
        return Promise.resolve(
          new Response(JSON.stringify({ isAdmin: false }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      return originalFetch(input, init);
    };
  });

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(user) });
  });
  await page.route("**/auth/v1/token**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(session) });
  });
  await page.route("**/api/admin/me**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ isAdmin: false }) });
  });
  await page.context().route("**/rest/v1/**", async (route) => {
    const url = route.request().url();
    const corsHeaders = {
      "Access-Control-Allow-Headers": "accept-profile, apikey, authorization, content-profile, content-type, x-client-info",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };

    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    let body = "[]";
    if (url.includes("/profiles")) {
      body = JSON.stringify({ user_id: AUTH_USER_ID, display_name: "QA Tester", avatar_url: null, is_publicly_listed: false });
    } else if (url.includes("/public_cert_leaderboard")) {
      body = JSON.stringify([
        { user_id: "00000000-0000-4000-8000-000000000999", cert_id: "secplus-sy0-701", predicted_score: 812, xp: 2100, display_name: "Top Student", avatar_url: null },
        { user_id: AUTH_USER_ID, cert_id: "secplus-sy0-701", predicted_score: 764, xp: 840, display_name: "QA Tester", avatar_url: null },
      ]);
    } else if (url.includes("/public_leaderboard")) {
      body = JSON.stringify([
        { user_id: "00000000-0000-4000-8000-000000000999", xp: 2100, predicted_score: 812, display_name: "Top Student", avatar_url: null },
        { user_id: AUTH_USER_ID, xp: 840, predicted_score: 764, display_name: "QA Tester", avatar_url: null },
      ]);
    }

    await route.fulfill({ status: 200, headers: corsHeaders, body });
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth, `scrollWidth ${overflow.scrollWidth} should fit clientWidth ${overflow.clientWidth}`).toBeLessThanOrEqual(
    overflow.clientWidth + 1
  );
}

async function attachScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, {
    body: screenshot,
    contentType: "image/png",
  });
}

test("leaderboard signed-out mobile states stay usable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/leaderboard");

  await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Global Rankings" })).toBeVisible();
  await expect(page.getByText("Save your profile to enter the leaderboard.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create save slot →" })).toHaveAttribute(
    "href",
    "/login?next=%2Fleaderboard&claim=guest-slot"
  );

  await attachScreenshot(page, testInfo, "leaderboard-mobile-public-auth-gate");
  await expectNoHorizontalOverflow(page);
});

test("leaderboard signed-in state exposes public opt-in and cert tabs", async ({ page }, testInfo) => {
  await mockSignedInSupabase(page);
  await page.goto("/leaderboard");

  await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
  await expect(page.getByText("You're not listed publicly.")).toBeVisible();
  await expect(page.getByRole("button", { name: "List me publicly" })).toBeVisible();
  await expect(page.getByText("Top Student")).toBeVisible();
  await expect(page.getByText("QA Tester")).toBeVisible();

  await page.getByRole("button", { name: "Global" }).click();
  await expect(page.getByRole("heading", { name: "Global Rankings · by XP" })).toBeVisible();
  await page.getByRole("button", { name: "Network+" }).click();
  await expect(page.getByRole("heading", { name: "Network+ Rankings" })).toBeVisible();
  await expect(page.getByText("Guest Slot 01")).toHaveCount(0);
  await attachScreenshot(page, testInfo, "leaderboard-signed-in-cert-tabs");
});

test("leaderboard signed-in mobile populated rankings do not overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSignedInSupabase(page);
  await page.goto("/leaderboard");

  await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
  await expect(page.getByText("Top Student")).toBeVisible();
  await expect(page.getByText("QA Tester")).toBeVisible();
  await attachScreenshot(page, testInfo, "leaderboard-signed-in-mobile-populated");
  await expectNoHorizontalOverflow(page);
});

test("login defaults to sign-in copy for multiplayer", async ({ page }) => {
  await page.goto("/play");

  await expect(page.getByRole("heading", { name: "Versus & Co-study" })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login?next=%2Fplay");
  await expect(page.getByRole("main").getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login?next=%2Fplay");

  await page.getByRole("main").getByRole("link", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/login\?next=%2Fplay$/);
  await expect(page.getByRole("heading", { name: "Sign in to hecz / study" })).toBeAttached();
  await expect(page.getByText("sign in to continue")).toBeVisible();
  await expect(page.getByText("Sign in to unlock multiplayer, keep duel results, and return right back to Versus.")).toBeVisible();
  await expect(page.getByPlaceholder("email address")).toBeVisible();
  await expect(page.getByRole("button", { name: "Email me a sign-in link" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
});

test("login save claim keeps the account-save path readable", async ({ page }) => {
  await page.goto("/login?next=%2Fleaderboard&claim=guest-slot");

  await expect(page.getByRole("heading", { name: "Sign in to hecz / study" })).toBeAttached();
  await expect(page.getByText("save your progress or sign in")).toBeVisible();
  await expect(page.getByText("Use the same browser you studied in.")).toBeVisible();
  await expect(page.getByPlaceholder("email for your account")).toBeVisible();
  await expect(page.getByRole("button", { name: "Email me a save link" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save with Google" })).toBeVisible();
});

test("quiz completion prompts signed-out users to save their run", async ({ page }) => {
  await page.goto("/quiz?n=1");

  await expect(page.getByText(/Select an answer|Check answer/)).toBeVisible();
  await page.keyboard.press("1");
  await page.getByRole("button", { name: "Check answer" }).click();

  const confidencePrompt = page.getByText("How confident?");
  if (await confidencePrompt.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /^Low/ }).click();
  }

  await page.getByRole("button", { name: "See Results" }).click();
  await expect(page.getByText("Quiz Complete")).toBeVisible();
  const saveRunPrompt = page.getByRole("region", { name: "Save your run" });
  await expect(saveRunPrompt).toBeVisible();
  await expect(saveRunPrompt.getByText("Save your run?")).toBeVisible();
  await expect(saveRunPrompt.getByText("This run is saved on this browser.")).toBeVisible();
  await expect(saveRunPrompt.getByText("Profile tied to this browser")).toBeVisible();
  await expect(saveRunPrompt.getByText("XP, streaks, scores, reviews")).toBeVisible();
  await expect(saveRunPrompt.getByRole("link", { name: "Save to account" })).toHaveAttribute("href", "/login?next=%2F&claim=guest-run");
});

test("drill results use the same guest save-run prompt", async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem(
      "drillResults",
      JSON.stringify({
        durationSeconds: 42,
        correct: 2,
        incorrect: 1,
        skipped: 0,
        attempts: [
          { acronymId: "secplus-sy0-701:ac:AAA", userAnswer: "auth auth auth", correct: false, ms: 5000 },
          { acronymId: "secplus-sy0-701:ac:AES", userAnswer: "Advanced Encryption Standard", correct: true, ms: 3000 },
          { acronymId: "secplus-sy0-701:ac:ACL", userAnswer: "Access Control List", correct: true, ms: 3000 },
        ],
      })
    );
  });

  await page.goto("/drill/results");

  await expect(page.getByText("1 wrong · 0 skipped · 3 seen")).toBeVisible();
  const saveRunPrompt = page.getByRole("region", { name: "Save your run" });
  await expect(saveRunPrompt).toBeVisible();
  await expect(saveRunPrompt.getByText("Local progress · drill run")).toBeVisible();
  await expect(saveRunPrompt.getByRole("link", { name: "Save to account" })).toHaveAttribute(
    "href",
    "/login?next=%2Fdrill%2Fresults&claim=guest-run"
  );
});

test("admin is closed to signed-out visitors and does not overflow on mobile", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/admin");

  expect(response?.status()).toBe(404);
  await expect(page.getByText("Admin · Analytics")).toHaveCount(0);
  await attachScreenshot(page, testInfo, "admin-mobile-signed-out-404");
  await expectNoHorizontalOverflow(page);
});

test("admin capability probe is safe for signed-out visitors", async ({ request }) => {
  const response = await request.get("/api/admin/me");
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toEqual({ isAdmin: false });
});

test("guest claim validates guest ids before attribution", async ({ request }) => {
  const response = await request.post("/api/guest/claim", { data: { guestId: "bad" } });
  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toEqual({ error: "Invalid guest id" });
});
