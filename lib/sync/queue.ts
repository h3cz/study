import Dexie, { type Table } from "dexie";
import type { SyncQueueItem, SyncOp, RemoteUserState, RemoteCertScore, RemoteQuizSession, RemoteFlashcardReview, RemoteMockExamSession, RemoteDrillSession, RemoteQuestionReport, RemoteQuestionReview, RemoteBookmark } from "./types";

/** Lightweight Dexie database just for the sync queue. */
class SyncQueueDb extends Dexie {
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super("SecPlusSyncDB");
    this.version(1).stores({
      syncQueue: "++id, op, createdAt",
    });
  }
}

export const syncDb = new SyncQueueDb();

/** Push an item onto the sync queue. */
export async function enqueue(
  op: SyncOp,
  payload: RemoteUserState | RemoteCertScore | RemoteQuizSession | RemoteFlashcardReview | RemoteMockExamSession | RemoteDrillSession | RemoteQuestionReport | RemoteQuestionReview | RemoteBookmark | { question_id: string }
): Promise<void> {
  await syncDb.syncQueue.add({
    op,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  });
}

/** Get all pending items ordered by creation time. */
export async function getPendingItems(): Promise<SyncQueueItem[]> {
  return syncDb.syncQueue.orderBy("createdAt").toArray();
}

/** Delete a successfully synced item. */
export async function deleteItem(id: number): Promise<void> {
  await syncDb.syncQueue.delete(id);
}

/** Increment retries counter for a failed item. */
export async function incrementRetries(id: number, retries: number): Promise<void> {
  await syncDb.syncQueue.update(id, { retries: retries + 1 });
}
