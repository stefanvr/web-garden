// Application shell — implementation-spec.md §6.
//
// Rebuilds its whole subtree from the state it is given rather than patching individual nodes, per
// tech-spec.md's "views re-render from state" rule. That rule is what makes running without a UI
// framework safe, so this stays a full replaceChildren even while the shell is small enough that
// patching would obviously work.

export interface BuildInfo {
  /** Short commit SHA this bundle was built from. */
  sha: string;
  /** ISO 8601 timestamp of the build. */
  builtAt: string;
}

/**
 * Renders the build time as UTC rather than the viewer's local time.
 *
 * The identifier is compared against a deploy that happened somewhere else — in CI, on a different
 * machine, possibly in a different timezone. Formatting locally would make the same build read
 * differently on the laptop that pushed it and the phone standing in the garden, which defeats the
 * one thing the identifier is for.
 */
export function formatBuiltAt(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "unknown";

  const pad = (n: number): string => String(n).padStart(2, "0");
  const date = `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`;
  const time = `${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}`;
  return `${date} ${time} UTC`;
}

/** The single string identifying which build is on screen. */
export function buildIdentifier(build: BuildInfo): string {
  return `${build.sha} · ${formatBuiltAt(build.builtAt)}`;
}

export function renderShell(root: HTMLElement, build: BuildInfo): void {
  const title = document.createElement("h1");
  title.textContent = "Web Garden";

  const identifier = document.createElement("p");
  identifier.className = "build-identifier";
  identifier.dataset["testid"] = "build-identifier";
  identifier.textContent = buildIdentifier(build);

  root.replaceChildren(title, identifier);
}
