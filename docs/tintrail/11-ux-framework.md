# TintRail UI/UX Framework

**Status:** Binding design system for Desk, Kiosk (optional), Rail, and Admin.  
**Screens live in:** [05-ux-spec.md](05-ux-spec.md)  
**Voice that broke OnePaint:** [09-associate-feedback.md](09-associate-feedback.md)

This is not a consumer paint app and not a marketing site. It is a **factory bench OS**. If a control would look at home in ColorSnap Visualizer or a Lowe’s unskippable sundries ad, it does not ship.

**Living shell:** [`tintrail/apps/desk`](../../tintrail/apps/desk) — production pit (TAKE + MAKE + LINE). Search with duplicate-name swatches, skip-save, always-on rail. Tokens in `src/tokens.css`. Saturday layout rules: [12-store-floor-production.md](12-store-floor-production.md).

---

## 1. Job of the UI

The UI has one job: **move a true can down the rail**.

Everything on screen is either:

- the **ticket** (color, product, formula, customer token),
- the **factory** (devices, station, rail),
- or a **sentence** (offline, policy, overfill, empty lookup).

Chrome that does not serve those three is waste. Empty half-pages are a defect (TR-26). Fifteen-second animations before commit are a defect (Lowe’s kiosk).

---

## 2. Principles (UX-*)

| ID | Principle | Why |
| --- | --- | --- |
| **UX-1 Bench, not boutique** | High contrast, dense type, industrial surfaces. Color lives in **swatches**, not in decorative gradients. | 2025 OnePaint “bare / no preview” failed in a rush. |
| **UX-2 Swatch is identity** | Every ticket, search hit, and rail row has a visible swatch ≥ 28px (Express) / 44px (Guided). No swatch, no row. | Purple-vs-black same-name mix. |
| **UX-3 Keyboard = touch** | Every action has a key. Touch is a peer, not the only path. Focus ring always visible. | HDPS 5-second veterans. |
| **UX-4 One primary** | One obvious commit per view (`Rail it` / `Dispense` / `Measure`). Secondary actions are quieter. | Wizard fatigue. |
| **UX-5 Sentence errors** | Errors are one sentence + one next step. No empty lists, no “something went wrong.” | Cross-brand walls, vanished saves. |
| **UX-6 Degraded, not dead** | Banners name the *device* or *sync*, not “TintRail is down.” The rest of the bench stays usable. | Offline matcher / nationwide downs. |
| **UX-7 Skip is a button** | Walk-up is a labeled control (`Alt+S`), same visual weight as Save. Never a shame state. | Fake-email culture. |
| **UX-8 No theater** | No capture meters, no “% saved,” no unskippable upsell, no usage trophy. | TR-35; Lowe’s 15s ad. |
| **UX-9 Density is a mode** | Express = rush density. Guided = larger hits + 15s field help. Same ticket, same tokens. | Universal associates vs veterans. |
| **UX-10 Motion is status** | Motion only for rail arrival, dispense progress, focus. Never for decoration or delay. | Customers walking during kiosk ads. |

---

## 3. Modes and surfaces

| Surface | Who | Density | Pack |
| --- | --- | --- | --- |
| **Desk Express** | Veteran / backup in a rush | Compact, 32–36px rows | All |
| **Desk Guided** | New hire | Comfortable, 44px hits | All |
| **Rail / tint station** | Mixer | Table density, swatch column | All |
| **Kiosk** (optional) | Customer *orders* only | Large type, no ads before commit | Lowe’s-shaped pack |
| **Admin** | DS / regional | Readable tables, no vanity dashboards | All |

Kiosk never shoots the dispenser (fork rule). Associate Desk always can.

`F2` toggles Express ↔ Guided without losing the draft.

---

## 4. Design tokens

Tokens are the framework. Screens consume tokens; they do not invent hex.

### 4.1 Color (bench)

| Token | Role | Hex (default) |
| --- | --- | --- |
| `--bg` | App background | `#12141A` |
| `--bg-raised` | Panels, rail | `#1B1E27` |
| `--bg-sunken` | Search, fields | `#0E1015` |
| `--line` | Borders | `#2A3040` |
| `--text` | Primary | `#F2F4F8` |
| `--text-dim` | Meta, codes | `#9AA3B5` |
| `--accent` | Commit, focus | `#F5A623` |
| `--accent-ink` | Text on accent | `#1A1204` |
| `--ok` | Live / dispensed | `#3DDC97` |
| `--warn` | Offline / stale | `#F5C542` |
| `--bad` | Jam / block | `#F07167` |
| `--match` | Match (not OEM) chip | `#7AA2F7` |

