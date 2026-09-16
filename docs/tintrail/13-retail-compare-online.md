# Retail paint desks compared — and online orders on the Line

**Date:** 2026-09-15  
**Status:** Binding for Line + inbound. Extends [12-store-floor-production.md](12-store-floor-production.md).  
**Evidence limits:** No myApron, Walmart AMP, or OrderUp manuals. Associate posts and public store pages only. No retailer API is connected; inbound in the bench is **synthetic**.

---

## 1. Why this pass

The pit shell (Take / Make / Line) is the right factory shape. It still treated every ticket like a person at the counter.

Home Depot Saturday is **walk-up + BOPIS + will-call on one desk**. Walmart is often **not a factory**. Lowe’s splits the customer to a kiosk. Ace **excludes tinted paint** from 15-minute pickup. Those are different jobs. The Line has to show the *source* or the mixer will treat an online gallon like a walk-in and hand the customer an **untinted base** — the exact D24 complaint.

---

## 2. How each desk actually runs

### 2.1 Home Depot (D24) — warehouse paint factory

**Staffing.** Dedicated paint associates plus universal backups. Learning OnePaint is “90% of the hard part.” OFAs (online fulfillment) are a **different job**; they pick the store, they do not tint.

**Walk-up.** Identify color → product/sheen/size → optional phone/Pro → queue → scan can → shoot → label → shake. Veterans want HDPS-speed (~5 s to queue). OnePaint added on-hand (liked) and a second “send to queue” (hated).

**Online / BOPIS (public associate voice).**

1. Tinted BOPIS lands in **OnePaint’s queue**, not first on the OFA phone.
2. Paint tints it, stages it on a shelf marked **For Online Orders Only**.
3. ESVS / OrderUp often leaves the pick in the **Future** tab until tint is done — or it **sticks** there and someone must push it to Pick.
4. OFAs who pick from the **aisle** grab the **base**. Customers walk with the wrong can.
5. Workarounds: call the OFA, write the shelf location in OrderUp, or paint pulls the BOPIS themselves.
6. Store SLA for BOPIS is about **two hours**. Tinted paint is slower than a hammer.

**Do not copy:** Future-tab babysitting, split brain between OnePaint and the pick phone, capture % on phone/email.

**Steal:** One Line for walk-up and online. Online cards say **Online**, not a name that looks like a walk-in. After Make: **Stage on the online shelf — do not hand the base.**

