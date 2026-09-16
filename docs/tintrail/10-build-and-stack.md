# TintRail build and stack

Durable engineering spec for making the concept. Do not treat a cloud SPA as the store.

- Architecture: [04-architecture.md](04-architecture.md)
- Functions: [07-function-model.md](07-function-model.md)
- Packs: [08-broad-spectrum-fork.md](08-broad-spectrum-fork.md)
- UI rules: [11-ux-framework.md](11-ux-framework.md)
- Screens: [05-ux-spec.md](05-ux-spec.md)
- Gaps: [02-gap-analysis.md](02-gap-analysis.md) (TR-1–TR-40)

**Code root:** `tintrail/` (pnpm workspaces). Catalog data is **synthetic**. No OEM formula books.

---

## 1. Stack table

| Layer | Choice | Why |
| --- | --- | --- |
| Language | TypeScript, `strict` | One team; Formula tests in the same language as Desk |
| Monorepo | pnpm workspaces | Apps + packages without publishing |
| Desk | React 19 + Vite | Keyboard-first UI; [11](11-ux-framework.md) tokens |
| Runtime | Node 22 + Hono on `127.0.0.1:8787` | Local HTTP; Desk never owns mix math |
| Formula | `@tintrail/formula` pure functions | TR-9–TR-11; no I/O |
| Rail | `@tintrail/rail` + SQLite WAL (better-sqlite3) | Tickets + full catalog snapshot (TR-37) |
| Devices | `@tintrail/devices` mocks | Scan / ack / print; OEM drivers later |
| Sync | `@tintrail/sync` outbox + kill switch | Tint with Sync unplugged (TR-4) |
| Shared types | `@tintrail/shared` | Ticket, vector, hash |
| Pack | `packs/hd` | Synthetic multi-brand catalog + policy |
| Tests | Vitest | Formula goldens; rail/devices |
| Later | Tauri 2 | Paint-PC shell so F5 is Measure |
| Not v1 | Spring/Cassandra, K8s-in-store, Convex-as-brain, real THD APIs | Would repeat OnePaint |

Cloud (including Convex) is **Sync only**. If Sync is down, `Rail it` and Dispense still work.

---

## 2. Process model

```
Desk (browser / later Tauri)
    |
    |  HTTP JSON  127.0.0.1:8787
    v
Runtime (Hono)
    +-- formula.compute / scale
    +-- rail.commit / list / get
    +-- devices.validateCan / dispense / print
    +-- sync.status / setEnabled / flush
```

Crash isolation (TR-7): Formula, Rail, and Devices are packages called by Runtime. An in-flight dispense is awaited in the Devices mock before the HTTP handler returns. Desk reload does not cancel a completed ack already written to Rail.

---

## 3. Ticket schema

```ts
type TicketState =
  | "draft" | "on_rail" | "validating" | "dispensing"
  | "labeled" | "shaken" | "done" | "binned" | "dumped" | "remake";

type Origin =
  | "walk-up" | "reorder" | "spectro" | "card-scan"
  | "special-order" | "kiosk" | "online" | "pos-retrieve" | "pro-job";

type FormulaResult = {
  vector: Record<string, number>; // colorantId -> shots at 1/48 oz
  displayRecipe: string[];
  swatch: string;                 // sRGB from engine
  hash: string;                   // sha256 of canonical vector+sku+size
};

type Ticket = {
  id: string;
  colorId: string;
  brand: string;
  colorName: string;
  code: string;
  kind: "OEM" | "Match";
  productLine: string;
  sheen: string;
  size: "8oz" | "Qt" | "Gal" | "5gal";
  qty: number;
  sku: string;
  onHand: number;
  pack: number;
  token: string;                  // "Walk-up" or phone/Pro
  station: string;
  state: TicketState;
  origin: Origin;
  formula: FormulaResult | null;
  ackHash: string | null;         // must equal formula.hash after dispense
  labelText: string | null;
  createdAt: number;
};
```

Commit **is** rail (TR-3). `token === "Walk-up"` is success (TR-36). No capture % field exists.

---

## 4. Driver interface

```ts
interface DeviceDrivers {
  validateCan(sku: string, barcode: string): Promise<{ ok: true } | { ok: false; reason: string }>;
  dispense(vector: Record<string, number>): Promise<{ ack: Record<string, number> }>;
  print(input: { hash: string; recipe: string[]; sku: string }): Promise<{ printed: true; path: string }>;
}
```

Phase 1 mocks: barcode must equal SKU; ack is a copy of the vector; print writes `tintrail/var/labels/{hash}.txt`.

Phase 4: same interface, serial/USB OEM adapters. Desk never imports a dispenser SDK.

---

## 5. Formula rules (lock)

- Display adjust `A` in `[-100, 100]` → multiplier `m = (A + 100) / 100` on `[0, 2]`.
- **No negative numbers** in mix arithmetic (TR-10).
- Size scale: `8oz=0.0625`, `Qt=0.25`, `Gal=1`, `5gal=5` relative to a gallon recipe.
- Overfill if total shots > headspace for that size/line → `{ ok: false, code: "OVERFILL" }`.
- Hash input: sorted `colorantId:shots` + sku + size. Label and UI show **ack** hash (TR-11).

---

## 6. What never goes in the cloud

- Dispense / print / validate-can as a required round-trip
- Formula arithmetic
- The only copy of today’s catalog (offline = last **full** snapshot)
- Phone-capture percentages
- OEM secret formula books (we use synthetic recipes)

Sync may mirror ticket ids, hashes, and tokens **after** the can is labeled.

---

## 7. Phase exit criteria

**Phase 1 (this repo slice)**

- Search HD synthetic catalog; `black` returns two brands with swatches (TR-14, TR-39).
- Express: product / sheen / size / qty / optional token / skip.
- Enter commits to rail without a second “send to queue.”
- Scan-to-shoot: barcode ≠ sku is blocked (TR-8).
- Dispense ack hash === formula hash; label file contains that hash (TR-11).
- Kill Sync: still search, rail, validate, dispense, print (TR-4).
- Formula Vitest: unsigned scale, sample→gallon, overfill, invert-regression (negative adjust still **adds** colorant).
- No capture KPI in API or UI (TR-35).

**Phase 2–5** — see the overall plan: match/adjust/Guided, packs/inbound, Tauri/drivers, other retailer packs.

---

## 8. Commands

```bash
cd tintrail
pnpm install
pnpm test          # formula (and package) tests
pnpm dev           # runtime :8787 + desk :5173
```

Desk talks only to `http://127.0.0.1:8787`.
