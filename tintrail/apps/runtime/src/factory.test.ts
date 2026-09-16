import { afterEach, describe, expect, it } from "vitest";
import { createRuntime } from "./boot.ts";

async function start() {
  const { mkdtemp } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = await mkdtemp(join(tmpdir(), "tintrail-factory-"));
  const runtime = createRuntime(dir);
  return { ...runtime, dir };
}

describe("factory roadmap", () => {
  let closer: { close: () => void } | undefined;

  afterEach(() => {
    closer?.close();
    closer = undefined;
  });

  it("exposes a synthetic inbound tray and rails by id or all", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    const listed = await app.request("/api/inbound");
    const listedBody = (await listed.json()) as {
      orders: Array<{ id: string; orderNo: string; colorName: string }>;
      adapter: string;
    };
    expect(listedBody.adapter).toBe("synthetic");
    expect(listedBody.orders[0]?.colorName).toBeTruthy();
    const firstId = listedBody.orders[0]?.id;
    expect(firstId).toBeTruthy();

    const railed = await app.request(`/api/inbound/${firstId}/rail`, { method: "POST" });
    expect(railed.status).toBe(201);

    const rest = await app.request("/api/inbound/pull-all", { method: "POST" });
    expect(rest.status).toBe(201);
    const restBody = (await rest.json()) as { tickets: Array<{ origin: string }>; pending: number };
    expect(restBody.tickets.every((row) => row.origin === "online")).toBe(true);
    expect(restBody.pending).toBe(0);
  });

  it("dumps stale Ready cans so they leave the line", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    const created = await app.request("/api/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        colorId: "behr-swiss-coffee",
        productLine: "Marquee",
        sheen: "Satin",
        size: "Gal",
        qty: 1,
      }),
    });
    const { ticket } = (await created.json()) as { ticket: { id: string; sku: string } };
    await app.request(`/api/tickets/${ticket.id}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ barcode: ticket.sku }),
    });
    await app.request(`/api/tickets/${ticket.id}/dispense`, { method: "POST" });
    await app.request(`/api/tickets/${ticket.id}/print`, { method: "POST" });
    const stored = deps.rail.getTicket(ticket.id);
    expect(stored).toBeTruthy();
    if (stored) {
      deps.rail.putTicket({ ...stored, createdAt: Date.now() - 5 * 60 * 60 * 1000 });
    }
    const cleared = await app.request("/api/rail/clear-stale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const clearedBody = (await cleared.json()) as { dumped: number };
    expect(clearedBody.dumped).toBe(1);
    expect(deps.rail.getTicket(ticket.id)?.state).toBe("dumped");
  });

  it("writes Online shelf A at done and skips notify on the HD pack", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    const created = await app.request("/api/inbound/pull", { method: "POST" });
    const { ticket } = (await created.json()) as { ticket: { id: string; sku: string } };
    await app.request(`/api/tickets/${ticket.id}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ barcode: ticket.sku }),
    });
    const afterFirst = deps.rail.getTicket(ticket.id);
    if (afterFirst && afterFirst.qty > 1 && afterFirst.state === "on_rail") {
      await app.request(`/api/tickets/${ticket.id}/validate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ barcode: ticket.sku }),
      });
    }
    await app.request(`/api/tickets/${ticket.id}/dispense`, { method: "POST" });
    await app.request(`/api/tickets/${ticket.id}/print`, { method: "POST" });
    const done = await app.request(`/api/tickets/${ticket.id}/advance`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state: "done" }),
    });
    const doneBody = (await done.json()) as { ticket: { stageBin: string | null; origin: string } };
    expect(doneBody.ticket.stageBin).toBe("Online shelf A");
    expect(deps.rail.listPendingOutbox().some((row) => row.kind === "ticket.ready")).toBe(false);
  });

  it("enqueues ticket.ready when the Lowe's pack is on", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    await app.request("/api/pack", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pack: "lowes" }),
    });
    const created = await app.request("/api/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        colorId: "behr-swiss-coffee",
        productLine: "Marquee",
        sheen: "Satin",
        size: "Gal",
        qty: 1,
        origin: "online",
        token: "BOPIS-9",
      }),
    });
    const { ticket } = (await created.json()) as {
      ticket: { id: string; sku: string; priceCents: number | null };
    };
    expect(ticket.priceCents).toBe(4898);
    await app.request(`/api/tickets/${ticket.id}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ barcode: ticket.sku }),
    });
    await app.request(`/api/tickets/${ticket.id}/dispense`, { method: "POST" });
    await app.request(`/api/tickets/${ticket.id}/print`, { method: "POST" });
    await app.request(`/api/tickets/${ticket.id}/advance`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state: "done" }),
    });
    expect(deps.rail.listPendingOutbox().some((row) => row.kind === "ticket.ready")).toBe(true);
  });

  it("requires a second scan when qty is 2", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    const created = await app.request("/api/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        colorId: "behr-swiss-coffee",
        productLine: "Marquee",
        sheen: "Satin",
        size: "Gal",
        qty: 2,
      }),
    });
    const { ticket } = (await created.json()) as { ticket: { id: string; sku: string } };
    const first = await app.request(`/api/tickets/${ticket.id}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ barcode: ticket.sku }),
    });
    const firstBody = (await first.json()) as { ticket: { state: string; scannedQty: number } };
    expect(firstBody.ticket.state).toBe("on_rail");
    expect(firstBody.ticket.scannedQty).toBe(1);
    const second = await app.request(`/api/tickets/${ticket.id}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ barcode: ticket.sku }),
    });
    const secondBody = (await second.json()) as { ticket: { state: string; scannedQty: number } };
    expect(secondBody.ticket.state).toBe("validating");
    expect(secondBody.ticket.scannedQty).toBe(2);
  });

  it("hides foreign brands on the Sherwin pack and names a bad device", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    await app.request("/api/pack", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pack: "sherwin" }),
    });
    const search = await app.request("/api/catalog/search?q=black");
    const searchBody = (await search.json()) as { hits: Array<{ brand: string }> };
    expect(searchBody.hits.every((hit) => hit.brand === "Sherwin")).toBe(true);

    await app.request("/api/devices", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dispenser: "bad" }),
    });
    const devices = await app.request("/api/devices");
    const deviceBody = (await devices.json()) as { dispenser: string };
    expect(deviceBody.dispenser).toBe("bad");

    const station = await app.request("/api/station", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ station: "D2" }),
    });
    expect(station.status).toBe(400);
  });
});
