import { describe, expect, it } from "vitest";
import { deviceStatusLabel } from "./devices.ts";

describe("device status label", () => {
  it("names the broken machine", () => {
    expect(
      deviceStatusLabel({ spectro: "ok", dispenser: "bad", printer: "ok" }, false),
    ).toBe("Mixer down");
    expect(
      deviceStatusLabel({ spectro: "ok", dispenser: "ok", printer: "ok" }, true),
    ).toBe("Offline — still works");
    expect(
      deviceStatusLabel({ spectro: "ok", dispenser: "ok", printer: "ok" }, false),
    ).toBe("Ready");
  });
});
