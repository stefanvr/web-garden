// Tests for src/shell/shell.ts — implementation-spec.md §6's build identifier.

import { describe, expect, test } from "vitest";

import { buildIdentifier, formatBuiltAt } from "../../src/shell/shell.ts";

describe("build identifier", () => {
  test("pairs the commit with the time it was built", () => {
    expect(buildIdentifier({ sha: "a1b2c3d", builtAt: "2026-08-23T21:40:00Z" })).toBe(
      "a1b2c3d · 2026-08-23 21:40 UTC",
    );
  });

  test("reads the same from any timezone, because the time is formatted as UTC", () => {
    // 23:40 Amsterdam summer time is 21:40 UTC. Local formatting would render one build two ways —
    // on the machine that pushed it and on the phone checking whether the deploy landed.
    expect(formatBuiltAt("2026-08-23T23:40:00+02:00")).toBe("2026-08-23 21:40 UTC");
  });

  test("degrades to unknown rather than throwing when the build time is unparseable", () => {
    expect(formatBuiltAt("not a date")).toBe("unknown");
  });
});
