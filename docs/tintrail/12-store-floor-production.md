# Store-floor production — layout and function

**Date:** 2026-09-15  
**Status:** Binding research for Desk production layout. Does not replace [11-ux-framework.md](11-ux-framework.md) or [07-function-model.md](07-function-model.md). It decides how those functions sit on a Saturday bench.  
**Evidence limits:** No public OnePaint / myApron / Sher-Color manuals. Associate posts are pain, not policy. Vendor case studies are marketing, not SLAs.

---

## 1. The question

The last Desk pass made TintRail **easy for one person, one can**. That is necessary and not enough.

A retail paint desk is a **small factory on a sales floor**. On a Saturday the same computer must:

1. Take the next walk-up while a can is already shooting.
2. Keep every open can visible (swatch, size, how long it has waited).
3. Let a mixer pull the next ticket without losing the draft of the person still talking.
4. Survive a universal associate from Tools, gloves, and a dead WAN.

If the UI is a three-tab wizard (Find → Mix → Sample), it is still a **sequential website**. OnePaint’s core failure was the same mismatch: one customer at a time on a parallel pit ([06-industry-discovery.md](06-industry-discovery.md) §2.2).

---

## 2. What a store actually does (not what a screen does)

Reconstructed from [09-associate-feedback.md](09-associate-feedback.md), [06](06-industry-discovery.md), and public Lowe’s / Sherwin / KDS sources.

### 2.1 Home Depot D24 pit

Simultaneous, not queued-in-software:

- Line at the desk (“just a quick question” behind the dispensers).
- Walk-up color + product interrogation.
- Sample rematch.
- Printed / online **pickup**.
- Mix, purge, shake, recover aisles.

Associates named the target in 2019: **“It should be like a deli… take the order, make the sandwich.”** HDPS veterans hit ~5 seconds to queue. OnePaint added on-hand and cleaner chips, then added **extra taps and a second “send to queue.”** When the WAN died, tint sometimes survived and Dynasty/Ultra vanished. When the queue locked (~10 minutes, Apr 2026), the store asked whether they could still take orders on a sunny Saturday.

**Function the layout must protect:** F-07 Rail is a **shared line**, not a page you visit after Find.

### 2.2 Lowe’s (Zebra, 100+ stores, expanding)

Public model (Zebra / NRF 2026 / r/Lowes test-store posts):

| Surface | Job |
| --- | --- |
| Customer KC50 | Question tree → order |
| Associate KC50 | Shared queue + tinter + **price** |
| TC53 handheld | Alert so they can leave the desk |
| DS8108 | Scan can → dispense; scan again for qty > 1 |
| ZD411 | Garage-readable label |
| SMS | Ready / pickup |

Steal: **one shared queue**, scan-to-shoot, price on the ticket, ready text, handheld ping.  
Refuse (r/Lowes): unskippable 15s sundries ad, incomplete catalog (stains / primers missing), X-Rite still on the old box, dropdown-only product lists, orders you cannot edit, bin hardware blocking the entrance, alerts that fire for the wrong store.

### 2.3 Sherwin-Williams store

Sher-Color **eye + dispenser + sales terminal + label** are one ticket. Six-year any-store archive. One brand, so Identify is cheap. ColorSnap Studio is the *chip wall*, not the mixer OS. Steal: match shot lands on the same ticket as pay. Do not copy the consumer Visualizer into Desk.

### 2.4 Grocery deli / restaurant KDS (the deli they asked for)

Kitchen Display Systems (FoodStorm grocery, Agilysys, Shift4, typical QSR KDS):

- Every open ticket visible at once.
- **Elapsed time** on every card; color when it ages.
- One tap / bump bar to advance New → Preparing → Ready.
- Counter, kiosk, and online land on **one queue**.
- Station screens can differ (grill vs expo); expo sees the whole line.
- High contrast, large targets, no browser chrome.

A paint pit is a two-station kitchen: **Take** (counter) and **Make** (tinter). Pickup/bin is expo.

---

## 3. Layout options (evaluated)

### Option A — Sequential tabs (current simplified Desk)

```
[ 1. Find color ] [ 2. Mix can ] [ Match a sample ]
```

Find hides Mix. Mix hides search. Sample hides both. Add-to-list **jumps** to Mix.

