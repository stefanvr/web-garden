# Code conventions

**Purpose.** How code is written and organized, and — most importantly — how it stays connected to
the documents that specify it.

**What belongs here.** Conventions that apply across the codebase: file organization, what
comments are for, determinism, dev-only affordances.

**What doesn't.** Which technologies were chosen and why (tech-spec), what any particular feature
does (implementation-spec, domain-spec), and the process around changes (workflow).

**Rule of thumb.** If it describes *how to write the code* rather than *what the code should do*,
it belongs here.

---

## Every module says what it implements

Open each module with a comment naming the doc section it implements, and the constraint it's
under. Not a restatement of what the code does — the code already says that.

```js
// Read side of tech-spec.md's state-access rule. Rendering and UI must go through this, never
// touch canonical state directly — a deliberate seam, even though it's a passthrough today.
```

```js
// Movement reach + routing — implementation-spec.md §1's Movement targeting.
// Read-only: it never mutates state, and the caller walks a returned route through the ordinary
// command rather than this module moving anything itself.
//
// Its own module rather than living in the UI because {other consumer} needs the same routing.
```

This is the single most valuable convention in this document, and it's load-bearing in both
directions:

- Reading code, you can find the rule it's meant to satisfy.
- Changing a rule, you can grep for who depends on it.

Without it the docs drift from the code silently, and the drift is only discovered when someone
implements against a spec that stopped being true several stages ago.

## Comments explain *why*, and especially "why not the obvious thing"

The diff shows what changed. A comment's job is the reasoning that isn't recoverable from
reading the code — most valuably where a naive reading would suggest a different approach, and
someone will otherwise "fix" it back:

```css
/* .menu-panel's own display:flex above (class, 0-1-0) would otherwise beat the native [hidden]
   default — this rule makes hidden win. */
```

```js
// `+ 0` normalises a possible -0, which === 0 but is distinguished by Object.is, and therefore
// by deepEqual in tests.
```

Three cases that always earn a comment:

- **A non-obvious constraint** that makes the simple version wrong.
- **A deliberate asymmetry** — two similar things treated differently on purpose. Say why, or it
  reads as an oversight and gets "tidied".
- **A shared helper's reason for existing** — especially "extracted because {other consumer} needs
  the same thing", which is invisible from its current single call site.

## Tests mirror the source layout

`test/{area}/` mirrors `src/{area}/`. Finding a module's tests should require no searching, and a
module with no matching test file should be conspicuous.

Name tests as the behavior claimed, not the function called — `a boat's reach follows water, not
land` rather than `reachableCells works`. A failing test should describe the broken behavior in
its own name, before anyone opens the file.

## Anything random is seeded

Route randomness through a seeded generator rather than the language's global one. A given seed
must reproduce a given result exactly.

This is not only for tests, though it makes them possible: it's what lets a bug report be
reproduced, a generated asset be regenerated identically, and a long simulation be re-run to
confirm a fix.

Where two options are equally valid, break the tie **deterministically** — lowest id, first in a
fixed order — rather than leaving it to iteration order that may change. "Equally valid" and
"arbitrary" are different things.

## Dev-only affordances are built, and gated

Build the things that make development and testing bearable, and make them obviously non-production:

- A **fixed fixture state** to jump straight to an interesting situation instead of setting it up
  by hand every time.
- **Preview/reference pages** rendering real output from the real code.
- A **gate** — a URL flag, an env check — so they don't ship enabled.

Document them in the README as you build them. They're forgotten within a month otherwise, and
rediscovered by accident much later.

When a fixture needs a situation the normal generation path can't produce, hand-construct it
*after* the normal path has run, and **verify the construction** rather than trusting coordinates
you worked out by hand. Fixtures that are subtly wrong cost more than no fixtures.

## Scratch work leaves no trace

Throwaway verification scripts are encouraged (see workflow.md's verification step) — but delete
them in the same session. A `_probe.js` left behind reads as real code to the next person, and to
the next AI session.

Write their output somewhere the project doesn't serve or watch.
