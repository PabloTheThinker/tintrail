# Industry Discovery: What a Paint-Desk System Is

**Date:** 2026-09-14  
**Purpose:** Deeper public reconstruction of OnePaint *as a job*, then the same job at Lowe’s, Sherwin-Williams, and independent dealers. This is the source for the [function model](07-function-model.md) and the [broad-spectrum fork](08-broad-spectrum-fork.md).

Official Home Depot, Lowe’s, and Sherwin store manuals are not public. What follows is reconstructed from associate reports, vendor case studies, manufacturer paint software, and dealer POS write-ups.

---

## 1. The job, before any brand name

A paint department is a **small factory attached to a sales floor**.

A customer arrives with one of:

- a color name or chip from *this* store’s brand
- a chip or lid from *another* brand
- a physical object (pillow, siding, 40-year-old can)
- a phone number / Pro account / job list
- “I need something that covers, exterior, satin, cheap”

The store must leave them with a **correctly tinted, labeled, shaken can** they can pay for — and, later, **make again**.

Every paint-desk system on the market is software for that factory. The brand on the box (OnePaint, Sher-Color, COLORx, Datacolor Paint, ColorDesigner PLUS, Lowe’s Zebra paint app) is an implementation, not a different job.

OnePaint’s *purpose for Home Depot D24* is: **take that factory, at warehouse scale, with multiple brands on one bench (Behr, Glidden/PPG, SW cards, stains, special orders), and run it with associates who are often new, pulled from other departments, and slammed on Saturday.**

Learning OnePaint is, per associates, “90% of the difficult part” of D24. The computer is the department.

---

## 2. OnePaint, as a purpose (not a feature list)

### 2.1 What Home Depot hired it to do

Replace HDPS/IMS (local Windows, keyboard-fast) with one web system that:

1. Walks a new associate through a tint (dummy-proof).
2. Looks up multi-brand colors and drives the matcher + dispenser + labeler.
3. Remembers the customer (phone / email / Pro) so they do not need the lid.
4. Shows on-hand so the desk does not tint empty air.
5. Lands special orders (PPG and similar) on the same bench.
6. Sends usage and order history to corporate (Order API + Cassandra).
7. Harvest phone/email as a **save-rate metric** (associates invent dummy contacts to keep the percentage up).

That is a **corporate control + training** purpose as much as a tint purpose. Stores were scored on whether they *used* OnePaint, not on cans-per-hour. Phone and email were required to “complete” an order. The wizard is the point. Voice log: [09-associate-feedback.md](09-associate-feedback.md).

### 2.2 What D24 actually is on a Saturday

Associates describe the pit, not the webpage:

- Line around the desk
- Someone “just has a quick question” behind the dispensers
- Paint pickup with a printed order
- A full product interrogation
- A rematch of an ancient sample
- Meanwhile: mix, open nozzles, fill tint, recover aisles, grab returns

OnePaint is supposed to be the **single customer-at-a-time machine**. The physical job is **many customers at once**. That mismatch is the real OnePaint problem: a sequential website on a parallel factory.

### 2.3 What the computer is trusted to do

D24 veterans: “the computer pretty much does the heavy lifting.” Associates do **not** edit corporate formulas. When a sample-to-gallon shift is wrong, they report via OnePaint feedback, Engage / OnePaint community, or Help Desk / MyApron. The system owns the recipe; the associate owns the can, the chip size (quarter-sized or the spectro fails), dispenser hygiene (purge, wet sponge, do not overfill canisters), and the knowledge that some lines (e.g. matching *into* Marquee the wrong way) physically cannot hold the colorant.

OnePaint is therefore:

| It is | It is not |
| --- | --- |
| The order + formula + device UI for D24 | The register (360 Commerce / FIRST) |
| The place special orders land | Behr’s consumer ColorSmart app |
| A web app (Chrome cache rituals) | A local OS like HDPS |
| A training substitute for product knowledge | A formula editor for stores |
| Multi-brand on one bench | A single-manufacturer store system |

### 2.4 Internal-only surfaces (still not public)

- MMU / HD TV intro (2019)
- MyApron / Help Desk tickets
- OnePaint “report feedback”
- Engage “OnePaint community”
- RDP remote support onto paint PCs

We still have no official manual, API, or training video on the open web.

### 2.5 New functional facts from this pass

