# Implementation spec

**Purpose.** Companion to domain-spec: that document specifies the *rules*; this one specifies the
**interaction and application behavior** built around them — how each part is presented and
operated, plus the application-only modules (menus, chrome, save/load) that have no rule-level
counterpart.

**What belongs here.** Per-element behavior: what a control does, what a click resolves to, what
gets shown and hidden, what each mode's entry and exit are.

**What doesn't.** Domain rules (domain-spec), stack/architecture decisions (tech-spec), visual
values (style-guide), build order (tracking), and the reasoning behind a given line of code — that
belongs in a code comment, next to the code.

**Organization.** By element/module, mirroring domain-spec's structure where a section
corresponds directly to one of its sections. Deliberately *not* by stage: a stage typically
touches several sections here, so check the relevant ones before starting rather than looking for
a same-named one.

---

## Two writing rules

These exist because both failure modes happened, repeatedly, without them.

**1. Concise, guidance-only bullets — not prose.**

Each section is short bullet-point guidance for *implementing* the feature. Not paragraphs
explaining rationale or backstory, and not restating what domain-spec, tech-spec, or the tracking
doc already cover.

Favor `circular background visual + title + Start button, per style-guide §9` over several
paragraphs on why each visual choice was made and how it maps to CSS. That level of detail belongs
in code comments or the tracking doc.

**2. Describe the end state, not a build log.**

Each section describes the state to reach once its stage finishes — not a chronological history.
Drop stage references (`(Stage 4)`) once they stop being forward-looking; that history lives in
the tracking doc and the git log.

References to a *future*, not-yet-built stage are fine and worth keeping — they explain why
something isn't specced yet ("real filtering lands in Stage 9"). References to past ones just rot,
and a stale one actively misleads: an unnoticed "X is a placeholder until Stage 3" left in after
Stage 3 shipped is worse than nothing.

Sections start `_Not started._` and get filled in when the stage that needs them comes up.

---

## 1. {Element}

_Not started._

## 2. {Element}

_Not started._

## {N}. {App-only module}

*(no domain-spec counterpart — application behavior only)*

_Not started._
