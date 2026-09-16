import { describe, expect, it } from "vitest";
import type { InboundOrder } from "@tintrail/shared";
import { createSyntheticInbound } from "./inbound.ts";

function row(id: string, orderNo: string): InboundOrder {
  return {
    id,
    orderNo,
    colorId: "behr-swiss-coffee",
    productLine: "Marquee",
    sheen: "Satin",
    size: "Gal",
    qty: 1,
    token: orderNo,
    dueAt: Date.now() + 3_600_000,
    colorName: "Swiss Coffee",
    brand: "Behr",
  };
}

describe("synthetic inbound adapter", () => {
  it("lists, takes one, takes by id, and reseeds only when empty", () => {
    const inbound = createSyntheticInbound(() => [row("a", "BOPIS-1"), row("b", "BOPIS-2")]);
    expect(inbound.kind).toBe("synthetic");
    expect(inbound.list()).toHaveLength(2);
    expect(inbound.take()?.orderNo).toBe("BOPIS-1");
    expect(inbound.take("b")?.orderNo).toBe("BOPIS-2");
    expect(inbound.take()).toBeNull();
    inbound.seed();
    expect(inbound.list()).toHaveLength(2);
    expect(inbound.takeAll()).toHaveLength(2);
    expect(inbound.list()).toHaveLength(0);
  });
});