**Swatches** come from Formula Lab/sRGB, never from a hardcoded “pretty” paint color. If Formula has no preview, use a hatched `--bg-sunken` square + “no preview” — do not invent a hue.

Do not use Home Depot orange as a brand claim. `--accent` is **bench amber** (work light), not a retailer logo.

### 4.2 Type

| Token | Size / weight | Use |
| --- | --- | --- |
| `--font` | `"IBM Plex Sans", "Segoe UI", sans-serif` | UI |
| `--font-mono` | `"IBM Plex Mono", ui-monospace` | Codes, shots, hash |
| `--type-xs` | 12 / 600 | Chips, age |
| `--type-sm` | 14 / 500 | Meta, help |
| `--type-md` | 16 / 600 | Fields, rows (Express) |
| `--type-lg` | 20 / 650 | Color name, commit |
| `--type-xl` | 28 / 700 | Guided primary question |

Minimum body contrast 4.5:1 on `--bg`. Accent-on-dark commit button: dark ink on amber, not white on amber.

### 4.3 Space and density

| Token | Express | Guided |
| --- | --- | --- |
| `--row` | 36px | 48px |
| `--swatch` | 28px | 44px |
| `--gap` | 8px | 12px |
| `--pad` | 12px | 16px |
| `--radius` | 6px | 8px |
| `--focus` | 2px solid `--accent` | same |

Rush layout: **search + results + ticket + commit** on one viewport at 1366×768 (typical paint PC). If the associate must scroll to commit in Express, the layout failed.

### 4.4 Elevation

No drop shadows as decoration. Separation = `--line` and `--bg-raised`. The rail selected row = `--bg-sunken` + accent left bar (4px).

---

## 5. Layout chrome (all Desk screens)

```
+------------------------------------------------------------------+
| STORE  ·  ASSOCIATE  ·  D1   [Express|Guided]   chips: sync/dev  |
| [ /  Search or scan a card, lid, or color .................. ]   |
+------------------------------------------------------------------+
| BANNER (only if degraded) — one sentence                         |
+-----------------------------------------+------------------------+
| MAIN (search / express / match / ...)   | TICKET STRIP           |
|                                         | swatch + fields        |
|                                         | [ Rail it ]            |
+-----------------------------------------+------------------------+
| RAIL PEEK (last 8 tickets, swatch row) or full rail on tint PC   |
+------------------------------------------------------------------+
```

- Search is **always** in chrome. `/` focuses it. Scanner types here unless spectro/manual has capture.
- Ticket strip is **always** visible once a color is chosen. Swatch locked top-right (or top of strip).
- Banner is **not** a toast. It stays until the condition clears.
- Status chips: Sync, Catalog as-of, Spectro, Dispenser, Printer. Each is `ok | warn | bad` with a one-word label (`Live`, `Offline`, `Jam`).

---

## 6. Component inventory

Build these once. Screens compose them.

| Component | Rules |
| --- | --- |
| **Swatch** | Square, 1:1, border `--line`. Optional hatch if no Lab. Tooltip = hex/Lab. |
| **Chip** | OEM / Match / Walk-up / Inbound / Job. Color per token. Never more than two chips per row. |
| **StatusDot** | 8px + label. Not icon-only. |
| **SearchField** | Large, mono-friendly for codes. Placeholder: “Name, code, card, or lid.” |
| **ResultRow** | Swatch · brand · name · code · OEM/Match. Duplicate names: brand+code mandatory. |
| **ProductRail** | Horizontal chips, wrap, last-used selected. Keyboard arrows. |
| **OnHand** | `14 gal · pack 2 · as of 10:14`. Zero = `--bad` + block commit. |
| **CommitButton** | Amber, label includes the key: `Rail it  ↵`. Disabled = reason beside it. |
| **SkipButton** | Ghost: `Skip — walk-up  Alt+S`. Equal height to Save. |
| **Banner** | Full width, `--warn` or `--bad` wash, one sentence, no dismiss-if-still-true. |
| **RailTable** | Sticky header, swatch column 1, age as `0:40`. Selected = accent bar. |
| **RecipeLines** | Mono, from Formula only. After ack, a `hash` footer. |
| **Adjust** | − / + or slider; **display** “10% darker”; numbers never shown as negative shots. |
| **Measure** | Huge Guided target; Express is a normal button + `F5`. |
| **HelpHint** | Guided only under focus. Max ~15 seconds of reading. Express: `F1` popover. |
| **KeyCap** | Small kbd glyph in chrome help, not a tutorial modal. |

**Forbidden components:** carousels, circular progress as decoration, confetti, NPS, “you saved a customer!”, email-required modal, unskippable overlay.

---

## 7. Interaction framework

