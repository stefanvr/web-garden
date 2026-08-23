# Implementation tracking

**Purpose.** The build plan and its running record: what gets built, in what order, and what
actually happened.

**What belongs here.** Stages, their checklists, notes on how each item really went, and the backlog
of deferred work.

**What doesn't.** The process itself — that's [workflow.md](workflow.md), which every stage below
follows. Don't restate it per stage.

**Sequencing rule.** Each stage must be independently exercisable using only what earlier stages
already built. No stage's tasks may depend on something a later stage hasn't built yet.

Every stage carries a **Try it:** line — how you'd actually exercise the thing once the stage is
done. A vague answer ("the code is there") is a failed answer.

**How far ahead this is planned.** Stages 1–4 are defined; everything after is a backlog to pick
from. Stages get written when they are picked, not now — a plan written four stages early is written
by someone who hasn't built the first four.

Cross-references: [domain-spec.md](domain-spec.md), [tech-spec.md](tech-spec.md),
[style-guide.md](style-guide.md), [implementation-spec.md](implementation-spec.md).

---

## Stage 1 — Deployed skeleton

Deployment first, before there is anything worth deploying. The effort is identical whenever it
happens, but doing it now makes every later stage verifiably shippable, and it flushes out the
deployment-only failures while there are three files rather than three hundred.

**Try it:** push a commit to `main`; a minute or two later the live Firebase Hosting URL shows the
change, opened on your phone.

- [x] Spec — [implementation-spec.md](implementation-spec.md) §6 Application shell, plus a first pass
      at [environment.md](environment.md) prompted by what the plan review turned up
- [ ] **Toolchain: upgrade Node to 20 LTS or newer, and install `firebase-tools`.** *Added at plan
      review, not in the original checklist:* this machine has Node 18.19.1, which is end-of-life and
      below what both current Vite and `firebase-tools` require. Nothing else in this stage can be
      verified until it is done
- [ ] **Owner, in the Firebase console:** create the project; enable Firestore, Storage and Auth; set
      Blaze with a budget cap; disable sign-up so the account list cannot grow
- [ ] Write those console steps into [environment.md](environment.md) *as they are done*, not from
      memory afterwards — the previous project's README is a good starting point
- [ ] Vite + TypeScript at the repo root, rendering the shell of implementation-spec §6 — name plus a
      build identifier (short commit SHA + build time) injected at build time, which is what makes
      this stage's **Try it** verifiable rather than a guess
- [ ] `dev` / `test` / `test:e2e` / `seed:generate` scripts named per the starter convention
- [ ] Vitest wired, with one assertion that would actually fail if broken
- [ ] Playwright wired at both viewports, one smoke spec
- [ ] `firebase init hosting:github` — creates the service account, uploads its key as a repo secret,
      writes the workflow
- [ ] Extend that workflow to deploy Firestore and Storage rules too; grant the generated service
      account whatever roles that needs. **The generated workflow deploys hosting only** — this is
      the step that is easy to discover months late
- [ ] `firestore.rules` and `storage.rules` denying everything except the one owner account
- [ ] Verify the whole loop end to end from a phone, not from the dev machine

## Stage 2 — Seed the catalogue

Turns `Tuin.xlsx` into committed reference data, and turns its ambiguities into a visible list rather
than a silent guess. No application surface — the output is a file and a report.

**Try it:** run `npm run seed:generate`, then read the git diff: seven borders, ~40 plant types, and
BM's `sedum-h` clump present as a planting with its cells.

- [ ] Spec
- [ ] Decide where the source workbook lives relative to the repo, and record it
- [ ] Workbook reader — script-time only, never a runtime dependency
- [ ] `Borders` sheet → seven borders with `kant` and name
- [ ] Slice `TuinV2` into 12×12 blocks at the labelled origins (rows 1/13/25/37, cols 1/13) → cells
      per border
- [ ] Group cells into plantings, honouring the `a:` / `b:` / `c:` labels as labels, not identity
- [ ] `PlantenV2` → plant types, with reference fields parsed into real types (month sets, cm,
      three-valued `blad`)
- [ ] Merge `bemesting` from `Onderhoud verkort` and guidance prose from `(Snoei)Info`
- [ ] Every fact tagged `seeded`; `unknown` recorded distinctly from empty
- [ ] **Ambiguities recorded as unresolved, never guessed** — the three `bloeiperiode` formats, the
      `augustus, oktober` case, every missing `rustperiode`
