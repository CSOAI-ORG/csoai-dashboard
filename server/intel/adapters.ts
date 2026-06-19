/**
 * server/intel/adapters.ts
 * ------------------------------------------------------------------------
 * Pluggable fetch+parse adapters for the daily ingest engine.
 *
 * An adapter takes a source + the previous run's state and returns:
 *   - deltas:    RegulationDelta[] describing what changed
 *   - state:     the new per-source state to persist for next time
 *   - status:    'ok' | 'unchanged' | 'skipped' | 'error' (+ message)
 *
 * LIVE adapters (these actually work end-to-end):
 *   • rssAdapter        — parses RSS 2.0 / Atom XML → items → 'new-instrument' /
 *                         'guidance' / 'enforcement' deltas, deduped by item GUID.
 *   • htmlHashAdapter   — fetches a page, extracts + normalises the main content,
 *                         hashes it, and emits a 'guidance'/'amendment' delta when
 *                         the hash differs from the stored hash.
 *
 * STUBBED adapters (intentionally parked — emit nothing, log a NOTE):
 *   • stub-eurlex / stub-oj / stub-api — need source-specific structured parsers
 *     (EUR-Lex CELLAR/SPARQL, the EU OJ daily index, regulator JSON APIs). We do
 *     NOT guess: a legal dataset must not fabricate deltas. See TODOs below.
 *
 * No third-party XML/HTML libs are used — the parsers are dependency-free regex/
 * string parsers, deliberately conservative. Network uses global `fetch` (Node 18+).
 */

import { createHash } from 'node:crypto';
import type { IntelSource, SourceKind } from './sources.ts';
import type { RegulationDelta } from '../../client/src/data/intel/types.ts';

/** Per-source persisted state (stored in ./.state/<id>.json by crawl.ts). */
export interface SourceState {
  /** last successful run ISO timestamp. */
  lastRunAt?: string;
  /** html-hash: sha256 of the last main-content snapshot. */
  contentHash?: string;
  /** rss: GUIDs we've already emitted, to dedupe across runs. */
  seenGuids?: string[];
}

export type AdapterStatus = 'ok' | 'unchanged' | 'skipped' | 'error';

export interface AdapterResult {
  deltas: RegulationDelta[];
  state: SourceState;
  status: AdapterStatus;
  message?: string;
}

const USER_AGENT =
  'CSOAI-Intel-Crawler/1.0 (+https://csoai.org; AI-governance dataset; respects robots.txt)';
const FETCH_TIMEOUT_MS = 20_000;
const MAX_ITEMS_PER_FEED = 25;

/** Map a source `kind` to the most appropriate RegulationDelta.kind. */
function deltaKindFor(kind: SourceKind): RegulationDelta['kind'] {
  switch (kind) {
    case 'gazette':
      return 'new-instrument';
    case 'enforcement':
      return 'enforcement';
    case 'standard':
    case 'regulator':
    case 'news':
    default:
      return 'guidance';
  }
}

/** Jurisdiction code for the delta (EUR is expanded to the common EU member set conceptually,
 *  but we keep the source's declared code so downstream joins stay deterministic). */
function jurisdictionsFor(source: IntelSource): string[] {
  return [source.jurisdiction];
}

/** Fetch with a timeout + descriptive UA. Throws on non-2xx so callers can catch per-source. */
async function fetchText(url: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/atom+xml, text/html, */*' },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

/** Decode the handful of XML/HTML entities we care about for readable summaries. */
function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}

function firstTag(block: string, tag: string): string | undefined {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decodeEntities(m[1]) : undefined;
}

// ───────────────────────────────────────────────────────────────────────────
// LIVE ADAPTER 1: generic RSS 2.0 / Atom feed
// ───────────────────────────────────────────────────────────────────────────

interface FeedItem {
  guid: string;
  title: string;
  link?: string;
  date?: string;
}

/** Dependency-free RSS/Atom parser. Handles <item> (RSS) and <entry> (Atom). */
export function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/(item|entry)>/gi) ?? [];
  for (const block of blocks) {
    const title = firstTag(block, 'title') ?? '(untitled)';
    // Atom <link href="..."/> vs RSS <link>...</link>
    let link = firstTag(block, 'link');
    if (!link) {
      const href = block.match(/<link[^>]*href=["']([^"']+)["']/i);
      if (href) link = href[1];
    }
    const date =
      firstTag(block, 'pubDate') ??
      firstTag(block, 'updated') ??
      firstTag(block, 'published') ??
      firstTag(block, 'dc:date');
    const guid = firstTag(block, 'guid') ?? firstTag(block, 'id') ?? link ?? title;
    items.push({ guid: guid.trim(), title: title.trim(), link: link?.trim(), date: date?.trim() });
  }
  return items;
}

