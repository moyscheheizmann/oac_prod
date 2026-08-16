import type { ImageMetadata } from "astro";

/**
 * Sponsor logos, resolved at build time so Astro can optimise them.
 *
 * Logos are optional: roughly a quarter of the businesses in the sponsor list
 * have none on file, and those fall back to the company name wherever they are
 * displayed. Files are fetched by scripts/fetch_logos.py in the pipeline repo.
 */
const logos = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/sponsors/*.{png,jpg,jpeg,svg,webp,avif}",
  { eager: true },
);

export function logoFor(name: string | null): ImageMetadata | undefined {
  if (!name) return undefined;
  return logos[`/src/assets/sponsors/${name}`]?.default;
}
