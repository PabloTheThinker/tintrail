# OnePaint Gap Analysis → TintRail Requirements

Every row is a public-evidence gap, the desk impact, and the TintRail requirement that closes it. Evidence points to the [research brief source list](01-research-brief.md#10-source-list). Requirements are numbered **TR-** and are binding on the [product concept](03-product-concept.md), [architecture](04-architecture.md), and [UX spec](05-ux-spec.md).

---

## How to read this

- **Evidence** is associate, engineer, or industry signal — not a THD ticket.
- **Impact** is named against real D24 moments: Saturday rush, color match, reorder, stain/sample, nationwide outage.
- **Keep** items at the end are features OnePaint already got right enough to preserve.

---

## G1. Speed — wizard vs five-second HDPS

**Evidence.** Associates: HDPS tab-key, eyes-off-screen, “queue in less than 5 seconds.” OnePaint: multi-step prompts, minutes per can, extra taps to land in the queue. 2019: “slows down the rate you can hammer orders.” 2022: delays on sheen/size, queue lag across PCs. 2026: still “ridiculously slow when inputting orders.”

**Impact.** Saturday rush. The line is the product. A 30–90 second tax per ticket is hours of customer wait and abandoned add-on sales (tape, trays, rollers).

**TintRail requirement.**

- **TR-1 Express path.** A trained associate must enter a known color + product + size + qty and send it to the rail in **one screen, keyboard-first, under 5 seconds** on a warm local cache.
- **TR-2 Guided path.** New hires get a stepped flow. Express and Guided share the same ticket object. Mode is a toggle, not a different app.
- **TR-3 No extra tap to queue.** Committing the ticket *is* putting it on the rail. The tint station sees it without a separate “send to queue” touch.

---

## G2. Reliability — cloud outages stop the factory

**Evidence.** Nationwide / multi-store downs (Nov 2024 hours-long; Apr 2026 “entire system… outside manual coloration add”; May 2026 crashes). Oct 2023 update crashed paint PCs; Kitchen Design and Flooring died in the same window. Offline tint exists; color matcher often will not boot. Dispense button dies mid-order. Launch failures with missing/locked debug logs. IT service line plays a canned message.

**Impact.** A sunny Saturday without OnePaint is “so effed.” Manual colorant-only fallback is not a store plan. Customers assume associates are standing around.

**TintRail requirement.**

- **TR-4 Offline-first runtime.** Store-local TintRail can search the cached catalog, build a ticket, dispense, print a label, and write local history with **no cloud**.
- **TR-5 Degraded spectro, not dead spectro.** Offline or cloud-down mode still talks to the local matcher process. If the matcher itself is down, the UI says so; formula-book and card-scan still work.
- **TR-6 Hardware actions are local.** Dispense and print never wait on a cloud round-trip. A dead Dispense button is a local driver fault, not a spinner on an API.
- **TR-7 Crash isolation.** Catalog UI, formula engine, dispenser driver, and printer driver are separate processes. A UI crash does not take the dispenser session with it.
- **TR-8 Honest outage banner.** When cloud sync is down, the rail stays usable and shows what will sync later (history, inventory confirm, Pro lookup).

---

## G3. Formula correctness — labels lie

**Evidence.** “Huge OnePaint Bug”: after a darker/lighter adjustment, the dispenser adds colorant but the **on-screen recipe and printed label subtract it**. Future lid scans replay the wrong formula. Associate diagnosis: signed −100…+100 scale used as raw arithmetic. Workaround: manual math, manual formula, shoot a hazard can so the save sticks because **Add Paint Label does not work**.

**Impact.** Color match and reorder. The next associate (or the next store) tints from a poisoned label. Customer gets a different wall. Waste and chargebacks.

**TintRail requirement.**

- **TR-9 Single formula engine.** UI never computes colorant amounts. One service owns scale, adjustment, and size conversion. Labels, screen, and dispenser receive the **same gram/shot vector**.
- **TR-10 Unsigned internal scale.** Store −100…+100 (or “tad darker”) as display only. Internally use a 0…200 (or 0…1 relative) multiplier. No negative symbols in mix arithmetic.
- **TR-11 Label equals dispensed.** The barcode and printed recipe are a hash of the vector the dispenser acknowledged, not the pre-adjust request.
- **TR-12 Add Label is a first-class write.** Saving a formula to a customer or reprinting a lid does not require a dummy dispense into the hazard can.

---

## G4. Sample-to-gallon scaling is associate math

**Evidence.** Oct 2019: “Color matched samples require you to manually calculate the new formula yourself if they come back and want a larger quantity.” Industry systems (Datacolor) treat formula scaling as a built-in operation.

**Impact.** Reorder after a sample. Errors at 4× / 5× / 20×. Time lost with a calculator while the line waits.

**TintRail requirement.**

- **TR-13 Automatic size scale.** Any saved or matched formula converts to 8 oz sample, quart, gallon, 5-gallon (and stain sizes) with one size change. Engine refuses illegal overfills (colorant exceeds can headspace) instead of silently clipping.

---

## G5. Search and color data are incomplete

**Evidence.** Searching “black” shows Behr and SW, not Glidden; associate must walk to a card. New Glidden cards scan to **wrong names**. Cross-brand: system “doesn’t allow PPG colors into Behr and vice versa” with no clear associate-facing rule. Veterans: old system named both Glidden and Behr on match and could “scan an atom of a sample.”

**Impact.** Color match and chip lookup. Extra walking, customer arguments, wrong-name labels.

**TintRail requirement.**

- **TR-14 Unified catalog search.** One box: color name, code, brand, sheen alias, and barcode. “Black” must return Glidden, Behr, SW, and store-brand equivalents, ranked, not a single-brand subset.
- **TR-15 Scan truth.** Card scan shows printed name, system name, and code. Mismatches are flagged, not silently renamed.
- **TR-16 Cross-brand as a decision, not a wall.** If a brand-to-base tint is blocked, show **why** and the legal path (match into store brand, special order, or refuse). If it is allowed as a match, say “match, not the OEM formula.”

---

## G6. Spectrophotometer and stain paths are fragile

**Evidence.** Matcher crashes; textured samples fail; Behr stain samples “good luck”; matcher dead in offline mode; customers then demand a rematch and waste product if the visual is off.

**Impact.** Color match and stain/sample. Highest-skill work, worst software.

**TintRail requirement.**

- **TR-17 Matcher as a device, not a webpage.** Local driver owns calibration, measurement, and last-N shots. UI only displays results.
- **TR-18 Texture and multi-spot.** Support average of N shots and a “textured / uneven” mode (industry MetaVue / multi-read pattern). Do not pretend one glossy-card read works on stucco.
- **TR-19 Stain and sample SKUs.** Stain, spray, and 8 oz paths are tested product types, not leftover paint-can screens. If a line cannot be formulated, the engine says so before the associate opens a can.
- **TR-20 Save-on-match.** A successful shot is stored on the ticket immediately, even if the customer later declines a phone number.

---

## G7. Customer save is a gate, then it loses the color

**Evidence.** 2019: phone **and** email required to complete; no clean “no thanks”; associates invent emails; customers walk. 2023–: colors missing under the phone; manager has to ask for a lid photo. DIYers hate the delay; Pros already have a number.

**Impact.** Rush (friction) and reorder (lost history). The feature that was supposed to replace the lid fails both jobs.

**TintRail requirement.**

- **TR-21 Optional, one-field save.** Phone **or** Pro Xtra **or** skip. Email is never required to tint. Skip is a real control, not a fake address.
- **TR-22 History is the ticket.** Every completed dispense writes a local ticket (formula, SKU, adjust, associate, time). Cloud attach to a phone/Pro is a later bind, not a precondition.
- **TR-23 Lookup that fails loudly.** If a phone has no colors, say “none here” plus last sync time. Do not return an empty list that looks like a glitch.

---

## G8. Queue and 2025 layout hide the work

**Evidence.** Queue “sucks (having to touch the screen).” 2025 layout: “bare,” “nothing on half the screen,” **no color preview**, “have to read a lot” in a rush. Associates hoped it was a glitch; cache clear restored the old UI after RDP.

**Impact.** Saturday rush. The tint station is a production board. If you cannot see hue, size, and sheen at a glance, you grab the wrong can.

**TintRail requirement.**

- **TR-24 Rail is visual.** Every ticket shows a **color swatch**, size, sheen, brand line, customer token, and station. No ticket without a swatch (estimated swatch if spectro-only).
- **TR-25 Keyboard and touch peers.** Arrow keys, Enter, and scanner move the rail. Touch is available; it is not required.
- **TR-26 Density for rush.** Express density: many tickets visible. Guided can use more chrome. Empty half-screens are a defect.

---

## G9. Inventory signal is incomplete

**Evidence.** On-hand was the liked 2019 feature. IMS pack size and label spool were missed in 2021. Public docs do not show whether OnePaint stops a tint when the base is out, or how mistints hit inventory.

**Impact.** Rush and freight. Tinting a can that is not on the floor, or not warning on the last 5-gallon, is wasted labor.

**TintRail requirement.**

- **TR-27 On-hand on every SKU step.** Brand/product/size pick shows units on-hand and pack size.
- **TR-28 Block or warn before dispense.** Out-of-stock base: cannot dispense (override with reason). Low stock: warn.
- **TR-29 Mistint / dump path.** A dumped can is a ticket state that can decrement or write-off, not a silent hole.

---

## G10. Special orders and Pro jobs are side doors

**Evidence.** PPG training includes “special order to Onepaint.” Pro Paint 2.0 / Pro Xtra / Project Planning exist beside the desk. Associates treat logo shirts and Pro numbers differently from DIY.

**Impact.** Pro and property accounts expect the same color in any U.S. store. If the desk system does not accept that identity, they re-explain the chip every visit.

**TintRail requirement.**

- **TR-30 Inbound order adapter.** Special orders land on the rail as tickets (SKU, color, promised date), not as a printed email the associate retypes.
- **TR-31 Pro identity.** Pro Xtra / job / unit (property) is a first-class customer key alongside phone. Reorder works store-to-store once synced.

---

## G11. Ops score the wrong thing

**Evidence.** ASM: stores are not “getting credit” for OnePaint because they still use HDPS. No public metric for first-time-right, seconds-to-rail, or outage minutes.

**Impact.** Associates are pushed into the slower system to satisfy a usage checkbox. Speed and accuracy are unmeasured.

**TintRail requirement.**

- **TR-32 Desk metrics, not usage theater.** Log: time-to-rail, time-to-dispense, remakes, label/formula mismatches (should be zero), offline minutes, spectro calibration age, **feedback close rate**. Do **not** score “opened TintRail” or phone-capture %.

---

## G12. Physical bench and training

**Evidence.** Associates: “layout of the paint processing area needs improving.” Training is MMU / HD TV, not public. New hires get a dummy-proof wizard; veterans lose power tools.

**Impact.** Even a fast UI fails if the can, dispenser, printer, and shaker are a maze. Dual skill levels need dual UI, one engine.

**TintRail requirement.**

- **TR-33 Station model.** Tickets know which dispenser, printer, and shaker they are bound to. Multi-station stores see a single rail with station tags.
- **TR-34 In-desk help.** Contextual 15-second help on the current field. No separate LMS tab to finish a can.

---

## G13. Save-rate metrics produce fake customers

**Evidence.** [2023 phone/email thread](https://www.reddit.com/r/HomeDepot/comments/18gafje/getting_every_customers_email_and_phone_number/): fear of write-ups for not asking; customers refuse in a rush. Workarounds: dummy emails (OrderUp then blocks reuse), random phones, **store number**, vendor-confirmed “keep their percentage up.” Saves also vanish on real numbers ([G7](#g7-customer-save-is-a-gate-then-it-loses-the-color)).

**Impact.** Reorder. The history file is polluted. A later associate looks up a real phone and finds nothing, or looks up a garbage key and finds a stranger’s color.

**TintRail requirement.**

- **TR-35 No capture score.** Do not report “% of tickets with phone/email.” Report **% of *willing* saves that later retrieve** (hit rate).
- **TR-36 Skip is audited as OK.** `walk-up` is a success state, not a miss.

---

## G14. Offline catalog is a skinny subset

**Evidence.** 2022 Yammer: unplug ethernet → offline. Lose matcher **and** Dynasty, Ultra, specialty paints. April 2026: when cloud is dead, **manual colorant add** is the only remaining corporate path.

**Impact.** Outage Saturday. The products Pros buy disappear exactly when the store is on its own.

**TintRail requirement.**

- **TR-37 Full last-good catalog offline.** Offline is the last successful catalog, not a “basics only” slice. Missing SKUs are listed, not silently gone.
- **TR-38 Manual-add mode.** A first-class degraded path: type shots, print a true label, write a ticket — without unplugging a NIC.

---

## G15. Duplicate names and feedback black hole

**Evidence.** Two on-screen colors with the same name → purple instead of black. Formula bugs filed via Feedback / Engage / MyApron; the 2026 label-invert bug had **three Feedbacks** and stayed live. Associates cannot edit the file.

**Impact.** Color match and remake. Training becomes “do a sample first” because the UI cannot disambiguate.

**TintRail requirement.**

- **TR-39 Disambiguate every hit.** Brand + code + swatch required; identical display names cannot sit unlabeled.
- **TR-40 Feedback with a close.** Associate report creates a ticket id, attaches chip/SKU/formula/photo, and shows **status** (open / accepted / catalog shipped). Silence is a defect.

---

## Keep list (do not throw away)

| Keep | Why | TintRail mapping |
| --- | --- | --- |
| On-hand visibility | Only universally liked 2019 feature | TR-27, TR-28 |
| Guided prompts for new hires | OnePaint’s dummy-proof flow has a real audience | TR-2 |
| Customer / color history *when it saves* | Reorder without a lid is the right idea | TR-21, TR-22, TR-31 |
| Special-order handoff into the desk | PPG → desk is real work | TR-30 |
| Product organization / cleaner catalog grouping | 2019 praise vs HDPS clutter | TR-14 |
| Offline tinting (the *idea*) | 2022–2023 proof the factory can run local | TR-4, TR-37, TR-38 |
| Sample-before-gallon habit | Associate safety culture when the engine is untrusted | TR-13, TR-17 — make the engine trusted; keep sample-first as a *prompt* on match |
| In-app Feedback *channel* | Right idea, no close | TR-40 |

---

## Requirement index

| ID | Title | Closes |
| --- | --- | --- |
| TR-1 | Express path ≤ 5s | G1 |
| TR-2 | Guided path, same ticket | G1, keep |
| TR-3 | Commit = rail | G1, G8 |
| TR-4 | Offline-first runtime | G2 |
| TR-5 | Degraded spectro, not dead | G2, G6 |
| TR-6 | Local dispense/print | G2 |
| TR-7 | Crash isolation | G2 |
| TR-8 | Honest outage banner | G2 |
| TR-9 | Single formula engine | G3 |
| TR-10 | Unsigned internal scale | G3 |
| TR-11 | Label equals dispensed | G3 |
| TR-12 | Add Label without dummy can | G3 |
| TR-13 | Automatic size scale | G4 |
| TR-14 | Unified catalog search | G5 |
| TR-15 | Scan truth | G5 |
| TR-16 | Cross-brand decision | G5 |
| TR-17 | Matcher as local device | G6 |
| TR-18 | Texture / multi-spot | G6 |
| TR-19 | Stain and sample SKUs | G6 |
| TR-20 | Save-on-match | G6, G7 |
| TR-21 | Optional one-field save | G7 |
| TR-22 | History is the ticket | G7 |
| TR-23 | Lookup fails loudly | G7 |
| TR-24 | Visual rail + swatch | G8 |
| TR-25 | Keyboard and touch peers | G8, G1 |
| TR-26 | Rush density | G8 |
| TR-27 | On-hand on SKU step | G9 |
| TR-28 | Block/warn before dispense | G9 |
| TR-29 | Mistint / dump path | G9 |
| TR-30 | Inbound special orders | G10 |
| TR-31 | Pro identity | G10 |
| TR-32 | Desk metrics | G11 |
| TR-33 | Station model | G12 |
| TR-34 | In-desk help | G12 |
| TR-35 | No capture score | G13, G11 |
| TR-36 | Skip is OK | G13, G7 |
| TR-37 | Full last-good catalog offline | G14, G2 |
| TR-38 | Manual-add mode | G14, G2 |
| TR-39 | Disambiguate every hit | G15, G5 |
| TR-40 | Feedback with a close | G15, G3 |

If a later design decision cannot name a TR- id, it is out of scope or a new gap that must be added here first. Voice: [09-associate-feedback.md](09-associate-feedback.md).
