import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createMockDrivers } from "./index.ts";

describe("mock devices", () => {
  it("blocks scan-to-shoot when barcode ≠ sku", async () => {
    const dir = await mkdtemp(join(tmpdir(), "tintrail-dev-"));
    const drivers = createMockDrivers(dir);
    const blocked = await drivers.validateCan("HD-SKU-GAL", "WRONG");
    expect(blocked).toEqual({
      ok: false,
      reason: "Barcode does not match SKU",
    });
    const ok = await drivers.validateCan("HD-SKU-GAL", "HD-SKU-GAL");
    expect(ok).toEqual({ ok: true });
  });

  it("acks the same vector and prints a label that contains the hash", async () => {
    const dir = await mkdtemp(join(tmpdir(), "tintrail-dev-"));
    const drivers = createMockDrivers(dir);
    const vector = { W1: 48, Y3: 12 };
    const { ack } = await drivers.dispense(vector);
    expect(ack).toEqual(vector);

    const hash = "abc123hash";
    const printed = await drivers.print({
      hash,
      recipe: ["W1 48 shots"],
      sku: "HD-SKU-GAL",
    });
    const text = await readFile(printed.path, "utf8");
    expect(text).toContain(`hash=${hash}`);
    expect(text).toContain("sku=HD-SKU-GAL");
  });
});
