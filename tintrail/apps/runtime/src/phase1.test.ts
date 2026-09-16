import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createRuntime } from "./boot.ts";

async function start() {
  const dir = await mkdtemp(join(tmpdir(), "tintrail-rt-"));
  const runtime = createRuntime(dir);
  return { ...runtime, dir };
}

describe("Phase 1 slice", () => {
  let closer: { close: () => void } | undefined;

  afterEach(() => {
    closer?.close();
    closer = undefined;
  });

  it("returns two brands for black and keeps the full catalog offline", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    const live = await app.request("/api/catalog/search?q=black");
    const liveBody = (await live.json()) as { hits: Array<{ brand: string; name: string }> };
    const blacks = liveBody.hits.filter((hit) => hit.name === "Black");
    expect(blacks).toHaveLength(2);
    expect(blacks.map((hit) => hit.brand).sort()).toEqual(["Behr", "Glidden"]);
    expect(liveBody.hits.some((hit) => hit.name === "Black Magic")).toBe(true);

    await app.request("/api/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: false }),
    });
    const offline = await app.request("/api/catalog/search?q=");
    const offlineBody = (await offline.json()) as { hits: unknown[] };
    expect(offlineBody.hits).toHaveLength(deps.catalog.colors.length);
  });

  it("rails a walk-up ticket, blocks a wrong barcode, then dispenses and prints matching hashes", async () => {
    const { app, deps, dir } = await start();
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
        token: "",
      }),
    });
    expect(created.status).toBe(201);
    const { ticket } = (await created.json()) as {
      ticket: {
        id: string;
        token: string;
        origin: string;
        sku: string;
        formula: { hash: string };
        ackHash: string | null;
      };
    };
    expect(ticket.token).toBe("Walk-up");
    expect(ticket.origin).toBe("walk-up");
    expect(ticket.formula.hash).toMatch(/^[0-9a-f]{64}$/);

    const blocked = await app.request(`/api/tickets/${ticket.id}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ barcode: "WRONG-SKU" }),
    });
    expect(blocked.status).toBe(409);

    const validated = await app.request(`/api/tickets/${ticket.id}/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ barcode: ticket.sku }),
    });
    expect(validated.status).toBe(200);

    await app.request("/api/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: false }),
    });

    const dispensed = await app.request(`/api/tickets/${ticket.id}/dispense`, {
      method: "POST",
    });
    expect(dispensed.status).toBe(200);
    const dispensedBody = (await dispensed.json()) as {
      ticket: { ackHash: string; formula: { hash: string } };
    };
    expect(dispensedBody.ticket.ackHash).toBe(dispensedBody.ticket.formula.hash);

    const printed = await app.request(`/api/tickets/${ticket.id}/print`, {
      method: "POST",
    });
    expect(printed.status).toBe(200);
    const printedBody = (await printed.json()) as {
      ticket: { state: string; ackHash: string; labelPath: string };
    };
    expect(printedBody.ticket.state).toBe("labeled");
    const label = await readFile(printedBody.ticket.labelPath, "utf8");
    expect(label).toContain(`hash=${printedBody.ticket.ackHash}`);
    expect(printedBody.ticket.labelPath.startsWith(join(dir, "labels"))).toBe(true);
  });

  it("measures a sample and dumps a railed ticket", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    const measured = await app.request("/api/measure", { method: "POST" });
    expect(measured.status).toBe(200);
    const shot = (await measured.json()) as { closest: unknown[] };
    expect(shot.closest.length).toBeGreaterThan(0);

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
    const { ticket } = (await created.json()) as { ticket: { id: string } };
    const dumped = await app.request(`/api/tickets/${ticket.id}/dump`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason: "wrong color" }),
    });
    expect(dumped.status).toBe(200);
    const dumpedBody = (await dumped.json()) as { ticket: { state: string } };
    expect(dumpedBody.ticket.state).toBe("dumped");
  });

  it("rails a synthetic online inbound ticket onto the line", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    const listed = await app.request("/api/inbound");
    expect(listed.status).toBe(200);
    const listedBody = (await listed.json()) as {
      orders: Array<{ id: string; orderNo: string }>;
      note: string;
    };
    expect(listedBody.orders.length).toBeGreaterThan(0);
    expect(listedBody.note).toMatch(/Synthetic/i);

    const pulled = await app.request("/api/inbound/pull", { method: "POST" });
    expect(pulled.status).toBe(201);
    const pulledBody = (await pulled.json()) as {
      ticket: { origin: string; token: string; colorName: string };
    };
    expect(pulledBody.ticket.origin).toBe("online");
    expect(pulledBody.ticket.token.startsWith("BOPIS-")).toBe(true);

    const rail = await app.request("/api/rail");
    const railBody = (await rail.json()) as { tickets: Array<{ origin: string }> };
    expect(railBody.tickets.some((row) => row.origin === "online")).toBe(true);
  });

  it("does not expose a capture KPI", async () => {
    const { app, deps } = await start();
    closer = deps.rail;
    const res = await app.request("/api/sync");
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.captureRate).toBeUndefined();
    expect(body.capturePercent).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/capture/i);
  });
});