export async function rssAdapter(source: IntelSource, prev: SourceState): Promise<AdapterResult> {
  const xml = await fetchText(source.url);
  const items = parseFeed(xml).slice(0, MAX_ITEMS_PER_FEED);
  const seen = new Set(prev.seenGuids ?? []);
  const firstRun = !prev.lastRunAt;

  const deltas: RegulationDelta[] = [];
  const allGuids: string[] = [];
  for (const it of items) {
    allGuids.push(it.guid);
    if (seen.has(it.guid)) continue;
    // On the very first run we record GUIDs as the baseline but do NOT flood the
    // dataset with the entire existing feed as "new" — only genuine future changes
    // become deltas. (One representative delta is emitted so the run is observable.)
    if (firstRun && deltas.length >= 1) continue;
    deltas.push({
      at: new Date().toISOString(),
      kind: deltaKindFor(source.kind),
      frameworkSlug: source.frameworkSlug,
      jurisdictions: jurisdictionsFor(source),
      summary: `${firstRun ? '[baseline] ' : ''}${source.label}: ${stripTags(it.title).slice(0, 240)}`,
      source: it.link || source.url,
    });
  }

  const state: SourceState = {
    lastRunAt: new Date().toISOString(),
    // keep the most recent GUIDs (cap to avoid unbounded growth)
    seenGuids: allGuids.slice(0, 200),
  };
  return {
    deltas,
    state,
    status: deltas.length ? 'ok' : 'unchanged',
    message: `${items.length} feed items, ${deltas.length} new`,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// LIVE ADAPTER 2: HTML "changed?" via main-content hash
// ───────────────────────────────────────────────────────────────────────────

/**
 * Extract the "main content" of an HTML page in a noise-resistant way:
 *  - drop <script>/<style>/<nav>/<header>/<footer> blocks,
 *  - prefer <main> or <article> if present,
 *  - strip tags + collapse whitespace.
 * This is deliberately simple; it tolerates messy markup and changes only when
 * substantive text changes (ignoring most boilerplate churn).
 */
export function extractMainContent(html: string): string {
  let h = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  const main = h.match(/<main\b[\s\S]*?<\/main>/i) || h.match(/<article\b[\s\S]*?<\/article>/i);
  if (main) h = main[0];
  return stripTags(h);
}

export async function htmlHashAdapter(source: IntelSource, prev: SourceState): Promise<AdapterResult> {
  const html = await fetchText(source.url);
  const content = extractMainContent(html);
  const hash = sha256(content);
  const prevHash = prev.contentHash;

  const state: SourceState = { lastRunAt: new Date().toISOString(), contentHash: hash };

  if (!prevHash) {
    // Baseline only — record the hash, emit nothing as "changed".
    return { deltas: [], state, status: 'ok', message: 'baseline hash recorded' };
  }
  if (hash === prevHash) {
    return { deltas: [], state, status: 'unchanged', message: 'no content change' };
  }

  // Content changed → emit a delta. We can't reliably know if it's an amendment vs
  // new guidance from a hash alone, so we map by source kind (enforcement pages →
  // 'enforcement', everything else → 'guidance'/'amendment').
  const kind: RegulationDelta['kind'] =
    source.kind === 'enforcement' ? 'enforcement' : source.kind === 'gazette' ? 'amendment' : 'guidance';
  const delta: RegulationDelta = {
    at: new Date().toISOString(),
    kind,
    frameworkSlug: source.frameworkSlug,
    jurisdictions: jurisdictionsFor(source),
    summary: `${source.label}: page content changed (hash ${prevHash.slice(0, 8)} → ${hash.slice(0, 8)}) — review for new/updated material.`,
    source: source.url,
  };
  return { deltas: [delta], state, status: 'ok', message: 'content changed' };
}

// ───────────────────────────────────────────────────────────────────────────
// STUBBED adapters — parked on purpose. They must NOT fabricate deltas.
// ───────────────────────────────────────────────────────────────────────────

/**
 * TODO(stub-eurlex): Implement a EUR-Lex CELLAR / SPARQL client.
 *   - Query the consolidated CELEX (e.g. 32024R1689) for new consolidated
 *     versions, corrigenda, and amending acts since `prev.lastRunAt`.
 *   - Endpoint: https://op.europa.eu/en/web/cellar (SPARQL at /webapi/sparql)
 *     or the EUR-Lex REST web service. Map each amending act → an 'amendment'
 *     delta with the precise CELEX + article scope.
 */
/**
 * TODO(stub-oj): Implement an EU Official Journal daily-index parser.
 *   - Walk the OJ "L" series daily index for the run date, filter to AI/data
 *     instruments, emit 'new-instrument' deltas with OJ reference + ELI URI.
 */
/**
 * TODO(stub-api): Implement source-specific JSON API clients where available
 *   (e.g. US Federal Register API at federalregister.gov/api/v1/documents.json,
 *   Korea PIPC board API, the ISO catalogue JSON). Richer + more precise than
 *   the generic html-hash fallback those sources currently use.
 */
export async function stubAdapter(source: IntelSource): Promise<AdapterResult> {
  return {
    deltas: [],
    state: { lastRunAt: new Date().toISOString() },
    status: 'skipped',
    message: `stub adapter '${source.adapter}' not yet implemented — ${source.note ?? 'needs structured parser'}`,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Dispatch
// ───────────────────────────────────────────────────────────────────────────

/** Run the adapter declared by a source. Never throws for stubs; live adapters may
 *  throw on network errors and are expected to be wrapped in try/catch by the runner. */
export async function runAdapter(source: IntelSource, prev: SourceState): Promise<AdapterResult> {
  switch (source.adapter) {
    case 'rss':
      return rssAdapter(source, prev);
    case 'html-hash':
      return htmlHashAdapter(source, prev);
    case 'stub-eurlex':
    case 'stub-oj':
    case 'stub-api':
      return stubAdapter(source);
    default: {
      // Exhaustiveness guard.
      const _never: never = source.adapter;
      return {
        deltas: [],
        state: prev,
        status: 'error',
        message: `unknown adapter ${String(_never)}`,
      };
    }
  }
}
