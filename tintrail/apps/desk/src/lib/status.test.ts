import { describe, expect, it } from "vitest";
import type { Ticket } from "../api";
import { lineNextLabel, mixPath, nextMixLabel, plainStatus } from "./status.ts";

describe("plain status", () => {
  it("uses Waiting / Mixing / Ready for the rail", () => {
    expect(plainStatus("on_rail")).toBe("Waiting");
    expect(plainStatus("validating")).toBe("Waiting");
    expect(plainStatus("dispensing")).toBe("Mixing");
    expect(plainStatus("labeled")).toBe("Ready");
    expect(plainStatus("shaken")).toBe("Ready");
    expect(plainStatus("done")).toBe("Done");
  });
});

describe("next mix label", () => {
  it("names the single next action", () => {
    expect(nextMixLabel("on_rail", false)).toBe("Scan");
    expect(nextMixLabel("validating", false)).toBe("Mix");
    expect(nextMixLabel("dispensing", false)).toBe("Mix");
    expect(nextMixLabel("dispensing", true)).toBe("Print");
    expect(nextMixLabel("labeled", true)).toBe("Done");
    expect(nextMixLabel("done", true)).toBe("Done");
    expect(nextMixLabel("on_rail", false, 2, 0)).toBe("Scan can 1 of 2");
    expect(nextMixLabel("on_rail", false, 2, 1)).toBe("Scan can 2 of 2");
  });
});

describe("line next label", () => {
  it("tells the associate the next tap, not the machine state", () => {
    expect(lineNextLabel({ state: "on_rail", origin: "walk-up", ackHash: null, qty: 1 } as Ticket)).toBe(
      "Scan",
    );
    expect(
      lineNextLabel({ state: "labeled", origin: "online", ackHash: "x", qty: 1 } as Ticket),
    ).toBe("Stage it");
    expect(
      lineNextLabel({ state: "labeled", origin: "walk-up", ackHash: "x", qty: 1 } as Ticket),
    ).toBe("Done");
  });
});

describe("mix path", () => {
  it("lights only the next technical tap", () => {
    expect(mixPath("on_rail", false).map((step) => step.phase)).toEqual(["now", "next", "next", "next"]);
    expect(mixPath("validating", false).map((step) => `${step.id}:${step.phase}`)).toEqual([
      "scan:done",
      "mix:now",
      "print:next",
      "done:next",
    ]);
    expect(mixPath("dispensing", true).map((step) => step.phase)).toEqual(["done", "done", "now", "next"]);
    expect(mixPath("labeled", true).map((step) => step.phase)).toEqual(["done", "done", "done", "now"]);
    expect(mixPath("done", true).every((step) => step.phase === "done")).toBe(true);
    expect(mixPath(null, false).every((step) => step.phase === "next")).toBe(true);
  });
});
