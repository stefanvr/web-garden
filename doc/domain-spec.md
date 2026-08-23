# Web Garden — Domain Specification

**Purpose.** What this thing *is* and what its rules are, independent of how it's built.

**What belongs here.** The problem domain: entities, their properties, the rules governing them,
and the edge cases those rules produce. Written so someone could reason about the product without
reading a line of code.

**What doesn't.** Anything technical (tech-spec), anything about how it's presented or operated
(implementation-spec), anything visual (style-guide), and anything about build order (tracking).

**Rule of thumb.** If changing it would change *what the product does*, it belongs here. If
changing it would only change *how the product is made*, it doesn't.

**On language.** The garden is Dutch and its vocabulary is the real identifier set — border codes
(`BM`, `BA`), plant codes (`sedum-h`, `haag-laurier`), months (`maart`), and `kant`
(`achter` / `voor`). These are data, not translations, and are never anglicised. The prose around
them is English.

---

## 0. What this is

A maintenance engine for one specific garden.

The distinction matters, because it is the whole reason to build rather than install something.
Plant apps know about plants. This one knows about *this garden*: which plant is in which border,
which clump did what last August, and what therefore needs doing in March. The plant catalogue is
the least differentiated thing here; the layout, the season and the journal are the point.

The engine already exists — it runs in the owner's head every spring, and its output was written
by hand into the `2026 onderhoud` sheet of `Tuin.xlsx`. This product is that derivation, made
explicit and kept honest by observation.

### The governing constraint

Two previous attempts failed the same way: effort went into application features while the data
stayed thin, because app work shows visible progress and data entry does not. The domain rule that
follows from it:

- **The product acquires its own data as a side effect of being used.** There is no phase in which
  the owner sits down to fill in a catalogue, and no screen whose primary job is bulk data entry.
  Information arrives one question at a time, in the garden, at the moment it can be answered by
  looking at the plant.

This is a rule about *what the product is*, not about how it is built, which is why it lives here.
A version of this product with an excellent bulk-editing screen is a different, worse product.

---

## 1. The garden

| Entity | Holds | Notes |
|---|---|---|
| Garden | Borders | Exactly one. Multi-garden is out of scope |
| Border | A grid of cells, `kant`, display order | Its own coordinate space |
| Cell | A position in one border, and what occupies it | |
| Planting | One plant type, in one border, over one or more cells | Has identity |
| Plant type | Reference data and guidance about a species/cultivar | Shared across plantings |

### Borders

Borders are **independent coordinate spaces**. They are not positioned relative to one another, and
the product does not model where a border sits in the physical garden. The only spatial
relationship between borders is `kant` plus display order.

| Code | Kant | Name |
|---|---|---|
| BA | achter | Achterin |
| BH | achter | Achter hoek |
| BM | achter | Midden |
| BK | achter | Keuken met Buurvrouw |
| BS | achter | Schutting |
| BV | voor | Voor |
| BG | voor | Voor gedeeld |

`BG` — *voor gedeeld* — is the shared front border, which is also what the `Notes` sheet's
wishlist entry *"iets voor shared"* refers to.

