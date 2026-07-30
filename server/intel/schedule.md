# Daily Ingest — Scheduling & Operations

The `server/intel/` engine is the **dataset moat**: it crawls authoritative
AI-governance sources daily, detects changes, and emits `RegulationDelta`
records (shape: `client/src/data/intel/types.ts`) into `deltas.json`. Run it
once a day on the hive and the CSOAI dataset stays the most current anywhere.

> This doc explains how to schedule it. It does **not** stand up live cron —
> that's infra/creds-gated. Pick one of the options below when ready.

## What it does on each run

1. Iterates `sources.ts` (20+ authoritative sources, grouped by jurisdiction).
2. For each source, loads `./.state/<id>.json`, runs its adapter, and either:
   - emits new `RegulationDelta`s (RSS items / changed HTML pages), or
   - records a baseline / reports "unchanged", or
   - skips a parked stub adapter with a NOTE.
3. Appends + dedupes deltas into `./deltas.json`.
4. Prints a "what changed since last run" report to stdout.

Per-source failures (offline, 404, timeout) are caught and logged — **the run
never crashes**, so it's safe to schedule unattended.

## Running it

```bash
# Full daily run (writes deltas.json + per-source state)
npx tsx server/intel/crawl.ts

# Dry run — fetch + report, but persist nothing (safe to run anywhere)
npx tsx server/intel/crawl.ts --dry

# Single source (debugging a specific feed/page)
npx tsx server/intel/crawl.ts --only=uk-ico-news
```

> Optional convenience: add `"crawl": "tsx server/intel/crawl.ts"` to
> `package.json` `scripts` so `pnpm crawl` works. (Left unadded by default to
> avoid merge conflicts with parallel work — `npx tsx ...` always works.)

## Environment

- **Node 18+** (uses global `fetch` and `AbortController`). The repo already
  runs `tsx`, so no new deps are required — the adapters are dependency-free.
- **No secrets needed** for the two LIVE adapters (`rss`, `html-hash`) — they
  hit public endpoints. The stubbed structured adapters (EUR-Lex CELLAR/SPARQL,
  EU OJ index, source JSON APIs) may later need API keys; document them here
  when implemented.
- **Outbound network access** to the source domains. In sandboxed CI those
  fetches fail gracefully and the run still completes (reports `fetch-error`s).
- **Writable `server/intel/.state/` and `server/intel/deltas.json`.** On the
  hive, point these at a persistent volume so state survives between runs (a
  fresh `.state/` just re-baselines — no errors, but no diffs on day 1).

## Option A — plain cron (a box / the GCP VM)

```cron
# 07:00 UTC daily; logs to a dated file
0 7 * * * cd /path/to/csoai-dashboard && /usr/bin/env npx tsx server/intel/crawl.ts >> /var/log/csoai-intel/$(date +\%F).log 2>&1
```

## Option B — GCP VM scheduled-agents (the hive)

The existing "MEOK ONE" VM already runs scheduled agents. Register the crawler
as a daily job there:

- **Command:** `npx tsx server/intel/crawl.ts`
- **Cwd:** the repo checkout on the VM.
- **Cadence:** once daily (07:00 UTC is a good slot — before EU business hours).
- **Output handling:** capture stdout (the "what changed" report) and forward
  new deltas downstream — e.g. POST `deltas.json` diffs to the CSOAI alerts /
  attestation API, or open a PR with the updated `deltas.json`.

## Option C — Vercel Cron (if the engine is wrapped in a route)

This is a CLI engine, not an HTTP route, so Vercel Cron isn't a direct fit. If
you want serverless scheduling, wrap `main()` from `crawl.ts` in an API handler
and add a `vercel.json` cron entry. Note Vercel function timeouts — 20+ live
fetches may exceed the limit; prefer the VM for the full sweep.

## Adding a new source

1. Open `server/intel/sources.ts` and append an `IntelSource` to `SOURCES`:
   ```ts
   {
     id: 'xx-regulator-news',        // stable, unique; also the Layer-0 id prefix
     label: 'Country X — Regulator news',
     jurisdiction: 'XXX',            // ISO alpha-3, or 'GLOBAL'
     kind: 'regulator',              // gazette | regulator | standard | enforcement | news
     url: 'https://…/feed',          // RSS/Atom feed URL, OR a page URL for html-hash
     adapter: 'rss',                 // 'rss' or 'html-hash' (both LIVE); stub-* to park it
     frameworkSlug: 'xx-ai-law',     // optional — stamps the delta for graph joins
   },
   ```
2. **Choose the adapter:**
   - Has a real RSS/Atom feed? → `adapter: 'rss'`. (GOV.UK and the US Federal
     Register expose `.atom` / `.rss` on any search URL — prefer those.)
   - Only an HTML index, no feed? → `adapter: 'html-hash'` (detects content
     changes; coarser — emits "page changed, review" deltas).
   - Needs precise structured parsing (a gazette / legal API)? → leave it as a
     `stub-*` and implement the parser in `adapters.ts` (TODOs are marked).
3. **Respect robots.txt / ToS** for the new domain before enabling. Keep the
   daily cadence; don't hammer. The crawler sends a descriptive User-Agent
   (`CSOAI-Intel-Crawler/1.0`).
4. Run `npx tsx server/intel/crawl.ts --only=<your-id>` to verify it fetches and
   baselines cleanly before the next scheduled sweep picks it up.

## Adapter status (be honest about coverage)

| Adapter      | Status | Notes                                                              |
| ------------ | ------ | ------------------------------------------------------------------ |
| `rss`        | LIVE   | RSS 2.0 / Atom → items → deltas, deduped by GUID.                  |
| `html-hash`  | LIVE   | Hashes main content; emits a "changed" delta on diff.             |
| `stub-eurlex`| STUB   | TODO: EUR-Lex CELLAR/SPARQL client for AI Act amendments.          |
| `stub-oj`    | STUB   | TODO: EU Official Journal daily L-series index parser.            |
| `stub-api`   | STUB   | TODO: source JSON APIs (Federal Register, PIPC, ISO catalogue).   |

`html-hash` is a change *detector*, not a structured extractor — it tells you a
page moved so a human/structured adapter can extract the specifics. Upgrade the
highest-value stubs (EUR-Lex, EU OJ, Federal Register API) first.
