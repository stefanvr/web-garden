# Tech specification

**Purpose.** What the project is built with, and — more importantly — *why*, including what was
rejected and which risks were knowingly accepted.

**What belongs here.** Stack choices, architectural rules, testing strategy, platform/support
targets, and any decision that constrains how code gets written across the whole project.

**What doesn't.** Domain rules (domain-spec), per-feature behavior (implementation-spec), visual
tokens (style-guide), build sequencing (tracking), and how any of it runs on a particular machine
(environment).

**Rule of thumb.** A choice belongs here if violating it in one module would be a problem for the
project as a whole.

---

## The rule behind most of what follows

Three deployments preceded this one — AWS S3 with CDK, Firebase, GitHub Pages — and only one of the
three was actually painful. The difference was not the vendor:

> **Prefer configuration you could recreate by hand in ten minutes over code that describes
> infrastructure.**

CDK for a static site is hundreds of lines describing services that change underneath it; it rots in
proportion to its volume, and it rots whether or not the project is being worked on. `firebase.json`
plus a rules file is around forty lines, and forty lines cannot rot much. Any future proposal to
"properly codify the infrastructure" should be measured against this rule before it is measured
against its own merits.

## Stack

- **App:** static single-page PWA. No server-rendered pages, no application server.
- **Language:** TypeScript.
- **UI:** No framework. TypeScript modules rendering SVG and DOM directly, bundled by Vite.
- **Local store:** IndexedDB, via Firestore's own offline persistence.
- **Data:** Cloud Firestore.
- **Photos:** Firebase Storage.
- **Auth:** Firebase Auth, single account, sign-up disabled in console.
- **Hosting:** Firebase Hosting.
- **CI/CD:** GitHub Actions, deploying on push to the integration branch.

## Architecture

- **The domain layer never imports Firebase.** Season resolution, task generation, nag decay and
  seed parsing are pure functions over plain types. Persistence is reached through a repository
  interface. The previous build got this right with its `Storage<T>` base class, and it is the part
  worth carrying forward.
- **A border's layout is not a grid of occupied cells.** Store the grid's dimensions and its cell
  *kinds* (`dirt` / `none` / `edge`), then store plantings as separate records that reference cell
  coordinates. Occupancy is a relation, not a property of the cell.
- **The device is the source of truth during use.** Every write lands locally first and syncs when
  the network allows. Nothing in the UI waits on a round trip.
- **Reference data and mutable data are separate stores.** The seeded catalogue ships with the
  application; the journal, check-offs, photos and review states live in Firestore.
- **Months are integers 1–12 internally.** Dutch month names are display, with exactly one mapping
  table. No Dutch string is ever compared for scheduling.
- **Geometry lives outside the renderer.** Which cell contains a point, and what outline a planting's
  cell set makes, are pure functions over the layout — not SVG code. Swapping SVG for canvas later
  must be replacing a draw function, not rewriting the interaction.
- **Views re-render from state; they do not patch themselves.** A view exposes one `render(state)`
  that rebuilds its subtree, rather than mutating individual nodes in event handlers. With roughly a
  thousand SVG elements in the largest view, full rebuild is imperceptible, and it removes the entire
  class of bug where one path forgets to update something. This rule is what makes going without a
  framework safe; without it, the decision below is a bad one.

## Tooling

- **Dev:** `npm run dev` — Vite dev server with live reload.
- **Tests:** `npm test` — Vitest over the domain layer. Carries the bulk of coverage.
- **E2E:** `npm run test:e2e` — Playwright, deliberately thin, every spec at desktop *and* mobile
  viewports.
- **Seed:** `npm run seed:generate` — regenerates the catalogue from `Tuin.xlsx`. Run by hand, output
  committed.

---

## Decisions

### Firebase rather than AWS or a hand-rolled backend

**Chosen:** Firebase — Firestore, Storage, Auth, Hosting.

**Why:** It is the one of the three previous deployments that was not painful, it covers data,
photos, auth and hosting from a single vendor with a single credential, and its entire configuration
surface is a `firebase.json` and two rules files.

**Rejected:** AWS S3 + CDK — the infrastructure code needed feeding to stay correct, and stopped
being correct whenever the project was left alone for a while. That is a permanent tax on a hobby
project with irregular attention, which is exactly the wrong shape of cost.

**Accepted risk:** Vendor lock-in, and a Blaze billing account with a budget cap. Mitigated by the
repository-interface rule above, which keeps the coupling at one seam rather than throughout.

