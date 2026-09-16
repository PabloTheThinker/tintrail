# Paint-Desk Function Model

**Purpose of this document:** One function at a time — what it *is*, why the department exists to do it, inputs/outputs, who touches it, and how Home Depot / Lowe’s / Sherwin / dealers implement it. TintRail (broad-spectrum) implements **these functions**, not OnePaint’s screens.

Each function has an id **F-01 … F-20**. The [fork](08-broad-spectrum-fork.md) maps them to product modules. Older HD-only requirements stay as TR-* in [02-gap-analysis.md](02-gap-analysis.md).

---

## How to read a function

- **Purpose** — why the paint department needs it (the job, not the UI).
- **In / out** — the durable objects.
- **Who** — associate, customer, machine, cloud, POS.
- **Store variants** — how each retailer does it today (public evidence).
- **TintRail stance** — one rule for the forked product.

We do not implement these one-by-one as a build order. We **operate** on them one-by-one so the product is the whole factory.

---

## The rail (order of the job)

```
Advise → Identify color → Formulate → Ticket on rail
      → Validate base → Dispense → Label → Shake
      → Remember? → Notify / bin → Pay
      ↘ Match / crossover / scale / correct as needed
      ↘ Maintain machines so the next can is true
```

---

## F-01 — Advise (product, not color)

**Purpose.** The wrong *chemistry* fails even if the color is perfect: exterior vs interior, sheen, primer, stain vs paint, colorant load of the line (e.g. Marquee vs a standard base).

**In:** job (wall, deck, cabinet), sheen ask, budget, existing product.  
**Out:** product family + sheen + size class (not yet a formula).

**Who:** associate (or customer kiosk). Vendor reps train this; software rarely replaces it.

**Variants**

- **HD / OnePaint:** product chips after color; associates told to lean on Behr/PPG reps and “search it up.”
- **Lowe’s kiosk:** a short question tree is the *point* of the customer screen; prices shown so the associate does not run the aisle.
- **Sherwin:** one catalog; sheen is a first-class ColorSnap Precision input.
- **Dealer:** clerk knowledge + POS catalog.

**TintRail:** Advise is a first-class step *or* a skip (veteran already knows). Never hide sheen/line inside an unsearchable dropdown-only list.

---

## F-02 — Identify color (catalog / card / lid)

**Purpose.** Find the **named formula** the manufacturer already computed so the store does not reinvent Swiss Coffee.

**In:** typed name, code, card barcode, lid barcode.  
**Out:** color identity (brand, name, code) + OEM vs match-only flag.

**Who:** associate + scanner. Customer may point at a chip.

**Variants**

- **HD:** multi-brand search; gaps (Glidden black missing); card names can disagree with the system.
- **Lowe’s new app:** dropdown lists; X-Rite database still on the old box.
- **Sherwin:** one palette + closest-color alternatives from the eye.
- **Datacolor / CD+:** formula book + 200k+ fan decks.

**TintRail:** one search box, all brands in the *configured* catalog, scan shows printed name vs system name. Identical display names are illegal without brand + code + swatch (TR-39).

---

## F-03 — Match (spectrophotometer)

**Purpose.** The customer does not have *this* store’s chip. The desk must invent a recipe from a physical sample.

**In:** sample ≥ ~dime/quarter, device calibration, product/base class.  
**Out:** custom recipe + optional closest catalog colors. Shot stored on the ticket immediately.

**Who:** spectro + formula engine. Associate aims; customer may confirm the on-screen image (Ace/MetaVue).

**Variants**

- **HD:** inside OnePaint; textured samples fail; offline matcher often dead; stain path fragile.
- **Lowe’s:** X-Rite iVue / Color iMatch on **legacy** — new queue cannot match yet.
- **Sher-Color:** eye is the product; warns against porous/mirror/high-gloss.
- **Ace / Datacolor Pro:** custom match + correction; multi-spot / imaging for fabric.

**TintRail:** matcher is a local device. Catalog still works if it is unplugged. Texture = multi-shot, not one glossy-card read.

---

## F-04 — Crossover (other manufacturer’s color)

**Purpose.** Keep the sale when they walk in with SW, BM, or PPG in a store that sells something else. “Match into our base,” not “we sell their can.”

**In:** foreign color id or spectro shot + home-brand product.  
**Out:** match recipe + explicit “this is a match, not the OEM formula” + policy if blocked.

**Who:** engine + policy pack (retailer).

**Variants**

