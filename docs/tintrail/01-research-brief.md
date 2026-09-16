# OnePaint Research Brief

**System:** OnePaint (also written One Paint)  
**Owner:** The Home Depot (THD), Department 24 (D24) — Paint  
**Document type:** Public-source reconstruction  
**Date:** 2026-09-14  
**Status:** Concept research for TintRail. Not an official THD document.

This brief reconstructs what OnePaint is, how it is built, what it talks to, and what public evidence exists. Official manuals, training videos, APIs, and dispenser contracts are **not public**. Anything we could not verify is listed under [Unknowns](#unknowns).

---

## 1. What OnePaint is

OnePaint is Home Depot’s in-store paint-desk system. Associates use it to:

- Look up manufacturer colors (Behr, Glidden, Sherwin-Williams, and others in the catalog)
- Take a tint order (brand, product line, sheen, size, quantity)
- Drive a spectrophotometer for custom color matches
- Send a formula to an automatic colorant dispenser
- Print can labels
- Store customer / color history (typically keyed by phone, email, or Pro number)
- Show on-hand inventory for bases and related SKUs
- Accept special-order paint handoffs (PPG and similar vendor flows)

It is **not** the store POS, not FIRST (Zebra handheld checkout), and not the customer-facing Behr / ColorSmart tools. It is the D24 bench application that sits between the associate, the tint machines, and THD cloud services.

D24 is the paint department number. It is unrelated to the Hero D24 *manual* rotary dispenser, a different product that shares the same code by coincidence.

---

## 2. History versus HDPS / IMS

### 2.1 Predecessor

Veterans name two older Windows applications:

- **HDPS** — Home Depot Paint System. Keyboard-driven order entry. Associates report tabbing through fields without looking at the screen and putting a can in the queue in about five seconds.
- **IMS** — used alongside HDPS for inventory-style functions. Associates specifically missed **pack size** visibility and **label spooling** when they were forced back onto OnePaint.

Associates describe the old stack as a local Windows OS, not a browser. It had more formula-adjustment options, named both Glidden and Behr on color match, and supported workarounds built up since the late 1990s.

### 2.2 Rollout

Public associate posts place the live rollout in **2018–2019**:

- June 2019: D24 associates asked whether anyone was on OnePaint yet after seeing it in the monthly MMU (internal video). Early reports: orders not reaching the queue, printers not printing, on-hand inventory liked, speed already slower than HDPS.
- July 2019: Phone and email required to “complete” an order; color matcher crashes; Behr stain samples fail; textured chips fail.
- October 2019: Still treated as “the new D24 system.” Some stores were scored on whether they *used* OnePaint, not on cans-per-hour.

HDPS was later disabled on store PCs. It still reappeared after glitches or restarts into at least 2021, and associates celebrated those days because they could fly through orders again.

### 2.3 Later life

OnePaint did not freeze in 2019. Public signals of continued work:

- A Slalom consulting project rebuilt an old Java paint tool into an Angular frontend and Node.js backend so associates could fill orders faster.
- An intern project built the **OnePaint Order API**: Spring Boot, HTTPS, Cassandra for historical orders, reorder retrieval, and new-order processing.
- February 2022: nationwide slowness. Associates used a **Yammer** recipe for offline: unplug ethernet, reboot, leave unplugged. Offline tint works; **color match dies**; catalog can drop **Dynasty, Ultra, and specialty paints**. Advice: only one PC offline.
- October 2023: a software update crashed store machines; Kitchen Design and Flooring died in the same window; matcher still dead offline. A separate thread documents **fake emails/phones** to hit save-rate metrics; OrderUp blocks reused dummy emails.
- June 2025: a layout change (or cache-broken layout after RDP) removed color previews. Cache clear restored the older UI.
- October 2025: **company-wide** D24 / OnePaint down; communications sent to management.
- 2026: adjustment **label-invert** bug (Feedback filed, still live); April multi-store outage with queue lockup — SM: everything down **except manual colorant add**; May crashes + customer rematch waste.

Associates in 2025–2026 still describe the product as essentially the same job it was seven years ago: slower than HDPS, cloud-fragile, and only incrementally reskinned. Full voice log: [09-associate-feedback.md](09-associate-feedback.md).

---

## 3. Inferred software stack

| Layer | Evidence | Confidence |
| --- | --- | --- |
| Associate UI (current) | Angular web app (Slalom: Java → Angular + Node.js) | Medium–high |
| Associate UI (original) | Java desktop or Java web; associates contrast “Windows-based” HDPS vs “web-based” OnePaint | Medium |
| Store client | Browser on paint-desk PCs; touch-first; RDP used by remote support | High |
| Order / reorder API | Spring Boot microservice, HTTPS, Cassandra for historical orders (intern write-up on the OnePaint team) | Medium–high |
| Cloud / runtime | Matches THD published stack: Java, Spring Boot, Node.js, Angular, Kubernetes, Docker, Cassandra, GCP (also Azure, React, Python) | Medium (company-wide, not OnePaint-specific) |
| Offline mode | Exists by 2022; unplug-ethernet trigger; spectro dead; **catalog subset** (Dynasty/Ultra/specialty missing) | High (associate reports) |
| Adjacent order app | **OrderUp** validates emails and can block dummy addresses used to skip OnePaint save | Medium–high |
| Feedback | In-app Feedback, Engage OnePaint community, Help Desk / MyApron — report-only, no store formula edit | High |
| Auth / store identity | Not public. Assumed store-associates login and store number scoping | Low |

Home Depot’s own technology careers page lists Java 11, JavaScript, Spring Boot, Node.js, Angular, Azure, React, Python, Kubernetes, Docker, Cassandra, GCP, Golang, PCF, Spinnaker, MongoDB. That is the corporate palette OnePaint would be expected to live in. It is not proof of every box in the table.

---

## 4. Hardware at the bench

A D24 desk is a small factory: look up → match → tint → label → shake → hand to customer.

### 4.1 Confirmed by associate workflow

- Paint-desk PCs (touchscreen, browser)
- Barcode / color-card scanner
- Spectrophotometer (“color matcher”)
- Automatic colorant dispenser
- Can label printer
- Shaker / mixer
- Hazard / waste can used as a workaround when “Add Paint Label” fails

### 4.2 OEM — not publicly pinned to THD

Industry machines that do this job in North American DIY paint:

- **Spectrophotometers:** X-Rite (i1 Paint, Ci4100, MetaVue) and Datacolor (CHECK family, 20D, SELECT). Associates say OnePaint’s matcher fails on textured samples and sometimes will not boot in offline mode. That is a software-integration problem, not proof of a specific OEM.
- **Automatic dispensers:** Fluid Management / Harbil (X-PROTINT, AT-series), COROB (D410x and others), HERO Archimede (A110 / A360). Public sources do **not** name which brand is on a typical Home Depot bench.
- **Manual dispensers:** HERO D-series (D23, D24, D54…) exist in the industry. Do not confuse HERO’s D24 canister with THD Department 24.

Datacolor PAINT 2.0 (2015 user guide) is the closest *published* spec of the same job: formula book lookup, color-card match, custom spectro match, formula scaling, correction, dispenser interface, label content, customer files, out-of-stock handling. Use it as a capability checklist, not as OnePaint internals.

---

## 5. Adjacent THD systems

OnePaint does not stand alone. Public and associate sources place it next to:

| System | Role relative to OnePaint |
| --- | --- |
| **Oracle / 360 Commerce POS** with NCR and Fujitsu hardware | Store checkout. Paint is sold here; tinting happens on OnePaint. Sync contract is unpublished. |
| **FIRST** | Mobile POS / lookup on Zebra handhelds. Floor inventory and checkout, not the tint bench. |
| **OrderUp** | Named on résumés next to OnePaint. Also the app that **rejects reused fake emails** when associates try to skip the OnePaint save gate. |
| **ProExtra / Pro Xtra** | Contractor identity and pricing. Paint associates look up Pro numbers instead of (or in addition to) phone. |
| **Project Planning / Material List Builder AI** (2025–2026 Pro digital workspace) | Contractor job lists. Not the in-store tint OS. A successor concept should still accept a Pro account as the customer key. |
| **Pro Paint 2.0** (older Propertyware interview) | Property-management paint repository usable at any U.S. store. Public product name has faded; the *need* (unit-level color books) has not. |
| **PPG special-order → OnePaint** | Vendor training at stores includes “special order to Onepaint” demos. OnePaint is the landing zone for those orders. |
| **HD TV / LMS / MMU** | Internal video training. OnePaint was introduced in MMU. Not public. |
| **IT service line** | Canned messages during OnePaint outages; associates mention missing or locked debug logs at launch. |

Customer-facing Home Depot paint videos (`videos.homedepot.com`, YouTube workshops) teach *how to paint a room*. They are not OnePaint training.

---

## 6. Inventory, as OnePaint actually uses it

Associates singled out **on-hand** as the one early OnePaint feature they liked. That implies OnePaint reads store inventory (or a paint-specific on-hand feed) at order time.

What public evidence does **not** show:

- Whether on-hand is live POS, a cached paint feed, or a separate D24 table
- Whether tinting a can decrements the base SKU in OnePaint or only at register
- How mistints, dumped cans, and sample pots hit inventory
- Pack-size display (IMS had it; OnePaint’s coverage is unclear)

Any replacement must treat inventory as a first-class bench signal: do not tint a 5-gallon if the base is not on the floor.

---

## 7. Videos, screenshots, and documents that exist

### Public

- Reddit associate threads with UI complaints and at least two screenshot posts (2019-era OnePaint; 2025 layout / cache-broken UI).
- LinkedIn: intern OnePaint Order API write-up; store associates listing OnePaint next to OrderUp and ProExtra; PPG trainer posts about special-order-to-OnePaint demos.
- Slalom-adjacent portfolio copy describing “One Paint Admin” for a major home retailer: Java → Angular + Node.js.
- THD technology careers page (stack list).
- Industry manuals: Datacolor PAINT 2.0, Fluid Management / COROB / HERO dispenser literature, Epicor Decor Fusion and Rundoo paint-POS feature lists (independent dealers, not THD).
- Propertyware interview with a THD Regional Pro Sales Manager on spectrophotometer improvement and Pro Paint 2.0.

### Not public (confirmed absent from open web)

- Official OnePaint user manual
- Store training videos or LMS modules
- API schemas, endpoints, or auth model
- Dispenser / spectro driver contracts
- Formula database ownership (Behr vs PPG vs THD)
- Internal architecture diagrams

There is **no** public OnePaint how-to video. Training is internal only.

---

## 8. How a Saturday order actually moves

Reconstructed from associate reports, not THD docs:

1. Customer arrives with a chip, a lid, a phone number, a Pro number, or “make it like this.”
2. Associate searches color name / code, scans a card, or shoots the spectro.
3. Associate picks brand, product, sheen, size, quantity.
4. System may demand phone and email before the ticket is complete.
5. Ticket goes to a **queue** on the tint station (often a second PC). Queue interaction is touch-heavy.
6. Associate opens the can, dispenses, prints a label, shakes, hands off.
7. Reorder later depends on the label scan or the phone lookup. If the save failed, the customer is told to photograph the lid.

Failure modes in that path are the entire gap analysis.

---

## 9. Industry comparison (what “good” looks like outside THD)

Independent paint dealers already have software that treats tint and sale as one object:

- **Epicor Decor Fusion:** formula tracking, manufacturer name/number lookup, color history, pickup/delivery scheduling, offline POS.
- **Rundoo + Benjamin Moore COLORx:** formula flows into the sale and back; catalog search in the same bar as SKUs; fewer mistints from double entry.
- **Datacolor Paint / X-Rite ColorDesigner PLUS:** formula book, competitive card match, spectro custom match, scaling, correction, multi-dispenser, labels, customer files, online *and* offline data update.

Sherwin-Williams ColorSnap and Lowe’s X-Rite-backed matching are brand-specific. Home Depot’s problem is harder: **multi-brand** (Behr, Glidden, SW cards, PPG special order) on one bench, at warehouse scale, with DIY and Pro in the same line.

TintRail should steal the dealer-POS idea — formula, label, inventory, and customer are one ticket — and the Datacolor idea — scaling and correction are engine features, not associate math — without becoming another cloud-only wizard.

---

## 10. Source list

Primary associate evidence (r/HomeDepot):

- [One Paint System](https://www.reddit.com/r/HomeDepot/comments/bvsltz/one_paint_system/) — June 2019 rollout, queue/print bugs, on-hand liked
- [New One Paint System](https://www.reddit.com/r/HomeDepot/comments/cjxg1i/new_one_paint_system/) — July 2019 phone/email gate, stain/spectro crashes
- [Regarding the new D24 system](https://www.reddit.com/r/HomeDepot/comments/dmswhv/regarding_the_new_d24_system/) — Oct 2019 search gaps, sample scaling, usage metrics
- [One Paint Sucks](https://www.reddit.com/r/HomeDepot/comments/u8w3v9/one_paint_sucks/) — HDPS 5-second tab entry vs OnePaint minutes
- [That moment when One Paint is down](https://www.reddit.com/r/HomeDepot/comments/q5uomu/that_moment_when_one_paint_is_down_and_you/) — HDPS / IMS nostalgia, pack size, label spool
- [OnePaint exceedingly slow](https://www.reddit.com/r/HomeDepot/comments/y50b0c/onepaint_exceedingly_slow/) — 2022 latency, dead Dispense button
- [Home Depot def got some of the worst tech](https://www.reddit.com/r/HomeDepot/comments/16libn2/home_depot_def_got_some_of_the_worst_tech_ive/) — slower and less reliable than predecessor
- [One paint](https://www.reddit.com/r/HomeDepot/comments/17gtcys/one_paint/) — Oct 2023 update crash; offline tint; dead matcher
- [D24 Customers Vent](https://www.reddit.com/r/HomeDepot/comments/12i1xbw/d24_customers_vent/) — saves missing from phone lookup; brand-to-brand rules
- [OnePaint outages](https://www.reddit.com/r/HomeDepot/comments/1gjk96q/onepaint_outages_right_now/) — Nov 2024 multi-hour down; debug log locked
- [Thoughts on the new one paint layout](https://www.reddit.com/r/HomeDepot/comments/1lkmepf/thoughts_on_the_new_one_paint_layout/) — June 2025 no swatch, empty UI; cache/RDP
- [Huge OnePaint Bug](https://www.reddit.com/r/HomeDepot/comments/1qk9iuk/huge_onepaint_bug/) — adjustment-scale sign error on labels
- [One Paint down nationwide](https://www.reddit.com/r/HomeDepot/comments/1sp3kso/one_paint_down_nationwide/) — April 2026 multi-store / nationwide
- [anyone else’s one paint system keep crashing](https://www.reddit.com/r/HomeDepot/comments/1tbh67w/anyone_elses_one_paint_system_keep_crashing_the/) — May 2026 crash + slowness
- [Getting every customer's email and phone number](https://www.reddit.com/r/HomeDepot/comments/18gafje/getting_every_customers_email_and_phone_number/) — 2023 save-rate / dummy PII
- [OnePaint offline mode](https://www.reddit.com/r/HomeDepot/comments/swf5ru/onepaint_offline_mode/) — 2022 unplug ethernet; catalog shrink
- [d24 paint down](https://www.reddit.com/r/HomeDepot/comments/1ohd8ah/d24_paint_down/) — Oct 2025 global
- [One paint down](https://www.reddit.com/r/HomeDepot/comments/1sp3a4y/one_paint_down/) — Apr 2026 queue lockup
- Chronology and mapping: [09-associate-feedback.md](09-associate-feedback.md)

Engineering and company:

- [Rishita Deshmukh](https://www.linkedin.com/in/rishita-deshmukh-407a33223) — OnePaint Order API, Cassandra, Spring Boot
- Slalom / portfolio copy: One Paint Admin, Java → Angular + Node.js
- [THD Technology careers](https://careers.homedepot.com/career-areas/technology/) — published stack
- [Rohit S. résumé listing](https://www.linkedin.com/in/rohit-s-s8877) — OrderUp, OnePaint, ProExtra
- [Donald Gill / PPG training post](https://www.linkedin.com/posts/donald-gill-mba-2836597a_ppgproud-ppginthd-activity-7158203931083370496-7bzX) — special order to Onepaint demo

Industry (capability, not THD internals):

- [Datacolor PAINT 2.0 User Guide](https://www.datacolor.com/wp-content/uploads/2022/04/Datacolor-PAINT-version-2_0-User-Guide.pdf)
- [Datacolor Paint spec](https://www.datacolor.com/wp-content/uploads/2022/01/Paint-specsheet-EN.pdf)
- [Epicor Decor Fusion POS](https://www.epicor.com/en-us/products/retail-management-systems-rms/decor-fusion/point-of-sale/)
- [Rundoo: best POS for paint stores](https://rundoo.ai/insights/best-pos-for-paint-stores/)
- [Propertyware / THD paint-matching interview](https://www.propertyware.com/blog/paint-matching-technology-interview-home-depot/)
- [Home Depot POS overview (secondary)](https://koronapos.com/blog/home-depot-pos-system/)

---

## 11. Unknowns

Do not treat these as facts in later docs. Design around them with adapters.

1. **Exact dispenser OEM and protocol** per store (and whether stores mix vendors).
2. **Exact spectrophotometer OEM** and whether OnePaint talks USB, a vendor SDK, or a store-local service.
3. **Who owns the formula database** — Behr, PPG/Glidden, Sherwin licensed cards, THD, or a third-party color house — and how often it updates.
4. **SKU / on-hand sync contract** with 360 Commerce: frequency, authority, decrement timing.
5. **Auth model:** associate SSO, shared desk login, or store service account.
6. **Queue topology:** one shared cloud queue vs per-PC local queue vs store LAN.
7. **Label barcode payload:** what a lid scan actually contains (formula, SKU, order id, adjustment).
8. **Why Add Paint Label fails** and why the hazard-can workaround writes history.
9. **Cassandra data model** for orders (only the intern summary is public).
10. **Whether the 2025 “new layout” was a ship or a CSS/cache failure after RDP.**
11. **Internal SLAs** for nationwide OnePaint availability.
12. **Legal / vendor limits** on putting PPG colors into Behr bases and the reverse — associates describe a hard block; the written rule is unpublished.

---

## 12. Bottom line for TintRail

OnePaint is a **cloud-centered web wizard** laid over a **local factory** (spectro, dispenser, printer, shaker). The factory still works when the cloud dies; the wizard often does not. The predecessor (HDPS/IMS) was the opposite: local, keyboard-fast, option-rich, weaker at customer history and on-hand.

A replacement that only reskins OnePaint will fail the same way. TintRail has to run the factory first and sync to the cloud second.