### Firebase Hosting rather than GitHub Pages

**Chosen:** Firebase Hosting, deployed from GitHub Actions.

**Why:** Firestore and Storage rules have to be deployed regardless, so the Firebase CLI and its
credentials are in CI either way. Serving the app from Pages would not avoid that plumbing — it would
add a *second* deploy path beside it, with its own workflow, its own failure mode, and an extra
authorized-domain configuration for Auth. One vendor, one command, rules and application shipping
together.

**Rejected:** GitHub Pages, which was the initial recommendation here and was wrong. It was argued
for on the grounds that it needs no plumbing; that is only true for a project whose backend needs no
plumbing either, which this one does not.

**Accepted risk:** `firebase init hosting:github` generates a workflow that deploys **hosting only**.
Shipping Firestore and Storage rules from the same pipeline is work we add ourselves, and the
generated service account may need roles beyond hosting deployment to do it. This is a stage 1 task,
not something to discover later.

> The genuinely painful part of the previous Firebase setup — base64-encoding a service account JSON
> into a CI variable by hand — is gone. The CLI creates the service account, uploads its key to
> GitHub's secret store itself, and writes the workflow.

### Local-first, with Firestore's offline persistence doing the work

**Chosen:** Firestore with offline persistence enabled, behind a repository interface.

**Why:** The product is used standing in a garden on a phone, possibly without signal, tapping cells
and checking off tasks. Offline is not a refinement here, it is the operating condition. Firestore's
persistence layer provides local reads, queued writes and reconciliation for approximately no code,
which is the cheapest correct answer available.

**Rejected:** A hand-written IndexedDB store with an explicit sync adapter. Genuinely more portable,
and a week of work that produces no garden value — the exact trade the previous two attempts kept
making and losing.

**Accepted risk:** Last-write-wins on conflict. Acceptable because there is one user; two devices
editing the same planting in the same minute is not a real scenario, and the journal is append-only
where it matters.

**Accepted risk:** **Firebase Storage has no offline upload queue.** Firestore handles data offline;
photo uploads do not. A photo taken with no signal needs a local outbox that drains when the network
returns. This is real work and it is easy to miss, because it only shows up where the product is
actually used.

### The product asks; it does not detect

**Chosen:** Photos carry EXIF date-time. Bloom state is established by asking a one-tap question.

**Why:** If the application knows which planting and what date, it already knows whether that plant
is *supposed* to be flowering — so a confirmation is both cheaper and better evidence than a
classifier's guess. It also produces exactly the trickle of small questions the domain's governing
constraint depends on.

**Rejected:** Image recognition for bloom detection. It is a research project bolted to a garden app,
and it would stall the build the way the half-built editing screens did.

**Accepted risk:** Bloom data only accrues when the owner is actually outside. Acceptable — that is
also when it is true.

### The seed is a generated asset in the repository

**Chosen:** `Tuin.xlsx` is parsed by a committed script into a static catalogue file, shipped with
the application. Review-before-add happens as a git diff.

**Why:** Reference data is small, slow-changing and worth versioning. Keeping it in the repository
makes the import inspectable, revertible, free to serve, and reviewable in the one tool already built
for reviewing changes. Only mutable data needs the backend.

**Rejected:** Importing the spreadsheet directly into Firestore. It makes the initial import a
one-shot event with no diff, no history, and no way to re-run it after fixing the parser.

**Accepted risk:** Once seeded, corrections made in the application diverge from the file in the
repository. The file is the *starting point and fallback*, not the live copy. Re-seeding is
deliberately a fresh-start operation, not a merge.

### SVG for the border layout

**Chosen:** SVG.

**Why:** Tapping a cell is the primary navigation of the whole product, and SVG keeps that as a
per-element DOM event rather than manual hit-testing. It also carries the enhancements this layout is
expected to grow into — organic planting outlines, overlay layers for actual sun and soil, zoom and
pan via `viewBox` — while remaining styleable by the same theme tokens as the rest of the interface.

**Rejected:** *Canvas* — its advantage is thousands of elements with per-frame redraw, and seven
borders of 144 cells with roughly 150 planted is two orders of magnitude short of that threshold. It
would cost manual hit-testing on the app's most-used interaction, colours hard-coded in JavaScript
instead of tokens, device-pixel-ratio handling and manual text, in exchange for headroom never
collected. *An HTML/CSS grid* — simplest for a rectangular layout, but it cannot express non-square
outlines at all, and layering overlays over the same coordinates becomes z-index management.