- **HD:** associates describe hard Behr ↔ PPG walls; customers fight it.
- **Lowe’s:** BM converter + X-Rite competitive file (public how-to sites).
- **Sherwin:** always into SW.
- **Dealer CCM:** competitive card databases are a paid module.

**TintRail:** policy is data. Never a silent empty search. Say the rule and the legal path.

---

## F-05 — Formulate (the only math)

**Purpose.** Turn color + base + size + adjust into the **colorant vector** that will go in the can. This is the soul of the factory. If this lies, the lid poisons the next visit.

**In:** color identity or match recipe, product, size, display adjust.  
**Out:** vector, display recipe, swatch, hash. Overfill refuse.

**Who:** formula engine only. UI does not add shots.

**Variants**

- **HD:** OnePaint computes; associates cannot edit corporate formulas; **signed adjust bug** on labels; sample vs gallon shifts reported as data errors.
- **Sherwin:** ColorSnap Precision by product *and* sheen.
- **Datacolor:** volume/weight, Smart Match, correction module.
- **Lowe’s new app:** no adjust / no manual until X-Rite is wired.

**TintRail:** unsigned internal scale; label = dispenser ack; stores report bad OEM data, they do not silently rewrite it — but **adjust and manual formula** are first-class *ticket* operations.

---

## F-06 — Scale

**Purpose.** Same color, different can. Sample → gallon → 5-gal without a calculator.

**In:** existing vector + new size.  
**Out:** scaled vector or OVERFILL.

**Who:** formula engine.

**Variants**

- **HD:** often **manual math**; known sample-perfect / gallon-wrong cases.
- **Industry (Datacolor):** built-in formula scaling.
- **Lowe’s new app:** cannot change container after create.

**TintRail:** size change is one field. Illegal fill is a stop, not a clip.

---

## F-07 — Ticket / rail (queue)

**Purpose.** Taking the order and shooting the can are often **two people or two moments**. The rail is the handoff. Saturday is many tickets, not one wizard.

**In:** complete draft (color, product, qty, optional customer).  
**Out:** ticket on a station-tagged rail. Commit **is** queue.

**Who:** associate (or customer kiosk creating a ticket). Tint station pulls.

**Variants**

- **HD:** separate queue UI, extra taps, no swatch in the 2025 layout.
- **Lowe’s:** shared queue across Zebra app and tinters; inbound online + kiosk.
- **Sherwin / dealer:** often one person, still a list when busy.

**TintRail:** visual rail, swatch required, keyboard and touch. Kiosk is just another ticket origin.

---

## F-08 — Validate base (scan the can)

**Purpose.** The #1 mistint is the **wrong base** under a correct recipe. Prove the open can is the SKU the formula expects **before** colorant moves.

**In:** ticket SKU + can barcode.  
**Out:** allow dispense | reject.

**Who:** scanner + devices process.

**Variants**

- **HD:** not publicly described as a hard gate.
- **Lowe’s new:** **scan required** to Validate and Dispense; qty 2 = scan can 2.
- **Stayton Ace:** no scan, no shot — mistint pile shrank.
- **Sherwin:** SKU is in the same terminal story.

**TintRail:** scan-to-shoot is default. Override is a reason code (empty barcode, damaged label).

---

## F-09 — Dispense

**Purpose.** Put the vector into the can, accurately, locally, without waiting on a website.

**In:** validated ticket + dispenser health.  
**Out:** ack amounts (or ack-as-sent).

**Who:** dispenser driver. Associate opens the lid and holds the can.

**Variants**

- **HD:** OnePaint Dispense button; dies mid-order; cloud outages stop the mental model.
- **Lowe’s:** tinter on the shared queue.
- **All:** hardware maintenance (F-18) decides accuracy.

**TintRail:** local driver; UI crash must not kill the session.

---

## F-10 — Label

**Purpose.** The garage in 2036 is the database. The lid must carry a **true** recipe (and a scan id) so any store or any future associate can remake it.

**In:** ack vector + hash + human names + date + store.  
**Out:** durable printed label + barcode.

**Who:** printer driver.

**Variants**

- **HD:** labels can **lie** after adjust; Add Paint Label broken (hazard-can workaround). IMS-era spool missed.
- **Lowe’s / Zebra:** designed for decade-readable type.
- **Sherwin:** part of the terminal archive story.
- **Dealer:** label + tint number.

**TintRail:** print only after ack. Add Label is a write, not a dummy dispense.

---

## F-11 — Shake / handoff physical

**Purpose.** Colorant on the bottom is not a color. Then the can leaves the pit (customer hands, pickup bin, or “paint pickup” counter).

