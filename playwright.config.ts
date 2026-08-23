// Thin UI-wiring / smoke layer only — see tech-spec.md's Testing strategy. The bulk of coverage
// belongs in the fast unit layer, run against the logic directly.

import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
  },
  webServer: {
    // Serves the built bundle rather than the dev server. The build identifier is substituted at
    // build time, and this layer exists to check what actually ships — testing the dev server would
    // exercise a different artefact than the one deployed.
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
  // Every spec runs against both viewports. tech-spec.md makes "usable on a phone in the garden" a
  // product requirement, and a desktop-only run passes happily while the mobile layout is broken.
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
});
