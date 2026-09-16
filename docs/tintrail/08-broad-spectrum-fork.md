# TintRail Fork: Broad-Spectrum Paint-Desk OS

This document **forks** the original Home Depot–only concept ([03-product-concept.md](03-product-concept.md)) from OnePaint replacement into a **retailer-agnostic factory OS**. The job is [F-01…F-20](07-function-model.md). OnePaint, Lowe’s Zebra+X-Rite, Sher-Color, and COLORx/Datacolor/ColorDesigner PLUS are **packs**, not the product.

Written concept only. No app.

---

## 1. What changed in the fork

| Before (HD TintRail) | After (broad-spectrum) |
| --- | --- |
| Replaces OnePaint | Implements the paint-desk **job** anywhere |
| THD cloud (Cassandra, Order API, Pro Xtra) | **Sync adapters** (THD, generic POS, dealer COLORx-style, none) |
| D24 language only | Same rail; optional kiosk, SMS, bins, Send-to-POS |
| Multi-brand assumed | **Catalog pack:** multi-brand, single-brand, or dealer CCM |
| Register always separate | **Loose** or **tight** POS coupling (F-14) |

The name **TintRail** stays. The rail is the job. Home Depot is the first pack, not the only customer.

---

## 2. Positioning (forked)

TintRail is the operating system of a paint bench: **advise → identify/match → formulate → rail → validate can → dispense → label → shake → remember → pay.**

It is not:

- A consumer color-picker (Behr ColorSmart, ColorSnap Visualizer)
- A replacement for a retailer’s legal POS, unless they choose the tight adapter
- A clone of OnePaint’s wizard or Lowe’s kiosk chrome
- A formula lab (corporate / vendor still owns the OEM file; stores report, they do not fork the database in secret)

It is:

- Offline-first **runtime** + thin desk UI
- One **ticket** through every function
- One **formula engine** (unsigned scale, label = ack)
- **Packs** for catalog, devices, POS, identity, notify

---

## 3. Core vs pack

```
                    TintRail Core
         F-05 Formulate   F-07 Rail   F-09 Dispense
         F-10 Label       F-08 Validate   F-19 Offline
         F-17 Correct     F-18 Maintain   F-20 Metrics
                         |
         +---------------+---------------+
         |               |               |
   Catalog pack    Identity pack    Commerce pack
   (F-02,03,04,06) (F-12,13,16)     (F-14,15)
   HD multi-brand  phone/Pro/job    loose POS
   SW single       6-year archive   tight POS
   Dealer + CCM    tint number      dealer inventory
         |
   Capture pack (F-01, F-07 origin)
   associate-only | customer kiosk | both
```

**Core** ships for every store. **Packs** are configuration + adapters. We do not build twenty products. We turn functions on and bind adapters.

---

## 4. Retailer packs (how we “operate” on each store type)

### 4.1 Pack: Big-box multi-brand (Home Depot / OnePaint-shaped)

- Catalog: Behr + Glidden/PPG + SW cards + stains; crossover policy table (F-04).
- Capture: associate Express + Guided (universal associates). Kiosk optional later.
- Identity: phone **or** Pro **or** skip (F-12). No email gate.
- Commerce: **loose** POS (360 Commerce / FIRST). On-hand read (F-15). Inbound special order (F-16).
- Notify/bin: off by default; can enable if the retailer wants Lowe’s-like pickup.
- Must-haves from HD research: TR-1 speed, TR-4 offline, TR-11 honest label, TR-14 search, TR-24 swatch.

This pack **is** the original TintRail, re-described as configuration.

### 4.2 Pack: Big-box split-brain (Lowe’s-shaped)

- Capture: **customer kiosk** creates tickets (F-01 + F-07). Associate desk still required for match.
- Rail: shared with tinters; handheld alert (F-13).
- Validate can: **mandatory** (F-08) — this pack does not ship without it.
- Match (F-03): must live on the **same ticket** as the queue. Do not repeat Lowe’s “new app / old X-Rite” split.
- Identity: walk-up bind must work without an prior online order.
- Edit: size/color/sheen changeable via F-06 / F-17 (Lowe’s current app cannot).

### 4.3 Pack: Brand store (Sherwin-shaped)

- Catalog: one manufacturer; sheen-aware formulas (F-05).
- Commerce: **tight** POS — ticket line appears on the sales terminal (F-14).
- Identity: any-store archive (F-12) as the default sync, not a phone-optional afterthought.
- Crossover (F-04): always “into our brand,” copy says so.

### 4.4 Pack: Independent dealer (Ace / BM / Datacolor-shaped)

