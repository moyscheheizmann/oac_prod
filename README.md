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
`.github/workflows/daily-build.yml` does this at 00:05 Berlin time.

Preview another date without waiting for it:

```bash
OAC_TODAY=2025-12-06 npm run build
```

The same override is exposed as an input on the `Daily build` workflow, so the
client can preview a date from the GitHub Actions tab.

## Content

| What | Where |
|---|---|
| Prize data, one file per day | `src/content/days/YYYY-MM-DD.json` |
| Schema for the above | `src/content.config.ts` |
| Sponsor logos | `src/assets/sponsors/` |
| Page copy (intro, info tiles) | `src/data/site.ts` |

`src/content/days/` currently holds the **2024** draw as sample data, so the
site renders during development. Replace it with the real year before launch.

### Regenerating prize data

The day files come from the [`ottenser_adventcalender`](../ottenser_adventcalender)
pipeline, which reads the notary's Excel list and the sponsor list:

```python
from pathlib import Path
import json
from ottenser_adventcalender import export_daily_json, collect_logo_sources

# ... build final_df as in create_tables/create_winning_tables.ipynb ...

export_daily_json(final_df, Path("../oac_prod/src/content/days"))

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

## Still to do

- Hero illustration (the yearly calendar artwork) — placeholder in `index.astro`
- Subpages: Sponsorenverzeichnis, Kontakt, Der Erlös, Impressum, Datenschutz
- Circus-acrobat silhouettes flanking the page, per the mockups
