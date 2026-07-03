import { describe, it, expect } from "vitest";
import { classifyMiss } from "@/lib/error-notebook";

describe("classifyMiss", () => {
  it("flags any high-confidence miss as overconfident, regardless of speed", () => {
    expect(classifyMiss("high", 30_000)).toBe("overconfident");
    expect(classifyMiss("high", 2_000)).toBe("overconfident");
    expect(classifyMiss("high", null)).toBe("overconfident");
  });

  it("flags a fast non-high-confidence miss as careless", () => {
    expect(classifyMiss("medium", 5_000)).toBe("careless");
    expect(classifyMiss("low", 11_999)).toBe("careless");
    expect(classifyMiss(null, 0)).toBe("careless");
  });

  it("flags a slow / unmarked miss as struggling", () => {
    expect(classifyMiss("low", 40_000)).toBe("struggling");
    expect(classifyMiss("medium", 12_000)).toBe("struggling"); // boundary: not < 12000
    expect(classifyMiss(null, null)).toBe("struggling");
    expect(classifyMiss(null, 20_000)).toBe("struggling");
  });
});
