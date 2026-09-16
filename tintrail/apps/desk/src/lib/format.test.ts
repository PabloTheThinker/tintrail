import { describe, expect, it } from "vitest";
import { formatAge, formatDue, formatPrice, shortHash } from "./format.ts";

describe("desk format", () => {
  it("formats rail age as m:ss and hours when late", () => {
    expect(formatAge(1_000, 41_000)).toBe("0:40");
    expect(formatAge(1_000, 121_000)).toBe("2:00");
    expect(formatAge(1_000, 1_000 + 90 * 60_000)).toBe("1h 30m");
  });

  it("formats price and inbound due", () => {
    expect(formatPrice(4898)).toBe("$48.98");
    expect(formatPrice(null)).toBeNull();
    expect(formatDue(1_000 + 20 * 60_000, 1_000)).toBe("due 20m");
    expect(formatDue(1_000 - 60_000, 1_000)).toBe("late");
  });

  it("shortens a formula hash", () => {
    expect(shortHash("abcdef0123456789")).toBe("abcdef01");
    expect(shortHash(null)).toBe("—");
  });
});
