# Environment

**Purpose.** How to actually run this project on a real machine, and which parts of that are
non-negotiable versus merely how one person's setup happens to work.

**What belongs here.** Runtimes and where they live, shells, identity/credential setup that
affects commits, ports, paths, and any tooling behaviour that surprises.

**What doesn't.** Technical *choices* — which runtime, which test framework, which architecture —
belong in [tech-spec.md](tech-spec.md). This doc doesn't decide anything; it describes what's
true. That's why it's separate: tech-spec changes when the project changes, this changes when a
machine changes, and mixing the two makes both harder to trust.

**Write silent failures first.** A command that errors is self-correcting — you see it and fix it.
A command that quietly does the *wrong thing* is not, and that's the class of problem this
document exists for.

---

## Invariants

What must be true regardless of whose machine it is. These stay true when someone else joins, and
each one is a property a setup either satisfies or doesn't.

- {Runtime} {version} or compatible.
- {Anything else that would produce broken output rather than an error if wrong.}

---

## This machine

How the invariants above are actually satisfied here. Personal to one setup — a second
contributor replaces this section rather than inheriting it.

> ### ⚠️ Starter block — keep if it matches your setup, otherwise delete and write your own
>
> Filled in from a real project (Windows host + WSL Ubuntu). If that's you, keep it. If not,
> delete the whole block and describe your actual setup — the point is that *something* concrete
> lives here, not that it's this.
>
> **Node/npm live only inside WSL**, not on the Windows host. The working directory is visible to
> Windows tools as `\\wsl.localhost\Ubuntu-24.04\...`, but every build, install, or run command
> still has to execute *inside* WSL:
>
> ```
> wsl.exe -- bash -lc 'cd ~/{project} && npm test'
> ```
>
> Calling `bash` directly from a Windows-side tool reaches Git Bash/mingw, which has no node.
> Only the `wsl.exe -- bash -lc '...'` form gets to the real environment.
>
> **`git commit` must run inside WSL too, and this one fails silently.** Windows-side git's global
> identity is a work email; WSL's is the personal identity matching this repo's owner. Committing
> through the Windows shell doesn't error — it just attributes the commit to the wrong person, and
> you find out later. (Discovered exactly that way, after two commits had already landed.)
>
> **Background processes** (dev servers) need the calling tool's own backgrounding, not `&` inside
> the `wsl.exe` call — a one-shot `wsl.exe` invocation tears down its children when it exits, so
> the server dies immediately while the launch command still looks like it succeeded.
>
> **Quoting.** Nesting a heredoc or an apostrophe inside `bash -lc '...'` breaks in ways whose
> error messages point somewhere unrelated. Write the file with an editor/tool instead of
> constructing it in a shell string.

---

## When someone else joins

The section above is tuned to one person's setup, and that's a deliberate trade: for a solo
project the specifics *are* the value, and a generic version would lose exactly the part worth
having.

It does not survive contact with a contributor whose environment differs. When that happens, don't
genericise it into vagueness — **promote whatever actually matters up into Invariants**, and let
each person's setup satisfy those however it does. Add a second "This machine" section rather than
merging them into a description that fits neither.

The invariants were always the shared part. The rest was only ever one machine's answer to them.
