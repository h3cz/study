import type { Question } from "@/lib/db";
import { db } from "@/lib/db";
import { messerVideosByCert } from "@/content/messer-videos-generated";

export interface Remediation {
  kind: "video" | "objective";
  label: string;
  href: string;
  videoId?: string;
}

// In-memory objective → VideoSource index, built once from all loaded questions.
// Maps objectiveId → { videoId, videoTitle, videoUrl }
interface CachedVideo {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  timestamp?: number;
}

let _objectiveVideoIndex: Map<string, CachedVideo> | null = null;
let _indexBuiltForCertId: string | null = null;

async function getObjectiveVideoIndex(certId: string): Promise<Map<string, CachedVideo>> {
  if (_objectiveVideoIndex && _indexBuiltForCertId === certId) {
    return _objectiveVideoIndex;
  }
  const allQuestions = await db.questions.where("certId").equals(certId).toArray();
  const index = new Map<string, CachedVideo>();
  for (const q of allQuestions) {
    if (q.videoSource && !index.has(q.objectiveId)) {
      index.set(q.objectiveId, {
        videoId: q.videoSource.videoId,
        videoTitle: q.videoSource.videoTitle,
        videoUrl: q.videoSource.videoUrl,
        timestamp: q.videoSource.timestamp,
      });
    }
  }
  applyMesserMapFallback(certId, index);
  _objectiveVideoIndex = index;
  _indexBuiltForCertId = certId;
  return index;
}

/**
 * For any objective with no video from question videoSources, fall back to the
 * Professor Messer objective→video map (e.g. Network+/A+, whose questions carry no
 * videoSource). Mutates `index` in place; existing entries are never overwritten, so
 * Security+ — already fully covered by question videoSources — is unaffected.
 * Exported so it can be unit-tested without IndexedDB.
 */
export function applyMesserMapFallback(
  certId: string,
  index: Map<string, CachedVideo>
): void {
  const certVideos = messerVideosByCert[certId];
  if (!certVideos) return;
  for (const [code, video] of Object.entries(certVideos)) {
    const objectiveId = `${certId}:obj:${code}`;
    if (!index.has(objectiveId)) {
      index.set(objectiveId, {
        videoId: video.videoId,
        videoTitle: video.title,
        videoUrl: video.url,
      });
    }
  }
}

/** Exposed for testing — allows injecting a pre-built index without hitting IndexedDB. */
export function _setObjectiveVideoIndexForTest(
  certId: string,
  index: Map<string, CachedVideo>
): void {
  _objectiveVideoIndex = index;
  _indexBuiltForCertId = certId;
}

/** Given a question, return the best remediation target, or null if nothing useful. */
export async function getRemediation(question: Question): Promise<Remediation | null> {
  // Step 1: question has its own videoSource
  if (question.videoSource) {
    const { videoTitle, videoUrl, videoId, timestamp } = question.videoSource;
    const href = timestamp ? `${videoUrl}&t=${timestamp}` : videoUrl;
    return {
      kind: "video",
      label: `Watch: ${videoTitle}`,
      href,
      videoId,
    };
  }

  // Step 2: another question on same objectiveId has a video
  const index = await getObjectiveVideoIndex(question.certId);
  const siblingVideo = index.get(question.objectiveId);
  if (siblingVideo) {
    const objCode = question.objectiveId.split(":obj:")[1] ?? question.objectiveId;
    return {
      kind: "video",
      label: `Watch the video for objective ${objCode}`,
      href: siblingVideo.timestamp
        ? `${siblingVideo.videoUrl}&t=${siblingVideo.timestamp}`
        : siblingVideo.videoUrl,
      videoId: siblingVideo.videoId,
    };
  }

  // Step 3: objective-drill fallback
  const objCode = question.objectiveId.split(":obj:")[1];
  if (!objCode) return null;

  return {
    kind: "objective",
    label: `Drill more on objective ${objCode}`,
    href: `/quiz?objective=${encodeURIComponent(objCode)}`,
  };
}