| For | Against |
| --- | --- |
| Easy first-day story | Saturday: cannot take #2 while #1 shoots |
| Large buttons | Rail disappears or moves depending on tab |
| Matches user “make it simple” ask | Recreates OnePaint’s one-at-a-time website |

**Verdict:** training mode only. Illegal as the only production layout.

### Option B — Two desks (order PC + tint PC)

HD already runs multiple paint PCs. OnePaint’s queue delay between them was a complaint (“delay between order being sent and actually showing up”).

TintRail already has a **local rail**. Two windows on two machines is correct **if they share the same Runtime**. The layout on *each* machine must still show the line.

**Verdict:** hardware pattern, not a UI. Keep. Do not require two PCs to take-and-mix.

### Option C — Lowe’s split (customer kiosk + associate tinter)

Kiosk never shoots (fork rule). Associate screen is almost a KDS.

**Verdict:** optional pack later. HD Saturday still has the associate *taking* the order. Desk must do Take + Make without a kiosk.

### Option D — Production pit (recommended)

One screen, three persistent regions. No tab destroys a region.

```
┌─ Search / scan (always) ──────────────────────────────────┐
│  Offline / error sentence                                 │
├─ TAKE (left) ──────────────────┬─ MAKE (right) ───────────┤
│  Hits + swatch                 │  Active can + one Next   │
│  Paint / finish / size         │  Use this code           │
│  Add to mix list / walk-in     │                          │
├────────────────────────────────┴──────────────────────────┤
│  LINE (KDS)  Waiting · Mixing · Ready   age  swatch       │
└───────────────────────────────────────────────────────────┘
```

Match-a-sample **replaces TAKE only**. MAKE and LINE stay. The mixer does not go blind because someone held a pillow to the eye.

Add-to-list **does not leave TAKE**. The new ticket appears on the LINE. MAKE stays on the can already shooting.

**Verdict:** this is the deli. Ship this as Desk default.

---

## 4. Production workflow (happy Saturday)

| Beat | Who | Function | UI |
| --- | --- | --- | --- |
| 1 | Counter | F-02 Identify | Type / scan; two Blacks show two swatches |
| 2 | Counter | F-01 Advise | Paint / finish / size chips; on-hand; qty |
| 3 | Counter | F-07 / F-12 | **Add to mix list** or **No phone — walk-in**. Skip is success |
| 4 | Mixer | F-08–F-11 | Pull oldest Waiting (or tap the card). Scan can. One Next: check → mix → print → done |
| 5 | Either | F-03 | Sample drawer on TAKE; shot writes the same ticket type |
| 6 | Either | F-16 | Pickup / inbound is a LINE card with a Pickup chip, not a different app |
| 7 | Either | F-19 | Kill sync: LINE and MAKE still work; on-hand says *as of* |

Rules:

- **Commit = on the rail.** No second send (TR-3, F-07).
- **Wrong base cannot shoot** (F-08). Use this code is a scanner stand-in, not a skip of identity.
- **Formula never uses display −100…+100** (F-05).
- **Desk crash must not kill an in-flight dispense** (Runtime owns the shot).
- **No capture KPI.**

---

## 5. Audit of the simplified Desk (2026-09-15)

Living code: `tintrail/apps/desk`.

| Production need | Current | Gap |
| --- | --- | --- |
| Take while mixing | Tabs hide Find when Mix is open | Sequential website |
| Search always armed | Search hidden on Mix / Sample | `/` veterans lose the box |
| LINE always visible | Bottom rail on Find only; side list on Mix | Line moves; Ready leftovers dominate |
| Ticket age | Removed in simplify | Mixer cannot see who waited |
| Add stays on Take | Auto-jumps to Mix | Cannot stack the next walk-up |
| Qty | Hard-coded 1 | Multi-can Pros (Lowe’s scan-again) |
| Inbound / pickup | Origin exists on ticket, unused in UI | Pickup person in the Saturday pile (F-16) |
| Price | None | Lowe’s associates use on-ticket price |
| Station D1/D2 | Not shown | Two mixers, one rail |
| Device named when bad | One “Offline” chip | UX-6 wants the *device* |
| Large buttons + skip-save | Present | **Keep** |
| Swatch on every hit | Present | **Keep** |
| One Next on Make | Present | **Keep** |
| Help as four steps | Present | Rewrite to pit, not wizard |

