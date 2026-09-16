# Associate Feedback Digest — OnePaint and peer desks

**Date:** 2026-09-14  
**What this is:** Public associate voice from r/HomeDepot (2019–2026), plus r/Lowes paint-kiosk/tinter threads. Not official THD research. Quotes are paraphrased from public posts; links are the source.

Use this to pressure-test every TintRail function. If a requirement cannot point at a real complaint or a real “keep,” it is decoration.

Internal THD channels that associates name (not readable here): **OnePaint in-app Feedback**, **Engage / OnePaint community**, **Help Desk / MyApron**, **Yammer** (offline how-to), **MMU / HD TV**, **Pocket Guide**. Official SOPs live on myApron and are confidential.

---

## 1. Timeline of what they actually said

### 2019 — rollout (MMU, “new D24 system”)

| They liked | They hated |
| --- | --- |
| On-hand inventory | Slower than hammering HDPS (~5 s → minutes) |
| Cleaner product organization | Queue does not receive the first order; labels do not print |
| Guided UI for new people | Phone **and** email to complete; no clean “no” |
| | Color matcher crashes; Behr stain samples fail; textured chips fail |
| | Search “black” misses Glidden; card-scan names wrong |
| | Sample → gallon is **manual math** |
| | Stores “get credit” for *using* OnePaint, not for speed |

**Voice:** “It should be like a deli… take the order, make the sandwich.” Fake emails already appearing. DIYers skip save; Pros get asked for a Pro number.

**Same-name collision:** associate mixed purple instead of black because **two colors shared a name on screen** — advice: samples before gallons.

### 2021 — HDPS/IMS still better when it ghosts back

Veterans: flying through orders on HDPS felt like “riding a bicycle.” IMS **pack size** and **label spool** missed. OnePaint has “fewer options” and fewer workarounds. HDPS disabled but still reappears after a restart.

### 2022 — slow + DIY offline

Nationwide molasses. IT: use offline. **Yammer recipe:** unplug ethernet, reboot, leave it unplugged. Offline **works for tint** but **drops color match**, and associates lost **Dynasty, Ultra, specialty paints** on the offline catalog. Advice: only put *one* PC into offline so the rest can still match.

### 2023 — update crash; phone-metric culture

October update: paint PCs crash; Kitchen Design and Flooring die in the same window. Offline tint yes; matcher no. Old system still mentioned as a fallback in some stores.

**Dedicated thread: “Getting every customer’s email and phone number.”**

- Associates fear write-ups for not asking.
- Customers refuse; rush makes it impossible.
- Workarounds: `noemail@none.com` → **OrderUp** then says “you’ve ordered before” and **blocks** reuse.
- Random letter-string emails; `number@gmail.com` + NULL name.
- **Store phone number** or obviously fake numbers. **A Behr/PPG vendor:** some stores use a random number “to keep their percentage up.”
- DH uses the store number. No one reprimanded for fakes — they *are* reprimanded (in rumor) for low *ask* rate.

This is the smoking gun for **F-12 / TR-21 / TR-32**: the save feature was turned into a **compliance metric**, so the database fills with garbage and real reorders fail.

### 2024 — multi-hour outage

Miami 30+ minutes; Ohio **3 hours**. IT canned message. **Debug log missing or locked** at launch.

### 2025 — layout + global down

June: “new layout” — empty half-screen, **no color preview**, unreadable in a rush. After RDP, cache clear restores old UI. Associates hoped it was a glitch. It was either a ship or a CSS failure; both are unacceptable on a Saturday.

October 27: D24/OnePaint **global**; “communications were sent out to management.” Store 2506 and others confirm. Joke: “do they have any actual trained software engineers.”

### 2026 — still the same product

- Jan-ish: **Huge OnePaint Bug** — adjust darker adds colorant, **label and UI subtract**. 1–5 cans/week in one store. **Three in-app Feedbacks already filed.** Hazard-can dummy because Add Paint Label fails. Future lid scans replay the lie.
- April 18: multi-store / nationwide. Lockup: **would not send to queue ~10 minutes**. SM: “entire system of one paint **outside manual coloration add** is down.” Associates ask: can we take orders / see history on a sunny Saturday?
- May: crashes + slowness. Customers “mean mugging” (think associates are idle). Color match “not 100%” → remake → customer still walks if it is not exact.

**Feedback loop is broken.** Stores can report. They cannot patch. Filed bugs stay live for months.

---

## 2. Feedback mapped to functions

