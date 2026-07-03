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

  it("resolves a new-cert objective to a Messer video via the map fallback", async () => {
    // Network+ questions carry no videoSource, so the only path to a video is the
    // messerVideosByCert map applied by applyMesserMapFallback.
    const NET_CERT = "networkplus-n10-009";
    const mapped = messerVideosByCert[NET_CERT]["1.1"];
    expect(mapped).toBeDefined();

    // Build the index exactly as getObjectiveVideoIndex does: empty (no question
    // videoSources) + map fallback, then inject via the test seam.
    const index = new Map<
      string,
      { videoId: string; videoTitle: string; videoUrl: string; timestamp?: number }
    >();
    applyMesserMapFallback(NET_CERT, index);
    _setObjectiveVideoIndexForTest(NET_CERT, index);

    const q = makeQuestion({
      certId: NET_CERT,
      domainId: `${NET_CERT}:domain:1`,
      objectiveId: `${NET_CERT}:obj:1.1`,
      videoSource: undefined,
    });

    const result = await getRemediation(q);

    expect(result).not.toBeNull();
    expect(result!.kind).toBe("video");
    expect(result!.label).toBe("Watch the video for objective 1.1");
    expect(result!.videoId).toBe(mapped.videoId);
    expect(result!.href).toBe(mapped.url);
  });

  it("map fallback never overwrites an existing (question-sourced) video", () => {
    const NET_CERT = "networkplus-n10-009";
    const index = makeIndex([
      [
        `${NET_CERT}:obj:1.1`,
        {
          videoId: "question-sourced",
          videoTitle: "From a question videoSource",
          videoUrl: "https://youtube.com/watch?v=question-sourced",
        },
      ],
    ]);

    applyMesserMapFallback(NET_CERT, index);

    // Existing entry preserved; a different objective gets filled from the map.
    expect(index.get(`${NET_CERT}:obj:1.1`)!.videoId).toBe("question-sourced");
    expect(index.get(`${NET_CERT}:obj:1.2`)!.videoId).toBe(
      messerVideosByCert[NET_CERT]["1.2"].videoId
    );
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