**Worth being clear about, because it is the actual constraint:** the renderer is not what limits
organic shapes — the data is. A planting is a *set of cells*, so no renderer produces true curves.
What SVG does allow, at any point and without a data change, is drawing a smoothed hull around a
planting's cell set, which gives clumps that read as objects rather than pixels. True free-form
shapes would need plantings to carry polygons, which is a domain change, not a rendering one.

**Accepted risk:** Brush-style painting of planting areas, if it is ever wanted, is the one
interaction canvas does genuinely better. The geometry-outside-the-renderer rule is what keeps that
switch cheap.

### No UI framework

**Chosen:** TypeScript modules rendering SVG and DOM directly, bundled by Vite. No React.

**Why:** Nearly all of this product's complexity is in the domain layer, which is framework-free by
the architectural rule above — season resolution, task generation, decay, seed parsing. What remains
is a thin shell of perhaps eight views over that. A framework earns its keep by taming UI state
complexity, and there is not enough of it here to pay for the dependency.

The question that settled it was asked directly: does a framework help an assistant that is writing
the code? Marginally — React is heavily represented in training data and its declarative model makes
stale-view bugs structurally hard. But that benefit is small once the domain layer holds the
complexity, and it is bought with the largest source of dependency churn in the tree.

**Rejected:** *React* — the honest tie-breaker if a framework were needed, being the one the owner
knows, and it should be reached for the moment the tripwire below trips. *Next.js* — server
rendering, routing and build machinery this project has no use for. *No build step at all*, which the
template's starter assumes: attractive under the ten-minute rule, but it costs TypeScript, and a
domain of month sets, three-valued foliage and four review states is precisely where a type checker
earns its place.

**Accepted risk:** Hand-written rendering is where stale views and leaked listeners come from, and
those bugs are invisible to unit tests — they appear when you are standing in the garden. Mitigated
by the render discipline in the architecture rules, and by the Playwright layer running at both
viewports.

**Tripwire.** Revisit this the moment UI state stops being local to a view — cross-view shared state,
optimistic updates with rollback, or several interdependent panels reacting to one change. That is
what a framework is actually for, and reaching for it then is not a reversal of this decision but the
condition it was made under.

### Resolving what domain-spec left open

**Domain-spec says** a planting has a stable identity that survives changes to its type and position.

**It doesn't specify** how that identity is formed.

**Resolved as:** an opaque generated id, never derived from plant code, border, or coordinates. The
spreadsheet's `a:` / `b:` prefixes are seeded as *labels*, not identifiers — they are display sugar
and may be edited or dropped without consequence.

**Domain-spec says** `bloeiperiode` and the other periods are sets of months.

**It doesn't specify** whether they may be non-contiguous.

**Resolved as:** an explicit set, never a start/end range. `augustus, oktober` for `duizend-knoop`
may well mean two separate months, and a range representation would silently resolve an ambiguity
that domain-spec deliberately left open for the owner to settle.

---

## Testing strategy

- **Vitest over the domain layer carries the bulk.** Season resolution, task generation from three
  sources, nag decay, review-state precedence and the spreadsheet parser are all pure functions over
  plain data. They are cheap, deterministic, and where the actual product logic lives.
- **Playwright is deliberately thin**, reserved for wiring the unit layer structurally cannot see:
  that tapping a cell reaches the right planting, that a check-off persists, that the layout is
  usable at phone size. Every spec runs at both viewports, because "works on a phone in the garden"
  is a product requirement and an assertion nobody makes is an assertion that fails quietly.
- **The seed parser is tested against the real `Tuin.xlsx`**, not a fixture. The point of that code is
  to survive one specific messy file.

---

## Future direction

Deliberately out of scope now, with the rule that keeps each possible:

- **Actual sun / soil / moisture per cell.** Kept possible by the architectural rule that occupancy
  is a relation rather than a property of the cell: adding a second layer over the same coordinates
  is additive, not a restructuring. Do not "simplify" a cell back into a record that holds its own
  plant.
- **Bloom detection from photographs.** Kept possible by storing photos with their planting and
  timestamp intact, so a classifier could later be run over an existing corpus rather than needing
  one collected for it.
- **More than one user, or more than one garden.** Not protected. Both are explicitly out of scope,
  and designing around them now would cost more than retrofitting them if the need ever appears.

**Explicitly out of scope:** multi-garden, sharing, plant identification from photographs, weather
integration, and any bulk-editing surface — the last by domain rule, not by scheduling.