### 7.1 Focus model

- Tab order is the job order: search → product → sheen → size → qty → customer → commit.
- Visible `:focus-visible` = `--focus`. Never `outline: none` without a replacement.
- Scanner HID: if capture target is Search, append and submit on Enter. Spectro/manual panes set `data-capture="hold"`.

### 7.2 Keyboard (canonical)

Keep the map in [05-ux-spec §2](05-ux-spec.md#2-keyboard-map-hdps-muscle-memory-tr-1-tr-25). Framework additions:

- `?` toggles a **one-screen keymap** overlay (not a training video).
- `Ctrl+Enter` force-commits when the ticket is valid (same as Enter on commit).
- Never steal `F5` for browser refresh on the installed Desk (Tauri / kiosk browser). In Phase 1 web demo, `F5` is Measure and we document “use the runtime shell.”

### 7.3 Touch

- Guided hits ≥ 44×44 CSS px.
- Express rows may be 36px; veterans are expected to use keyboard.
- No hover-only actions. Every hover control has a click/key equivalent.

### 7.4 Timing

| Action | Budget |
| --- | --- |
| Search results (local catalog) | < 100ms after 2 characters |
| Express known-color → rail | < 5s human time (TR-1) |
| Rail event to tint PC | < 200ms LAN |
| Banner after Sync drop | < 1s |
| Commit animation | 0ms delay; 120ms row insert |

If the UI waits on Sync to enable `Rail it`, the framework is violated.

---

## 8. Copy framework

- **Verbs:** Rail, Dispense, Measure, Skip, Bind, Dump, Remake. Not “Submit,” “Continue,” “Finish setup.”
- **Offline:** `TintRail Offline — tinting on. History will sync. On-hand as of {time}.`
- **Empty lookup:** `No colors for this number. Last sync {time}. Scan a lid or start a match.`
- **Policy:** `{Brand} does not tint into {base}. Match into {alt} or special-order.`
- **Overfill:** `Too much colorant for a quart. Use a gallon or split.`
- **Skip:** `Walk-up — not saved` (neutral, not “customer refused”).

No exclamation points. No “Oops.” No “Let’s get their email!”

---

## 9. State kit (every screen must handle)

| State | Visual |
| --- | --- |
| Empty search | Prompt + last 10 tickets with swatches |
| Loading catalog | Skeleton rows, search still typed |
| Offline | Banner + full catalog snapshot |
| Device bad | Chip `--bad` + disable only that action |
| Zero on-hand | Commit disabled + override path |
| Duplicate name | Two rows, two swatches, two codes |
| After ack | Recipe locked to hash; “Printed” chip |
| Walk-up | Chip, no shame |

---

## 10. Accessibility

- Contrast: WCAG AA for text; swatches may be similar hues — **name and code always accompany** the square.
- Do not rely on color alone for OEM vs Match (chip text).
- Reduce motion: respect `prefers-reduced-motion` (instant rail insert).
- Screen reader: ticket strip is an `aria-live="polite"` region on commit. Rail is a table with row headers = color name.
- Gloves / bright store: default theme is dark bench. A **high-sun** theme (light `--bg`, same structure) is a token set, not a second app.

---

## 11. Pack skins

Tokens may shift; structure may not.

| Pack | Skin |
| --- | --- |
| HD multi-brand | Default tokens. Brand column always shown. |
| Lowe’s-shaped | Kiosk surface: large type, **commit is the last step**, no animation before it. Desk unchanged. |
| Brand store | Hide foreign-brand column; “into our paint” chip default. |
| Dealer | Expert density default; tint-id visible on ticket strip. |

---

## 12. Anti-patterns (do not rebuild)

From OnePaint and Lowe’s (see [09](09-associate-feedback.md)):

1. Wizard that hides the swatch.
2. Email required to tint.
3. “Send to queue” after commit.
4. Negative shot numbers on screen.
5. Unplug-ethernet instructions in the UI.
6. Capture % widget.
7. Unskippable sundries / ads.
8. Kiosk catalog that is not the department (no stains).
9. Hover-only queue.
10. Toasts that vanish while the jam remains.

---

## 13. UX QA gate (before a screen ships)

- [ ] Points at a TR- and an F- id
- [ ] Swatch on every ticket-like object
- [ ] Keyboard path complete
- [ ] Banner/copy is one sentence
- [ ] Works with Sync killed
- [ ] Skip-save does not look like failure
- [ ] No scroll-to-commit in Express at 1366×768
- [ ] Duplicate names disambiguated
- [ ] Recipe text from Formula only

If any box fails, the screen goes back. This gate **is** the stronger framework: the old spec listed screens; this file decides whether they are allowed to exist.
