# TintRail UX Spec

Written screens and shortcuts. Visual and interaction **rules** live in the [UI/UX framework](11-ux-framework.md) (tokens, density, copy, QA gate). This file is the screen inventory. A screen that fails the framework gate does not ship.

Every screen must keep a **color swatch** on the active ticket (TR-24, UX-2). Keyboard and touch are peers (TR-25, UX-3). Modes: **Express** and **Guided** (TR-1, TR-2, UX-9).

---

## 1. Chrome (all screens)

**Left / top persistent**

- Store number, associate, station id (D1 / D2)
- Mode toggle: Express | Guided
- Status chips: Cloud (live / offline), Catalog as-of, Spectro, Dispenser, Printer
- Search / scan field (always focusable with `/`)

**Banner (TR-8)** — only when something is degraded, in one sentence:

- `TintRail Offline — tinting on. History will sync. On-hand as of 10:14.`
- `Spectro not ready — card and catalog still work.`
- `Dispenser D1 jammed — rail moved to D2?`

**Ticket strip** — current draft: swatch, name, code, size, sheen, qty, customer token or `Walk-up`.

**Help (TR-34)** — Guided: 15-second text under the focused field. Express: `F1` opens the same text, does not steal the ticket.

Empty half-pages are a defect (TR-26).

---

## 2. Keyboard map (HDPS muscle memory, TR-1, TR-25)

| Key | Action |
| --- | --- |
| `/` | Focus search / scan |
| `Tab` / `Shift+Tab` | Next / previous field |
| `Enter` | Advance or **commit to rail** when the ticket is complete |
| `Esc` | Back one step; does not destroy the draft |
| `F2` | Toggle Express / Guided |
| `F3` | Pull next ticket on this station (tint view) |
| `F4` | Reorder / lookup |
| `F5` | Spectro measure |
| `F6` | Manual formula |
| `F7` | Add / reprint label (no dummy can) |
| `F8` | Dump / mistint |
| `F9` | Bind phone or Pro |
| `Alt+S` | Skip save (walk-up) |
| `↑` `↓` or `j` `k` | Move rail selection |
| Space | Toggle station filter |

Scanner input always lands in search, even if another field is focused, unless the spectro or manual-formula pane has capture.

---

## 3. Home / search (TR-14, TR-15, TR-27)

**Purpose.** Start every walk-up: type, scan a card, or scan a lid.

**Express layout**

- Search box (default focus)
- Results: dense rows — swatch, brand, name, code, “OEM” or “Match”
- On-hand for the last-used product line appears as the associate tabs into product chips
- Recent tickets for this station (last 10)

**Guided layout**

- Same results, larger hit targets
- Prompt: “Scan a chip, type a name, or press F5 to match a sample.”

**Rules**

- Query `black` lists Glidden, Behr, SW, and store brands (TR-14).
- Two hits that share a display name **must** show brand, code, and swatch side by side (TR-39). Never “Black” twice with no chip — that mix was purple.
- A card scan that disagrees with the printed name shows **both** names and a mismatch chip (TR-15).
- Lid scan loads the hashed formula (reorder), not a name guess.

**Primary action.** Selecting a color opens **Express order** (or Guided product step) with the swatch locked in.

---

## 4. Express order (TR-1, TR-3, TR-21, TR-27, TR-28)

**One screen.** This is the five-second path.

```
[SWATCH]  Swiss Coffee   Behr  S-W-1234   OEM
          Marquee  |  Premium Plus  |  Dynasty     ← product chips
          Flat  Eggshell  Satin  Semi  Gloss       ← sheen
          8oz  Qt  Gal  5gal     Qty [ 2 ]
          On-hand: 14 gal   Pack: 2                ← TR-27
          Customer: [ phone / Pro / skip ]
          [ Enter — Rail it ]
```

**Flow**

1. Color already chosen (or typed in search with a unique hit).
2. Tab through product, sheen, size, qty. Last-used product is preselected.
3. On-hand updates per SKU. Zero stock: commit disabled unless override + reason (TR-28).
4. Customer field is optional. `Alt+S` or empty + Enter = walk-up (TR-21, TR-36). Walk-up is **not** a failed KPI.
5. Enter commits. Ticket is **on the rail**. There is no second “send to queue” (TR-3).

**Errors that stay on this screen**

- Overfill after a prior sample scale (engine message + suggested size)
- Cross-brand block with the policy sentence and one alternative (TR-16)

---

## 5. Guided order (TR-2)

Same ticket. Steps: Color → Product → Sheen → Size/qty (on-hand visible) → Save optional → Confirm rail.

Each step shows the swatch and a back control. Confirm copies Express’s commit. “Express” in the chrome jumps to the one-screen layout without losing fields.

---

## 6. Color match / spectro (TR-17, TR-18, TR-19, TR-20)

**Purpose.** Customer has a chip, fabric, or dirty lid, not a code.

