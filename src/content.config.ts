import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

/**
 * One prize, with every lot number that won it.
 *
 * The upstream notary list has one row per drawn number; the exporter in the
 * `ottenser_adventcalender` pipeline groups identical prizes together so the
 * table renders the way the redesign draws it.
 */
const prize = z.object({
  /** Zero-padded four-digit lot numbers, e.g. "0824". */
  numbers: z.array(z.string().regex(/^\d{4}$/)).min(1),
  /** What was won, e.g. "1 Wundertüte mit Produkten aus der Kreativwerkstatt". */
  prize: z.string(),
  /** Donating business, as printed in the sponsor list. */
  sponsor: z.string(),
  /** Logo file name inside src/assets/sponsors/, or null when none exists. */
  logo: z.string().nullable().default(null),
  /** Where the winner collects the prize — either the shop or the TriBühne office. */
  pickupAt: z.string(),
});

const days = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/days" }),
  schema: z.object({
    /** Door number, 1–24. */
    day: z.number().int().min(1).max(24),
    /** Draw date as ISO "YYYY-MM-DD" — the day this door may be opened. */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    prizes: z.array(prize),
  }),
});

export const collections = { days };
export type Prize = z.infer<typeof prize>;
