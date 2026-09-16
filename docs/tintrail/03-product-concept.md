# TintRail Product Concept

**Name:** TintRail  
**Replaces:** OnePaint (Home Depot D24 paint-desk OS)  
**Audience:** Paint associates, DS / ASM, store leaders, THD product and store-tech  
**Companion docs:** [research](01-research-brief.md), [gaps](02-gap-analysis.md), [architecture](04-architecture.md), [UX](05-ux-spec.md). **North star is now the [broad-spectrum fork](08-broad-spectrum-fork.md).** Associate voice: [09-associate-feedback.md](09-associate-feedback.md).

---

## 1. Name

**TintRail** is the operating system of the paint bench: a rail of cans moving from lookup to tint to shake to handoff.

Why this name, not OnePaint:

- **Throughput, not a form.** “One Paint” sounds like a single website. The job is a line.
- **D24 language.** Associates already talk about the queue, the desk, the can. A rail is that queue made visible.
- **Room to grow.** TintRail Desk (associate UI), TintRail Offline (store runtime), TintRail Pro (account and job books), TintRail Admin (catalog, devices, metrics).

Working alternatives, rejected as primary:

- **BenchOS** — accurate, sounds like internal IT.
- **HueLine** — consumer color-picker vibe.
- **CanReady** — good for a status, weak as a system name.

Use **TintRail** in associate-facing chrome. Do not style it as a DIY color app.

---

## 2. Positioning

OnePaint is a **cloud wizard** laid on a **local factory**. When the wizard is slow or down, the factory stops.

TintRail is the factory OS that **syncs** to Home Depot cloud services. It does the same job — look up, match, tint, label, remember, show on-hand — but the can can still leave the desk when Cassandra, GCP, or the Order API is unreachable.

It is not a new POS. Checkout stays on 360 Commerce / FIRST. TintRail owns the ticket until the can is labeled; POS owns the tender.

---

## 3. Who it is for

| Persona | What they need | Mode |
| --- | --- | --- |
| Veteran (HDPS-era) | Eyes-off-screen, tab, scanner, no lecture | **Express** |
| New hire / backup | Prompts, swatches, “what next” | **Guided** |
| Pro / property account | Same color, any store, job or unit key | Same engine, Pro key |
| DIY walk-up | Fast can, optional save, no email interrogation | Skip-friendly |
| DS / ASM | Rail visibility, remakes, outage minutes | Metrics, not usage credit |

Express and Guided are one product. Switching mid-ticket is allowed. The ticket object does not change.

---

## 4. Principles

1. **Factory first, cloud second.** Local catalog, formula engine, dispenser, and printer are enough to finish a Saturday. Sync is eventual. (TR-4, TR-6)
2. **One ticket, one truth.** Color, formula vector, SKU, adjust, customer token, station, and label hash travel together. The UI does not recompute mix math. (TR-9, TR-11, TR-22)
3. **Five seconds for a known color.** If the associate already knows Behr Marquee Satin gallon in “Swiss Coffee,” the path is one screen. (TR-1)
4. **Save is a gift, not a gate.** Phone or Pro or skip. (TR-21)
5. **If you cannot see the hue, you will tint the wrong can.** Every ticket has a swatch. (TR-24)
6. **Labels cannot lie.** What the dispenser acknowledged is what prints and what a future scan replays. (TR-11)
7. **Say the rule.** Cross-brand blocks, out-of-stock, and offline limits are sentences, not empty lists. (TR-16, TR-23, TR-8)
8. **Score the desk, not the login.** Seconds-to-rail and remakes, not “opened the app.” (TR-32)

---

## 5. Product shape

```
TintRail Desk     associate UI (Express / Guided)
TintRail Runtime  store-local processes: catalog cache, formula, devices, rail
TintRail Sync     cloud: history, inventory confirm, Pro, special orders
TintRail Admin    devices, catalog freshness, metrics, station map
```

A store can lose Sync and still run Desk + Runtime. A store cannot lose Runtime and still tint.

### 5.1 Ticket (the core object)

A **ticket** is the unit of work on the rail:

- Color identity (brand, name, code, match vs OEM formula)
- Formula vector (engine output) + display adjustment
- Product SKU (line, sheen, size, qty) + on-hand snapshot
- Customer token (none | phone | Pro | job/unit) — optional
- Station binding (dispenser, printer, shaker)
- State: `draft → on_rail → dispensing → labeled → shaken → done | dumped | remake`
- Label hash (from dispenser ack)
- Origin: walk-up | reorder | spectro | card-scan | special-order | inbound Pro job

Commiting a draft **is** placing it on the rail (TR-3).

### 5.2 Modes

**Express (TR-1, TR-25)**

- One screen: search/scan, product chips, size/qty, optional customer, Enter to rail.
- Keyboard and scanner complete the path. Touch is optional.
- Color swatch always visible.

**Guided (TR-2, TR-34)**

- Same fields, one primary action at a time, 15-second field help.
- Still shows the swatch and on-hand.
- “Switch to Express” is always available after first week of hire (or immediately if the DS enables it).

### 5.3 Offline (TR-4, TR-5, TR-8)

When Sync is down:

- Cached catalog search works.
- Cached on-hand is shown with **as-of** time; TR-28 warn, do not pretend it is live.
- Local history writes; phone/Pro bind queues.
- Spectro uses the local driver.
- Banner: “TintRail Offline — tinting on. History will sync. On-hand as of 10:14.”

When the matcher hardware is down but Runtime is up: formula book and card scan still work; the banner names the matcher, not “OnePaint is down.”

### 5.4 Formula (TR-9–TR-13, TR-19)

- Engine is the only place mix math lives.
- Display: “10% lighter” / slider. Internal: unsigned scale.
- Size change auto-scales; overfill is a hard stop with a suggested next size or split.
- Stain, spray, and sample are product types with their own fill limits.
- Manual formula is a supported origin, not a shame path — and it still goes through the engine so the label matches.

### 5.5 Customer (TR-21–TR-23, TR-31)

- After or during the ticket: “Save to phone, Pro, or skip.”
- One field. Email is a later optional receipt, never a blocker.
- Reorder: scan lid **or** lookup token. Empty lookup shows “none” + last sync.
- Property / job books (the old Pro Paint 2.0 need) are Pro tickets with a unit key, replayable at any store after sync.

### 5.6 Rail (TR-24–TR-26, TR-33)

The tint station is a production board:

- Rows or cards with swatch, size, sheen, line, token, station.
- Keyboard: j/k or arrows, Enter to pull, S to skip station filter.
- Multi-station: one store rail, tagged D1 / D2.
- Special orders appear as inbound tickets, not retyped emails (TR-30).

### 5.7 Inventory (TR-27–TR-29)

- Every SKU step shows units and pack size.
- Dispense blocked on zero (override + reason).
- Dump / mistint is a ticket state with write-off hook for inventory.

### 5.8 Metrics (TR-32)

TintRail Admin (store + regional) shows:

- Median time-to-rail and time-to-dispense
- Remake rate and label/formula mismatch count (target: 0)
- Offline minutes and spectro calibration age
- Inbound special-order wait time

It does **not** show “% of orders on TintRail vs shadow system.” There is no shadow system.

---

## 6. What TintRail is not

- Not a customer app for picking colors at home (Behr / ColorSmart stay).
- Not a replacement for FIRST or register POS.
- Not a self-dispense kiosk. The dummy-proof OnePaint path trained new hires; it should not train customers to run the dispenser.
- Not a reskin of the Angular wizard with a new logo.
- Not a claim that we have Home Depot’s formula file or dispenser SDK. Adapters are the integration story ([architecture](04-architecture.md)).

---

## 7. Success

TintRail is better than OnePaint when, on a documented Saturday rush and a documented cloud outage:

1. A veteran rails a known color in ≤ 5 seconds (TR-1).
2. The store keeps tinting, labeling, and writing local history (TR-4).
3. A darker/lighter adjust prints the same vector the dispenser shot (TR-11).
4. A sample formula becomes a gallon without a calculator (TR-13).
5. A customer who says no to a phone still gets a correct can (TR-21).
6. The tint station can identify every ticket by swatch without reading a paragraph (TR-24).

Those six are the product bar. Naming, chrome, and cloud features exist to serve them.
