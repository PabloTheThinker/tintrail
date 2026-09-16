import { describe, expect, it } from "vitest";
import type { Ticket } from "@tintrail/shared";
import type { SyncAdapter } from "@tintrail/sync";
import { notifyReady } from "./notify.ts";
import { PACKS } from "./packs.ts";

function fakeSync(): SyncAdapter & { kinds: string[] } {
  const kinds: string[] = [];
  return {
    kinds,
    isEnabled() {
      return true;
    },
    setEnabled() {
      /* demo */
    },
    enqueue(kind) {
      kinds.push(kind);
    },
    pendingCount() {
      return kinds.length;
    },
    flush() {
      return { flushed: kinds.length, skipped: false };
    },
  };
}

const ticket = { id: "t1", token: "BOPIS-1", stageBin: "Online shelf A", origin: "online" } as Ticket;

describe("notify stub", () => {
  it("does not enqueue for the HD pack", () => {
    const sync = fakeSync();
    notifyReady(sync, PACKS.hd, ticket);
    expect(sync.kinds).toEqual([]);
  });

  it("enqueues ticket.ready for the Lowe's pack", () => {
    const sync = fakeSync();
    notifyReady(sync, PACKS.lowes, ticket);
    expect(sync.kinds).toEqual(["ticket.ready"]);
  });
});
