import type { RailStore } from "@tintrail/rail";

export type OutboxItem = {
  id: string;
  kind: string;
  payload: string;
  createdAt: number;
  flushedAt: number | null;
};

export type SyncAdapter = {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  enqueue(kind: string, payload: unknown): void;
  pendingCount(): number;
  flush(): { flushed: number; skipped: boolean };
};

export function createFileOutboxSync(rail: RailStore): SyncAdapter {
  return {
    isEnabled() {
      return rail.getMeta("sync.enabled") !== "0";
    },
    setEnabled(enabled) {
      rail.setMeta("sync.enabled", enabled ? "1" : "0");
    },
    enqueue(kind, payload) {
      rail.enqueueOutbox(kind, JSON.stringify(payload));
    },
    pendingCount() {
      return rail.pendingOutboxCount();
    },
    flush() {
      if (!this.isEnabled()) {
        return { flushed: 0, skipped: true };
      }
      const flushed = rail.markOutboxFlushed();
      return { flushed, skipped: false };
    },
  };
}