- **Clear Chrome cache daily** — associates treat OnePaint as a flaky website, not an install.
- **Formula QA is one-way** — stores can report, not patch, bad recipes; sample vs gallon and base-vs-base shifts are known.
- **Physical constraints live outside the UI** — colorant load (Marquee vs standard), chip size, nozzle purge, canister fill height. OnePaint does not appear to enforce these well.
- **Vendor reps (Behr, PPG, Rust-Oleum)** are the product-education layer. The software does not replace that.
- **Universal associates** get pulled into D24. The UI must survive a backup from Tools.

---

## 3. Other stores: same factory, different OS

### 3.1 Lowe’s — split the job (kiosk + old matcher)

**Public model (Zebra, 2025–2026):** Customer-facing KC50 kiosk walks DIY through product questions. Associate-facing KC50 receives the order, talks to the tinter, shows price. TC53 handhelds notify associates so they can leave the desk. ZD411 prints a label meant to be readable in a garage years later. Ready-order **text**. 100+ stores, expanding.

**Associate model (r/Lowes):** New Zebra paint app and tinters **share a queue**. Flow: build order → queue → Validate and Dispense → **scan the can barcode** → machine shoots. Qty > 1: scan the next can. Then complete, send to a **bin/location**, close. Dropdown-only product lists. **Cannot edit** color/sheen/product after create. Phone lookup only works if the order already existed from **online fulfillment**; new manual orders often **do not attach** a customer unless checkout scans the barcode. **X-Rite still lives on the old system** — match and adjust are not in the new app yet.

**Kiosk failure mode (r/Lowes, 2024–2026):** catalog missing stains, cabinet/furniture, ExpressCoat, Magnolia, primers; assist is a red light; handheld alerts fail often; **wrong store’s orders**; inventory check refuses in-stock SKUs; unskippable **15-second sundries animation** before commit (customers walk thinking they ordered); bin hardware **blocks the desk door**. A later **Catalyst** colorant change requires a converter that **does not write the new formula onto the ticket** — associates copy it by hand; new hires do not know the tool exists.

**Purpose of Lowe’s new system:** take *order capture, queue, validate-can, notify, pickup* away from the associate’s memory. It is a **flow and error** system. Color science is still X-Rite / iVue / Color iMatch on the legacy side.

**Lesson for a fork:** do not ship a pretty kiosk that cannot match, adjust, save a walk-up, or list the whole department. The factory has two brains until they are one ticket. Do not put ads in front of commit.

### 3.2 Sherwin-Williams — one brand, tightly coupled

**Sher-Color:** spectro “eye” + tint dispenser + **sales terminal** + label printer. Custom formula *and* closest SW palette colors. Orders archived **up to six years**, retrieve at any SW store. ColorSnap Precision calibrates formula **by product and sheen**. Single colorant system, “color hygiene,” Cleveland color lab pushing formula updates.

**Purpose:** gallon-to-gallon consistency for *one* manufacturer across 4,300+ stores. Matching another brand means “into Sherwin,” not “sell Behr.” POS and tint are one story.

**Lesson:** when tint and sale are one object, remakes and charging stay honest. A broad-spectrum system must *allow* that coupling (dealer / brand store) without *requiring* it (big-box: register is a different machine).

### 3.3 Independent dealers — Ace, Benjamin Moore, Ace-like hardware

**Datacolor Paint (EFB / CCM / Pro):** formula book, competitive card match, spectro custom match, correction, customer files, labels, barcode, price list, POS stats, multi-dispenser, **online and offline** catalog update.

**X-Rite ColorDesigner PLUS (e.g. Stayton Ace):** measure (MetaVue), customer sees the scan, **scan can barcode or no dispense**, customer files, novice/expert modes, talks to Fluid Management / HERO / Dromont dispensers.

**Benjamin Moore COLORx 6/7 + Rundoo (or Decor Fusion):** enter product/color/qty in COLORx → dispense → **Send to POS** (color, formula, qty). Later **Retrieve from POS** by tint number. Bidirectional so the receipt is what was shot.

**Purpose:** the independent store *is* a paint store. Tint, inventory, charge account, and reorder are the business. Offline is expected. Expert mode is expected.

**Lesson:** the durable objects are **formula, tint id, customer file, validated base, POS line**. OnePaint invented a web wizard; dealers already had the objects.

