import { describe, expect, it } from "vitest";
import type { Ticket } from "../api";
import {
  ageTone,
  isOpenLineTicket,
  isStaleReady,
  matchesLineFilter,
  sortLineTickets,
  sourceLabel,
} from "./source.ts";

const base = {
  origin: "walk-up",
} as Ticket;

describe("source chips", () => {
  it("names walk-in and online without looking like a person", () => {
    expect(sourceLabel("walk-up")).toBe("Walk-in");
    expect(sourceLabel("online")).toBe("Online");
    expect(sourceLabel("pro-job")).toBe("Pro");
  });
});

describe("line age", () => {
  it("warns walk-ins after 10 minutes and online after 20", () => {
    const now = 1_000_000;
    expect(ageTone(now - 9 * 60_000, now, "walk-up")).toBe("ok");
    expect(ageTone(now - 11 * 60_000, now, "walk-up")).toBe("warn");
    expect(ageTone(now - 19 * 60_000, now, "online")).toBe("ok");
    expect(ageTone(now - 21 * 60_000, now, "online")).toBe("warn");
    expect(ageTone(now - 91 * 60_000, now, "online")).toBe("late");
  });
});

describe("line filter", () => {
  it("keeps online and walk-in on separate chips", () => {
    const walk = { ...base, origin: "walk-up" } as Ticket;
    const web = { ...base, origin: "online" } as Ticket;
    const pro = { ...base, origin: "pro-job" } as Ticket;
    expect(matchesLineFilter(walk, "walk-in")).toBe(true);
    expect(matchesLineFilter(pro, "walk-in")).toBe(true);
    expect(matchesLineFilter(web, "walk-in")).toBe(false);
    expect(matchesLineFilter(web, "online")).toBe(true);
    expect(matchesLineFilter(pro, "online")).toBe(false);
    expect(matchesLineFilter(walk, "all")).toBe(true);
  });
});

describe("line sort", () => {
  it("keeps oldest first unless online is late", () => {
    const now = 10_000_000;
    const freshWalk = { origin: "walk-up", createdAt: now - 60_000 } as Ticket;
    const freshOnline = { origin: "online", createdAt: now - 30_000 } as Ticket;
    const lateOnline = { origin: "online", createdAt: now - 91 * 60_000 } as Ticket;
    expect(sortLineTickets([freshOnline, freshWalk], now).map((row) => row.origin)).toEqual([
      "walk-up",
      "online",
    ]);
    expect(sortLineTickets([freshWalk, lateOnline], now)[0]?.origin).toBe("online");
  });
});

describe("stale leftover", () => {
  it("hides leftover cans from the Line, including unfinished ones", () => {
    const now = 10_000_000;
    const leftoverReady = {
      ...base,
      state: "labeled",
      createdAt: now - 31 * 60 * 60 * 1000,
    } as Ticket;
    const leftoverWaiting = {
      ...base,
      state: "on_rail",
      createdAt: now - 12 * 60 * 60 * 1000,
    } as Ticket;
    const fresh = { ...base, state: "on_rail", createdAt: now - 60_000 } as Ticket;
    const ready = { ...base, state: "labeled", createdAt: now - 10 * 60_000 } as Ticket;
    expect(isStaleReady(leftoverReady, now)).toBe(true);
    expect(isOpenLineTicket(leftoverReady, now)).toBe(false);
    expect(isOpenLineTicket(leftoverWaiting, now)).toBe(false);
    expect(isOpenLineTicket(fresh, now)).toBe(true);
    expect(isOpenLineTicket(ready, now)).toBe(true);
  });
});
