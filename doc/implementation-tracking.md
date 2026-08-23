# Implementation tracking

**Purpose.** The build plan and its running record: what gets built, in what order, and what
actually happened.

**What belongs here.** Stages, their checklists, notes on how each item really went, and the
backlog of deferred work.

**What doesn't.** The process itself — that's [workflow.md](workflow.md), which every stage below
follows. Don't restate it per stage.

**Sequencing rule.** Each stage must be independently exercisable using only what earlier stages
already built. No stage's tasks may depend on something a later stage hasn't built yet.

Every stage below therefore carries a **Try it:** line — how you'd actually exercise the thing
once the stage is done. Fill it in *while planning the stage*, not after. If you can't answer it
concretely, the stage is scoped wrong, and you've found out now rather than three stages later.
A vague answer ("the code is there") is a failed answer.

Cross-references: [domain-spec.md](domain-spec.md), [tech-spec.md](tech-spec.md),
[style-guide.md](style-guide.md), [implementation-spec.md](implementation-spec.md).

---

## Stage 1 — {Skeleton}

*One line on why this stage exists and what it unlocks.*

**Try it:** {how you exercise this once it's done — e.g. "open the app; the start screen renders
and the Start button reaches the main menu"}

- [ ] Spec
- [ ] {Item}
- [ ] {Item}

## Stage 2 — {…}

**Try it:** {…}

- [ ] Spec
- [ ] {Item}

## Stage {N}b — {An intermediate stage}

*Use an `Nb` stage for a focused pass on something already built — a UX revisit, or pulling items
forward out of the polish stage because waiting has stopped making sense. Say in the italic note
what prompted it; that's usually the most useful thing about it.*

**Try it:** {…}

- [ ] Spec
- [ ] {Item}

---

## Stage {N} — Polishing

*A deliberate closing pass before considering the build done. Also the home for anything deferred
along the way.*

- [ ] Spec
- [ ] Edge-case sweep against domain-spec
- [ ] UI/UX pass
- [ ] Audit the docs against the actual implementation, and document any remaining gaps

Deferred items land here as they're found, each with: what's wrong, why it wasn't fixed then, and
what fixing it would take.

---

# Backlog — features to plan later

Genuinely out of scope for this build, per what the docs themselves call out as deferred — **not**
a place to park anything that's merely unfinished. Unfinished work goes in the polish stage above,
where it stays visible.

- [ ] {Item} — {which doc scopes it out, and why}

---

## Notes on checking items off

See [workflow.md](workflow.md) for the full routine. In short: check items off with a note on what
actually happened, add `Ad hoc:` items for things found and fixed along the way, and move anything
deliberately skipped to the polish stage with its reasoning rather than dropping it.

The divergences are the point. A checklist of clean ticks records nothing that the git log
doesn't already say better.
