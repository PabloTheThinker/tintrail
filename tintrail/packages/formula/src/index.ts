import { createHash } from "node:crypto";
import type { CanSize, MixVector, OverfillResult } from "@tintrail/shared";

export const SIZE_SCALE: Record<CanSize, number> = {
  "8oz": 0.0625,
  Qt: 0.25,
  Gal: 1,
  "5gal": 5,
};

/** Headspace in shots (1/48 oz). Synthetic; not OEM fill tables. */
const HEADSPACE_SHOTS: Record<CanSize, number> = {
  "8oz": 48,
  Qt: 96,
  Gal: 240,
  "5gal": 960,
};

export function displayToMultiplier(display: number): number {
  if (!Number.isFinite(display) || display < -100 || display > 100) {
    throw new Error("Display adjust out of range");
  }
  return (display + 100) / 100;
}

export function roundShots(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error("Colorant shots must be finite");
  }
  if (value < 0) {
    throw new Error("Negative colorant in mix arithmetic");
  }
  return Math.round(value);
}

export function assertUnsignedVector(vector: MixVector): void {
  for (const [colorantId, shots] of Object.entries(vector)) {
    if (!Number.isFinite(shots) || shots < 0) {
      throw new Error(`Negative colorant in mix arithmetic: ${colorantId}`);
    }
  }
}

export function scaleBy(vector: MixVector, factor: number): MixVector {
  if (!Number.isFinite(factor) || factor < 0) {
    throw new Error("Scale factor must be a non-negative number");
  }
  assertUnsignedVector(vector);
  const next: MixVector = {};
  for (const [colorantId, shots] of Object.entries(vector)) {
    next[colorantId] = roundShots(shots * factor);
  }
  return next;
}

/** Display −100…+100 never enters arithmetic except as unsigned multiplier. */
export function applyDisplayAdjust(vector: MixVector, display: number): MixVector {
  return scaleBy(vector, displayToMultiplier(display));
}

export function scaleRecipe(
  vector: MixVector,
  from: CanSize,
  to: CanSize,
): MixVector {
  const fromScale = SIZE_SCALE[from];
  const toScale = SIZE_SCALE[to];
  return scaleBy(vector, toScale / fromScale);
}

export function totalShots(vector: MixVector): number {
  assertUnsignedVector(vector);
  return Object.values(vector).reduce((sum, shots) => sum + shots, 0);
}

export function checkOverfill(
  size: CanSize,
  vector: MixVector,
): OverfillResult {
  const total = totalShots(vector);
  const headspace = HEADSPACE_SHOTS[size];
  if (total > headspace) {
    return { ok: false, code: "OVERFILL" };
  }
  return { ok: true };
}

export function canonicalVector(vector: MixVector): string {
  assertUnsignedVector(vector);
  return Object.keys(vector)
    .sort()
    .map((id) => `${id}:${vector[id]}`)
    .join("|");
}

export function hashMix(vector: MixVector, sku: string, size: CanSize): string {
  const input = `${canonicalVector(vector)}|${sku}|${size}`;
  return createHash("sha256").update(input).digest("hex");
}

export function formatRecipe(vector: MixVector): string[] {
  assertUnsignedVector(vector);
  return Object.keys(vector)
    .sort()
    .map((id) => `${id} ${vector[id]} shots`);
}

export function computeSizedFormula(
  gallonRecipe: MixVector,
  sku: string,
  size: CanSize,
  swatch: string,
  display = 0,
): { vector: MixVector; displayRecipe: string[]; swatch: string; hash: string } {
  const sized = scaleRecipe(gallonRecipe, "Gal", size);
  const vector = applyDisplayAdjust(sized, display);
  const overfill = checkOverfill(size, vector);
  if (!overfill.ok) {
    throw new Error("OVERFILL");
  }
  return {
    vector,
    displayRecipe: formatRecipe(vector),
    swatch,
    hash: hashMix(vector, sku, size),
  };
}

export function buildSku(
  brand: string,
  code: string,
  productLine: string,
  sheen: string,
  size: CanSize,
): string {
  const compact = (value: string) => value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return [
    "HD",
    compact(brand).slice(0, 4),
    compact(code),
    compact(productLine).slice(0, 3),
    compact(sheen).slice(0, 3),
    compact(size),
  ].join("-");
}