| Function | Associate signal | TintRail must |
| --- | --- | --- |
| F-01 Advise | Training is reps, Pocket Guide, YouTube SOP — not OnePaint | Do not pretend the wizard is product school |
| F-02 Identify | Duplicate names; Glidden black missing; card mismatch | Swatch + code on every hit; never two “Black” without brand/code |
| F-03 Match | Textured fail; stain crash; customers waste a gallon then leave | Multi-spot; sample-first prompt; set expectation (“match, not photocopy”) |
| F-04 Crossover | Behr ↔ PPG fights | Policy sentence, not a shrug |
| F-05 Formulate | Label invert; sample≠gallon; no store edit | Engine + ack label; report channel that **closes** |
| F-06 Scale | Manual math; 8 oz good / gal wrong | Built-in scale + overfill stop |
| F-07 Rail | Extra taps; lockup “won’t send to queue”; no swatch | Commit = rail; local queue if cloud dead |
| F-08 Validate can | Wrong-name mix (purple vs black) | Scan-to-shoot + swatch confirm |
| F-09 Dispense | Dead button; cloud down except **manual add** | Local shoot; manual-add is a first-class degraded mode, not folklore |
| F-10 Label | Lie after adjust; spool missed | Label = ack; reprint without dummy can |
| F-12 Remember | Fake PII to hit %; OrderUp blocks reuse; saves vanish | Skip is legal; **never score capture %** |
| F-14 Pay | OrderUp email collision | Identity is not a checkout email |
| F-15 On-hand | Only universally liked feature | Keep, show pack size |
| F-16 Inbound | Paint pickup person in the Saturday pile | Inbound tickets on the rail |
| F-17 Correct | Samples first; remakes; hazard can | Sample-first default on match; remake link |
| F-18 Maintain | Purge/sponge/canister tribal knowledge | Checklist lock |
| F-19 Offline | Unplug ethernet; catalog **shrinks** (Dynasty/Ultra gone) | Offline catalog = full last-good, not a skinny subset |
| F-20 Metrics | Usage credit; phone %; Feedback black hole | Time-to-rail, remakes, **feedback SLA** |

---

## 3. What they asked for (in their words, distilled)

1. Deli speed — order, sandwich, gone.
2. Bypass email. One field or skip.
3. Offline that still has **the products they sell** and the matcher if the hardware is up.
4. A queue that does not need a ritual tap and does not lock.
5. Labels that match the machine.
6. Sample math that is not a calculator.
7. A swatch they can see in a rush.
8. Search that includes Glidden and does not alias two blacks.
9. Credit for **cans done right**, not for opening OnePaint or harvesting phones.
10. A feedback button that **changes the formula file**.

Those ten are the associate product brief. TintRail either does them or it is OnePaint with a new name.

---

## 4. Lowe’s peer feedback (why we do not copy their kiosk)

r/Lowes paint associates on the Zebra kiosk (2024–2026):

- Missing **stains, cabinet/furniture, ExpressCoat, Magnolia, primers** — catalog not the department.
- Assist button is a red light; phone app alerts fail ~80%; sometimes **another store’s orders**.
- Inventory check refuses orders the store has in quantity.
- Unskippable **15-second sundries animation** *before* the order commits; customers walk thinking they ordered. Double upsell screens.
- Bin hardware **blocks the desk entrance**.
- Kiosk exists so they leave the desk; they must babysit the kiosk anyway.
- New tinter (Catalyst): old custom formulas need a **converter that does not transfer** — write it down, type it again. Newer associates do not know the tool exists.

**Steal:** scan-to-dispense, shared rail, SMS, price on the ticket.  
**Refuse:** kiosk without a complete catalog, unskippable ads, split matcher, conversion tools that do not write a ticket.

---

## 5. Official / adjacent THD (public only)

- **myApron** — SOPs, Help Desk, Learning Locker / Pocket Guide. Not public.
- **Engage OnePaint community** — named as the place to post formula bugs “with details.”
- **OnePaint Feedback button** — used; impact uncertain (“how much that will actually help”).
- **OrderUp** — sits next to OnePaint; email uniqueness collisions.
- **Chrome** — daily cache clear is tribal IT.
- **Code of Conduct** — SOPs and software are confidential; we will not invent or leak myApron content.

No public OnePaint manual still.

---

## 6. Sources (this pass + prior)

New or newly used:

- [Getting every customer’s email and phone number](https://www.reddit.com/r/HomeDepot/comments/18gafje/getting_every_customers_email_and_phone_number/)
- [OnePaint offline mode](https://www.reddit.com/r/HomeDepot/comments/swf5ru/onepaint_offline_mode/)
- [OnePaint slow](https://www.reddit.com/r/HomeDepot/comments/sweeg9/onepaint_slow/)
- [d24 paint down (Oct 2025 global)](https://www.reddit.com/r/HomeDepot/comments/1ohd8ah/d24_paint_down/)
- [One paint down (Apr 2026 lockup)](https://www.reddit.com/r/HomeDepot/comments/1sp3a4y/one_paint_down/)
- [Applying to Paint](https://www.reddit.com/r/HomeDepot/comments/ditlzw/applying_to_paint/) — duplicate color names
- [Paint kiosks (r/Lowes)](https://www.reddit.com/r/Lowes/comments/1cpf8kh/paint_kiosks/)
- [New paint system formula conversion (r/Lowes)](https://www.reddit.com/r/Lowes/comments/1i0tc7n/new_paint_system_formula_conversion/)

Prior list: [01-research-brief §10](01-research-brief.md#10-source-list), [06-industry-discovery §5](06-industry-discovery.md#5-sources-added-this-pass).
