# {Project} — Style Specification

**Purpose.** The visual vocabulary: tokens, components, and the states things can be shown in.

**What belongs here.** Concrete values (colors, type, spacing, sizes) and the named treatments
built from them. Specific enough that two people implementing different screens produce something
that looks like one product.

**What doesn't.** Which control appears where and what it does (implementation-spec), and
rendering technology choices (tech-spec).

**Phase note.** Early on this only needs to be *enough to start*. Real art can replace flat colors
later without changing the structure — as long as the structure is in terms of named tokens rather
than literal values scattered through the code.

---

## 1. Tokens

One source of truth. Nothing else hand-rolls these values — code references the token, so a
change here actually propagates.

| Token | Value | Used for |
|---|---|---|
| `--{name}` | `#000000` | |

## 2. Typography

| Role | Font | Notes |
|---|---|---|
| Display | | titles/buttons only |
| Body | | everything else |

## 3. Layout & spacing

Include touch-target minimums here if the project has any touch surface — roughly 44×44 CSS px is
the usual accessibility floor, and it's much cheaper to honor from the start than to retrofit.

---

## {N}. States & highlights

How status and affordance are shown. Split these two apart deliberately — they answer different
questions and shouldn't share one treatment:

**Entity status** — "what is this thing?" (health, progress, remaining resource).

| State | Treatment |
|---|---|
| | |

**Affordance overlays** — "what happens if I interact here?"

| Overlay | Treatment | Means |
|---|---|---|
| | | |

Where several overlays can appear at once, say how they rank — weight, opacity, or stroke — so the
ambient ones never compete with the ones that commit to an action.

### On placeholder rules

If a treatment is a deliberate simplification for now, **say exactly what it's scoped to** and what
is expected to replace it. An unscoped "text only, no highlights yet" gets read as a rule about
the whole UI, and richer treatment gets wrongly deferred everywhere — including places that were
never meant to be constrained. Name the surface it applies to, and name the pass that lifts it.

---

## {N}. Components

| Component | Spec |
|---|---|

---

## {N}. Open items (not yet decided)

What's deliberately still open, so nobody assumes it was settled and quietly decides it alone.
Empty is a fine state — say "none currently" rather than deleting the section, so its absence
reads as *checked* rather than *forgotten*.

- {Open question} — {what would settle it}

> Every doc in this set benefits from a section like this. domain-spec has one for rules
> (balance/tuning), and this is the visual equivalent. The failure it prevents is specific: an
> undecided thing that isn't written down as undecided gets treated as decided by whoever touches
> it next, and nobody notices a choice was ever made.

---

## {N}. Reference implementation

{Link to a live preview page rendering these tokens and components.}

Build this early. A reference page that pulls the project's real stylesheet can't drift from it,
because it *is* the implementation — unlike a document restating values, which is wrong the first
time someone changes a colour and doesn't think to update prose.
