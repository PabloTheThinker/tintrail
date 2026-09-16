import { describe, expect, it } from "vitest";
import {
  applyDisplayAdjust,
  checkOverfill,
  displayToMultiplier,
  hashMix,
  scaleRecipe,
} from "./index.ts";

const BASE = { W1: 48, Y3: 12, R2: 4 };

describe("unsigned display scale", () => {
  it("maps +50 to 1.5x and keeps every shot unsigned", () => {
    expect(displayToMultiplier(50)).toBe(1.5);
    const next = applyDisplayAdjust(BASE, 50);
    expect(next).toEqual({ W1: 72, Y3: 18, R2: 6 });
    expect(Object.values(next).every((shots) => shots >= 0)).toBe(true);
  });

  it("rejects a signed display outside −100…+100", () => {
    expect(() => displayToMultiplier(-101)).toThrow(/out of range/);
    expect(() => applyDisplayAdjust(BASE, 120)).toThrow(/out of range/);
  });
});

describe("sample → gallon", () => {
  it("scales an 8oz recipe to a gallon by 16x", () => {
    const sample = { W1: 3, Y3: 1 };
    expect(scaleRecipe(sample, "8oz", "Gal")).toEqual({ W1: 48, Y3: 16 });
    expect(scaleRecipe(BASE, "Gal", "8oz")).toEqual({ W1: 3, Y3: 1, R2: 0 });
  });
});

describe("overfill", () => {
  it("rejects a vector that exceeds gallon headspace", () => {
    const huge = { K: 10_000 };
    expect(checkOverfill("Gal", huge)).toEqual({ ok: false, code: "OVERFILL" });
    expect(checkOverfill("Gal", BASE)).toEqual({ ok: true });
  });
});

describe("invert-regression (TR-9–TR-11)", () => {
  it("treats display −50 as 0.5x add, never as subtract-from-label", () => {
    const next = applyDisplayAdjust(BASE, -50);
    expect(displayToMultiplier(-50)).toBe(0.5);
    expect(next).toEqual({ W1: 24, Y3: 6, R2: 2 });
    expect(Object.values(next).every((shots) => shots > 0)).toBe(true);
  });

  it("label hash equals the ack vector hash", () => {
    const sku = "HD-BEHR-12B-MAR-SAT-GAL";
    const formulaHash = hashMix(BASE, sku, "Gal");
    const ack = { ...BASE };
    expect(hashMix(ack, sku, "Gal")).toBe(formulaHash);
  });

  it("refuses negative colorant in mix arithmetic", () => {
    expect(() => applyDisplayAdjust({ W1: -4 }, 0)).toThrow(
      /Negative colorant/,
    );
  });
});
