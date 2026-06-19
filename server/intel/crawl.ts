/**
 * server/intel/crawl.ts
 * ------------------------------------------------------------------------
 * The daily ingest RUNNER — the engine that keeps the CSOAI AI-governance
 * dataset the most current anywhere.
 *
 * Flow:
 *   1. Iterate every source in sources.ts.
 *   2. Load its persisted state from ./.state/<id>.json.
 *   3. Run its adapter (LIVE rss / html-hash, or a parked stub).
 *   4. Collect RegulationDelta[] across all sources.
 *   5. Append + dedupe into ./deltas.json (the durable changelog).
 *   6. Print a concise "what changed since last run" report.
 *
 * RESILIENCE: a network/parse failure in ONE source is caught, logged, and the
 * run continues. The whole crawl never crashes because a single site is down or
 * the environment is sandboxed (offline). This makes `npx tsx server/intel/crawl.ts`
 * a safe dry-run anywhere.
 *
 * USAGE:
 *   npx tsx server/intel/crawl.ts            # full run, writes deltas.json + state
 *   npx tsx server/intel/crawl.ts --dry      # run + report, but DO NOT persist anything
 *   npx tsx server/intel/crawl.ts --only=id  # run a single source by id
 *
 * See schedule.md for running this daily on the hive (cron / GCP VM agents).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCES, sourceStats, type IntelSource } from './sources.ts';
import { runAdapter, type SourceState, type AdapterStatus } from './adapters.ts';
import type { RegulationDelta } from '../../client/src/data/intel/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_DIR = join(__dirname, '.state');
const DELTAS_FILE = join(__dirname, 'deltas.json');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry') || argv.includes('--dry-run');
const ONLY = argv.find((a) => a.startsWith('--only='))?.split('=')[1];

// ── state I/O ───────────────────────────────────────────────────────────────

function statePath(id: string): string {
  return join(STATE_DIR, `${id}.json`);
}

function loadState(id: string): SourceState {
  try {
    if (existsSync(statePath(id))) {
      return JSON.parse(readFileSync(statePath(id), 'utf8')) as SourceState;
    }
  } catch (e) {
    console.warn(`  ! state read failed for ${id}: ${(e as Error).message} (treating as first run)`);
  }
  return {};
}

function saveState(id: string, state: SourceState): void {
  if (DRY) return;
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(statePath(id), JSON.stringify(state, null, 2));
}

// ── deltas changelog (append + dedupe) ───────────────────────────────────────

/** Stable dedupe key for a delta — same source + summary + kind = same event. */
function deltaKey(d: RegulationDelta): string {
  return `${d.kind}|${d.source}|${d.summary}`;
}

function loadDeltas(): RegulationDelta[] {
  try {
    if (existsSync(DELTAS_FILE)) return JSON.parse(readFileSync(DELTAS_FILE, 'utf8')) as RegulationDelta[];
  } catch (e) {
    console.warn(`  ! deltas.json read failed: ${(e as Error).message} (starting fresh)`);
  }
  return [];
}

function saveDeltas(all: RegulationDelta[]): void {
  if (DRY) return;
  writeFileSync(DELTAS_FILE, JSON.stringify(all, null, 2));
}

// ── run ──────────────────────────────────────────────────────────────────────

interface RunRow {
  source: IntelSource;
  status: AdapterStatus | 'fetch-error';
  newDeltas: number;
  message: string;
}

async function main(): Promise<void> {
  const startedAt = new Date();
  const sources = ONLY ? SOURCES.filter((s) => s.id === ONLY) : SOURCES;
  const stats = sourceStats(SOURCES);

  console.log('═'.repeat(72));
  console.log('CSOAI daily ingest — regulation crawler');
  console.log(`  started:   ${startedAt.toISOString()}`);
  console.log(`  sources:   ${stats.total} total (${stats.live} live, ${stats.stubbed} stubbed)`);
  console.log(`  adapters:  ${JSON.stringify(stats.byAdapter)}`);
  if (ONLY) console.log(`  --only:    ${ONLY} (${sources.length} matched)`);
  if (DRY) console.log('  MODE:      DRY RUN (no state/deltas written)');
  console.log('═'.repeat(72));

  const existing = loadDeltas();
  const seenKeys = new Set(existing.map(deltaKey));
  const collected: RegulationDelta[] = [];
  const rows: RunRow[] = [];

  for (const source of sources) {
    const prev = loadState(source.id);
    try {
      const res = await runAdapter(source, prev);
      // Dedupe against the durable changelog AND within this run.
      const fresh = res.deltas.filter((d) => {
        const k = deltaKey(d);
        if (seenKeys.has(k)) return false;
        seenKeys.add(k);
        return true;
      });
      collected.push(...fresh);
      saveState(source.id, res.state);
      rows.push({ source, status: res.status, newDeltas: fresh.length, message: res.message ?? '' });
      const tag = res.status === 'skipped' ? 'SKIP' : res.status === 'unchanged' ? '----' : ' OK ';
      console.log(`[${tag}] ${source.id.padEnd(24)} +${fresh.length}  ${res.message ?? ''}`);
    } catch (e) {
      // Per-source failure: log + continue. This is the path hit when sandboxed/offline.
      const msg = (e as Error).message || String(e);
      rows.push({ source, status: 'fetch-error', newDeltas: 0, message: msg });
      console.log(`[FAIL] ${source.id.padEnd(24)} +0  ${msg}`);
    }
  }

  // Persist appended changelog.
  const merged = [...existing, ...collected];
  saveDeltas(merged);

  // ── report ──────────────────────────────────────────────────────────────
  const ok = rows.filter((r) => r.status === 'ok').length;
  const unchanged = rows.filter((r) => r.status === 'unchanged').length;
  const skipped = rows.filter((r) => r.status === 'skipped').length;
  const failed = rows.filter((r) => r.status === 'fetch-error' || r.status === 'error').length;

  console.log('─'.repeat(72));
  console.log('WHAT CHANGED SINCE LAST RUN');
  if (collected.length === 0) {
    console.log('  (no new deltas this run)');
  } else {
    for (const d of collected) {
      console.log(`  • [${d.kind}] (${d.jurisdictions.join(',')}) ${d.summary}`);
      console.log(`      ↳ ${d.source}`);
    }
  }
  console.log('─'.repeat(72));
  console.log(
    `RESULT: ${collected.length} new delta(s) | sources: ${ok} ok, ${unchanged} unchanged, ${skipped} stub-skipped, ${failed} fetch-error`,
  );
  console.log(`  changelog: ${DRY ? '(dry — not written)' : DELTAS_FILE} (${merged.length} total)`);
  console.log(`  finished:  ${new Date().toISOString()} (${Date.now() - startedAt.getTime()}ms)`);
  if (failed > 0) {
    console.log(
      `  NOTE: ${failed} source(s) failed to fetch — expected when offline/sandboxed or if a site is down. The run completed gracefully.`,
    );
  }
}

main().catch((e) => {
  // Top-level guard: even a programming error should not leave a non-zero hang.
  console.error('FATAL (unexpected — per-source errors are handled above):', e);
  process.exitCode = 1;
});