**In:** labeled can.  
**Out:** ticket state `shaken` → `done` or `binned`.

**Who:** associate + shaker. Optional shaker-busy status.

**Variants**

- **HD:** shaker is physical; pickup is a separate person in the Saturday story.
- **Lowe’s:** explicit **bin / location** then close.

**TintRail:** station knows a shaker; bin location is an optional ticket field (big-box pack).

---

## F-12 — Remember (customer / job history)

**Purpose.** Reorder without the lid: phone, Pro, property unit, or tint id. The *idea* OnePaint sold. The *execution* cannot be a gate that then loses the color.

**In:** optional token.  
**Out:** ticket bound to a file; lookup returns tickets or a loud empty.

**Who:** associate (ask once). Cloud sync when up.

**Variants**

- **HD:** phone **and** email to complete; saves vanish; Pro number for contractors. **2023:** dummy emails, store phone, vendor-coached random numbers to hit capture %. OrderUp blocks reused fakes.
- **Lowe’s new:** history tied to **online** orders; walk-up often unsaved unless checkout scans.
- **Sherwin:** six-year any-store archive — the gold standard for Pros.
- **COLORx:** tint number + Retrieve from POS.

**TintRail:** one field or skip. Ticket exists unbound. Email never required to tint. Pro / job / tint id are equal keys. **Never score capture %** (TR-35, TR-36).

---

## F-13 — Notify and pickup

**Purpose.** The customer should not hold the desk hostage while the machine runs. The associate should not stand watch.

**In:** ticket `done` or `binned` + phone.  
**Out:** SMS / app ping / “ready at bin 4.”

**Who:** sync + handheld.

**Variants**

- **HD:** not a OnePaint headline; people wait at the desk.
- **Lowe’s:** SMS + TC53 alerts — this is their differentiator.
- **Sherwin / dealer:** usually counter call.

**TintRail:** optional Notify adapter. Function exists; Home Depot pack can turn SMS off until legal/process exists.

---

## F-14 — Pay (POS coupling)

**Purpose.** Charge for **what was tinted**, not what someone remembered to ring. Inventory and mistint accounting follow the same object.

**In:** ticket (SKU, qty, tint id, color name).  
**Out:** tender on the retailer’s POS. Optional write-off on dump.

**Who:** POS. Tint OS does not take cards.

**Variants**

- **HD:** separate register; coupling unpublished.
- **Lowe’s:** barcode at checkout to persist the order.
- **Sherwin:** sales terminal *is* in the Sher-Color loop.
- **COLORx + Rundoo:** Send to POS / Retrieve from POS.

**TintRail:** two adapters — **loose** (print/SKU for a foreign register) and **tight** (push line + tint id). Same ticket.

---

## F-15 — On-hand and pack

**Purpose.** Do not start a 5-gal if the base is not on the floor. Show pack size for freight brains (IMS).

**In:** SKU.  
**Out:** units, pack, as-of time.

**Who:** inventory feed (read). Associate sees it at product pick.

**Variants**

- **HD:** on-hand was the liked OnePaint feature; IMS pack size was missed.
- **Dealer POS:** inventory *is* the product.
- **Lowe’s kiosk:** price more than stock in public write-ups.

**TintRail:** on-hand on every SKU step; warn/block before dispense; stale cache labeled.

---

## F-16 — Inbound (online, special order, vendor)

**Purpose.** The ticket did not start at the desk. PPG special order, homedepot.com / lowes.com paint, Pro job list — still a can on the rail.

**In:** external order.  
**Out:** rail ticket, origin = inbound.

**Who:** sync.

**Variants**

- **HD:** “special order to Onepaint” vendor training.
- **Lowe’s:** online orders appear on the Zebra queue.
- **Pro tools:** Project Planning / old Pro Paint 2.0 — still need a desk landing zone.

**TintRail:** inbound adapter. Associate does not retype a vendor email.

---

## F-17 — Correct / remake / dump

**Purpose.** First can is wrong: adjust, remake, or dump. Waste must be a ticket state, not a silent hole.

**In:** existing ticket + reason.  
**Out:** new vector or `dumped` + remake link.

**Who:** associate + engine. Corporate formula file stays read-only unless they push a catalog fix.

**Variants**

- **HD:** adjust slider (buggy label); manual formula; hazard can; feedback button for OEM errors.
- **Datacolor Pro:** correction module.
- **Lowe’s new:** no edit after create (until X-Rite).

**TintRail:** adjust and remake on the ticket; dump reason; OEM errors go to a report channel, not a store-side secret fork of the formula file.

