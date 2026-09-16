import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Ticket } from "@tintrail/shared";
import { openRailStore } from "./index.ts";

function sampleTicket(id: string): Ticket {
  return {
    id,
    colorId: "behr-swiss-coffee",
    brand: "Behr",
    colorName: "Swiss Coffee",
    code: "12-B",
    kind: "OEM",
    productLine: "Marquee",
    sheen: "Satin",
    size: "Gal",
    qty: 1,
    sku: "HD-BEHR-12B-MAR-SAT-GAL",
    onHand: 14,
    pack: 2,
    token: "Walk-up",
    station: "D1",
    state: "on_rail",
    origin: "walk-up",
    formula: {
      vector: { W1: 36 },
      displayRecipe: ["W1 36 shots"],
      swatch: "#EFE6D4",
      hash: "abc",
    },
    ackHash: null,
    labelText: null,
    labelPath: null,
    createdAt: Date.now(),
    stageBin: null,
    scannedQty: 0,
    priceCents: null,
  };
}

describe("rail store", () => {
  it("persists tickets and the last-good catalog snapshot", async () => {
    const dir = await mkdtemp(join(tmpdir(), "tintrail-rail-"));
    const path = join(dir, "rail.db");
    const store = openRailStore(path);
    store.putTicket(sampleTicket("t1"));
    store.saveCatalogSnapshot({
      pack: "hd",
      asOf: "2026-09-14T10:14:00Z",
      store: "0505",
      station: "D1",
      lines: ["Marquee"],
      sheens: ["Satin"],
      sizes: ["Gal"],
      colors: [],
    });
    expect(store.listTickets()).toHaveLength(1);
    store.close();

    const reopened = openRailStore(path);
    expect(reopened.getTicket("t1")?.colorName).toBe("Swiss Coffee");
    expect(reopened.getCatalogSnapshot()?.asOf).toBe("2026-09-14T10:14:00Z");
    reopened.close();
  });
});
