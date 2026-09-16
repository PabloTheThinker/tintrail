import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { buildSku, computeSizedFormula, hashMix } from "@tintrail/formula";
import type {
  CanSize,
  ColorHit,
  ColorRecord,
  DeviceStatus,
  InboundOrder,
  Origin,
  PackCatalog,
  PackId,
  Ticket,
} from "@tintrail/shared";
import type { DeviceDrivers } from "@tintrail/shared";
import type { RailStore } from "@tintrail/rail";
import type { SyncAdapter } from "@tintrail/sync";
import { createSyntheticInbound } from "./inbound.ts";
import { notifyReady } from "./notify.ts";
import { isPackId, PACKS } from "./packs.ts";

const SIZES: CanSize[] = ["8oz", "Qt", "Gal", "5gal"];

export type RuntimeDeps = {
  catalog: PackCatalog;
  rail: RailStore;
  sync: SyncAdapter;
  devices: DeviceDrivers;
};

type CommitBody = {
  colorId: string;
  productLine: string;
  sheen: string;
  size: CanSize;
  qty: number;
  token?: string;
  origin?: Origin;
};

const ORIGINS: Origin[] = [
  "walk-up",
  "reorder",
  "spectro",
  "card-scan",
  "special-order",
  "kiosk",
  "online",
  "pos-retrieve",
  "pro-job",
];

function isOrigin(value: string): value is Origin {
  return (ORIGINS as string[]).includes(value);
}

type BarcodeBody = {
  barcode: string;
};

function isCanSize(value: string): value is CanSize {
  return (SIZES as string[]).includes(value);
}

function searchColors(catalog: PackCatalog, query: string): ColorHit[] {
  const q = query.trim().toLowerCase();
  const rows = q.length === 0
    ? catalog.colors
    : catalog.colors.filter((color) => {
        return (
          color.name.toLowerCase().includes(q) ||
          color.brand.toLowerCase().includes(q) ||
          color.code.toLowerCase().includes(q)
        );
      });
  return rows.map(toHit);
}

function toHit(color: ColorRecord): ColorHit {
  return {
    id: color.id,
    brand: color.brand,
    name: color.name,
    code: color.code,
    swatch: color.swatch,
    kind: color.kind,
  };
}

function stubOnHand(line: string, syncEnabled: boolean): number {
  if (!syncEnabled && line === "Dynasty") {
    return 0;
  }
  return 14;
}

function parseCommit(body: unknown): CommitBody {
  if (typeof body !== "object" || body === null) {
    throw new Error("Invalid ticket");
  }
  const value = body as Record<string, unknown>;
  if (typeof value.colorId !== "string" || value.colorId.length === 0) {
    throw new Error("colorId is required");
  }
  if (typeof value.productLine !== "string") {
    throw new Error("productLine is required");
  }
  if (typeof value.sheen !== "string") {
    throw new Error("sheen is required");
  }
  if (typeof value.size !== "string" || !isCanSize(value.size)) {
    throw new Error("size is required");
  }
  const qty = typeof value.qty === "number" ? value.qty : Number(value.qty);
  if (!Number.isInteger(qty) || qty < 1) {
    throw new Error("qty must be a positive integer");
  }
  const token = typeof value.token === "string" ? value.token : "";
  const origin =
    typeof value.origin === "string" && isOrigin(value.origin) ? value.origin : undefined;
  return {
    colorId: value.colorId,
    productLine: value.productLine,
    sheen: value.sheen,
    size: value.size,
    qty,
    token,
    origin,
  };
}

const ONLINE_SHELF = "Online shelf A";
const STALE_READY_MS = 4 * 60 * 60 * 1000;

function stubPriceCents(size: CanSize): number {
  switch (size) {
    case "8oz":
      return 748;
    case "Qt":
      return 1848;
    case "Gal":
      return 4898;
    case "5gal":
      return 18900;
  }
}

function hydrateTicket(ticket: Ticket): Ticket {
  return {
    ...ticket,
    stageBin: ticket.stageBin ?? null,
    scannedQty: ticket.scannedQty ?? 0,
    priceCents: ticket.priceCents ?? null,
  };
}

