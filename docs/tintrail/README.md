# TintRail — Paint-desk OS (broad-spectrum)

TintRail is a **written concept** for the operating system of a paint bench: identify a color, formulate it, prove the can, shoot, label, remember, get paid. It started as a Home Depot OnePaint replacement and is now **forked** so the same core can fit Home Depot, a Lowe’s-shaped big box, a Sherwin-shaped brand store, or an independent dealer.

The product spec lives here. The running Phase 1 bench is [`tintrail/`](../../tintrail/README.md) (Desk + local Runtime + mocks). How we make it: [10-build-and-stack.md](10-build-and-stack.md). How it must feel: [11-ux-framework.md](11-ux-framework.md). No retailer APIs and no real dispenser SDK yet.

Start here if you are new: [associate feedback](09-associate-feedback.md) → [industry discovery](06-industry-discovery.md) → [function model](07-function-model.md) → [store-floor production](12-store-floor-production.md) → [retail compare + online](13-retail-compare-online.md) → [broad-spectrum fork](08-broad-spectrum-fork.md) → [UI/UX framework](11-ux-framework.md) → [build and stack](10-build-and-stack.md).

---

## What OnePaint actually is (purpose)

OnePaint is Home Depot D24’s **web factory UI**: lookup, match, tint, label, customer save, on-hand, special orders. Associates say learning it is **90% of the job**. Home Depot hired it to dummy-proof new hires, push history to the cloud, and **score phone/email capture**. Associates invent dummy contacts to keep that percentage up; OrderUp then blocks the fake emails. Offline often means **unplug ethernet**, and the catalog can drop Dynasty/Ultra. Feedback is filed; bugs stay live. The Saturday pit is a **parallel factory**; OnePaint is a **sequential website**.

It is not the register, not FIRST, not Behr ColorSmart. Official manuals and training videos are not public.

---

## Same job, other stores

| Store type | System | What they optimized |
| --- | --- | --- |
| Home Depot | OnePaint | Wizard + cloud history, multi-brand |
| Lowe’s | Zebra kiosk/queue + legacy X-Rite | Scan-to-dispense, SMS, bins — also missing stains, ads-before-commit, split matcher |
| Sherwin-Williams | Sher-Color + ColorSnap Precision | One brand, eye + tinter + **sales terminal**, 6-year any-store archive |
| Independent / Ace | COLORx, Datacolor Paint, ColorDesigner PLUS | Offline, scan-or-no-shot, **Send to POS**, expert mode |

The job is identical. The OS is not. TintRail is the job; those names are **packs**.

---

## Twenty functions (operate on these, not on screens)

Advise → identify → match / crossover → formulate → scale → rail → **validate can** → dispense → label → shake/bin → remember → notify → pay → on-hand → inbound → correct → maintain → offline → measure.

Full purpose, I/O, and retailer variants: [07-function-model.md](07-function-model.md) (**F-01…F-20**).

---

## The bar (any pack)

1. Known color → rail in ≤ 5 seconds (keyboard).
2. Cloud down → still tint and label.
3. Adjust → lid matches the machine.
4. Sample → gallon without a calculator.
5. Skip phone → still a correct can.
6. Every ticket has a swatch.
7. **Wrong base cannot shoot** without an override.
8. Match, queue, and label are **one ticket** (no split-brain).
9. Offline catalog is yesterday’s **full** set, not a skinny subset.
10. Skip-save is a success; capture % is not a KPI.

---

## Documents

| Doc | What it is |
| --- | --- |
| [09 — Associate feedback](09-associate-feedback.md) | 2019–2026 Reddit voice + Lowe’s kiosk; mapped to F-01…F-20 |
| [06 — Industry discovery](06-industry-discovery.md) | Deeper OnePaint purpose + Lowe’s / Sherwin / dealer |
| [07 — Function model](07-function-model.md) | F-01…F-20: purpose, I/O, who, variants |
| [08 — Broad-spectrum fork](08-broad-spectrum-fork.md) | **Current north star** — core vs packs |
| [01 — Research brief](01-research-brief.md) | HD OnePaint stack, hardware, sources, unknowns |
| [02 — Gap analysis](02-gap-analysis.md) | OnePaint flaws → TR-1…TR-40 |
| [03 — Product concept](03-product-concept.md) | Original HD-only TintRail (superseded by 08) |
| [04 — Architecture](04-architecture.md) | Store runtime, formula, devices, sync |
| [12 — Store-floor production](12-store-floor-production.md) | Saturday pit layout: TAKE + MAKE + LINE (KDS), not a wizard |
| [13 — Retail compare + online](13-retail-compare-online.md) | HD vs Walmart / Lowe’s / Ace / Menards / Sherwin; Line + BOPIS rules |

Phase 1–5 factory work lives in the bench: inbound tray + late sort + stale dump, `stageBin` + notify outbox stub, station/device/price/qty scan, pack layouts, synthetic inbound adapter only.
| [11 — UI/UX framework](11-ux-framework.md) | Binding design system: tokens, density, copy, QA gate |
| [10 — Build and stack](10-build-and-stack.md) | How we make it: local runtime, Desk, mocks |
| [05 — UX spec](05-ux-spec.md) | HD pack screens and keyboard map (obeys 11) |

---

## Name

**TintRail** (Desk, Runtime, Sync, Admin) + retailer **packs**. Alternatives considered: BenchOS, HueLine, CanReady.

---

## What this is not yet

A production store install. No Home Depot integration. No real OEM driver. No customer-facing kiosk. Phase 1 is a **local bench demo**. Later phases add match/adjust, packs, Tauri, and other retailers.

---

## Evidence limits

No public OnePaint, Lowe’s, or Sherwin store manual. myApron SOPs are confidential and were not used. Dispenser/spectro OEM per store is unverified. Design uses adapters. Do not treat vendor case studies as SLAs. Associate posts are evidence of **pain**, not of THD policy text.
