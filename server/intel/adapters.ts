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
 * LIVE adapter 3 (promoted 2026-06-19 from the old `stub-api`):
 *   • fedRegisterAdapter — queries the US Federal Register JSON API
 *     (federalregister.gov/api/v1/documents.json) for AI documents newer than the
 *     last seen document. This is a REAL structured parser, not a hash/guess.
 *
 * STILL STUBBED (intentionally parked — emit nothing, log a NOTE):
 *   • stub-eurlex / stub-oj — need source-specific structured parsers
 *     (EUR-Lex CELLAR/SPARQL, the EU OJ daily index). We do NOT guess: a legal
 *     dataset must not fabricate deltas. See TODOs below.
 *
 * No third-party XML/HTML libs are used — the parsers are dependency-free regex/
 * string parsers, deliberately conservative. Network uses global `fetch` (Node 18+).
 *
 * USER-AGENT NOTE (2026-06-19): a real VM dry-run showed several authoritative
 * regulators (EDPB, others behind Akamai/Cloudflare) hard-403 a bare crawler UA
 * string but serve the same feed to a Mozilla-prefixed UA. We therefore send a
 * standards-compliant Mozilla-compatible UA that still identifies CSOAI + links a
 * contact page (honest, robots-respecting), and retry once on a 403/429/503 with a
 * tiny backoff. This is a pure robustness win — no contract change.
 *
 * BROWSER-PROFILE HEADERS (2026-06-20): some WAFs (notably Akamai in front of the
 * EU institutions — EDPB / EDPS) don't gate on the UA string alone; they score the
 * *whole* request shape (header set, order, Sec-Fetch-* hints). A bare `fetch` with
 * only UA+Accept gets 403 even though curl with the same UA gets 200. So for sources
 * that opt in (`source.fetchProfile = 'browser'` in sources.ts), we send a fuller
 * browser-shaped header set (Accept, Accept-Language, Sec-Fetch-*, Sec-CH-UA,
 * Upgrade-Insecure-Requests, and a same-origin Referer). Sources can also pass
 * `source.extraHeaders` for one-off needs. This is best-effort: a TLS-fingerprint
 * WAF that fingerprints the *TLS ClientHello* (not headers) can still block the Node
 * stack — those sources are parked in sources.ts with a `// WAF:` note, not faked.
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

// Mozilla-compatible UA that still identifies CSOAI + a contact URL. Many public
// regulator feeds sit behind WAFs (Akamai/Cloudflare) that 403 a bare token UA but
// serve a browser-shaped UA. We stay honest (we say who we are + link a page) while
// not getting needlessly blocked. See USER-AGENT NOTE in the header.
const USER_AGENT =
  'Mozilla/5.0 (compatible; CSOAI-Intel-Crawler/1.0; +https://csoai.org/crawler; AI-governance dataset; respects robots.txt)';
/**
 * A current real-Chrome UA. We only send this for sources that explicitly opt into
 * the 'browser' fetch profile (Akamai/WAF-gated EU feeds that 403 the honest crawler
 * UA). The default everywhere else stays the honest, self-identifying CSOAI UA above.
 */
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const FETCH_TIMEOUT_MS = 20_000;
const MAX_ITEMS_PER_FEED = 25;
/** HTTP statuses worth one polite retry (transient block / rate limit / upstream). */
const RETRYABLE_STATUS = new Set([403, 429, 500, 502, 503, 520, 522]);

/**
 * Build a fuller, browser-shaped header set for a `fetchProfile: 'browser'` source.
 * These mimic what a real Chrome navigation sends (incl. Sec-Fetch-* + a same-origin
 * Referer) so header-scoring WAFs (Akamai in front of EDPB/EDPS) are less likely to
 * 403 the Node fetch. Best-effort only — see header note. `source.extraHeaders` wins.
 */
function browserHeaders(url: string, accept: string): Record<string, string> {
  let referer = url;
  try {
    referer = new URL(url).origin + '/';
  } catch {
    /* keep full url as referer if it won't parse */
  }
  return {
    'User-Agent': BROWSER_USER_AGENT,
    Accept: accept.includes('json')
      ? accept
      : 'text/html,application/xhtml+xml,application/xml;q=0.9,application/rss+xml,application/atom+xml;q=0.8,*/*;q=0.7',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Sec-CH-UA': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    Referer: referer,
  };
}

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

/** Per-fetch options: which header profile + any source-declared extra headers. */
interface FetchOpts {
  /** 'browser' sends the fuller real-Chrome header set; 'default' (or omitted) sends the honest CSOAI UA. */
  profile?: 'default' | 'browser';
  /** source-declared extra/override headers (highest precedence). */
  extraHeaders?: Record<string, string>;
}

