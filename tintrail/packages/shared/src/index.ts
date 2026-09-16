export type TicketState =
  | "draft"
  | "on_rail"
  | "validating"
  | "dispensing"
  | "labeled"
  | "shaken"
  | "done"
  | "binned"
  | "dumped"
  | "remake";

export type Origin =
  | "walk-up"
  | "reorder"
  | "spectro"
  | "card-scan"
  | "special-order"
  | "kiosk"
  | "online"
  | "pos-retrieve"
  | "pro-job";

export type CanSize = "8oz" | "Qt" | "Gal" | "5gal";

export type ColorKind = "OEM" | "Match";

/** Colorant id → shots at 1/48 oz. All values are unsigned. */
export type MixVector = Record<string, number>;

export type FormulaResult = {
  vector: MixVector;
  displayRecipe: string[];
  swatch: string;
  hash: string;
};

export type Ticket = {
  id: string;
  colorId: string;
  brand: string;
  colorName: string;
  code: string;
  kind: ColorKind;
  productLine: string;
  sheen: string;
  size: CanSize;
  qty: number;
  sku: string;
  onHand: number;
  pack: number;
  token: string;
  station: string;
  state: TicketState;
  origin: Origin;
  formula: FormulaResult | null;
  ackHash: string | null;
  labelText: string | null;
  labelPath: string | null;
  createdAt: number;
  stageBin: string | null;
  scannedQty: number;
  priceCents: number | null;
};

export type ColorRecord = {
  id: string;
  brand: string;
  name: string;
  code: string;
  swatch: string;
  kind: ColorKind;
  gallonRecipe: MixVector;
};

export type PackCatalog = {
  pack: string;
  asOf: string;
  store: string;
  station: string;
  lines: string[];
  sheens: string[];
  sizes: CanSize[];
  colors: ColorRecord[];
};

export type PackId = "hd" | "walmart" | "lowes" | "ace" | "sherwin";

export type PackLayout =
  | "hd-pit"
  | "walmart-compact"
  | "lowes-kds"
  | "ace-expert"
  | "sherwin-brand";

export type NotifyMode = "off" | "outbox";

export type PackPolicy = {
  pack: PackId;
  crossover: string;
  offlineCatalog: "full-last-good";
  layout: PackLayout;
  notify: NotifyMode;
  commerce: boolean;
  inboundAdapter: "synthetic";
  stations: string[];
  hideBrands: string[];
};

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

export type ColorHit = {
  id: string;
  brand: string;
  name: string;
  code: string;
  swatch: string;
  kind: ColorKind;
};

export type SyncStatus = {
  enabled: boolean;
  catalogAsOf: string;
  pendingOutbox: number;
};

export type ValidateResult =
  | { ok: true }
  | { ok: false; reason: string };

export type OverfillResult =
  | { ok: true }
  | { ok: false; code: "OVERFILL" };

export type DeviceHealth = "ok" | "warn" | "bad";

export type DeviceStatus = {
  spectro: DeviceHealth;
  dispenser: DeviceHealth;
  printer: DeviceHealth;
};

export type DeviceDrivers = {
  validateCan(sku: string, barcode: string): Promise<ValidateResult>;
  dispense(vector: MixVector): Promise<{ ack: MixVector }>;
  print(input: {
    hash: string;
    recipe: string[];
    sku: string;
  }): Promise<{ printed: true; path: string }>;
};
