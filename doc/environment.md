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

> **Keep personal details out of this file.** It is committed, and may be public. Describe the
> *failure mode* and how to check for it — never paste email addresses, SSH configuration, key
> names, or absolute paths to someone's home directory. Every warning below is written to be useful
> without any of that.

---

## Invariants

What must be true regardless of whose machine it is.

- **Node 20 LTS or newer**, and *actually* that version at the moment a command runs — see the first
  silent failure below. Pinned by `.nvmrc` at the repository root.
- **Commits carry the personal identity that owns this repository**, not a work identity that may
  also be configured on the same machine. Verify, don't assume:
  `git log --format='%an <%ae>' | sort -u`.
- **`firebase-tools` is available**, to deploy hosting and — crucially — the Firestore and Storage
  rules.
- **Push access to the GitHub remote over SSH.** HTTPS is not configured here and prompts for
  credentials that no helper supplies.

---

## This machine

Windows 11 host, WSL Ubuntu 24.04, edited from VS Code on the Windows side. Personal to one setup; a
second contributor replaces this section rather than inheriting it.

The repository path is **not recorded here** — it is whatever the editor workspace is, and every
command below is written to work from there without knowing it. Work that has to happen *outside*
the repository goes in a sibling folder next to it, not in a system temp directory.

### Silent failures

**1. The Node version depends on which shell flags you use.** This is the dangerous one, because
both invocations succeed:

| Invocation | Node |
|---|---|
| `wsl.exe -e bash -lc '…'` | the **system** Node — old, possibly end-of-life |
| `wsl.exe -e bash -ic '…'` | **nvm's** Node, the one this project targets |

nvm initialises from the interactive shell startup file, so a *login* shell (`-l`) never loads it
and silently falls back to whatever the distribution installed. A build, test run or deploy can
complete on the wrong runtime and simply behave differently. **Use `-ic` (or `-lic`).** Check with
`wsl.exe -e bash -ic 'node -v'` before trusting a result that depends on the runtime.

**2. Committing from the Windows side attributes the commit to the wrong person.** The Windows host
and WSL each carry their own global git identity, and on this machine they differ — one is a work
identity, one is the personal identity this repository should use. Git does not warn; the commit
simply lands under the wrong name. **Run every git command for this repository inside WSL**, and
check attribution with the `git log` command in the invariants above.

**3. An SSH host alias exists that resembles this repository's host but resolves somewhere else.**
Pushing works over the default key — confirm with `ssh -T git@github.com`, which names the
authenticated account. Do not "fix" the remote to use that alias.

**4. Nesting apostrophes or heredocs inside `bash -ic '…'` breaks**, and the error points somewhere
unrelated (`unexpected EOF while looking for matching`). Hit while writing a document containing
ordinary English contractions. Write files with an editor or file-writing tool rather than
constructing them in a shell string; heredocs for *commit messages* are fine, as long as the
surrounding single-quoted string contains no apostrophes.

### Getting to the real environment

Node, npm and the project toolchain exist **only inside WSL**. Calling `bash` directly from a
Windows-side tool reaches Git Bash/mingw, which has none of them and the wrong git identity.

`wsl.exe` **inherits the Windows working directory**, so commands run from the editor workspace need
no path at all:

```
wsl.exe -e bash -ic 'npm test'
```

**Background processes** (dev servers) need the calling tool's own backgrounding rather than `&`
inside the `wsl.exe` call: a one-shot `wsl.exe` invocation tears down its children when it exits, so
the server dies immediately while the launch command still looks like it succeeded. *(Carried from
the template; not yet hit here.)*

### Current state

| Tool | Status |
|---|---|
| nvm | installed, with Node 20 LTS as the default |
| node | 20 LTS **when invoked correctly** — see silent failure 1 |
| `firebase-tools` | **not installed** — needed for stage 1 |
| `gh` | not installed on either side; plain `git` over SSH covers current needs |

---

## Firebase project setup

Console steps, done once by the owner. Adapted from the previous build's notes, which covered most
of this already.

- Create the project at <https://console.firebase.google.com/>.
- Enable **Authentication**, **Firestore**, and **Storage** (keep the default bucket name).
- **Billing:** settings → billing → Blaze, and set a budget cap. Storage requires it.
- **Close the door on new accounts:** Authentication → Settings → User actions → uncheck *Enable
  create (sign-up)*. This product has exactly one user, and an open sign-up on a Blaze project is
  the wrong kind of surprise.
- **CI credentials:** `firebase init hosting:github` creates a service account, uploads its key to
  the repository's secret store itself, and writes the workflow. No manual base64 of a
  service-account JSON into a CI variable is needed.
  - The generated workflow deploys **hosting only**. Deploying `firestore.rules` and
    `storage.rules` from the same pipeline is added by hand, and the generated service account may
    need roles beyond hosting deployment to do it.

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
