import type {
  CanSize,
  ColorHit,
  SyncStatus,
  Ticket,
} from "@tintrail/shared";

export type { CanSize, ColorHit, SyncStatus, Ticket };

export type CatalogOptions = {
  lines: string[];
  sheens: string[];
  sizes: CanSize[];
  asOf: string;
  store: string;
  station: string;
  pack?: string;
  layout?: string;
  commerce?: boolean;
  notify?: "off" | "outbox";
  stations?: string[];
};

export type DeviceStatus = {
  spectro: "ok" | "warn" | "bad";
  dispenser: "ok" | "warn" | "bad";
  printer: "ok" | "warn" | "bad";
};

export type MeasureShot = {
  ready: boolean;
  shot: { swatch: string; lab: string; note: string };
  closest: ColorHit[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return body;
}

export function searchCatalog(query: string) {
  return request<{ hits: ColorHit[]; asOf: string }>(
    `/api/catalog/search?q=${encodeURIComponent(query)}`,
  );
}

export function getOptions() {
  return request<CatalogOptions>("/api/catalog/options");
}

export function getOnHand(line: string) {
  return request<{ onHand: number; pack: number }>(
    `/api/on-hand?line=${encodeURIComponent(line)}`,
  );
}

export function getRail() {
  return request<{ tickets: Ticket[] }>("/api/rail");
}

export function getSync() {
  return request<SyncStatus>("/api/sync");
}

export function getDevices() {
  return request<DeviceStatus>("/api/devices");
}

export function measureSample() {
  return request<MeasureShot>("/api/measure", { method: "POST" });
}

export function setSyncEnabled(enabled: boolean) {
  return request<SyncStatus>("/api/sync", {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
}

export type InboundOrder = {
  id: string;
  orderNo: string;
  colorId: string;
  productLine: string;
  sheen: string;
  size: CanSize;
  qty: number;
  token: string;
  dueAt: number;
  colorName: string;
  brand: string;
  swatch?: string;
};

export type PackInfo = {
  pack: string;
  layout: string;
  notify: "off" | "outbox";
  commerce: boolean;
  inboundAdapter: "synthetic";
  stations: string[];
  hideBrands: string[];
  station: string;
  inboundKind: "synthetic";
};

export function getInbound() {
  return request<{ orders: InboundOrder[]; note: string; adapter: string }>("/api/inbound");
}

export function pullInbound() {
  return request<{ ticket: Ticket; pending: number }>("/api/inbound/pull", {
    method: "POST",
  });
}

export function pullAllInbound() {
  return request<{ tickets: Ticket[]; pending: number }>("/api/inbound/pull-all", {
    method: "POST",
  });
}

export function railInbound(id: string) {
  return request<{ ticket: Ticket; pending: number }>(`/api/inbound/${id}/rail`, {
    method: "POST",
  });
}

export function seedInbound() {
  return request<{ orders: InboundOrder[] }>("/api/inbound/seed", { method: "POST" });
}

export function clearStaleRail(olderThanMs?: number) {
  return request<{ dumped: number }>("/api/rail/clear-stale", {
    method: "POST",
    body: JSON.stringify(olderThanMs === undefined ? {} : { olderThanMs }),
  });
}

export function getPack() {
  return request<PackInfo>("/api/pack");
}

export function setPack(pack: string) {
  return request<PackInfo>("/api/pack", {
    method: "POST",
    body: JSON.stringify({ pack }),
  });
}

export function setStation(station: string) {
  return request<{ station: string; stations: string[] }>("/api/station", {
    method: "POST",
    body: JSON.stringify({ station }),
  });
}

export function commitTicket(input: {
  colorId: string;
  productLine: string;
  sheen: string;
  size: CanSize;
  qty: number;
  token: string;
  origin?: Ticket["origin"];
}) {
  return request<{ ticket: Ticket }>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function validateTicket(id: string, barcode: string) {
  return request<{ ticket: Ticket }>(`/api/tickets/${id}/validate`, {
    method: "POST",
    body: JSON.stringify({ barcode }),
  });
}

export function dispenseTicket(id: string) {
  return request<{ ticket: Ticket }>(`/api/tickets/${id}/dispense`, {
    method: "POST",
  });
}

export function printTicket(id: string) {
  return request<{ ticket: Ticket }>(`/api/tickets/${id}/print`, {
    method: "POST",
  });
}

export function dumpTicket(id: string, reason: string) {
  return request<{ ticket: Ticket }>(`/api/tickets/${id}/dump`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function advanceTicket(id: string, state: "shaken" | "done") {
  return request<{ ticket: Ticket }>(`/api/tickets/${id}/advance`, {
    method: "POST",
    body: JSON.stringify({ state }),
  });
}
