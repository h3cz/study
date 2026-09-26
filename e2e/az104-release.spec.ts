import { expect, test } from "@playwright/test";

test("AZ-104 announcement, selection and all content modes work on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("tourSeenVersion", "1");
    localStorage.setItem("hecz.analytics.consent.v1", "denied");
  });
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Set date →", exact: true }).click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Skip, take me to the dashboard" }).click();
  const announcement = page.getByRole("link", { name: /New: Azure Administrator/ });
  await expect(announcement).toBeVisible();
  await page.screenshot({ path: "test-results/az104-announcement-mobile.png" });
  await announcement.click();
  await expect(page.locator("#az-104")).toContainText("160 original questions");
  await page.goto("/settings");
  await page.getByRole("menuitemradio", { name: /AZ-104/ }).click();
  await expect(page.locator(".hero-grid")).toBeVisible();
  const counts = await page.evaluate(async () => {
    const open = indexedDB.open("SecPlusQuestDB");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    try {
      return await Promise.all(["questions", "flashcards", "perfQuestions", "acronyms"].map(store => {
        const request = database.transaction(store).objectStore(store).index("certId").count("az-104");
        return new Promise<number>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }));
    } finally { database.close(); }
  });
  expect(counts).toEqual([160, 60, 8, 40]);
  // Exercise the real IndexedDB upgrade path with existing study progress.
  const preserved = await page.evaluate(async () => {
    const request = indexedDB.open("SecPlusQuestDB");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const result = await new Promise<{ id: string; due: string }>((resolve, reject) => {
      const tx = database.transaction(["userState", "flashcards", "questions", "perfQuestions", "acronyms"], "readwrite");
      const state = tx.objectStore("userState").get(1);
      state.onsuccess = () => tx.objectStore("userState").put({ ...state.result, xp: 123, contentVersion: state.result.contentVersion - 1 });
      const card = tx.objectStore("flashcards").index("certId").get("secplus-sy0-701");
      let saved: { id: string; due: string };
      card.onsuccess = () => {
        saved = { id: card.result.id, due: "2026-10-10T12:00:00.000Z" };
        tx.objectStore("flashcards").put({ ...card.result, fsrsReps: 7, fsrsDue: saved.due });
      };
      for (const name of ["questions", "flashcards", "perfQuestions", "acronyms"]) {
        const cursor = tx.objectStore(name).index("certId").openCursor("az-104");
        cursor.onsuccess = () => { if (cursor.result) { cursor.result.delete(); cursor.result.continue(); } };
      }
      tx.oncomplete = () => resolve(saved);
      tx.onerror = () => reject(tx.error);
    });
    database.close();
    return result;
  });
  await page.reload();
  await expect(page.locator(".hero-grid")).toBeVisible();
  const restored = await page.evaluate(async ({ id }) => {
    const request = indexedDB.open("SecPlusQuestDB");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const read = <T,>(req: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const tx = database.transaction(["userState", "flashcards", "questions", "perfQuestions", "acronyms"]);
    const [state, card, ...counts] = await Promise.all([
      read(tx.objectStore("userState").get(1)),
      read(tx.objectStore("flashcards").get(id)),
      ...["questions", "flashcards", "perfQuestions", "acronyms"].map(name => read(tx.objectStore(name).index("certId").count("az-104"))),
    ]);
    database.close();
    return { xp: state.xp, reps: card.fsrsReps, due: card.fsrsDue, counts };
  }, preserved);
  expect(restored).toEqual({ xp: 123, reps: 7, due: preserved.due, counts: [160, 60, 8, 40] });
  await page.getByRole("button", { name: "Dismiss announcement", exact: true }).click();
  await page.reload();
  await expect(announcement).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/az104-dashboard-mobile.png", fullPage: true });
});