Sources: [OFA's not picking](https://www.reddit.com/r/HomeDepot/comments/13vqsg3/ofas_not_picking/), [Curbside paint mix](https://www.reddit.com/r/HomeDepot/comments/moujgm/curbside_only_but_were_mixing_paint_now/), [09-associate-feedback.md](09-associate-feedback.md).

### 2.2 Walmart — Paint Solutions, often shrinking

**Staffing.** Hardware/Home associate, not a D24 factory. Mixing is **when someone is at the counter**. Some Supercenters advertise “Paint Solutions can mix acrylic or house paint” ([store paint-service pages](https://www.walmart.com/store/364-center-tx/paint-service)). ColorPlace is a Sherwin-made house brand; Glidden tintable **bases** sell online.

**Walk-up.** Chip or sample → mix → shake → leave. Public how-tos claim 5–10 minutes. No shared multi-brand rail, no OFA handoff, no Saturday pit of the HD kind.

**Online.** Walmart.com sells **tintable bases and pre-tinted ColorPlace**. Custom formula / sample match is **in the store**. Associates (2023, r/walmart): remodels **remove** the tint counter; some stores could not order base or tint for months; rumor of a self-serve mixer.

**Steal:** Speed and a short path (chip → mix → go).  
**Refuse:** Pretending TintRail is a grab-and-go aisle. Do not hide the Line because Walmart sometimes has none.  
**Layout lesson:** If a pack is “Walmart-shaped,” Make can dominate and Take shrinks. HD pack keeps the full pit.

Sources: [r/walmart tinting going away](https://www.reddit.com/r/walmart/comments/11dsk40/does_anyone_know_if_walmart_is_going_to_get_rid/), Walmart store paint-service pages, tintable-base browse.

### 2.3 Lowe’s — kiosk + associate tinter + SMS

Customer KC50 takes the order. Associate KC50 + tinter + scan-to-dispense. Handheld ping. Ready **text**. Catalog holes and unskippable ads are the failure mode ([12](12-store-floor-production.md) §2.2).

**Online.** Same associate queue as kiosk (test-store posts). Steal: one queue, SMS when Ready. Refuse: ads, incomplete catalog.

### 2.4 Ace Hardware — match in store, pickup excludes tint

Participating stores match and tint (Benjamin Moore / local). Ace **Ready in 15** and curbside **exclude tinted paint** ([acehardware.com/onlineorder](https://www.acehardware.com/onlineorder)). Online is pretinted or “call the store.”

**Lesson:** A 15-minute pickup SLA **must not** include a can that still needs the machine. TintRail must not promise “ready in 15” on an Online card.

### 2.5 Menards — bases online, tint at the counter

BOPIS exists. Tintable SKUs say **bases must be tinted at the paint counter**. Same split as Walmart.com: the web sells the *can*, the desk sells the *color*.

### 2.6 Sherwin-Williams — one brand, one ticket to pay

Eye + dispenser + sales terminal + 6-year archive. No multi-brand Black collision. Online reorder is the archive, not an OFA.

### 2.7 Target / grocery

No public custom-tint factory. Out of scope except as a warning: do not design Desk like a general-merchandise pickup screen.

---

## 3. Comparison (the job, not the logo)

| | Home Depot D24 | Walmart Paint Solutions | Lowe’s | Ace | Sherwin |
| --- | --- | --- | --- | --- | --- |
| What it is | Multi-brand factory | Occasional mix counter | Kiosk + tinter | Dealer match | Brand store |
| Parallel line | Yes (walk-up + BOPIS + questions) | Rarely | Yes (kiosk + desk + online) | Small | Small |
| Online tint | OnePaint queue → shelf → OFA | Mostly pretint / base ship | Shared queue + SMS | **Excluded** from 15-min pickup | Archive / will-call |
| Failure we steal against | OFA grabs **base**; Future tab | Counter removed in remodel | Ads; skinny catalog | False 15-min promise | Consumer Visualizer in the mixer |
| TintRail pack | Default HD | Compact Make | Kiosk later | Expert + no fake SLA | Hide foreign brand |

---

## 4. What the Line must do for online

F-16 Inbound was already in the function model. The simplified Line ignored `ticket.origin`.

| Rule | Why |
| --- | --- |
| **One Line** | HD and Lowe’s both fail when online lives in a second app |
| **Source chip** Walk-in / Online / Pro / Desk | Mixer sees BOPIS before they grab a can |
| **Online does not look like a name** | Token `Walk-up` vs order `#BOPIS-1042` |
| **Age + late color** | BOPIS ~2 h store window; paint should move in minutes |
| **Pull inbound** | Orders appear *before* they are railed (HD queue), then hit the Line |
| **After Make, stage copy** | “Online shelf — do not hand the untinted base” |
| **No 15-minute badge on Online** | Ace explicitly excludes tint |
| **No capture KPI** | Unchanged |
| **Synthetic inbound only** | No OrderUp / Walmart / Home Depot API |

Sort: oldest first (already). Optional: Online waiting sorts ahead of a fresh walk-in only if it is **late**. Do not starve the person at the counter for a 30-second-old web order.

---

## 5. Workflow (synthetic inbound)

```
Web / BOPIS (adapter later) → Inbound tray
        ↓ Pull onto Line
   Ticket origin=online
        ↓ Make (same Next as walk-in)
   Labeled / Done → stage shelf sentence
        ↓ (later) notify OFA / SMS
```

Desk **Pull online** rails the next pending inbound. Seed is local demo data (Swiss Coffee / Black, Marquee, gallon). It is labeled as a demo pull in Help, not as a live store feed.

---

## 6. UI changes this pass

1. Line cards show a **source chip** and age that warns when the can is old.
2. Line filters: **All / Walk-in / Online**.
3. **Pull online** fills the Line from synthetic inbound.
4. Make / flash copy names the online shelf when the active ticket is online.
5. Commit accepts `origin` so a desk ticket is not forced to walk-up vs pro by token alone.

**Not this pass:** real OrderUp, OFA phone, SMS, Walmart.com, price on the card.

---

## 7. Sources

- [12-store-floor-production.md](12-store-floor-production.md), [06-industry-discovery.md](06-industry-discovery.md), [09-associate-feedback.md](09-associate-feedback.md)
- [OFA's not picking (r/HomeDepot)](https://www.reddit.com/r/HomeDepot/comments/13vqsg3/ofas_not_picking/)
- [Curbside only but we're mixing paint (r/HomeDepot)](https://www.reddit.com/r/HomeDepot/comments/moujgm/curbside_only_but_were_mixing_paint_now/)
- [Will-call / Future tab](https://www.reddit.com/r/HomeDepot/comments/naf93t/phone_salewill_call_question/)
- [Walmart tinting going away (r/walmart)](https://www.reddit.com/r/walmart/comments/11dsk40/does_anyone_know_if_walmart_is_going_to_get_rid/)
- [Walmart store 364 paint service](https://www.walmart.com/store/364-center-tx/paint-service)
- [Ace online order — excludes tinted paint](https://www.acehardware.com/onlineorder)
- Menards tintable SKU copy: bases tinted at the paint counter
- Zebra / Lowe’s case study (marketing; associate counterweight in 12)
