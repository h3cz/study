import { db } from "@/lib/db";
import type { Bookmark } from "@/lib/db";

export type { Bookmark };

export async function isBookmarked(questionId: string): Promise<boolean> {
  const existing = await db.bookmarks.where("questionId").equals(questionId).first();
  return !!existing;
}

export async function toggleBookmark(questionId: string, certId: string): Promise<boolean> {
  const existing = await db.bookmarks.where("questionId").equals(questionId).first();
  if (existing) {
    await db.bookmarks.delete(existing.id!);
    return false;
  } else {
    await db.bookmarks.add({
      questionId,
      certId,
      bookmarkedAt: new Date().toISOString(),
    });
    return true;
  }
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const all = await db.bookmarks.toArray();
  return all.sort((a, b) => b.bookmarkedAt.localeCompare(a.bookmarkedAt));
}

export async function getBookmarkCount(): Promise<number> {
  return db.bookmarks.count();
}
