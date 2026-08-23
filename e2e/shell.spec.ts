// Wiring the unit layer structurally cannot see: that the shell reaches the document at all, and
// that it fits the viewport. Both run at desktop and mobile — see playwright.config.ts.
//
// Covers implementation-spec.md §6.

import { expect, test } from "@playwright/test";

test("the shell shows a build identifier, so a deploy can be confirmed on sight", async ({
  page,
}) => {
  await page.goto("/");

  const identifier = page.getByTestId("build-identifier");
  await expect(identifier).toBeVisible();

  // "unknown" is a legitimate runtime value for a build made without git, but it must never be
  // what ships from CI — an identifier that cannot identify anything is worse than none, because
  // it looks like it worked.
  await expect(identifier).not.toContainText("unknown");
});

test("the page does not scroll horizontally", async ({ page }) => {
  await page.goto("/");

  const overflows = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth;
  });

  expect(overflows).toBe(false);
});