function seedInbound(catalog: PackCatalog): InboundOrder[] {
  const due = Date.now() + 2 * 60 * 60 * 1000;
  const swiss = catalog.colors.find((row) => row.id === "behr-swiss-coffee");
  const black = catalog.colors.find((row) => row.id === "glidden-black");
  return [
    {
      id: randomUUID(),
      orderNo: "BOPIS-1042",
      colorId: "behr-swiss-coffee",
      productLine: "Marquee",
      sheen: "Satin",
      size: "Gal",
      qty: 2,
      token: "BOPIS-1042",
      dueAt: due,
      colorName: swiss?.name ?? "Swiss Coffee",
      brand: swiss?.brand ?? "Behr",
      swatch: swiss?.swatch,
    },
    {
      id: randomUUID(),
      orderNo: "BOPIS-1048",
      colorId: "glidden-black",
      productLine: "Premium Plus",
      sheen: "Eggshell",
      size: "Gal",
      qty: 1,
      token: "BOPIS-1048",
      dueAt: due,
      colorName: black?.name ?? "Black",
      brand: black?.brand ?? "Glidden",
      swatch: black?.swatch,
    },
  ];
}

function railFromInput(
  deps: RuntimeDeps,
  input: CommitBody,
  extras: { station: string; commerce: boolean },
): { ticket?: Ticket; error?: string; status?: 400 | 404 | 409 } {
  const color = deps.catalog.colors.find((row) => row.id === input.colorId);
  if (!color) {
    return { error: "Color not found", status: 404 };
  }
  if (!deps.catalog.lines.includes(input.productLine)) {
    return { error: "Unknown product line", status: 400 };
  }
  if (!deps.catalog.sheens.includes(input.sheen)) {
    return { error: "Unknown sheen", status: 400 };
  }

  const onHand = stubOnHand(input.productLine, deps.sync.isEnabled());
  if (onHand === 0) {
    return { error: "No on-hand for this line", status: 409 };
  }

  const sku = buildSku(color.brand, color.code, input.productLine, input.sheen, input.size);
  let formula;
  try {
    formula = computeSizedFormula(color.gallonRecipe, sku, input.size, color.swatch);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Formula failed";
    return { error: message, status: 409 };
  }

  const token = input.token?.trim() ? input.token.trim() : "Walk-up";
  const origin: Origin =
    input.origin ?? (token === "Walk-up" ? "walk-up" : "pro-job");
  const ticket: Ticket = {
    id: randomUUID(),
    colorId: color.id,
    brand: color.brand,
    colorName: color.name,
    code: color.code,
    kind: color.kind,
    productLine: input.productLine,
    sheen: input.sheen,
    size: input.size,
    qty: input.qty,
    sku,
    onHand,
    pack: 2,
    token,
    station: extras.station,
    state: "on_rail",
    origin,
    formula,
    ackHash: null,
    labelText: null,
    labelPath: null,
    createdAt: Date.now(),
    stageBin: null,
    scannedQty: 0,
    priceCents: extras.commerce ? stubPriceCents(input.size) : null,
  };
  deps.rail.putTicket(ticket);
  deps.sync.enqueue("ticket.railed", { id: ticket.id, hash: formula.hash, token: ticket.token });
  return { ticket };
}

