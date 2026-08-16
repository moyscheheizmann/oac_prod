# Ottenser Adventskalender

Astro rebuild of [ottenser-adventskalender.de](https://www.ottenser-adventskalender.de/),
replacing the WordPress 6.1 / Elementor site.

## Development

```bash
npm install
npm run dev
```

## How the doors work

Every door is gated **at build time**, in `src/lib/calendar.ts`. Days that have
not been drawn yet are dropped before rendering, so their lot numbers are never
written into the generated HTML — a client-side filter would leave them visible
in the page source, which for a notarised raffle is not acceptable.

The consequence is that **the site must be rebuilt every day in December**.
The scheduled function in `netlify/functions/daily-rebuild.mts` does this at
00:05 Berlin time.

`scripts/check-no-leak.mjs` is the regression test for this: it builds against
a pinned mid-calendar date and fails if any later day's numbers appear in the
output. CI runs it on every push.

```bash
npm run check:leak
```

Preview another date without waiting for it:

```bash
OAC_TODAY=2025-12-06 npm run build
```

## Deployment (Netlify)

The site is static, so no Astro adapter is involved — Netlify runs
`npm run build` and serves `dist/`. Everything else lives in `netlify.toml`.

### One-time setup

1. **Connect the repo.** Netlify → Add new site → Import an existing project.
   Build command and publish directory are read from `netlify.toml`; leave the
   UI fields empty so there is one source of truth.

2. **Create a build hook.** Site configuration → Build & deploy → Build hooks →
   Add build hook. Name it `daily-rebuild`, target `main`, and copy the URL.

3. **Store the hook as an environment variable.** Site configuration →
   Environment variables → `BUILD_HOOK_URL` = the URL from step 2.

   This is a secret — anyone holding it can trigger builds — so it is
   deliberately not committed. The scheduled function fails loudly in the
   function log if it is missing.

4. **Deploy once**, so the scheduled function is registered. Netlify only picks
   up the schedule after the function has shipped; it will not run before the
   first deploy. Confirm under Logs → Functions that `daily-rebuild` appears.

### Verifying the schedule

Trigger the function by hand from Netlify (Functions → `daily-rebuild` →
Trigger) and check that a new deploy starts. Worth doing once in late November
each year, since the rest of the year nobody notices whether it fires.

### Old WordPress URLs

`netlify.toml` redirects the retired paths. The per-day pages
(`/advent-calendar/…`) and `/gewinnnummern-2025/` are **301**s, since they are
permanently folded into the one-page layout. `/kontakt/`, `/der-erloes/` and
`/sponsorenverzeichnis/` are **302**s on purpose — those will become real pages
here, and a 301 would sit in visitors' browser caches and keep redirecting them
away from the page once it exists. Change them to 301 only if the path is
genuinely never coming back.

Deploy Previews are public to anyone with the URL, but build through the same
date gate, so they cannot expose undrawn doors either.

## Content

| What | Where |
|---|---|
| Prize data, one file per day | `src/content/days/YYYY-MM-DD.json` |
| Sponsor directory | `src/content/sponsors.json` |
| Schema for both | `src/content.config.ts` |
| Sponsor logos | `src/assets/sponsors/` |
| Page copy (intro, tiles, contact, Impressum) | `src/data/site.ts` |

`src/content/days/` currently holds the **2024** draw as sample data, so the
site renders during development. Replace it with the real year before launch.

### Regenerating prize data

The day files come from the [`ottenser_adventcalender`](../ottenser_adventcalender)
pipeline, which reads the notary's Excel list and the sponsor list:

```python
from pathlib import Path
import json
from ottenser_adventcalender import (
    export_daily_json, export_sponsors_json, collect_logo_sources, load_sponsors_lookup,
)

# ... build final_df as in create_tables/create_winning_tables.ipynb ...

export_daily_json(final_df, Path("../oac_prod/src/content/days"))

# The Sponsorenverzeichnis comes from the same sponsor list that supplies the
# logos in the day tables, so the two cannot drift apart.
export_sponsors_json(
    load_sponsors_lookup(Path("data/sponsorenliste.csv")),
    Path("../oac_prod/src/content/sponsors.json"),
)

Path("data/logos.json").write_text(
    json.dumps(collect_logo_sources(final_df), ensure_ascii=False, indent=2)
)
```

Then fetch any sponsor logos that are not already local:

```bash
uv run python scripts/fetch_logos.py \
    --manifest create_tables/data/logos.json \
    --out ../oac_prod/src/assets/sponsors
```

Sponsors with no logo on file fall back to their name in the table, so a
missing file degrades gracefully.

## Design

Tokens live in `src/styles/global.css` under `@theme`. The palette and the
Kalam / Arimo pairing follow the redesign mockups in `../assets/img/`; both
typefaces are carried over from the old theme and are self-hosted via
`@fontsource` rather than loaded from Google's CDN.

## Before launch

Blocking, in rough order of how badly they bite:

- **Complete the Impressum.** `impressum` in `src/data/site.ts` has five fields
  set to `null` — the Vertretungsberechtigte(r), the Vereinsregister and its
  number, the USt-ID, and the person responsible under § 18 Abs. 2 MStV. They
  render as loud red placeholders and warn in the build log. An incomplete
  Impressum is a genuine legal exposure, so these must come from the client.
- **Add a Datenschutzerklärung.** Required under Art. 13 DSGVO even though the
  site sets no cookies and self-hosts its fonts. The footer link is currently
  omitted rather than left pointing at a 404.
- **Fix the sponsor list.** `CODOS Coffee` and `el rojito` share one logo URL in
  the source CSV, so el rojito shows the wrong logo. Two sponsors (`HAVN
  Copenhagen Streetfood`, `Susan Boening Heilpraktikerin`) have no address.
- **Settle the prize total.** The home page says "mehr als 10.000 Euro", the
  Sponsorenverzeichnis says "über 12.000,- Euro". Both figures come from the
  current site.
- **Update the credits.** `credits` in `src/data/site.ts` still names the
  previous site under "Internetauftritt" and "Grafik".
- Replace the 2024 sample draw in `src/content/days/` with the real year.

## Still to do

- Hero illustration (the yearly calendar artwork) — placeholder in `index.astro`
- "Der Erlös" subpage (still a 302 to `/` in `netlify.toml`)
- Circus-acrobat silhouettes flanking the page, per the mockups
- Logo contrast: several sponsor logos are dark artwork on the navy panel and
  read poorly. Either a white panel or per-logo treatment is needed.
