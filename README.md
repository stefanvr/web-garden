# {Project}

{One line: what this is.}

See [doc/domain-spec.md](doc/domain-spec.md) for what it does and the rules it follows,
[doc/tech-spec.md](doc/tech-spec.md) for technical decisions, and
[doc/implementation-tracking.md](doc/implementation-tracking.md) for the build plan.
New here? [doc/workflow.md](doc/workflow.md) is how work actually gets done.

## Development

```
{install}
{run}      # dev server on http://127.0.0.1:{port}
{test}     # unit/integration tests
{test:e2e} # end-to-end / UI-wiring smoke tests
```

## Dev-only surfaces

List anything that exists purely to make development or testing easier, **and how to reach it** —
these get forgotten within a month of being built, and rediscovered by accident a stage later.

- `{path}` — {what it shows}
- `?{flag}` — {what it unlocks, e.g. a fixed fixture state to skip setup}

Where a dev page has a non-obvious access requirement, say it here rather than leaving the next
person to hit the error. (For example: pages using `fetch` or ES module imports must be opened
through the dev server, not by double-clicking the file — browsers block both under `file://`,
and the resulting permission error doesn't explain itself.)

---

> **Delete this line and rename the file to `README.md` when starting a real project.** The
> template's own README, which describes the doc set itself, is the one you're replacing.
