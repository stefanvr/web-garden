# {Project} — Domain Specification

**Purpose.** What this thing *is* and what its rules are, independent of how it's built.

**What belongs here.** The problem domain: entities, their properties, the rules governing them,
and the edge cases those rules produce. Written so someone could reason about the product — or
play the game, or work the process — without reading a line of code.

**What doesn't.** Anything technical (tech-spec), anything about how it's presented or operated
(implementation-spec), anything visual (style-guide), and anything about build order (tracking).

**Rule of thumb.** If changing it would change *what the product does*, it belongs here. If
changing it would only change *how the product is made*, it doesn't.

---

> ### ⚠️ Illustrative example — delete this whole block
>
> Section 1 below is filled in with a small worked example, because the hard thing to convey
> abstractly is *how much detail to write*. An empty stub teaches nothing about density. Read it,
> then delete it and write your own.
>
> ---
>
> ## 1. Library lending
>
> Describe the entities and their properties. Tables work well for anything with per-type values —
> they stay readable as the list grows, and they make gaps obvious.
>
> | Item type | Loan period | Renewals | Reservable | Notes |
> |---|---|---|---|---|
> | Book | 21 days | 2 | Yes | — |
> | Reference book | — | — | No | Never leaves the building |
> | DVD | 7 days | 0 | Yes | — |
> | E-book | 21 days | Unlimited | No | Licence-limited concurrent copies |
>
> State constraints as rules, not prose:
>
> - A member may hold at most 10 items at once, of which at most 3 may be DVDs.
> - A reservation holds an item for 3 days once it becomes available, then passes to the next
>   member in the queue.
> - An overdue item blocks new loans — but **not** returns, renewals of *other* items, or
>   collecting a reservation already being held. Both halves matter: the block exists to get items
>   back, so it must never make returning one harder.
>
> Note what that last rule does: it names its own exceptions explicitly, and says *why*, in one
> clause. That's the density to aim for. Compare it with "overdue items restrict borrowing" —
> which reads fine and settles nothing.
>
> ---
>
> ## 3. Interactions & edge cases
>
> The rules above will overlap. Where two of them meet ambiguously, resolve it *here*, in writing,
> before implementation has to guess.
>
> - **A reserved item is returned overdue, and the next member in the queue is also blocked.**
>   The 3-day hold starts anyway; being blocked prevents collection, not reservation. If the hold
>   lapses uncollected, it passes on as normal.
>   *Example:* item due back Monday, returned Thursday. Member B's hold runs Thursday–Sunday.
>   B owes a fine and can't collect. Sunday midnight it passes to member C.
> - **A member hits the 10-item cap mid-collection.** The reservation is forfeited, not held —
>   otherwise a capped member could park items indefinitely.
>
> Worked examples earn their space. One concrete "X happens, so Y, leaving Z" is worth several
> paragraphs of careful qualification, and it doubles as a test case.

---

## 1. {Core domain area}

Describe the entities and their properties. Tables work well for anything with per-type values —
they stay readable as the list grows, and they make gaps obvious.

| {Entity} | {Property} | {Property} | Notes |
|---|---|---|---|
| | | | |

State constraints as rules, not prose:

- {Rule that always holds.}
- {Rule with its own exception, and the exception named explicitly — plus why the exception
  exists, which is usually the part that stops it being "fixed" later by someone who missed it.}

---

## 2. {Second domain area}

---

## 3. Interactions & edge cases

The rules above will overlap. Where two of them meet ambiguously, resolve it *here*, in writing,
before implementation has to guess.

Worked examples earn their space. One concrete "X happens, so Y, leaving Z" is worth several
paragraphs of careful qualification, and it doubles as a test case.

---

## {N}. Balance / tuning considerations

Open questions flagged for later, deliberately *not* decided yet. Each one says what the current
behavior is, what the alternative would be, and why it isn't settled.

Keeping these here rather than in someone's head is what stops them being silently re-decided by
whoever touches that code next.

- **{Question}.** Currently {behavior}. The alternative is {alternative}, which would {effect}.
  Worth {what would settle it}.
