# Workflow

**Purpose.** The development routine: how a stage goes from plan to merged code, and where the
review gates are.

**What belongs here.** Anything about *process* — branching, commit granularity, review points,
merge and push order, how the docs get updated as work lands.

**What doesn't.** Anything about the product itself. Rules go in domain-spec, technical choices in
tech-spec, behavior in implementation-spec, the build order in implementation-tracking. If a
statement would still be true on a completely different project, it probably belongs here; if it
would change, it belongs in one of the others.

---

## Per stage

Work is organized into **stages** (see implementation-tracking.md). Each one runs the same loop.

### 1. Review the plan

Re-read the stage's own checklist and check whether it still holds up. Add, remove, or tweak
steps based on what's been learned since it was written — especially from how the previous stage
actually went. Do this **before** touching the spec or writing any code.

A plan written five stages ago was written by someone who hadn't built the last four.

Answer the stage's **Try it:** line now, if it isn't already filled in — concretely, as the steps
you'd actually take. It's the sequencing rule's only real enforcement: a stage you can't describe
exercising is a stage that depends on something not built yet, and finding that out at planning
time costs a sentence instead of a rewrite.

### 2. Create the stage's branch

One branch per stage, off whichever branch the project integrates into — call that the
**integration branch**. On a small project that's just `main`; on a longer build it's often a
long-running branch that only reaches `main` at milestones, so `main` always holds something
demonstrable.

Pick one and say which in this doc. Either works; not knowing which is in use is what causes
trouble.

> **Integration branch for this project:** `main`

One branch per stage keeps a stage's history reviewable as a unit, and reverting it a single
operation.

### 3. Fill in the spec, then stop

Write the implementation-spec sections the stage needs. That doc is organized by
element/module, not by stage, so a stage typically touches a handful of sections rather than one.

**Then stop and wait for explicit sign-off before writing implementation code.** This is the
cheapest review gate in the loop: a wrong assumption costs a paragraph here and a day of rework
after the code exists.

**Opt-out.** If the reviewer explicitly says to skip the wait for a given stage ("if there are no
significant questions, spec it and start — I'll review after"), then: note any genuine open design
questions *in the spec text itself*, pick the sensible default for each rather than blocking, and
proceed. Review happens against the finished result instead of the spec draft. This is a
per-request opt-out, not a change to the default.

If the design shifts once implementation starts, update the spec section — it describes the end
state, so it must match what actually got built.

### 4. Implement, one commit per checklist step

A separate commit per checklist item, not one commit per stage. Bundling a whole stage into one
commit makes the diff unreviewable and bisecting useless.

Each commit message should say **why**, not just what — the what is in the diff. Decisions,
rejected alternatives, and anything surprising you found are worth the lines.

### 5. Verify before claiming done

Run the **full** test suite, not just the tests for what you touched. Report failures plainly,
with the output; a skipped step gets said out loud, not quietly dropped.

**Look at anything visual.** A passing test says the code ran, not that the result is right. A
colour at 18% opacity over dark terrain can be technically drawn and effectively invisible, and
only looking finds that.

**Write throwaway verification for anything you're reasoning about rather than observing.** A
scratch script that runs the real functions and prints what actually happened — a simulation over
many iterations, a screenshot, a direct check of a computed value — repeatedly catches things that
careful thinking misses: off-by-one errors in hand-worked coordinates, a rule that never fires, a
fixture that isn't what you meant. Delete the script in the same session
(see code-conventions.md).

Two traps worth naming, both of which cost real time:

- **Don't write scratch output into a directory the dev server serves or watches.** A live-reloading
  server will reload the page mid-run and reset the state you were inspecting, and the failure
  looks like an application bug rather than a tooling one.
- **A test failing after a deliberate rule change may be asserting the old behavior.** Before
  "fixing" anything, decide which of the two is right. A test written when the old rule held is
  evidence about the old rule, not about the code being wrong now — but it's equally possible the
  rule change was wrong, and the test is telling you so. Read it before touching either.

### 6. Push the branch

Push the stage branch to its own remote as soon as it's complete — **before** review, and before
any merge. Two reasons: the work is backed up off your machine from that moment, and the reviewer
has something to look at that isn't your working copy.

### 7. Review

The reviewer reviews the finished stage. Nothing merges before this.

### 8. Merge, then push the target

Merge or fast-forward the stage branch into the integration branch, then push that.

Because step 6 already pushed the branch itself, its full history survives on the remote
independently — rather than existing there only implicitly, folded inside the integration
branch's history after the merge.

Delete the stage branch once it's merged and you're confident, locally and on the remote. A
branch list that only contains live work stays useful; one that accumulates every finished stage
stops being read.

---

## Checking work off

When a stage's item is done, check it off **with a note on what actually happened** —
particularly where it diverged from the plan:

- Something that turned out to be already handled by earlier generic work: say so, and what
  confirmed it.
- Something found and fixed along the way that wasn't in the plan: add it as an `Ad hoc:` item
  rather than leaving the checklist looking like the plan was perfect.
- Something deliberately *not* done: move it to the backlog stage with the reasoning, don't
  silently drop it.

The checklist is a record of how the build actually went. Its value is in the divergences.

---

## Deferring work honestly

When something real is found but shouldn't be fixed now, write it into the polish/backlog stage
with enough detail to act on later: what's wrong, why it was deferred, and what fixing it would
take. "Not a minor tweak" is useful information; a one-line stub that says "improve X" is not.

Anything deferred because it needs a **decision** rather than work should say which decision, and
what the options are. That's what makes it resumable by someone else.

---

## When a rule turns out to be wrong

Specs get things wrong. When implementation reveals that a documented rule doesn't hold up:

1. Fix the doc that owns the rule, in the same change as the code.
2. Say plainly in the commit message that it's a reversal, and why the original reasoning failed.

Don't leave a doc asserting something the code no longer does. A spec nobody trusts is worse than
no spec, because people keep half-believing it.

Watch specifically for **implementation limitations leaking into rules** — "it works this way
because that was awkward to build" is a bug in the doc, not a design decision. Write the rule the
domain actually wants, then note the gap if the implementation can't meet it yet.
