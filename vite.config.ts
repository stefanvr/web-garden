/// <reference types="vitest/config" />

// Build configuration, and the injection of the build identifier that implementation-spec.md §6
// requires. The identifier exists so a deploy can be confirmed from a phone, where a landed deploy
// and a stale cached page are otherwise indistinguishable.

import { execSync } from "node:child_process";
import { defineConfig } from "vite";

// CI is preferred over git because the checkout there may be a detached or shallow one, and
// GITHUB_SHA is the commit the workflow was actually triggered for — which is the thing the
// identifier is meant to let you compare against.
function buildSha(): string {
  const fromCi = process.env.GITHUB_SHA;
  if (fromCi) return fromCi.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    // A build from a tarball with no .git is legitimate; it just cannot identify itself.
    return "unknown";
  }
}

export default defineConfig({
  define: {
    __BUILD_SHA__: JSON.stringify(buildSha()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  test: {
    // Mirrors src/, per code-conventions.md's "tests mirror the source layout".
    include: ["test/**/*.test.ts"],
  },
});