**Layout**

- Live device status and last calibration time
- Big **Measure** (`F5`)
- Shot list: swatch per shot, option to average N (TR-18)
- Texture toggle: `Smooth` | `Textured / uneven` (multi-spot instructions)
- Engine results: closest catalog names **and** custom recipe, each with swatch
- Product / sheen / size (same chips as Express)
- Save-on-match: the shot is on the ticket immediately (TR-20), before any phone

**Stain / sample (TR-19)**

- Product type filter includes Stain, Spray, 8oz.
- If the engine cannot formulate that type, the result is a refusal **before** a can is opened.

**Offline.** If Sync is down but SpectroDriver is up, measure still works (TR-5). If the driver is down, this pane is disabled; search stays available.

---

## 7. Reorder / lookup (TR-23, TR-31)

`F4`

- Fields: phone, Pro, job/unit, or lid scan
- Results: tickets with swatches, date, store, size, sheen
- Empty: `No colors for this number. Last sync 10:14. Scan a lid or start a new match.` (TR-23)
- Selecting a row opens Express with formula + last product, size changeable (TR-13)

---

## 8. Rail / queue (TR-24, TR-25, TR-26, TR-30, TR-33)

**Tint-station view** (can be a second PC or a pane)

Dense table, not a marketing landing page:

| Swatch | Color | Line / sheen | Size × qty | Token | Station | State | Age |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ## | Swiss Coffee | Marquee Satin | Gal × 2 | ••12 | D1 | on_rail | 0:40 |
| ## | Custom match | Stain — cedar | Qt × 1 | Walk-up | D1 | on_rail | 1:10 |
| ## | Special: PPG | — | 5gal × 1 | Job 88 | D2 | inbound | 2:00 |

- Inbound special orders are rows, not emails (TR-30).
- `F3` / Enter pulls the selected ticket to **Dispense**.
- Filter: my station / all. Keyboard moves selection.

**Dispense pane**

- Swatch, recipe lines from Formula (not from Desk math)
- `Dispense` — local driver (TR-6)
- Progress / jam from Devices
- Auto-print on ack (label = ack vector, TR-11)
- Then `Shaken` / `Done` or `F8` dump

---

## 9. Manual formula (TR-9, TR-12)

`F6`

- Colorant grid with shots; Desk sends the grid to Formula; Formula returns vector + overfill check
- Used for corrections and associate-computed recipes
- Saving is `F7` Add Label — writes Rail history **without** a hazard-can dummy (TR-12)

---

## 10. Adjust (lighter / darker) (TR-10, TR-11)

On Express, Dispense, or after a customer “a tad darker”:

- Slider or − / + with display copy only (`10% darker`)
- Each change calls Formula; swatch and recipe lines update from the engine
- Nothing on screen may show a colorant **removed** while the dispenser is adding (the OnePaint bug)
- Printed label and on-screen recipe are the post-ack vector

---

## 11. Customer bind (TR-21, TR-22)

`F9` or the optional field on Express

- One field: phone **or** Pro
- Email: collapsed “Send receipt” — never required
- Skip is a labeled control (`Alt+S`)
- Binding can happen after `done`; history is the ticket (TR-22)

---

## 12. Offline, dump, and stain-specific copy

**Offline (TR-4, TR-8, TR-37, TR-38)** — all screens remain; catalog is the last **full** snapshot; Pro lookup may be local-only; banner stays until sync catches up. `F6` manual-add stays available if the dispenser driver is up and the cloud is not. Do not instruct anyone to unplug ethernet.

**Dump / mistint (TR-29)** — `F8` asks reason (wrong color, machine error, customer reject). Ticket → `dumped`. Optional inventory write-off event. Does not delete the formula (needed for remake).

**Remake** — new ticket linked to the dumped id; metrics count it (TR-32).

---

## 13. Screen → requirement map

| Screen | TR ids |
| --- | --- |
| Chrome / banner | 8, 24, 26, 34 |
| Keyboard | 1, 25 |
| Home / search | 14, 15, 27 |
| Express order | 1, 3, 16, 21, 27, 28 |
| Guided order | 2, 3, 34 |
| Color match | 5, 17, 18, 19, 20 |
| Reorder | 13, 23, 31 |
| Rail / dispense | 3, 6, 11, 24, 25, 26, 30, 33 |
| Manual / Add Label | 9, 12 |
| Adjust | 10, 11 |
| Bind | 21, 22 |
| Dump | 29 |
| Search disambiguation | 39 |
| Walk-up skip | 21, 36 |
| Manual-add / offline catalog | 37, 38 |
| Feedback status | 40 |
| Metrics (Admin, not desk chrome) | 32 |

If a screen cannot point at a TR- id, it does not ship. If it fails the [framework QA gate](11-ux-framework.md#13-ux-qa-gate-before-a-screen-ships), it does not ship.
