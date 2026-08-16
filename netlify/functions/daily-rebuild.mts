import type { Config } from "@netlify/functions";

/**
 * Nightly rebuild.
 *
 * Doors are gated at build time (src/lib/calendar.ts), so a door that should
 * open on the 5th only appears once the site has been rebuilt on the 5th.
 * Nothing else triggers that — the content does not change, only the date —
 * so this function pokes a build hook every night.
 *
 * Set BUILD_HOOK_URL in Netlify: Site configuration → Build & deploy → Build
 * hooks → Add build hook, then paste the URL into Environment variables. It is
 * a secret: anyone holding it can trigger builds, so it stays out of the repo.
 *
 * Runs year-round rather than only in December. A build costs about a minute
 * against Netlify's 300 min/month, and a single always-on schedule has no
 * month-boundary edge cases to get wrong.
 */
export default async (req: Request) => {
  const hook = process.env.BUILD_HOOK_URL;

  if (!hook) {
    // Fail loudly in the function log, but do not throw: a missing variable is
    // a setup problem, and retrying it every night would not fix anything.
    console.error(
      "BUILD_HOOK_URL is not set — the site will not rebuild, so no further doors will open.",
    );
    return new Response("BUILD_HOOK_URL is not set", { status: 500 });
  }

  const response = await fetch(hook, { method: "POST" });

  if (!response.ok) {
    console.error(`Build hook failed: ${response.status} ${response.statusText}`);
    return new Response(`Build hook failed: ${response.status}`, { status: 502 });
  }

  let nextRun: string | undefined;
  try {
    ({ next_run: nextRun } = await req.json());
  } catch {
    // Manual invocations have no body; the schedule still holds.
  }

  console.log(`Rebuild triggered. Next run: ${nextRun ?? "unknown"}`);
  return new Response("Rebuild triggered", { status: 200 });
};

/**
 * 23:05 UTC is 00:05 in Berlin during CET, which December always is. Netlify
 * cron is UTC-only, so the offset is baked in here.
 */
export const config: Config = {
  schedule: "5 23 * * *",
};