- A border's layout is a rectangular grid. Grids are per border and need not share dimensions.
- A cell is exactly one of: **planted**, **dirt** (bare soil, plantable), **none** (outside the
  border's shape), or **edge** (border boundary, optionally rounded at a corner).
- A cell is a unit of *layout*, not a unit of area. It says a plant is here and roughly how much
  room it takes; it is not a survey measurement. Real area lives on the plant type as `m2`.

### Plantings

A **planting** is one occurrence of a plant type, in one border, occupying one or more cells. It
has a stable identity that survives changes to its type, its position, and its cell count.

- **Photos, observations and acquisition attach to the planting. Never to the plant type.**
- A plant type may have many plantings, in the same border or across several.
- Two adjacent cells of the same type are not necessarily one planting. Whether they are is a fact
  about the garden — recorded, not inferred from adjacency.

> **Why this entity exists.** The spreadsheet has no word for it, and kept reaching for one. Eight
> cells hold `bal-white`; the observation *"eind aug: nieuwe witte bollen"* is filed against
> `bal-white` the species, so next August it is impossible to tell which clump did it. Where the
> owner needed to point at *one* — because a photo demanded an anchor — a prefix was invented by
> hand: `a:sedum-s`, `b:hortentia`, `c:vlinder-paars`. Five plant types acquired labels this way.
> That prefix is this entity, discovered under pressure and encoded in a string. The product gives
> it a name instead.

---

## 2. What is known about a plant

Information about plants is **three kinds**, and conflating any two of them is what made the
spreadsheet simultaneously too restrictive and too messy. `PlantenV2`, `Onderhoud verkort` and
`(Snoei)Info` all describe a plant, and all three disagree, because each was reaching for a
different one of these.

| Kind | Example | Who reads it | Attaches to |
|---|---|---|---|
| **Reference** | `snoei periode: maart`, `m2: 9`, `hoogte 5–10`, `bloei: juli–augustus` | the engine | plant type |
| **Guidance** | *"Terug tot paar knoppen, vroege voorjaar 15–20cm"* | a human, holding secateurs | plant type |
| **Journal** | *"eind aug: nieuwe witte bollen"*, *pruned 14 March 2026* | a human, next year | planting |

The rule that keeps them apart:

- **Structure only what the engine computes on. Everything else is prose, and prose is never
  parsed.** `maart` is a field because the maintenance calendar needs it. *"15–20cm, vroege
  voorjaar"* is text because nothing computes on it — it is shown beside the task when the task
  comes up. Neither one attempts to be the other, so neither is restricted or messy.

A consequence worth stating, because it will be tempting to violate: **the engine never infers
reference data from guidance prose.** If a fact matters to scheduling, it is a field. If it exists
only in the prose, the engine does not know it, and the correct fix is to add the field — not to
parse.

### Reference fields

Carried on the plant type. These are the only fields the engine computes on.

| Field | Type | Source column | Used by |
|---|---|---|---|
| `code` | identifier | `PlantCode` | everything |
| `roepnaam` | text | `RoepNaam` | display |
| `naam` | text | `Naam` | display, search |
| `type` | text | `Type / familie` | grouping |
| `standplaats` | set of {zon, halfschaduw, schaduw} | `Standplaats` | placement check |
| `bloeiperiode` | set of months | `Bloeiperiode` | season view |
| `winterhardheid` | bool + optional °C | `Winterhardheid` | advice |
| `grondsoort` | text | `Grondsoort / Soort` | placement check |
| `vocht` | ordinal {droog…nat} | `Grondsoort / vocht` | placement check |
| `blad` | {bladhoudend, half, bladverliezend} | `Bladhoudend` | season view |
| `hoogte_min`, `hoogte_max` | cm | `Hoogte min/max` | layout, season view |
| `m2` | number | `m2` | coverage |
| `snoeiperiode` | set of months | `Snoei info / Periode` | **maintenance schedule** |
| `bemesting` | set of months | `Onderhoud verkort / Bemesting` | **maintenance schedule** |
| `rustperiode` | set of months | *does not exist* | season view — see open questions |

- `blad` is **three-valued, not boolean.** The spreadsheet already records `NEE,Half` for
  half-evergreens; a boolean cannot hold it, and the season view needs the distinction.
- `bemesting` exists in `Onderhoud verkort` and in no other sheet. The previous application dropped
  it entirely. It is reference data because the schedule computes on it.

### Guidance

Free prose attached to a plant type, carrying an optional source. There is no schema and no length
limit, and it is displayed rather than interpreted. `(Snoei)Info` and the `Snoei info / Info`
column are guidance.

---

## 3. Provenance and review state

Every reference fact carries **where it came from** and **how much it is trusted**. This is not
bookkeeping; it is what makes the product's questions intelligent rather than merely persistent.

A **source** is a nursery, a website, a printed label, or the owner's own observation. A plant type
references one or more; a fact may point at a specific one, otherwise it inherits the type's
default.

Each reference fact has a **review state**:

| State | Meaning |
|---|---|
| `seeded` | Imported from `Tuin.xlsx`, never since confirmed |
| `reviewed` | A human has looked at it and accepted or corrected it |
| `observed` | Established by looking at the actual plant in this garden |
| `unknown` | Genuinely not known — distinct from empty |

- **`unknown` and empty are different, and the distinction is load-bearing.** A blank cell in the
  spreadsheet means "unknown", "not applicable", or "nobody asked", and the product cannot tell
  which. Recording it explicitly is what lets the engine know whether it has a question to ask.
- **`observed` outranks everything.** A fact established in this garden beats a fact from a
  nursery, which beats a fact from a website.

Acquisition is a different thing from provenance and must not share a field with it. *Where this
specimen was bought* (`Genk`, `IntraTuin`) belongs to the **planting** and is a journal event —
*planted, from Genk*. *Where this information came from* belongs to the fact. `Tuin.xlsx` conflated
them in the `Gekocht` column because a spreadsheet has only one row per plant.

---

## 4. Season

The season view answers: **in month M, what is each planting doing?**

A planting is in exactly one **season state** per month, resolved in this order:

1. **bloeiend** — M is in the type's `bloeiperiode`.
2. **in blad** — not blooming, and the type is `bladhoudend`; or it is `bladverliezend` / `half`
   and M is not in its `rustperiode`.
3. **in rust** — M is in the type's `rustperiode`.

- Blooming outranks foliage. A plant in flower is shown as flowering even though it also has leaves.
- A `half` plant is *in blad* during its rest period but visibly reduced. It is not *in rust*.
- **A planting whose type lacks `rustperiode` cannot be resolved for winter months.** The view shows
  this as unknown rather than guessing, and it is exactly the kind of gap that should generate a
  question.

---

## 5. Maintenance

The schedule is a list of **tasks**, each due in a month, each checkable.

### Where tasks come from

Three sources, which behave differently and must not be collapsed:

| Source | Example | Attaches to | Recurs |
|---|---|---|---|
| **Derived** | prune in `maart`, feed in `april` | a planting | yearly, from reference data |
| **Recurring area** | `voortuin → onkruid` | a border or area | yearly, declared not derived |
| **One-off** | `klimop terug uit planten` | anything | no |

- **Most real tasks are not derived.** `2026 onderhoud` is dominated by weeding and one-off
  interventions, which no plant's data implies. A schedule built only from `snoeiperiode` would miss
  most of what the owner actually does, so area and one-off tasks are first-class, not an
  afterthought.

### Checking off

- **Checking off a task writes a journal entry against whatever it was attached to** — *pruned
  hortentia-b, 14 March 2026*. The schedule *is* the journal; there is no separate act of recording
  an observation.
- A journal entry is permanent. Un-checking a task removes it from the done list but leaves a
  corrected entry, because the garden's history is not editable by changing your mind about a
  checkbox.

### Nagging, and its decay

An overdue task does not simply persist, and does not simply expire.

- A task not done in its month **carries forward and nags**, with the nag weakening each time it is
  passed over, until it stops surfacing on its own.
- A faded task is **not deleted**. It remains findable, and it returns at full strength next year
  when its month comes round again.

> **Why decay rather than expiry or persistence.** A task that expires silently loses information
> the owner might have wanted. A task that nags forever trains the owner to ignore all nagging,
> which costs the product its one mechanism for acquiring data. Repeatedly skipping something *is*
> an answer — usually "this did not actually need doing" — and decay is how the product hears it
> without being told.

---

## 6. Questions the product asks

The mechanism by which the product acquires data. A question is generated, surfaced sparingly, and
answered in one tap where possible.

Questions are drawn from, roughly in priority order:

1. A fact needed by something the owner is looking at right now, which is `unknown`.
2. A fact that is `seeded` and never reviewed.
3. A season state the engine cannot resolve — most often a missing `rustperiode`.
4. A confirmation the engine can make trivial: *the type says it blooms now — is it in bloom?*

Rules:

- **Questions are asked where they can be answered.** A question about what a plant looks like is
  worth asking in the garden and worthless at a desk.
- **A question may always be dismissed**, and dismissal is information: it decays like a nag.
- **The product never blocks on an unanswered question.** Everything remains usable with the data as
  thin as it is on day one.

---

## 7. Interactions & edge cases

- **A planting is removed but its journal is not.** Removing a planting from a border ends it; it
  does not erase what it did. Its photos and observations remain reachable from the plant type and
  from the border's history. *Example: the ivy pulled out of BS in March 2026 keeps its two
  observations; the cells become `dirt`.*
- **A plant type's `snoeiperiode` changes after tasks were generated.** Completed tasks and their
  journal entries are untouched — they record what happened. Future tasks regenerate. History is
  never rewritten to match current reference data.
- **Two plantings of one type in one border.** Fully supported and expected; this is what `a:`/`b:`
  encoded. They have separate identities, photos, observations and derived tasks, and are
  distinguished in the layout by position, not by name.
- **A photo is taken of a cell that is `dirt`.** Allowed. It attaches to the border and the position,
  not to a planting. *Example: photographing a gap to remember what to fill it with — which is also
  the `Notes` sheet's wishlist, arriving by a better route.*
- **A derived task exists for a planting whose type has `snoeiperiode` = `unknown`.** No task is
  generated, and the gap becomes a question. Silence is never treated as "no pruning needed".

---

## 8. Open questions

Deliberately unresolved. Each says what is currently true, what the alternative is, and what would
settle it.

- **Ambiguous `bloeiperiode` encodings.** Three incompatible formats are in use — `juli, augustus`
  (list), `juli-september` (range), `maart,april, mei` (list). `augustus, oktober` for
  `duizend-knoop` is genuinely ambiguous: August *and* October, or August *through* October? Only
  the owner knows. Roughly forty such facts exist; they are the initial review queue, not a
  migration blocker.
- **`rustperiode` does not exist in any source.** Nothing records when a deciduous plant dies back or
  re-emerges, which leaves the season view unresolved from roughly November to March — precisely the
  stretch where *"what does the garden look like now"* matters most. Acquired by observation over a
  season, or seeded from general knowledge per species and marked `seeded`.
- **Actual sun / soil / moisture per cell.** The catalogue records what each plant *wants*
  (`standplaats`, `grondsoort`, `vocht`). Nothing records what each *spot has*. With both, the engine
  could report that a plant is in the wrong place — advice no plant app can give, because none of
  them know this garden. Deliberately not built now; see tech-spec's Future direction for the rule
  that keeps it possible.
- **How steep the nag decay is.** Currently unspecified beyond "weakens each time". Whether that is
  three skips or ten, and whether it decays per skip or per season, wants a season of real use before
  being fixed.
- **Whether a planting has an extent independent of its cells.** Currently cell count is the only
  extent, and `m2` on the type is per-plant. For a hedge like `haag-laurier` these disagree. Worth
  settling once coverage or spacing advice is actually attempted.
