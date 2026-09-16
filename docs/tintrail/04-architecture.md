# TintRail Architecture

Store-local runtime plus sync. Not a cloud-only SPA. This is a concept architecture: adapters hide unpublished Home Depot contracts ([unknowns](01-research-brief.md#11-unknowns)). Requirements: [gap analysis](02-gap-analysis.md).

---

## 1. Why local-first

OnePaint’s public failure mode is a browser waiting on cloud services (Order API, Cassandra, inventory) while the dispenser, printer, and spectro sit on the bench unused.

TintRail inverts that:

- **Runtime** on the store LAN (or on the paint PCs) can finish a ticket.
- **Sync** attaches history, live on-hand, and Pro identity when the link is up.
- A nationwide cloud outage is a banner, not a closed desk (TR-4, TR-8).

```
                    +---------------- Store LAN ----------------+
 Associate -- Desk UI --+                                       |
                        |     TintRail Runtime                   |
                        |  catalog | formula | rail | devices    |
                        +-----+--------+--------+-------+-------+
                              |        |        |       |
                           spectro  dispenser printer shaker
                              |        |        |       |
                        +-----+--------+--------+-------+-------+
                        |           TintRail Sync               |
                        |     (optional while tinting)          |
                        +-----+--------+--------+-------+-------+
                              |        |        |       |
                           history  inventory  Pro   special orders
                              |        |        |       |
                              +-------- THD cloud ------+
```

---

## 2. Processes (crash isolation, TR-7)

Four store processes, separate memory spaces. A Desk crash must not drop an in-flight dispense.

| Process | Owns | Must stay up if others die |
| --- | --- | --- |
| **Desk** | Express/Guided UI | No — UI only |
| **Formula** | Mix math, scale, overfill, label hash | Yes — source of truth for vectors |
| **Devices** | Spectro, dispenser, printer, scanner drivers | Yes during dispense |
| **Rail** | Ticket store, station binding, local history | Yes — the queue |
| **Sync** | Cloud I/O, retry, conflict | No — tint without it |

Desk talks to Formula, Rail, and Devices over localhost (or store-LAN RPC). Desk never talks to a dispenser with a homemade milliliter table.

---

## 3. Formula service (TR-9–TR-13, TR-19)

The only component allowed to turn “this color, this base, this size, this adjust” into a colorant vector.

**Inputs**

- Color id (OEM formula, competitive card, spectro recipe, or manual shots)
- Base / product id (line, sheen, size)
- Display adjustment (associate-facing −100…+100 or “tad darker”)
- Quantity

**Internal**

- Convert display adjust to an **unsigned** multiplier on `[0, 2]` (0 = empty, 1 = recipe, 2 = double) — never subtract a “negative percent” from a vector (TR-10).
- Scale shots to can size. If headspace would be exceeded, return `OVERFILL` with a suggested size or split (TR-13).
- Stain / spray / sample use their own headspace and colorant tables (TR-19).

**Outputs** (same object to everyone)

- `vector`: colorant id → amount (canonical unit, e.g. shots at 1/48 oz or grams)
- `display_recipe`: human lines for the label
- `swatch`: Lab or sRGB preview
- `hash`: stable hash of vector + product + size

**Label equals dispensed (TR-11)**

1. Formula emits `vector` + `hash`.
2. Devices send `vector` to the dispenser.
3. Dispenser acks actual amounts (or “acked as sent” if the OEM has no telemetry).
4. If ack differs, Formula writes `vector_actual` and a new hash.
5. Printer prints `vector_actual` and encodes the hash in the barcode.
6. Desk and Rail only display what Formula just committed.

UI sliders do not add colorant lines. They send a new adjust to Formula and wait.

**Add Label (TR-12)** is `Rail.saveFormula(ticket)` — a write, not a fake dispense.

---

## 4. Device adapters (TR-6, TR-17, TR-18, TR-33)

Public sources do not name THD’s OEM. TintRail assumes **pluggable drivers**.

```
Devices process
  ├── SpectroDriver      (USB / vendor SDK / local service)
  ├── DispenserDriver    (serial / vendor protocol)
  ├── PrinterDriver      (label template + barcode)
  ├── ScannerDriver      (HID wedge or vendor)
  └── ShakerStatus       (optional: busy / free)
```

**Rules**

- Dispense and print are **local** and do not await Sync (TR-6).
- Spectro calibration, last-N measurements, and multi-spot average live in SpectroDriver (TR-17, TR-18). Desk only shows shots and asks for another.
- Each ticket binds `station_id` → dispenser + printer + preferred shaker (TR-33).
- Driver health is a first-class status: `ok | calibrating | jammed | not_found`. The banner names the device.

If the spectro process is down, catalog and card-scan still tint (TR-5).

---

## 5. Catalog and search (TR-14–TR-16)

**Local catalog cache** (replicated to each paint PC or a store box):

- Color records: brand, name, codes, aliases (“black”), card barcode, OEM vs match-only flag
- Product records: line, sheen, sizes, tintable bases, headspace class
- Crosswalk: competitive card → allowed bases + “match vs OEM” policy text

Search is local full-text + barcode. “Black” must return every brand in the cache, ranked (TR-14). Scan shows **printed name, system name, code** (TR-15). A blocked PPG-into-Behr (or reverse) returns the **policy sentence** and the legal alternative (TR-16).

Catalog refresh is a Sync job. Stale catalog still searches; the UI shows catalog as-of time.

**Offline catalog (TR-37).** The last successful full snapshot is what offline search uses. Do **not** ship a “core lines only” subset (2022 OnePaint offline dropped Dynasty, Ultra, specialty). If a SKU is absent, it is listed as `not in snapshot`, not missing from the alphabet.

**Manual-add (TR-38).** Devices expose a local shot-entry pad that still goes through Formula → hash → label. This is the April 2026 “manual coloration add” path, made first-class so associates do not unplug ethernet (the Yammer ritual).

---

## 6. Rail and local history (TR-3, TR-22, TR-24)

Rail is an append-only local store (embedded DB on the store runtime):

- Tickets by state and station
- Local history by phone / Pro / job once bound
- Unbound tickets still stored (TR-22) so a later bind can attach them

Commit from Desk is a Rail insert — that **is** the queue (TR-3). Other Desks on the LAN subscribe. No “send to the other computer” tap.

History lookup: local first, then Sync if online. Empty + last-sync timestamp (TR-23).

---

## 7. Sync (cloud)

When the link is up, Sync pushes and pulls. When it is down, Desk and Runtime ignore it except for the banner (TR-8).

| Channel | Direction | If down |
| --- | --- | --- |
| Ticket / formula history | Up, then down to other stores | Queue locally |
| On-hand / pack size | Down (POS or inventory service) | Show cached + as-of; warn (TR-27, TR-28) |
| Pro Xtra / job / unit | Down, bind up | Phone-only or skip |
| Special orders | Down onto rail (TR-30) | Associate can still walk-up tint |
| Catalog / policy | Down | Use last **full** snapshot (TR-37) |
| Metrics (TR-32, TR-35) | Up | Buffer. Never upload “save %.” |
| Feedback (TR-40) | Up | Local ticket until ack |

**Inventory authority.** TintRail does not invent a second inventory system. It **displays** on-hand and can emit dump/mistint events (TR-29). Decrement of a sold gallon remains POS’s job unless THD later grants a write API. The architecture only requires a **read** of units and pack size, plus an optional write-off event.

**POS.** Desk does not tender. Optional: print or send a SKU list for the register. Exact 360 Commerce contract is an unknown — adapter.

**Auth.** Associate identity is a store concern (SSO or desk login). Tickets record `associate_id` for remakes and metrics. Offline allows the last unlocked desk session with a short timeout.

---

## 8. Resilience scenarios

| Event | OnePaint (public) | TintRail |
| --- | --- | --- |
| Nationwide Order API / Cassandra outage | Desk dead or “manual colorant only” | Runtime tints; Sync queues history |
| UI crash mid-order | Dispense button / session lost | Devices + Formula keep the session; Desk reconnects to the same ticket |
| Spectro unplugged | Matcher “won’t boot,” often blocks the mental model of the whole app | Device status; book + card still work |
| Inventory feed stale | Unclear | Cached on-hand + timestamp; block on zero only if last read was zero and fresh enough, else warn |
| Formula adjust | Label can invert the math | Hash from ack; mismatch metric |

---

## 9. Deployment sketch (concept, not a THD bill of materials)

- **Store runtime:** one small always-on box **or** a leader paint PC plus replicas. Kubernetes-at-the-edge is optional; a supervised local service is enough.
- **Desk:** web or desktop shell **on top of localhost APIs**, so Express can be as fast as HDPS. A pure remote SPA is non-compliant with TR-4.
- **Cloud:** reuse THD palette where useful (Spring Boot services, Cassandra or equivalent for *synced* history, GCP). Cloud is the backup of the store, not the store’s brain.
- **Admin:** regional view of device health, catalog age, offline minutes, remake rate.

No Home Depot API is called by this document. Drivers and Sync adapters are the implementation seam.

---

## 10. Mapping to inferred OnePaint pieces

| OnePaint (inferred) | TintRail |
| --- | --- |
| Angular SPA | Desk (thin) |
| Node / Java backends | Split: Formula + Rail local; Sync cloud |
| OnePaint Order API + Cassandra | Sync history only |
| Browser talking to machines | Devices process |
| Weak offline mode | Runtime is the default |
| RDP to the paint PC | Still possible for support; must not be the availability plan |

The architectural test: unplug the store from the WAN. If a veteran can still rail, tint, label, and find this morning’s unbound tickets, TintRail is on-model. If they cannot, it is OnePaint with a new name.
