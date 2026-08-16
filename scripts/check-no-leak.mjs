/**
 * Regression test for the one property that really matters: a door that has
 * not been drawn yet must not have its lot numbers anywhere in the built HTML.
 *
 * Builds the site pinned to a date in the middle of the calendar, then checks
 * every number belonging to a later day against every generated page —
 * including the inline search index, which is where a leak would most likely
 * hide.
 *
 * Usage: node scripts/check-no-leak.mjs [YYYY-MM-DD]
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DAYS_DIR = "src/content/days";
const DIST = "dist";

const days = readdirSync(DAYS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(DAYS_DIR, f), "utf8")))
  .sort((a, b) => a.date.localeCompare(b.date));

if (days.length < 2) {
  console.error(`Need at least 2 days in ${DAYS_DIR} to test the gate; found ${days.length}.`);
  process.exit(1);
}

// Default to the midpoint so there is a meaningful set of days on each side.
const pinned = process.argv[2] ?? days[Math.floor(days.length / 2)].date;

console.log(`Building with OAC_TODAY=${pinned} …`);
execFileSync("npx", ["astro", "build"], {
  stdio: "inherit",
  env: { ...process.env, OAC_TODAY: pinned },
});

const numbersOn = (predicate) =>
  new Set(days.filter(predicate).flatMap((d) => d.prizes.flatMap((p) => p.numbers)));

const past = numbersOn((d) => d.date <= pinned);
const future = numbersOn((d) => d.date > pinned);

// A number drawn on both sides of the cut-off is not evidence of a leak.
const secret = [...future].filter((n) => !past.has(n));

const html = readdirSync(DIST, { recursive: true })
  .filter((f) => String(f).endsWith(".html"))
  .map((f) => readFileSync(join(DIST, String(f)), "utf8"))
  .join("\n");

const leaked = secret.filter((n) => new RegExp(`\\b${n}\\b`).test(html));

console.log(`\n  days built        ${days.filter((d) => d.date <= pinned).length}/${days.length}`);
console.log(`  numbers withheld  ${secret.length}`);
console.log(`  leaked            ${leaked.length}`);

if (leaked.length > 0) {
  console.error(`\nFAIL: undrawn lot numbers found in the built HTML: ${leaked.slice(0, 20).join(", ")}`);
  process.exit(1);
}

console.log("\nOK: no undrawn lot numbers reached the output.");
