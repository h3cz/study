import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("tourSeenVersion", "1");
    localStorage.setItem("hecz.analytics.consent.v1", "denied");
  });
});

test("mobile case study retains scenario and progress through reload and completion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/case-studies");
  await expect(page.getByRole("link", { name: "Start case study", exact: true })).toHaveCount(6);
  await page.getByRole("article").filter({ hasText: "Alder Quay" }).getByRole("link").click();
  const scenario = page.locator(".case-study-context");
  await expect(scenario).toContainText("CostCenter=410");
  await expect(page.locator(".cert-switcher-trigger")).toContainText("AZ-104");
  await expect(page.locator(".answer-sources")).toHaveCount(0);
  await page.screenshot({ path: "test-results/az104-case-mobile.png", fullPage: true });

  for (let index = 0; index < 5; index++) {
    await expect(scenario).toContainText("Alder Quay");
    await page.keyboard.press("1");
    await page.getByRole("button", { name: "Check answer", exact: true }).click();
    await page.getByRole("button", { name: /High.*Confident/ }).click();
    await expect(page.locator(".answer-sources")).toContainText("Microsoft Learn evidence");
    await expect(page.locator(".answer-sources a").first()).toHaveAttribute("href", /^https:\/\/learn.microsoft.com\//);
    await page.getByRole("button", { name: index === 4 ? "See Results" : "Next Question →", exact: true }).click();
    if (index === 0) {
      await expect.poll(() => page.evaluate(async () => {
        const request = indexedDB.open("SecPlusQuestDB");
        const database = await new Promise<IDBDatabase>(resolve => { request.onsuccess = () => resolve(request.result); });
        const read = database.transaction("inProgressQuizzes").objectStore("inProgressQuizzes").get("current");
        const currentIndex = await new Promise<number>(resolve => { read.onsuccess = () => resolve(read.result?.currentIndex ?? -1); });
        database.close();
        return currentIndex;
      })).toBe(1);
      await page.reload();
      await expect(scenario).toContainText("Alder Quay");
      await expect(page.getByText("After an authorized administrator removes", { exact: false })).toBeVisible();
    }
  }
  await expect(scenario).toHaveCount(0);
  const saved = await page.evaluate(async () => {
    const request = indexedDB.open("SecPlusQuestDB");
    const database = await new Promise<IDBDatabase>(resolve => { request.onsuccess = () => resolve(request.result); });
    const read = database.transaction("quizSessions").objectStore("quizSessions").getAll();
    const sessions = await new Promise<Array<{ answerRecords: { confidence?: string }[] }>>(resolve => { read.onsuccess = () => resolve(read.result); });
    database.close();
    return sessions[sessions.length - 1].answerRecords;
  });
  expect(saved).toHaveLength(5);
  expect(saved.every(answer => answer.confidence === "high")).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/practice");
  await expect(page.getByRole("link", { name: /Azure Case Studies/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ports & Protocols/ })).toHaveCount(0);
});

test("mobile search is keyboard-contained and restores focus; privacy and unknown cases are clear", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/case-studies");
  const open = page.getByRole("button", { name: "Open command palette" });
  await open.click();
  const input = page.getByRole("combobox", { name: "Search commands" });
  await expect(input).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await page.goto("/privacy");
  await page.getByRole("button", { name: "Turn analytics off" }).click();
  await expect(page.getByRole("status")).toContainText("turned off");
  await page.goto("/quiz?caseStudy=missing-case");
  await expect(page.getByText("Question not found", { exact: false })).toBeVisible();
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("link", { name: "Find practice" })).toBeVisible();
});