---

## 6. What to change vs keep

### Change (this pass)

1. **Production pit shell** — TAKE + MAKE + LINE always on. Sample overlays TAKE.
2. **Add does not navigate away.**
3. **LINE is a KDS strip** — swatch, name, size, Waiting/Mixing/Ready, age, walk-in vs named.
4. **Qty chips** on TAKE (1–4).
5. **Help** describes the pit: take the order, mix from the line.

### Keep

- Large yellow primary, walk-in as a first-class control.
- Formula math on Runtime only.
- Skip-save is success.
- Offline still tints.
- No F-key wallpaper (shortcuts stay silent).
- Synthetic catalog only.

### Later (do not fake)

| Item | Why later |
| --- | --- |
| On-ticket price | Needs POS / pack price file |
| Handheld ping / SMS | Needs store SMS + device fleet |
| Customer kiosk | Pack, never shoots |
| True inbound from OrderUp / BOPIS | No retailer API |
| Second physical station lock | Runtime already has `station`; UI chip after two-PC test |
| Spectro multi-spot | Device adapter, not a layout |

---

## 7. Mapping to F-01–F-20 and associate brief

| Associate ask ([09](09-associate-feedback.md) §3) | Layout / function |
| --- | --- |
| Deli speed | TAKE and MAKE on one screen; commit = rail |
| Bypass email | Walk-in button stays |
| Offline full catalog | Unchanged Runtime rule; LINE still works |
| Queue with no ritual tap | Card tap = pull; no send-to-queue |
| Labels match machine | Unchanged hash/ack |
| Sample math | Scale stays in Formula; Sample does not steal MAKE |
| Swatch in a rush | LINE cards ≥ 48px swatch |
| Two Blacks | Unchanged search rows |
| Credit for cans done right | LINE age + remakes later; no capture % |
| Feedback that closes | Out of Desk; do not add a vanity meter |

---

## 8. QA gate (production pit)

In addition to [11](11-ux-framework.md) §13:

- [ ] TAKE, MAKE, and LINE are all visible at 1366×768 without opening a tab
- [ ] Adding a walk-in does not hide TAKE
- [ ] LINE shows age and a swatch
- [ ] Sample does not hide MAKE or LINE
- [ ] Sync killed: search, add, mix, print still work
- [ ] Two “Black” hits still show two brands + two swatches

---

## 9. Sources (this pass)

- [09-associate-feedback.md](09-associate-feedback.md), [06-industry-discovery.md](06-industry-discovery.md), [07-function-model.md](07-function-model.md), [11-ux-framework.md](11-ux-framework.md)
- [One Paint System (r/HomeDepot, 2019)](https://www.reddit.com/r/HomeDepot/comments/bvsltz/one_paint_system/) — slower to hammer the queue; on-hand liked
- [OnePaint exceedingly slow (2022)](https://www.reddit.com/r/HomeDepot/comments/y50b0c/onepaint_exceedingly_slow/) — inter-PC queue delay; dead Dispense
- [Huge OnePaint Bug](https://www.reddit.com/r/HomeDepot/comments/1qk9iuk/huge_onepaint_bug/) — label invert; dummy-can folklore
- [Zebra / Lowe’s paint journey](https://www.zebra.com/us/en/resource-library/success-stories/how-lowes-redefined-the-paint-buying-journey-with-zebras-connected-technology.html) — kiosk + associate KC50 + scan + SMS (marketing)
- [What fresh hell (r/Lowes)](https://www.reddit.com/r/Lowes/comments/1rq4ezs/what_fresh_hell/) — validate/dispense/scan; qty rescan; no edit; X-Rite split
- [Sher-Color](https://www.sherwin-williams.com/painting-contractors/business-builders/sw-article-pro-shercolor) — eye + dispenser + sales terminal + 6-year archive
- [FoodStorm grocery KDS](https://foodstorm.com/blog/what-grocers-can-learn-from-restaurants-by-implementing-a-kitchen-display-system-kds) — perimeter departments as kitchens
- Typical restaurant KDS (Agilysys, Shift4, Restrofi): elapsed time, one-tap stage, multi-station

**Not used:** myApron SOPs, OEM dispenser SDKs, Home Depot APIs.