export function createApp(deps: RuntimeDeps): Hono {
  const inbound = createSyntheticInbound(() => seedInbound(deps.catalog));
  const devices: DeviceStatus = { spectro: "ok", dispenser: "ok", printer: "ok" };
  let packId: PackId = isPackId(deps.rail.getMeta("pack") ?? "")
    ? (deps.rail.getMeta("pack") as PackId)
    : "hd";
  const policy = () => PACKS[packId];
  const station = () => deps.rail.getMeta("station") ?? deps.catalog.station;
  const railExtras = () => ({ station: station(), commerce: policy().commerce });
  const railTicket = (input: CommitBody) => railFromInput(deps, input, railExtras());

  const app = new Hono();
  app.use(
    "/api/*",
    cors({
      origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    }),
  );

  app.get("/api/health", (c) => c.json({ ok: true, service: "tintrail-runtime" }));

  app.get("/api/devices", (c) => {
    return c.json(devices);
  });

  app.post("/api/devices", async (c) => {
    const body = (await c.req.json()) as Partial<DeviceStatus>;
    const allowed = ["ok", "warn", "bad"] as const;
    for (const key of ["spectro", "dispenser", "printer"] as const) {
      const value = body[key];
      if (value !== undefined) {
        if (!allowed.includes(value)) {
          return c.json({ error: "device status must be ok, warn, or bad" }, 400);
        }
        devices[key] = value;
      }
    }
    return c.json(devices);
  });

  app.get("/api/pack", (c) => {
    return c.json({
      ...policy(),
      station: station(),
      inboundKind: inbound.kind,
    });
  });

  app.post("/api/pack", async (c) => {
    const body = (await c.req.json()) as { pack?: unknown };
    if (typeof body.pack !== "string" || !isPackId(body.pack)) {
      return c.json({ error: "Unknown pack" }, 400);
    }
    packId = body.pack;
    deps.rail.setMeta("pack", packId);
    return c.json({
      ...policy(),
      station: station(),
      inboundKind: inbound.kind,
    });
  });

  app.get("/api/station", (c) => {
    return c.json({ station: station(), stations: policy().stations });
  });

  app.post("/api/station", async (c) => {
    const body = (await c.req.json()) as { station?: unknown };
    if (typeof body.station !== "string" || !policy().stations.includes(body.station)) {
      return c.json({ error: "Unknown station" }, 400);
    }
    deps.rail.setMeta("station", body.station);
    return c.json({ station: body.station, stations: policy().stations });
  });

  app.post("/api/measure", async (c) => {
    const closest = searchColors(deps.catalog, "fog").slice(0, 2);
    return c.json({
      ready: true,
      shot: {
        swatch: "#8B5A2B",
        lab: "L 42  a 18  b 28",
        note: "Mock spectro — OEM driver later",
      },
      closest,
    });
  });

  app.get("/api/catalog/search", (c) => {
    const q = c.req.query("q") ?? "";
    const hidden = new Set(policy().hideBrands);
    const hits = searchColors(deps.catalog, q).filter((hit) => !hidden.has(hit.brand));
    return c.json({
      asOf: deps.catalog.asOf,
      hits,
    });
  });

  app.get("/api/catalog/options", (c) => {
    return c.json({
      lines: deps.catalog.lines,
      sheens: deps.catalog.sheens,
      sizes: deps.catalog.sizes,
      asOf: deps.catalog.asOf,
      store: deps.catalog.store,
      station: station(),
      pack: packId,
      layout: policy().layout,
      commerce: policy().commerce,
      notify: policy().notify,
      stations: policy().stations,
    });
  });


  app.get("/api/on-hand", (c) => {
    const line = c.req.query("line") ?? "";
    const onHand = stubOnHand(line, deps.sync.isEnabled());
    return c.json({ onHand, pack: 2 });
  });

  app.get("/api/sync", (c) => {
    return c.json({
      enabled: deps.sync.isEnabled(),
      catalogAsOf: deps.catalog.asOf,
      pendingOutbox: deps.sync.pendingCount(),
    });
  });

  app.post("/api/sync", async (c) => {
    const body = (await c.req.json()) as { enabled?: unknown };
    if (typeof body.enabled !== "boolean") {
      return c.json({ error: "enabled must be a boolean" }, 400);
    }
    deps.sync.setEnabled(body.enabled);
    if (body.enabled) {
      deps.sync.flush();
    }
    return c.json({
      enabled: deps.sync.isEnabled(),
      catalogAsOf: deps.catalog.asOf,
      pendingOutbox: deps.sync.pendingCount(),
    });
  });

  app.get("/api/rail", (c) => {
    return c.json({ tickets: deps.rail.listTickets().map(hydrateTicket) });
  });

  app.post("/api/rail/clear-stale", async (c) => {
    let olderThanMs = STALE_READY_MS;
    try {
      const body = (await c.req.json()) as { olderThanMs?: unknown };
      if (typeof body.olderThanMs === "number" && body.olderThanMs >= 0) {
        olderThanMs = body.olderThanMs;
      }
    } catch {
      /* empty body uses default */
    }
    const cutoff = Date.now() - olderThanMs;
    let dumped = 0;
    for (const ticket of deps.rail.listTickets()) {
      const leftover =
        ticket.state === "on_rail" ||
        ticket.state === "validating" ||
        ticket.state === "dispensing" ||
        ticket.state === "labeled" ||
        ticket.state === "shaken";
      if (leftover && ticket.createdAt <= cutoff) {
        const next: Ticket = { ...hydrateTicket(ticket), state: "dumped" };
        deps.rail.putTicket(next);
        deps.sync.enqueue("ticket.dumped", { id: next.id, reason: "stale-ready" });
        dumped += 1;
      }
    }
    return c.json({ dumped });
  });

  app.get("/api/inbound", (c) => {
    return c.json({
      orders: inbound.list(),
      note: "Synthetic BOPIS tray. Not OrderUp.",
      adapter: inbound.kind,
    });
  });

  app.post("/api/inbound/seed", (c) => {
    inbound.seed();
    return c.json({ orders: inbound.list(), adapter: inbound.kind });
  });

  app.post("/api/inbound/pull", (c) => {
    if (inbound.list().length === 0) {
      inbound.seed();
    }
    const order = inbound.take();
    if (!order) {
      return c.json({ error: "No inbound orders" }, 404);
    }
    const result = railTicket({
      colorId: order.colorId,
      productLine: order.productLine,
      sheen: order.sheen,
      size: order.size,
      qty: order.qty,
      token: order.token,
      origin: "online",
    });
    if (!result.ticket) {
      return c.json({ error: result.error ?? "Could not rail inbound" }, result.status ?? 400);
    }
    return c.json({ ticket: result.ticket, pending: inbound.list().length }, 201);
  });

  app.post("/api/inbound/pull-all", (c) => {
    const orders = inbound.takeAll();
    if (orders.length === 0) {
      return c.json({ error: "No inbound orders" }, 404);
    }
    const tickets: Ticket[] = [];
    for (const order of orders) {
      const result = railTicket({
        colorId: order.colorId,
        productLine: order.productLine,
        sheen: order.sheen,
        size: order.size,
        qty: order.qty,
        token: order.token,
        origin: "online",
    });
    if (!result.ticket) {
      return c.json({ error: result.error ?? "Could not rail inbound" }, result.status ?? 400);
    }
    tickets.push(result.ticket);
    }
    return c.json({ tickets, pending: inbound.list().length }, 201);
  });

  app.post("/api/inbound/:id/rail", (c) => {
    const order = inbound.take(c.req.param("id"));
    if (!order) {
      return c.json({ error: "Inbound order not found" }, 404);
    }
    const result = railTicket({
      colorId: order.colorId,
      productLine: order.productLine,
      sheen: order.sheen,
      size: order.size,
      qty: order.qty,
      token: order.token,
      origin: "online",
    });
    if (!result.ticket) {
      return c.json({ error: result.error ?? "Could not rail inbound" }, result.status ?? 400);
    }
    return c.json({ ticket: result.ticket, pending: inbound.list().length }, 201);
  });

  app.get("/api/tickets/:id", (c) => {
    const ticket = deps.rail.getTicket(c.req.param("id"));
    if (!ticket) {
      return c.json({ error: "Ticket not found" }, 404);
    }
    return c.json({ ticket: hydrateTicket(ticket) });
  });

  app.post("/api/tickets", async (c) => {
    let input: CommitBody;
    try {
      input = parseCommit(await c.req.json());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid ticket";
      return c.json({ error: message }, 400);
    }

    const result = railTicket(input);
    if (!result.ticket) {
      return c.json({ error: result.error ?? "Could not add ticket" }, result.status ?? 400);
    }
    return c.json({ ticket: result.ticket }, 201);
  });

  app.post("/api/tickets/:id/validate", async (c) => {
    const ticket = deps.rail.getTicket(c.req.param("id"));
    if (!ticket) {
      return c.json({ error: "Ticket not found" }, 404);
    }
    const body = (await c.req.json()) as BarcodeBody;
    if (typeof body.barcode !== "string") {
      return c.json({ error: "barcode is required" }, 400);
    }
    const result = await deps.devices.validateCan(ticket.sku, body.barcode);
    if (!result.ok) {
      return c.json({ error: result.reason, ticket: hydrateTicket(ticket) }, 409);
    }
    const scannedQty = (ticket.scannedQty ?? 0) + 1;
    const readyToMix = scannedQty >= ticket.qty;
    const next: Ticket = {
      ...hydrateTicket(ticket),
      scannedQty,
      state: readyToMix ? "validating" : "on_rail",
    };
    deps.rail.putTicket(next);
    return c.json({ ticket: next });
  });

  app.post("/api/tickets/:id/dispense", async (c) => {
    const ticket = deps.rail.getTicket(c.req.param("id"));
    if (!ticket) {
      return c.json({ error: "Ticket not found" }, 404);
    }
    if (ticket.state !== "validating" && ticket.state !== "dispensing") {
      return c.json({ error: "Validate the can before dispense" }, 409);
    }
    if (!ticket.formula) {
      return c.json({ error: "Ticket has no formula" }, 409);
    }
    const working: Ticket = { ...ticket, state: "dispensing" };
    deps.rail.putTicket(working);
    const { ack } = await deps.devices.dispense(ticket.formula.vector);
    const ackHash = hashMix(ack, ticket.sku, ticket.size);
    if (ackHash !== ticket.formula.hash) {
      return c.json({ error: "Ack hash does not match formula hash" }, 500);
    }
    const next: Ticket = { ...working, ackHash };
    deps.rail.putTicket(next);
    deps.sync.enqueue("ticket.dispensed", { id: next.id, hash: ackHash });
    return c.json({ ticket: next });
  });

  app.post("/api/tickets/:id/print", async (c) => {
    const ticket = deps.rail.getTicket(c.req.param("id"));
    if (!ticket) {
      return c.json({ error: "Ticket not found" }, 404);
    }
    if (!ticket.formula || !ticket.ackHash) {
      return c.json({ error: "Dispense before print" }, 409);
    }
    const printed = await deps.devices.print({
      hash: ticket.ackHash,
      recipe: ticket.formula.displayRecipe,
      sku: ticket.sku,
    });
    const next: Ticket = {
      ...ticket,
      state: "labeled",
      labelText: ticket.ackHash,
      labelPath: printed.path,
    };
    deps.rail.putTicket(next);
    deps.sync.enqueue("ticket.labeled", { id: next.id, hash: next.ackHash });
    return c.json({ ticket: next });
  });

  app.post("/api/tickets/:id/dump", async (c) => {
    const ticket = deps.rail.getTicket(c.req.param("id"));
    if (!ticket) {
      return c.json({ error: "Ticket not found" }, 404);
    }
    const body = (await c.req.json()) as { reason?: unknown };
    if (typeof body.reason !== "string" || body.reason.trim() === "") {
      return c.json({ error: "Dump needs a reason" }, 400);
    }
    const next: Ticket = { ...ticket, state: "dumped" };
    deps.rail.putTicket(next);
    deps.sync.enqueue("ticket.dumped", {
      id: next.id,
      reason: body.reason.trim(),
    });
    return c.json({ ticket: next });
  });

  app.post("/api/tickets/:id/advance", async (c) => {
    const ticket = deps.rail.getTicket(c.req.param("id"));
    if (!ticket) {
      return c.json({ error: "Ticket not found" }, 404);
    }
    const body = (await c.req.json()) as { state?: unknown };
    if (body.state !== "shaken" && body.state !== "done") {
      return c.json({ error: "state must be shaken or done" }, 400);
    }
    if (ticket.state !== "labeled" && ticket.state !== "shaken") {
      return c.json({ error: "Label the can before shake or done" }, 409);
    }
    const next: Ticket = {
      ...hydrateTicket(ticket),
      state: body.state,
      stageBin:
        body.state === "done" && ticket.origin === "online"
          ? ticket.stageBin ?? ONLINE_SHELF
          : ticket.stageBin ?? null,
    };
    deps.rail.putTicket(next);
    if (body.state === "done") {
      notifyReady(deps.sync, policy(), next);
    }
    return c.json({ ticket: next });
  });

  return app;
}
