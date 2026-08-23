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

What must be true regardless of whose machine it is.

- **Node 20 LTS or newer.** Current Vite and `firebase-tools` both require it, and Node 18 reached
  end of life in April 2025.
- **Commits are attributed to the personal identity** (`stefan.van.raaphorst@gmail.com`), not to a
  work one. See the silent failure below — this does not error when it goes wrong.
- **`firebase-tools` is available** to deploy hosting and, crucially, the Firestore and Storage
  rules.
- **Push access to `github.com:stefanvr/web-garden` over SSH.** HTTPS is not configured and prompts
  for a username that no credential helper supplies.

---

## This machine

Windows 11 host, WSL Ubuntu 24.04. Personal to one setup; a second contributor replaces this
section rather than inheriting it.

The repository lives at `~/garden/web-garden` inside WSL, and is visible to Windows tools as
`\\wsl.localhost\Ubuntu-24.04\home\stefanraaphorst\garden\web-garden`. Work that has to happen
outside the repository — reference clones, scratch parsing — goes in a sibling folder under
`~/garden`, not in a system temp directory.

### Silent failures

**Committing from the Windows side attributes the commit to the wrong person.** Verified here, and
it does not error:

| Side | `user.name` | `user.email` |
|---|---|---|
| Windows host | `stefan.van.raaphorst` | `stefan.van.raaphorst@groupm.com` — **work** |
| WSL | `StefanVR` | `stefan.van.raaphorst@gmail.com` — correct |

Every git command for this repository runs inside WSL. All commits to date are correctly attributed;
check with `git log --format='%an <%ae>'` before assuming.

**`~/.ssh/config` contains an entry that looks like it covers this repository and does not:**

```
Host github.com:stefanvr
  HostName gitlab.com
```

That alias points at *GitLab*, and does not match a plain `github.com` host anyway. GitHub access
works because the **default** key (`~/.ssh/id_ed25519`) authenticates as `stefanvr` —
`ssh -T git@github.com` confirms it. Don't "fix" the remote to use that alias.

**Nesting apostrophes or heredocs inside `wsl.exe -e bash -lc '...'` breaks**, and the error points
somewhere unrelated (`unexpected EOF while looking for matching`). Hit while writing a document
containing ordinary English contractions. Write files with an editor or file-writing tool rather
than constructing them in a shell string; heredocs for *commit messages* are fine as long as the
surrounding single-quoted string contains no apostrophes.

### Getting to the real environment

Node and npm exist **only inside WSL**. Every install, build, test or run command must execute
there:

```
wsl.exe -e bash -lc 'cd ~/garden/web-garden && npm test'
```

Calling `bash` directly from a Windows-side tool reaches Git Bash/mingw, which has no node, no
firebase CLI, and the wrong git identity.

**Background processes** (dev servers) need the calling tool's own backgrounding rather than `&`
inside the `wsl.exe` call: a one-shot `wsl.exe` invocation tears down its children when it exits, so
the server dies immediately while the launch command still looks like it succeeded. *(Carried from
the template; not yet hit on this machine.)*

### Current state — does not yet satisfy the invariants

| Tool | Found | Needed |
|---|---|---|
| node | **v18.19.1** | 20 LTS or newer — **must be upgraded** |
| npm | 9.2.0 | comes with the Node upgrade |
| `firebase-tools` | **not installed** | required |
| `gh` | not installed, on either side | optional — plain `git` over SSH covers current needs |

Node 18 is the blocking one. It is end-of-life, below what current Vite supports, and below what
`firebase-tools` requires.

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
  the repository's secret store itself, and writes the workflow. The previous project's manual
  `base64 -w0` of a service-account JSON into a CI variable is no longer necessary.
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