- Expert + Guided modes (already in core).
- Offline (F-19) non-negotiable.
- Tight POS: Send to POS / Retrieve by tint id (F-14, F-12).
- Scan-or-no-shot (F-08).
- Charge accounts and vendor catalog are **outside** core; the ticket only emits tint id + SKU.

---

## 5. Ticket (unchanged object, more origins)

A ticket still carries: color identity, vector + hash, SKU, adjust, customer token, station, state, origin.

**Origins (forked):** walk-up | reorder | spectro | card-scan | special-order | **kiosk** | **online** | **POS-retrieve** | inbound Pro job.

States: `draft → on_rail → validating → dispensing → labeled → shaken → done | binned | dumped | remake`.

`validating` is new vs the HD spec: F-08 is a real state, not a hope.

---

## 6. Principles (forked set)

Keep the HD eight, add three that the industry forced:

9. **Prove the can.** No colorant until the barcode matches the ticket (or an override reason). (F-08)
10. **One brain.** Queue, match, adjust, and label are the same ticket. A “new flow” that cannot talk to the spectro is unfinished. (Lowe’s lesson)
11. **Packs, not forks of math.** Formulate, hash, and label rules are core. Retailers do not get a different mix engine.

---

## 7. Module map (function → product)

| Module | Functions | Notes |
| --- | --- | --- |
| Desk (Express / Guided / optional Kiosk) | F-01, F-02, F-07 | Kiosk is a skin on the same ticket |
| Match pane | F-03, F-04 | Local spectro driver |
| Formula service | F-05, F-06, F-17 | Only math |
| Rail | F-07, F-11, F-16 | Visual, multi-station |
| Devices | F-08, F-09, F-10, F-18 | Scan, shoot, print, maintain |
| Identity / Sync | F-12, F-13, F-16, F-19 | Adapters |
| Commerce | F-14, F-15 | Loose or tight |
| Admin | F-20, F-18 | Health + desk metrics |

HD-only UX screens in [05-ux-spec.md](05-ux-spec.md) remain valid for Pack 4.1. Kiosk, bin, SMS, and Send-to-POS screens are **pack UX**, specified only as: same ticket fields, different entry point.

---

## 8. What we explicitly steal (and refuse)

**Steal**

- HDPS keyboard speed
- OnePaint on-hand + inbound special order + guided hire path
- Lowe’s scan-to-dispense, shared rail, notify, bin
- Sherwin any-store archive + sheen-calibrated formula
- Dealer offline, tint id, Send-to-POS, MetaVue-style customer-visible scan

**Refuse**

- OnePaint email gate and usage-score (**and the fake-PII culture it created**)
- Scoring “% of tickets with a phone”
- OnePaint signed-adjust label math
- Offline catalog that drops the Pro lines (Dynasty / Ultra)
- “Unplug the ethernet” as an official offline plan
- Lowe’s “new queue, old matcher, no edit, no walk-up save”
- Kiosk with a partial catalog, unskippable ads, or ads before commit
- Colorant-generation converters that do not write a ticket
- A self-serve dispenser kiosk (customer may *order*; associate *shoots*)
- Store-side silent edits to the OEM formula file
- Feedback buttons with no ticket status

---

## 9. Success (broad)

TintRail (any pack) is done when:

1. Every F-01…F-20 is either implemented in core or explicitly **off** in the pack file (never silently missing).
2. A veteran rails a known color in ≤ 5 seconds (F-02 + F-07).
3. Cloud down still tints and labels (F-19).
4. Adjust prints the ack vector (F-05 + F-10).
5. Wrong base cannot shoot without override (F-08).
6. Reorder works from lid **or** token **or** tint id (F-12).
7. Tight-POS packs never ring a different color than the rail (F-14).
8. Offline still lists the same products as yesterday (TR-37).
9. Walk-up skip is a success, not a miss (TR-36).
10. A filed formula bug has a status the associate can see (TR-40).

Home Depot success is this list plus the original six-line bar in the [README](README.md). Other retailers use the same list with their pack flags.

---

## 10. Relationship to the first package

- [01](01-research-brief.md)–[05](05-ux-spec.md) remain the **Home Depot deep dive** (Pack 4.1 source).
- [06](06-industry-discovery.md) is **why** we forked (purpose of OnePaint vs other OS’s).
- [07](07-function-model.md) is the **unit of work** — one function at a time, all stores.
- **This file** is the product north star going forward.

Do not implement functions as a sequential app build unless a later goal says so. Operate on them as the checklist for every design decision.
