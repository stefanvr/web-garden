# Web Garden

A maintenance engine for one specific garden — which plant is in which border, what each one did
last season, and what therefore needs doing this month.

See [doc/domain-spec.md](doc/domain-spec.md) for what it does and the rules it follows,
[doc/tech-spec.md](doc/tech-spec.md) for technical decisions, and
[doc/implementation-tracking.md](doc/implementation-tracking.md) for the build plan.
New here? [doc/workflow.md](doc/workflow.md) is how work actually gets done.

## Development

Node 20 (see `.nvmrc`). On this machine every command must run inside WSL with an **interactive**
shell — `wsl.exe -e bash -ic '…'` — or it silently gets the wrong Node. See
[doc/environment.md](doc/environment.md), which explains that and the rest of the setup.

```
npm install
npm run dev        # Vite dev server, live reload
npm test           # unit tests (Vitest)
npm run typecheck  # tsc --noEmit
npm run test:e2e   # Playwright smoke layer, desktop + mobile viewports
npm run build      # production build into dist/
```

`npm run test:e2e` builds first and serves `dist/` through `vite preview`, rather than testing the
dev server — the build identifier is substituted at build time, so the dev server would exercise a
different artefact than the one that ships.

## Deployment

Push to `main`. The workflow in `.github/workflows/` typechecks, runs unit tests, builds, deploys
Firestore and Storage rules, then deploys hosting — in that order, so a new bundle never lands
against rules that predate it.

The page shows a **build identifier** (short commit SHA + build time, in UTC). That is how a deploy
is confirmed: on a phone, a landed deploy and a stale cached page are otherwise indistinguishable.

## Dev-only surfaces

Anything that exists purely to make development or testing easier goes here, **with how to reach
it** — these get forgotten within a month of being built, and rediscovered by accident a stage
later.

- _None yet._
