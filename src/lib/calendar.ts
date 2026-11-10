import { getCollection, type CollectionEntry } from "astro:content";
import { calendarYear } from "../data/site";

export type Day = CollectionEntry<"days">;

/**
 * Today's date in Europe/Berlin as an ISO "YYYY-MM-DD" string.
 *
 * The build machine is very likely on UTC, which is one or two hours behind
 * Berlin — without pinning the zone, a door scheduled for the 1st would still
 * look shut to a build that runs just after midnight local time.
 *
 * Set OAC_TODAY to preview the site on another date, e.g. to show the client
 * what the 6th will look like:
 *
 *     OAC_TODAY=2026-12-06 npm run build
 */
export function berlinToday(): string {
  const override = import.meta.env.OAC_TODAY;
  if (override) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(override)) {
      throw new Error(`OAC_TODAY must be YYYY-MM-DD, got "${override}"`);
    }
    return override;
  }
  // "en-CA" formats as YYYY-MM-DD, which sorts lexicographically.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Whether a door with this draw date may be opened on `today`. */
export function isOpen(date: string, today: string): boolean {
  return date <= today;
}

/**
 * Every door that has already been opened, earliest first.
 *
 * This is the ONLY function pages may use to reach day data. Doors that have
 * not been drawn yet are dropped here, at build time, so their lot numbers are
 * never written into the generated HTML — a client-side filter would leave
 * them readable in the page source.
 */
export async function getOpenDays(today = berlinToday()): Promise<Day[]> {
  const days = await getCollection("days", ({ data }) => isOpen(data.date, today));
  return days.sort((a, b) => a.data.date.localeCompare(b.data.date));
}

/**
 * All 24 doors as display stubs — number, date and state, never prizes.
 *
 * Generated from calendarYear rather than from the day files, so a door opens
 * on its date even if that day's numbers have not been added yet. `hasPrizes`
 * says whether there is a prize table to link to.
 *
 * Safe to render for the full month: it deliberately carries no prize data.
 */
export async function getDoors(
  today = berlinToday(),
): Promise<Array<{ day: number; date: string; open: boolean; hasPrizes: boolean }>> {
  const opened = new Set((await getOpenDays(today)).map(({ data }) => data.date));
  return Array.from({ length: 24 }, (_, index) => {
    const day = index + 1;
    const date = `${calendarYear}-12-${String(day).padStart(2, "0")}`;
    return { day, date, open: isOpen(date, today), hasPrizes: opened.has(date) };
  });
}