- [ ] Vitest over the parser, run against the real workbook rather than a fixture
- [ ] Committed output, plus a short report listing what could not be resolved

## Stage 3 — Render a border, tap a cell

The first visual surface, and the product's primary navigation. Read-only: no Firestore, no writes.

**Try it:** open the live URL on your phone, choose BM, tap the `sedum-h` clump, and see which
planting it is and what is known about it.

- [ ] Spec — implementation-spec sections for the layout view and the detail panel
- [ ] Fill [style-guide.md](style-guide.md); this is the first thing there is to look at
- [ ] Border picker across the seven borders, grouped by `kant`
- [ ] SVG layout rendered from the seed file
- [ ] Geometry module — point→cell, planting cell-set→outline — pure and unit-tested, living outside
      the renderer per tech-spec
- [ ] Tap a cell → the planting it belongs to
- [ ] Detail panel showing reference and guidance distinctly, and `unknown` as unknown
- [ ] Playwright at both viewports: a tap reaches the correct planting
- [ ] **Look at it on a real phone, outdoors, in daylight.** A passing test says it rendered, not that
      it is usable where it will be used

## Stage 4 — Season view

The first thing the engine actually derives, and the first honest look at how thin the winter data
is.

**Try it:** scrub to `januari` and see which plantings resolve to a state and how many come back
unknown.

- [ ] Spec
- [ ] Season resolution as pure functions — precedence, `half` foliage, missing `rustperiode`
- [ ] Tests for the precedence rule and for every unresolvable case
- [ ] Month scrubber
- [ ] Layout coloured by season state
- [ ] Unknown rendered as unknown, never guessed or defaulted
- [ ] Playwright: scrubbing changes what the layout shows

---

# Backlog — the v1 pick-list

Not deferred work and not out of scope: this is the set that v1 is drawn from. Items become defined
stages when they are picked, in whatever order turns out to make sense once stages 1–4 have been
built. Each says what it needs and what is unresolved about it.

- [ ] **Firestore, auth, and the first write.** Needs stage 1's rules. The first mutable data —
      probably a journal entry — is what proves the local-first path end to end, including writing
      with the phone offline and watching it reconcile.
- [ ] **Maintenance schedule and check-off.** Needs seeded `snoeiperiode` and `bemesting` (stage 2)
      and a write path. Domain-spec's three task sources all have to exist from the start; a
      schedule built only from plant data would miss most of what `2026 onderhoud` actually contains.
- [ ] **Photos.** Needs a write path and a **local outbox** — Firebase Storage has no offline upload
      queue, so a photo taken without signal must queue and drain later. Client-side resize to about
      1600px before upload. This is the wish that started the whole design, and it is deliberately
      not first: it is the one with the most hidden work.
- [ ] **The question and nag engine.** Needs review states (stage 2) and a write path. Domain-spec
      leaves the decay curve deliberately unsettled, so this wants a season of real use before its
      numbers are fixed — worth building the mechanism early and tuning it late.
- [ ] **The review flow.** Promoting `seeded` facts to `reviewed`, starting with the ~40 ambiguities
      stage 2 reports. The point of the whole seeding design; needs the question surface to exist.
- [ ] **Wishlist by photographing bare ground.** Domain-spec allows a photo on a `dirt` cell,
      attaching to the position. That is the `Notes` sheet arriving by a better route, and it falls
      out of the photo work almost free.

## Polishing

A deliberate closing pass before v1 is considered done. Also the home for anything deferred along the
way, each with what is wrong, why it wasn't fixed then, and what fixing it would take.

- [ ] Edge-case sweep against domain-spec
- [ ] UI/UX pass, on a phone, outdoors
- [ ] Audit the docs against the actual implementation, and document any remaining gaps
- [ ] Delete throwaway verification scripts (`~/garden/.scratch/`)

---

## Notes on checking items off

See [workflow.md](workflow.md) for the full routine. In short: check items off with a note on what
actually happened, add `Ad hoc:` items for things found and fixed along the way, and move anything
deliberately skipped into the polish section with its reasoning rather than dropping it.

The divergences are the point. A checklist of clean ticks records nothing the git log doesn't already
say better.