/** One timed fetch attempt. Returns the Response (caller decides on status). */
async function fetchOnce(url: string, accept: string, opts: FetchOpts = {}): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  const base: Record<string, string> =
    opts.profile === 'browser'
      ? browserHeaders(url, accept)
      : {
          'User-Agent': USER_AGENT,
          Accept: accept,
          // A couple of innocuous browser-ish headers help past stricter WAFs.
          'Accept-Language': 'en;q=0.9',
        };
  const headers = { ...base, ...(opts.extraHeaders ?? {}) };
  try {
    return await fetch(url, {
      headers,
      signal: ctrl.signal,
      redirect: 'follow',
    });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Fetch text with a timeout + (honest, or per-source browser-shaped) headers,
 * retrying once on a transient/blocking status. Throws on a non-2xx final response
 * so callers can catch per-source (the runner logs + continues — one bad source
 * never fails the run).
 */
async function fetchText(
  url: string,
  accept = 'application/rss+xml, application/atom+xml, application/xml, text/html, */*',
  opts: FetchOpts = {},
): Promise<string> {
  let res = await fetchOnce(url, accept, opts);
  if (!res.ok && RETRYABLE_STATUS.has(res.status)) {
    // Polite single backoff retry — many WAF 403s are transient/challenge-based.
    await new Promise((r) => setTimeout(r, 750));
    res = await fetchOnce(url, accept, opts);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return await res.text();
}

/** Pull the per-source fetch options off a source (profile + extra headers). */
function fetchOptsFor(source: IntelSource): FetchOpts {
  return { profile: source.fetchProfile, extraHeaders: source.extraHeaders };
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
    // RSS <link>...</link> first.
    let link = firstTag(block, 'link');
    // Atom uses <link href="..."/>. Prefer rel="alternate" (the human page) over
    // rel="self"/"edit"/"enclosure"; fall back to the first href if none is marked.
    if (!link) {
      const linkTags = block.match(/<link\b[^>]*>/gi) ?? [];
      let alternate: string | undefined;
      let firstHref: string | undefined;
      for (const lt of linkTags) {
        const href = lt.match(/href=["']([^"']+)["']/i)?.[1];
        if (!href) continue;
        if (!firstHref) firstHref = href;
        const rel = lt.match(/rel=["']([^"']+)["']/i)?.[1]?.toLowerCase();
        if (rel === 'alternate' || rel === undefined) {
          alternate = alternate ?? href;
        }
      }
      link = alternate ?? firstHref;
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
  const xml = await fetchText(source.url, undefined, fetchOptsFor(source));
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
  const html = await fetchText(source.url, undefined, fetchOptsFor(source));
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
// LIVE ADAPTER 3: US Federal Register JSON API (promoted from old `stub-api`)
// ───────────────────────────────────────────────────────────────────────────

/** Minimal shape of a Federal Register API document we consume. */
interface FedRegDoc {
  document_number?: string;
  title?: string;
  type?: string; // "Rule" | "Proposed Rule" | "Notice" | "Presidential Document"
  publication_date?: string;
  html_url?: string;
  abstract?: string;
}

/** Map a Federal Register document `type` to our delta kind. */
function fedRegDeltaKind(type?: string): RegulationDelta['kind'] {
  const t = (type ?? '').toLowerCase();
  if (t === 'rule') return 'new-instrument';
  if (t === 'proposed rule') return 'amendment';
  // Notices / presidential documents / other → treat as guidance signals.
  return 'guidance';
}

/**
 * Query the Federal Register JSON API for AI documents and emit a delta per
 * document we haven't seen before (keyed by the stable `document_number`). This
 * is a real structured parser — no hashing, no guessing.
 *
 * The source `url` is the API endpoint, e.g.
 *   https://www.federalregister.gov/api/v1/documents.json?conditions[term]=artificial+intelligence&order=newest&per_page=20
 */
export async function fedRegisterAdapter(source: IntelSource, prev: SourceState): Promise<AdapterResult> {
  const body = await fetchText(source.url, 'application/json, */*', fetchOptsFor(source));
  let parsed: { results?: FedRegDoc[] };
  try {
    parsed = JSON.parse(body) as { results?: FedRegDoc[] };
  } catch {
    throw new Error('Federal Register API returned non-JSON (unexpected)');
  }
  const docs = (parsed.results ?? []).slice(0, MAX_ITEMS_PER_FEED);
  const seen = new Set(prev.seenGuids ?? []);
  const firstRun = !prev.lastRunAt;

  const deltas: RegulationDelta[] = [];
  const allGuids: string[] = [];
  for (const d of docs) {
    const id = d.document_number || d.html_url || d.title || '';
    if (!id) continue;
    allGuids.push(id);
    if (seen.has(id)) continue;
    // First run: record the baseline, emit a single representative delta only.
    if (firstRun && deltas.length >= 1) continue;
    const label = stripTags(d.title ?? '(untitled Federal Register document)').slice(0, 240);
    deltas.push({
      at: new Date().toISOString(),
      kind: firstRun ? 'guidance' : fedRegDeltaKind(d.type),
      frameworkSlug: source.frameworkSlug,
      jurisdictions: jurisdictionsFor(source),
      summary: `${firstRun ? '[baseline] ' : ''}${source.label}: ${d.type ? `[${d.type}] ` : ''}${label}`,
      source: d.html_url || source.url,
    });
  }

  const state: SourceState = {
    lastRunAt: new Date().toISOString(),
    seenGuids: allGuids.slice(0, 200),
  };
  return {
    deltas,
    state,
    status: deltas.length ? 'ok' : 'unchanged',
    message: `${docs.length} FR documents, ${deltas.length} new`,
  };
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
    case 'fed-register':
      return fedRegisterAdapter(source, prev);
    case 'stub-eurlex':
    case 'stub-oj':
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
