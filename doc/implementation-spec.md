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

**2. Describe the end state, not a build log.**

Each section describes the state to reach once its stage finishes — not a chronological history.
Drop stage references once they stop being forward-looking; that history lives in the tracking doc
and the git log.

Sections start `_Not started._` and get filled in when the stage that needs them comes up.

---

## 1. Border layout

*(domain-spec §1 — the garden)*

_Not started._

## 2. Planting detail

*(domain-spec §2 and §3 — what is known about a plant, provenance and review state)*

_Not started._

## 3. Season view

*(domain-spec §4)*

_Not started._

## 4. Maintenance schedule

*(domain-spec §5)*

_Not started._

## 5. Questions

*(domain-spec §6)*

_Not started._

## 6. Application shell

*(no domain-spec counterpart — application behavior only)*

The frame everything else renders inside. At present it is the whole application.

- Single page. Shows the application name and a **build identifier**, both visible without
  scrolling at phone width.
- **Build identifier is short commit SHA + build timestamp**, injected at build time. It exists to
  make a deploy verifiable from a phone: without it, a landed deploy and a stale cached page look
  identical, and the deploy pipeline cannot actually be confirmed.
- No horizontal scroll at phone width. This is asserted by the mobile-viewport E2E run, not by
  looking.
- **No service worker yet.** A caching service worker would make a landed deploy look like a failed
  one, which is precisely the signal this stage exists to establish. It arrives with offline
  behavior, together with an update strategy that does not strand the user on an old build.
- No navigation, no sign-in prompt, no data access. Anything beyond name and build identifier
  belongs to a later section here.

## 7. Photo capture

*(no domain-spec counterpart for the capture flow itself; what a photo attaches to is domain-spec §1)*

_Not started._

## 8. Sync and offline state

*(no domain-spec counterpart — application behavior only)*

_Not started._