### 3.4 Comparison (purpose, not chrome)

| | Home Depot OnePaint | Lowe’s (Zebra + X-Rite) | Sher-Color | Dealer (COLORx / Datacolor / CD+) |
| --- | --- | --- | --- | --- |
| Brands on bench | Many | Many (Valspar + match) | One (SW) | One primary + crossovers |
| Who starts the ticket | Associate wizard | Customer kiosk *or* associate | Associate | Associate (expert/novice) |
| Color science | In OnePaint + spectro | Still on **old** X-Rite | In Sher-Color | In tint OS |
| Validate can before shot | Weak / not public | **Scan required** | Coupled to SW SKU | **Scan or no dispense** |
| History | Phone/email/Pro; flaky | Online-first; walk-up weak | 6-year archive, any store | Customer file + tint # |
| POS | Separate register | Separate; barcode at checkout | **Same terminal** | **Send to POS** |
| Notify / pickup | Desk wait | **SMS + bins** | Counter | Counter |
| Offline | Partial; matcher dies | Not the pitch | Store-local heritage | First-class |
| Training theory | Wizard replaces skill | Kiosk reduces training | Brand-trained tinters | Expert mode + vendor |

---

## 4. What “fork from the idea” means

Do **not** clone OnePaint’s screens. Clone the **job**:

> Identify a color, choose a tintable product, compute a true formula, put a can on a rail, prove the base, shoot the machine, print a lid that will still be true in ten years, optionally remember the customer, and let them pay.

Home Depot’s twist: multi-brand, high volume, green associates, cloud-first.  
Lowe’s twist: customer kiosk, SMS, bin, validate-scan — color engine lagging.  
Sherwin’s twist: one brand, POS + tint + archive.  
Dealer twist: formula is money; offline and Send-to-POS.

A broad-spectrum TintRail is the **job OS**. Retailer packs (catalog, POS adapter, kiosk on/off, brand policy) are configuration, not a new product.

---

## 5. Sources added this pass

- [D24 New Associate](https://www.reddit.com/r/HomeDepot/comments/16l3soe/d24_new_associate/) — OnePaint is 90% of the job; Saturday pit
- [Tips for a new D24](https://www.reddit.com/r/HomeDepot/comments/18zqgmv/the_hiring_saga_continues_baited_and_switched/) — Chrome cache; computer does the lifting
- [D24 crash course](https://www.reddit.com/r/HomeDepot/comments/2lndlx/help_please_need_a_crash_course_for_d24/) — dispenser hygiene; chip size; Marquee colorant load
- [Other manufacturers’ formulas](https://www.reddit.com/r/HomeDepot/comments/1uez44o/paint_dept_staff_question_about_other/) — no store-side formula edit; feedback / Engage
- [Zebra / Lowe’s paint journey](https://www.zebra.com/us/en/resource-library/success-stories/how-lowes-redefined-the-paint-buying-journey-with-zebras-connected-technology.html)
- [r/Lowes new paint flow](https://www.reddit.com/r/Lowes/comments/1rq4ezs/what_fresh_hell/)
- [Sher-Color](https://www.sherwin-williams.com/painting-contractors/business-builders/sw-article-pro-shercolor)
- [Rundoo + COLORx 7](https://rundoo.substack.com/p/vendor-catalogs-a-smarter-buyers)
- [Rundoo + COLORx bidirectional](https://rundoo.substack.com/p/how-do-rundoo-and-colorx-work-together)
- [Stayton Ace / MetaVue](https://www.xrite.com/-/media/xrite/files/case-studies-pdfs/l3-341_stayton_ace_hardware_case_study/l3-341_stayton_ace_hardware_case_study_en.pdf)
- [Datacolor Paint](https://www.datacolor.com/business-solutions/product/datacolor-paint/)
- [Paint kiosks (r/Lowes)](https://www.reddit.com/r/Lowes/comments/1cpf8kh/paint_kiosks/)
- [Getting every customer's email and phone number](https://www.reddit.com/r/HomeDepot/comments/18gafje/getting_every_customers_email_and_phone_number/)
- Voice digest: [09-associate-feedback.md](09-associate-feedback.md)
- Earlier OnePaint sources: [01-research-brief.md](01-research-brief.md#10-source-list)