---

## F-18 — Maintain (dispenser, spectro, colorant)

**Purpose.** A dirty nozzle or overfilled canister makes every function above a liar. This is D24 close-work: purge, wet sponge, do not bury the paddle, check colorant labels, calibrate the eye.

**In:** device status, time of day.  
**Out:** healthy / jammed / needs purge / calibration due.

**Who:** associate + devices process. UI should **prompt**, not assume.

**Variants**

- **HD:** tribal knowledge in crash-course threads; OnePaint console for open-nozzle.
- **Industry dispensers:** vendor maintenance modes.
- **Sherwin:** “color hygiene” as culture.

**TintRail:** maintenance is a function with a checklist and a lock (“D1 cannot shoot until purge”). Not a PDF in the break room.

---

## F-19 — Offline continue

**Purpose.** The WAN dies. Saturday does not.

**In:** last catalog, last on-hand, local history.  
**Out:** finished cans, queued sync.

**Who:** store runtime.

**Variants**

- **HD:** offline tint exists (unplug ethernet + reboot); matcher often dead; catalog **shrinks** (Dynasty/Ultra/specialty gone); nationwide downs; last resort = **manual colorant add**.
- **Datacolor:** online *and* offline data update is a selling point.
- **Lowe’s Zebra:** cloud-ish kiosk; not sold as offline-first.

**TintRail:** runtime is the default. Banner tells the truth. Offline catalog = last **full** snapshot (TR-37). Manual-add is a mode, not a NIC ritual (TR-38).

---

## F-20 — Measure the desk (not the login)

**Purpose.** Improve cans-per-hour and first-time-right. Do not score “opened the website.”

**In:** ticket timestamps, remakes, mismatches (target 0), offline minutes, calibration age.  
**Out:** store / regional view.

**Variants**

- **HD:** credit for OnePaint *usage*.
- **Lowe’s Zebra:** vendor claims fewer errors, less training time.
- **Dealer POS:** tint vs sale mismatch is money.

**TintRail:** F-20 metrics only — plus **feedback close rate** (TR-40). Never phone-capture %.

---

## Function × retailer (quick map)

| Function | HD OnePaint | Lowe’s new | Sher-Color | Dealer tint OS |
| --- | --- | --- | --- | --- |
| F-01 Advise | Weak | Kiosk strong | Brand-strong | Clerk-strong |
| F-02 Identify | Multi-brand, gaps | Dropdown / old X-Rite | One palette | Formula book |
| F-03 Match | In-app, fragile | Legacy only | Core | Core (Pro) |
| F-04 Crossover | Opaque blocks | Converters | Into SW | CCM module |
| F-05 Formulate | UI-mixed, bugs | Incomplete | Precision | Engine |
| F-06 Scale | Often manual | Can’t edit size | Built-in | Built-in |
| F-07 Rail | Extra taps | Shared queue | Light | Light |
| F-08 Validate can | Unclear | **Required** | Coupled | **Required** (best) |
| F-09 Dispense | Cloud-tied | Queue-tied | Local loop | Local |
| F-10 Label | Can lie | Decade type | Archived | Tint # |
| F-11 Shake / bin | Physical / pickup | **Bins** | Counter | Counter |
| F-12 Remember | Gated, flaky | Online-first | **6-year** | Customer file |
| F-13 Notify | Rare | **SMS** | No | No |
| F-14 Pay | Separate | Barcode | **Integrated** | **Send to POS** |
| F-15 On-hand | Liked | Price-first | Store stock | Native |
| F-16 Inbound | Special order | Online queue | Jobs | PO / charge |
| F-17 Correct | Workarounds | Missing | Lab + store | Correction |
| F-18 Maintain | Tribal | Hardware | Hygiene | Vendor |
| F-19 Offline | Partial | Weak | Local heritage | Strong |
| F-20 Metrics | Usage theater | Vendor KPIs | Brand QA | Margin |

---

## What we keep from each

- **From HD / OnePaint:** multi-brand bench, on-hand, inbound special order, guided mode for universal associates.
- **From HDPS:** five-second keyboard identify + ticket.
- **From Lowe’s:** validate-scan, shared rail, notify, bin, customer-origin ticket.
- **From Sherwin:** any-store archive, sheen-aware formula, tint+sale as one story when the retailer wants it.
- **From dealers:** offline, expert mode, Send-to-POS, scan-or-no-shot, correction as a module.

The fork is that union. See [08-broad-spectrum-fork.md](08-broad-spectrum-fork.md).
