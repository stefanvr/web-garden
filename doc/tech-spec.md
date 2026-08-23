# Tech specification

**Purpose.** What the project is built with, and — more importantly — *why*, including what was
rejected and which risks were knowingly accepted.

**What belongs here.** Stack choices, architectural rules, testing strategy, platform/support
targets, and any decision that constrains how code gets written across the whole project.

**What doesn't.** Domain rules (domain-spec), per-feature behavior (implementation-spec), visual
tokens (style-guide), build sequencing (tracking), and how any of it runs on a particular machine
(environment).

**Rule of thumb.** A choice belongs here if violating it in one module would be a problem for the
project as a whole. Note *choice*: a description of what's true on your machine isn't one, which
is why it lives in [environment.md](environment.md) instead.

---

## Stack

- **{Layer}:** {choice}
- **{Layer}:** {choice}

## Architecture

- {Architectural rule, stated as a rule someone could violate.}

## Tooling

- **Dev:** {how it runs locally, with live reload}
- **Tests:** {runner, and what it covers}
- **E2E:** {tool, and how thin the layer is deliberately kept}

---

## Decisions

The valuable part of this document. One entry per decision that wasn't obvious.

### {Decision}

**Chosen:** {what}

**Why:** {the reasoning, in terms of this project's actual constraints}

**Rejected:** {alternative} — {why it lost}

**Accepted risk:** {what could go wrong, and why that's tolerable for now}

> Recording the rejected option matters as much as the chosen one. Without it, the same
> alternative gets re-proposed every few months and re-litigated from scratch.

### Resolving what domain-spec left open

A particular kind of decision belongs here: one the domain spec deliberately **didn't** make.
Domain rules often constrain an outcome without dictating the mechanism — "positions are
addressed by row and column" says nothing about the internal maths, "results are reproducible"
says nothing about which algorithm.

When implementation forces that choice, resolve it here and say plainly that the domain spec left
it open. Otherwise it gets settled implicitly by the first module that needs it, and every later
module quietly copies whatever that one did.

### {Decision domain-spec left open}

**Domain-spec says:** {the constraint it does impose}

**It doesn't specify:** {the gap}

**Resolved as:** {choice, and where the single source of truth for it lives}

---

## Testing strategy

State where the *bulk* of coverage lives and why, so nobody has to guess whether a new test
belongs in the fast layer or the slow one.

- **{Fast layer}** carries the bulk: {what makes it cheap here}.
- **{Slow/E2E layer}** is deliberately thin: {what it's reserved for}.

A useful split: test the logic through its own interface where it's cheap and deterministic, and
reserve browser/integration tests for wiring that the cheap layer structurally cannot see.

---

## Future direction

Things deliberately out of scope now, where a decision is being made *today* to keep them
possible later. Say which current rule exists to protect the future option — otherwise someone
will reasonably simplify it away.

**Explicitly out of scope:** {list, so "not built yet" is never mistaken for "overlooked"}.
