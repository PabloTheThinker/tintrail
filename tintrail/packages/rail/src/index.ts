import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import type { PackCatalog, Ticket } from "@tintrail/shared";

export type RailStore = {
  listTickets(): Ticket[];
  getTicket(id: string): Ticket | null;
  putTicket(ticket: Ticket): void;
  saveCatalogSnapshot(catalog: PackCatalog): void;
  getCatalogSnapshot(): PackCatalog | null;
  getMeta(key: string): string | null;
  setMeta(key: string, value: string): void;
  enqueueOutbox(kind: string, payload: string): void;
  pendingOutboxCount(): number;
  listPendingOutbox(): Array<{ kind: string; payload: string }>;
  markOutboxFlushed(): number;
  close(): void;
};

export function openRailStore(dbPath: string): RailStore {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS catalog_snapshot (
      id TEXT PRIMARY KEY,
      json TEXT NOT NULL,
      as_of TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      flushed_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const insertTicket = db.prepare(
    `INSERT INTO tickets (id, json, created_at) VALUES (@id, @json, @createdAt)
     ON CONFLICT(id) DO UPDATE SET json = excluded.json`,
  );
  const selectTickets = db.prepare(
    `SELECT json FROM tickets ORDER BY created_at DESC`,
  );
  const selectTicket = db.prepare(`SELECT json FROM tickets WHERE id = ?`);
  const upsertCatalog = db.prepare(
    `INSERT INTO catalog_snapshot (id, json, as_of) VALUES ('current', @json, @asOf)
     ON CONFLICT(id) DO UPDATE SET json = excluded.json, as_of = excluded.as_of`,
  );
  const selectCatalog = db.prepare(
    `SELECT json FROM catalog_snapshot WHERE id = 'current'`,
  );
  const selectMeta = db.prepare(`SELECT value FROM meta WHERE key = ?`);
  const upsertMeta = db.prepare(
    `INSERT INTO meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  );
  const insertOutbox = db.prepare(
    `INSERT INTO outbox (id, kind, payload, created_at, flushed_at)
     VALUES (?, ?, ?, ?, NULL)`,
  );
  const countOutbox = db.prepare(
    `SELECT COUNT(*) AS n FROM outbox WHERE flushed_at IS NULL`,
  );
  const selectPendingOutbox = db.prepare(
    `SELECT kind, payload FROM outbox WHERE flushed_at IS NULL ORDER BY created_at ASC`,
  );
  const flushOutbox = db.prepare(
    `UPDATE outbox SET flushed_at = ? WHERE flushed_at IS NULL`,
  );

  return {
    listTickets() {
      return selectTickets.all().map((row) => JSON.parse((row as { json: string }).json) as Ticket);
    },
    getTicket(id) {
      const row = selectTicket.get(id) as { json: string } | undefined;
      return row ? (JSON.parse(row.json) as Ticket) : null;
    },
    putTicket(ticket) {
      insertTicket.run({
        id: ticket.id,
        json: JSON.stringify(ticket),
        createdAt: ticket.createdAt,
      });
    },
    saveCatalogSnapshot(catalog) {
      upsertCatalog.run({ json: JSON.stringify(catalog), asOf: catalog.asOf });
    },
    getCatalogSnapshot() {
      const row = selectCatalog.get() as { json: string } | undefined;
      return row ? (JSON.parse(row.json) as PackCatalog) : null;
    },
    getMeta(key) {
      const row = selectMeta.get(key) as { value: string } | undefined;
      return row?.value ?? null;
    },
    setMeta(key, value) {
      upsertMeta.run(key, value);
    },
    enqueueOutbox(kind, payload) {
      insertOutbox.run(`ob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, kind, payload, Date.now());
    },
    pendingOutboxCount() {
      const row = countOutbox.get() as { n: number };
      return row.n;
    },
    listPendingOutbox() {
      return selectPendingOutbox.all() as Array<{ kind: string; payload: string }>;
    },
    markOutboxFlushed() {
      const info = flushOutbox.run(Date.now());
      return info.changes;
    },
    close() {
      db.close();
    },
  };
}
