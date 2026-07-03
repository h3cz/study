import { describe, it, expect } from "vitest";
import {
  CERTS,
  DEFAULT_CERT_ID,
  getCert,
  liveCerts,
  getActiveCertId,
} from "@/lib/certs";

describe("getCert", () => {
  it("returns the requested cert by id", () => {
    const cert = getCert("secplus-sy0-701");
    expect(cert.id).toBe("secplus-sy0-701");
    expect(cert.version).toBe("SY0-701");
    expect(cert.passingScore).toBe(750);
  });

  it("falls back to the default cert for an unknown id", () => {
    expect(getCert("does-not-exist").id).toBe(DEFAULT_CERT_ID);
    expect(getCert("").id).toBe(DEFAULT_CERT_ID);
  });

  it("default cert id is Security+", () => {
    expect(DEFAULT_CERT_ID).toBe("secplus-sy0-701");
  });
});

describe("liveCerts", () => {
  it("returns Security+, Network+, A+ Core 1, and A+ Core 2", () => {
    const live = liveCerts();
    const ids = live.map((c) => c.id);
    expect(ids).toContain("secplus-sy0-701");
    expect(ids).toContain("networkplus-n10-009");
    expect(ids).toContain("aplus-220-1101");
    expect(ids).toContain("aplus-220-1102");
    expect(live).toHaveLength(4);
  });

  it("both A+ exams are present in the registry and live", () => {
    const ids = CERTS.map((c) => c.id);
    expect(ids).toContain("aplus-220-1101");
    expect(ids).toContain("aplus-220-1102");
    expect(getCert("aplus-220-1101").status).toBe("live");
    expect(getCert("aplus-220-1102").status).toBe("live");
  });
});

describe("getActiveCertId", () => {
  it("defaults to DEFAULT_CERT_ID when state is missing or has no activeCertId", () => {
    expect(getActiveCertId()).toBe(DEFAULT_CERT_ID);
    expect(getActiveCertId({})).toBe(DEFAULT_CERT_ID);
    expect(getActiveCertId({ activeCertId: undefined })).toBe(DEFAULT_CERT_ID);
  });

  it("returns the stored activeCertId when present", () => {
    expect(getActiveCertId({ activeCertId: "networkplus-n10-009" })).toBe(
      "networkplus-n10-009"
    );
  });
});

describe("Security+ taxonomy (SY0-701 regression guard)", () => {
  const secplus = getCert("secplus-sy0-701");

  it("has the exact 5 SY0-701 domain weights in order", () => {
    const weights = secplus.domains.map((d) => d.weight);
    expect(weights).toEqual([0.12, 0.22, 0.18, 0.28, 0.2]);
  });

  it("domain weights sum to 1.0", () => {
    const sum = secplus.domains.reduce((acc, d) => acc + d.weight, 0);
    // float-safe equality
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("has 5 domains and the exact SY0-701 objective counts per domain", () => {
    expect(secplus.domains).toHaveLength(5);
    // Verbatim from content/seed.ts: D1=4, D2=5, D3=4, D4=6, D5=5 → 24 total.
    expect(secplus.domains.map((d) => d.objectives.length)).toEqual([4, 5, 4, 6, 5]);
    const objectiveCount = secplus.domains.reduce(
      (acc, d) => acc + d.objectives.length,
      0
    );
    expect(objectiveCount).toBe(24);
  });

  it("domain codes map to numbers 1..5 and names are unchanged", () => {
    expect(secplus.domains.map((d) => d.code)).toEqual(["1", "2", "3", "4", "5"]);
    expect(secplus.domains.map((d) => d.name)).toEqual([
      "General Security Concepts",
      "Threats, Vulnerabilities & Mitigations",
      "Security Architecture",
      "Security Operations",
      "Security Program Management & Oversight",
    ]);
  });
});

describe("Network+ taxonomy (N10-009)", () => {
  const netplus = getCert("networkplus-n10-009");

  it("is live and selectable", () => {
    expect(netplus.status).toBe("live");
  });

  it("has 5 domains with codes 1..5", () => {
    expect(netplus.domains).toHaveLength(5);
    expect(netplus.domains.map((d) => d.code)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("has the exact N10-009 domain weights in order", () => {
    const weights = netplus.domains.map((d) => d.weight);
    expect(weights).toEqual([0.23, 0.2, 0.19, 0.14, 0.24]);
  });

  it("domain weights sum to 1.0", () => {
    const sum = netplus.domains.reduce((acc, d) => acc + d.weight, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe("A+ Core 1 taxonomy (220-1101)", () => {
  const core1 = getCert("aplus-220-1101");

  it("is live and selectable", () => {
    expect(core1.status).toBe("live");
  });

  it("has 5 domains with codes 1..5", () => {
    expect(core1.domains).toHaveLength(5);
    expect(core1.domains.map((d) => d.code)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("has the exact 220-1101 domain weights in order", () => {
    const weights = core1.domains.map((d) => d.weight);
    expect(weights).toEqual([0.13, 0.23, 0.25, 0.11, 0.28]);
  });

  it("domain weights sum to 1.0", () => {
    const sum = core1.domains.reduce((acc, d) => acc + d.weight, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe("A+ Core 2 taxonomy (220-1102)", () => {
  const core2 = getCert("aplus-220-1102");

  it("is live and selectable", () => {
    expect(core2.status).toBe("live");
  });

  it("has 4 domains with codes 1..4", () => {
    expect(core2.domains).toHaveLength(4);
    expect(core2.domains.map((d) => d.code)).toEqual(["1", "2", "3", "4"]);
  });

  it("has the exact 220-1102 domain weights in order", () => {
    const weights = core2.domains.map((d) => d.weight);
    expect(weights).toEqual([0.28, 0.28, 0.22, 0.22]);
  });

  it("domain weights sum to 1.0", () => {
    const sum = core2.domains.reduce((acc, d) => acc + d.weight, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});
