/**
 * remediation.test.ts
 *
 * Tests for getRemediation() — pure logic, no IndexedDB.
 * We inject the objective→video index directly via _setObjectiveVideoIndexForTest.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  getRemediation,
  _setObjectiveVideoIndexForTest,
  applyMesserMapFallback,
} from "../lib/remediation";
import { messerVideosByCert } from "../content/messer-videos-generated";
import type { Question } from "../lib/db";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "q1",
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:1",
    objectiveId: "secplus-sy0-701:obj:1.4",
    stem: "What is hashing?",
    choices: [
      { key: "A", text: "A", correct: true },
      { key: "B", text: "B", correct: false },
      { key: "C", text: "C", correct: false },
      { key: "D", text: "D", correct: false },
    ],
    explanation: "Hashing produces a fixed-length digest.",
    difficulty: 2,
    ...overrides,
  };
}

type CachedVideo = { videoId: string; videoTitle: string; videoUrl: string; timestamp?: number };

function makeIndex(entries: [string, CachedVideo][]): Map<string, CachedVideo> {
  return new Map(entries);
}

const CERT_ID = "secplus-sy0-701";
const FALLBACK_CERT =
  Object.entries(messerVideosByCert).find(([, videos]) => Object.keys(videos).length > 0) ?? null;

// Reset the module-level cache before each test
beforeEach(() => {
  _setObjectiveVideoIndexForTest(CERT_ID, new Map());
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getRemediation", () => {
  it("returns video remediation when question has videoSource", async () => {
    const q = makeQuestion({
      videoSource: {
        videoId: "vid-abc",
        videoTitle: "Hashing and Digital Signatures",
        videoUrl: "https://youtube.com/watch?v=vid-abc",
        channel: "Professor Messer",
        objectiveCode: "1.4",
      },
    });

    const result = await getRemediation(q);

    expect(result).not.toBeNull();
    expect(result!.kind).toBe("video");
    expect(result!.label).toBe("Watch: Hashing and Digital Signatures");
    expect(result!.href).toBe("https://youtube.com/watch?v=vid-abc");
    expect(result!.videoId).toBe("vid-abc");
  });

  it("includes timestamp in href when videoSource has timestamp", async () => {
    const q = makeQuestion({
      videoSource: {
        videoId: "vid-ts",
        videoTitle: "PKI",
        videoUrl: "https://youtube.com/watch?v=vid-ts",
        channel: "Professor Messer",
        timestamp: 90,
      },
    });

    const result = await getRemediation(q);
    expect(result!.href).toBe("https://youtube.com/watch?v=vid-ts&t=90");
  });

  it("returns sibling video when question lacks videoSource but objective has one", async () => {
    const q = makeQuestion({ videoSource: undefined });

    // Inject index with a video for the same objective
    _setObjectiveVideoIndexForTest(
      CERT_ID,
      makeIndex([
        [
          "secplus-sy0-701:obj:1.4",
          {
            videoId: "vid-sibling",
            videoTitle: "Hashing and Digital Signatures",
            videoUrl: "https://youtube.com/watch?v=vid-sibling",
          },
        ],
      ])
    );

    const result = await getRemediation(q);

    expect(result).not.toBeNull();
    expect(result!.kind).toBe("video");
    expect(result!.label).toBe("Watch the video for objective 1.4");
    expect(result!.videoId).toBe("vid-sibling");
  });

  it("returns objective-drill remediation when no video exists anywhere on the objective", async () => {
    const q = makeQuestion({ videoSource: undefined });

    // Empty index — no video for this objective
    _setObjectiveVideoIndexForTest(CERT_ID, new Map());

    const result = await getRemediation(q);

    expect(result).not.toBeNull();
    expect(result!.kind).toBe("objective");
    expect(result!.label).toBe("Drill more on objective 1.4");
    expect(result!.href).toBe("/quiz?objective=1.4");
  });

  it("uses a video map when one is present and a study drill when it is not", async () => {
    if (!FALLBACK_CERT) {
      const certId = "starter-cert";
      const index = new Map<string, CachedVideo>();
      applyMesserMapFallback(certId, index);
      _setObjectiveVideoIndexForTest(certId, index);
      const result = await getRemediation(
        makeQuestion({
          certId,
          domainId: `${certId}:domain:1`,
          objectiveId: `${certId}:obj:1.1`,
          videoSource: undefined,
        })
      );

      expect(result).toMatchObject({
        kind: "objective",
        label: "Drill more on objective 1.1",
        href: "/quiz?objective=1.1",
      });
      return;
    }

    const [certId, videos] = FALLBACK_CERT;
    const [objectiveCode, mapped] = Object.entries(videos)[0];
    const index = new Map<string, CachedVideo>();
    applyMesserMapFallback(certId, index);
    _setObjectiveVideoIndexForTest(certId, index);

    const result = await getRemediation(
      makeQuestion({
        certId,
        domainId: `${certId}:domain:${objectiveCode.split(".")[0]}`,
        objectiveId: `${certId}:obj:${objectiveCode}`,
        videoSource: undefined,
      })
    );

    expect(result).toMatchObject({
      kind: "video",
      label: `Watch the video for objective ${objectiveCode}`,
      videoId: mapped.videoId,
      href: mapped.url,
    });
  });

  it("map fallback never overwrites an existing video entry", () => {
    const certId = FALLBACK_CERT?.[0] ?? "starter-cert";
    const objectiveCode = FALLBACK_CERT ? Object.keys(FALLBACK_CERT[1])[0] : "1.1";
    const index = makeIndex([
      [
        `${certId}:obj:${objectiveCode}`,
        {
          videoId: "question-sourced",
          videoTitle: "From a question videoSource",
          videoUrl: "https://youtube.com/watch?v=question-sourced",
        },
      ],
    ]);

    applyMesserMapFallback(certId, index);

    expect(index.get(`${certId}:obj:${objectiveCode}`)!.videoId).toBe("question-sourced");
    for (const [otherCode, mapped] of Object.entries(FALLBACK_CERT?.[1] ?? {})) {
      if (otherCode !== objectiveCode) {
        expect(index.get(`${certId}:obj:${otherCode}`)?.videoId).toBe(mapped.videoId);
      }
    }
  });

  it("index is reused on second call without re-querying (cache hit)", async () => {
    // Set a specific index — if it rebuilds from DB it would get an empty one
    _setObjectiveVideoIndexForTest(
      CERT_ID,
      makeIndex([
        [
          "secplus-sy0-701:obj:1.4",
          {
            videoId: "vid-cached",
            videoTitle: "Cached Video",
            videoUrl: "https://youtube.com/watch?v=vid-cached",
          },
        ],
      ])
    );

    const q = makeQuestion({ videoSource: undefined });

    const r1 = await getRemediation(q);
    const r2 = await getRemediation(q);

    // Both calls must return the same cached result
    expect(r1!.videoId).toBe("vid-cached");
    expect(r2!.videoId).toBe("vid-cached");
  });
});
