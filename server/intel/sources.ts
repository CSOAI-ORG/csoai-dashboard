/**
 * server/intel/sources.ts
 * ------------------------------------------------------------------------
 * The authoritative source registry for the CSOAI daily ingest engine — the
 * moat that keeps our AI-governance dataset the most current anywhere.
 *
 * Each source is a node the crawler polls on its daily run. Sources are grouped
 * conceptually by jurisdiction + kind, and each declares which `adapter` should
 * fetch + parse it. See `adapters.ts` for adapter semantics (which are LIVE vs
 * stubbed).
 *
 * HONESTY / SCOPE:
 *  - Every URL below is a real, public, authoritative endpoint as of 2026-06.
 *  - Sources tagged `adapter: 'rss'` or `adapter: 'html-hash'` are handled by the
 *    two LIVE adapters and will produce real deltas the moment they fetch.
 *  - Sources tagged `adapter: 'stub-*'` are intentionally parked: they need a
 *    source-specific structured parser (e.g. EUR-Lex SPARQL/CELLAR, the EU OJ
 *    daily index, regulator JSON APIs). The crawler skips them with a logged
 *    NOTE rather than guessing — accuracy beats coverage for a legal dataset.
 *
 * ROBOTS / ToS POSTURE (conceptual — see schedule.md):
 *  - We poll at a low daily cadence, identify ourselves with a descriptive
 *    User-Agent, prefer official RSS/Atom feeds and APIs over scraping, and
 *    only hash the *main content* of HTML pages. Operators should still confirm
 *    each source's robots.txt / ToS before enabling high-frequency polling.
 */

/** ISO-3166 alpha-3 jurisdiction code, or GLOBAL for trans-national bodies. */
export type Jurisdiction =
  | 'EUR' // EU institutions (using EUR for the Union; member-state codes used where national)
  | 'GBR'
  | 'USA'
  | 'KOR'
  | 'JPN'
  | 'CHN'
  | 'CAN'
  | 'AUS'
  | 'SGP'
  | 'GLOBAL';

/** What category of authority/feed this is — drives downstream delta `kind` mapping. */
export type SourceKind = 'gazette' | 'regulator' | 'standard' | 'enforcement' | 'news';

/** Which adapter parses this source. See adapters.ts. */
export type AdapterId =
  | 'rss' //         LIVE: generic RSS/Atom feed → items → deltas
  | 'html-hash' //   LIVE: fetch page, hash main content, emit delta on change
  | 'stub-eurlex' // STUB: needs EUR-Lex CELLAR/SPARQL structured parser
  | 'stub-oj' //     STUB: needs EU Official Journal daily-index parser
  | 'stub-api'; //   STUB: needs a source-specific JSON API client

export interface IntelSource {
  /** stable id, also used as the Layer-0 id prefix for emitted deltas. */
  id: string;
  /** human label for the report. */
  label: string;
  jurisdiction: Jurisdiction;
  kind: SourceKind;
  /** the URL the adapter fetches (feed URL for rss, page URL for html-hash). */
  url: string;
  adapter: AdapterId;
  /** optional framework slug to stamp on emitted deltas (joins to data/frameworks.ts). */
  frameworkSlug?: string;
  /** free-text note on status / what a stub still needs. */
  note?: string;
}

export const SOURCES: IntelSource[] = [
  // ───────────────────────────── EU ─────────────────────────────
  {
    id: 'eu-eurlex-ai-act',
    label: 'EUR-Lex — Regulation (EU) 2024/1689 (AI Act) consolidated',
    jurisdiction: 'EUR',
    kind: 'gazette',
    url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
    adapter: 'stub-eurlex',
    frameworkSlug: 'eu-ai-act',
    note: 'STUB: parse CELLAR/SPARQL for consolidated-version + corrigendum changes; html-hash would be too noisy on this page.',
  },
  {
    id: 'eu-oj-l-series',
    label: 'EU Official Journal — L series (legislation) daily index',
    jurisdiction: 'EUR',
    kind: 'gazette',
    url: 'https://eur-lex.europa.eu/oj/direct-access.html',
    adapter: 'stub-oj',
    note: 'STUB: parse the OJ daily L-series index for new AI/data instruments; needs date-scoped index parser.',
  },
  {
    id: 'eu-ai-office-news',
    label: 'European Commission — AI Office / Digital Strategy news',
    jurisdiction: 'EUR',
    kind: 'regulator',
    url: 'https://digital-strategy.ec.europa.eu/en/rss.xml',
    adapter: 'rss',
    frameworkSlug: 'eu-ai-act',
  },
  {
    id: 'edpb-news',
    label: 'European Data Protection Board — news & guidelines',
    jurisdiction: 'EUR',
    kind: 'regulator',
    url: 'https://www.edpb.europa.eu/feed/news_en',
    adapter: 'rss',
  },

  // ───────────────────────── UK (GBR) ─────────────────────────
  {
    id: 'uk-ico-news',
    label: 'UK ICO — news & blogs (AI, data protection)',
    jurisdiction: 'GBR',
    kind: 'regulator',
    url: 'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/rss/',
    adapter: 'rss',
  },
  {
    id: 'uk-dsit-aisi',
    label: 'UK AI Safety Institute — publications & updates',
    jurisdiction: 'GBR',
    kind: 'regulator',
    url: 'https://www.aisi.gov.uk/work',
    adapter: 'html-hash',
    note: 'AISI has no stable feed; html-hash detects new publications on the work index.',
  },
  {
    id: 'uk-gov-ai-regulation',
    label: 'GOV.UK — AI regulation announcements (DSIT)',
    jurisdiction: 'GBR',
    kind: 'regulator',
    url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=artificial%20intelligence&organisations%5B%5D=department-for-science-innovation-and-technology',
    adapter: 'rss',
    note: 'GOV.UK exposes an Atom feed on any search/finder URL by appending .atom.',
  },

  // ───────────────────────── US (USA) ─────────────────────────
  {
    id: 'us-nist-ai',
    label: 'NIST — AI news & AI Risk Management Framework updates',
    jurisdiction: 'USA',
    kind: 'standard',
    url: 'https://www.nist.gov/news-events/news/rss.xml',
    adapter: 'rss',
    frameworkSlug: 'nist-ai-rmf',
    note: 'NIST-wide news feed; crawler keyword-filters AI items downstream if needed.',
  },
  {
    id: 'us-federal-register-ai',
    label: 'US Federal Register — AI documents feed',
    jurisdiction: 'USA',
    kind: 'gazette',
    url: 'https://www.federalregister.gov/documents/search.rss?conditions%5Bterm%5D=artificial+intelligence',
    adapter: 'rss',
    note: 'Federal Register exposes .rss on any search; also has a full JSON API (future stub-api upgrade).',
  },
  {
    id: 'us-ca-ag',
    label: 'California Attorney General — press releases (AI/privacy enforcement)',
    jurisdiction: 'USA',
    kind: 'enforcement',
    url: 'https://oag.ca.gov/news/press-releases',
    adapter: 'html-hash',
    note: 'No feed; html-hash on the press-release index catches new AG actions.',
  },
  {
    id: 'us-ftc-ai',
    label: 'US FTC — press releases (AI/algorithmic enforcement)',
    jurisdiction: 'USA',
    kind: 'enforcement',
    url: 'https://www.ftc.gov/feeds/press-release.xml',
    adapter: 'rss',
  },
  {
    id: 'us-tx-ag',
    label: 'Texas Attorney General — news (TRAIGA / AI enforcement)',
    jurisdiction: 'USA',
    kind: 'enforcement',
    url: 'https://www.texasattorneygeneral.gov/news',
    adapter: 'html-hash',
    note: 'No feed; Texas enacted TRAIGA — watch the AG news index for actions.',
  },

  // ───────────────────────── Korea (KOR) ─────────────────────────
  {
    id: 'kr-pipc',
    label: 'Korea PIPC — Personal Information Protection Commission notices',
    jurisdiction: 'KOR',
    kind: 'regulator',
    url: 'https://www.pipc.go.kr/eng/user/ltc/law/lawList.do',
    adapter: 'html-hash',
    note: "STUB-ish: KO/EN portal, no clean feed. html-hash on the English law list; a stub-api parser of the Korean board would be richer (Korea's AI Basic Act takes effect 2026).",
  },

  // ───────────────────────── Japan (JPN) ─────────────────────────
  {
    id: 'jp-meti-news',
    label: 'Japan METI — press releases (AI governance / guidelines)',
    jurisdiction: 'JPN',
    kind: 'regulator',
    url: 'https://www.meti.go.jp/english/press/index.html',
    adapter: 'html-hash',
    note: 'METI English press index; html-hash detects new releases. METI co-authors the AI Business Guidelines.',
  },

  // ───────────────────────── China (CHN) ─────────────────────────
  {
    id: 'cn-cac-news',
    label: 'China CAC — Cyberspace Administration news (gov AI/algorithm rules)',
    jurisdiction: 'CHN',
    kind: 'regulator',
    url: 'http://www.cac.gov.cn/yw.htm',
    adapter: 'html-hash',
    note: 'No feed; html-hash on CAC news index. CAC issues algorithm/deep-synthesis/genAI measures.',
  },

  // ───────────────────────── Other national regulators ─────────────────────────
  {
    id: 'ca-opc-news',
    label: 'Canada OPC — Office of the Privacy Commissioner news',
    jurisdiction: 'CAN',
    kind: 'regulator',
    url: 'https://www.priv.gc.ca/en/opc-news/news-and-announcements/feed/',
    adapter: 'rss',
  },
  {
    id: 'au-oaic-news',
    label: 'Australia OAIC — news (privacy / AI guidance)',
    jurisdiction: 'AUS',
    kind: 'regulator',
    url: 'https://www.oaic.gov.au/newsroom/feed',
    adapter: 'rss',
  },
  {
    id: 'sg-imda-news',
    label: 'Singapore IMDA — news (Model AI Governance Framework)',
    jurisdiction: 'SGP',
    kind: 'regulator',
    url: 'https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches',
    adapter: 'html-hash',
    note: 'No clean feed; html-hash on the IMDA press index.',
  },

  // ───────────────────────── Standards (GLOBAL) ─────────────────────────
  {
    id: 'iso-jtc1-sc42',
    label: 'ISO/IEC JTC 1/SC 42 — Artificial Intelligence standards committee',
    jurisdiction: 'GLOBAL',
    kind: 'standard',
    url: 'https://www.iso.org/committee/6794475.html',
    adapter: 'html-hash',
    note: 'SC42 committee page; html-hash detects new/updated standards (ISO/IEC 42001, 23894, etc.). A stub-api against the ISO catalogue JSON would be more precise.',
  },
  {
    id: 'oecd-ai-news',
    label: 'OECD.AI — Policy Observatory news & policy updates',
    jurisdiction: 'GLOBAL',
    kind: 'news',
    url: 'https://oecd.ai/en/rss',
    adapter: 'rss',
  },
  {
    id: 'coe-ai',
    label: 'Council of Europe — AI & human rights (Framework Convention) news',
    jurisdiction: 'GLOBAL',
    kind: 'regulator',
    url: 'https://www.coe.int/en/web/artificial-intelligence/newsroom',
    adapter: 'html-hash',
    note: 'Watches the CoE AI newsroom; CoE Framework Convention on AI is the first binding international AI treaty.',
  },

  // ───────────────────────── Incident / enforcement trackers (GLOBAL) ─────────────────────────
  {
    id: 'oecd-aim-incidents',
    label: 'OECD AI Incidents Monitor (AIM)',
    jurisdiction: 'GLOBAL',
    kind: 'enforcement',
    url: 'https://oecd.ai/en/incidents-rss',
    adapter: 'rss',
    note: 'If the dedicated incidents feed 404s in-sandbox, fall back to html-hash on https://oecd.ai/en/incidents (handled gracefully by the runner).',
  },
  {
    id: 'aiaaic-repository',
    label: 'AIAAIC — AI, Algorithmic & Automation Incidents & Controversies repository',
    jurisdiction: 'GLOBAL',
    kind: 'enforcement',
    url: 'https://www.aiaaic.org/aiaaic-repository',
    adapter: 'html-hash',
    note: 'Community incident repository; html-hash detects repository updates. Respect AIAAIC ToS / attribution (CC-licensed).',
  },
];

/** Convenience: count sources by adapter for the crawl report. */
export function sourceStats(sources: IntelSource[] = SOURCES) {
  const byAdapter: Record<string, number> = {};
  const byJurisdiction: Record<string, number> = {};
  for (const s of sources) {
    byAdapter[s.adapter] = (byAdapter[s.adapter] ?? 0) + 1;
    byJurisdiction[s.jurisdiction] = (byJurisdiction[s.jurisdiction] ?? 0) + 1;
  }
  const live = sources.filter((s) => s.adapter === 'rss' || s.adapter === 'html-hash').length;
  return { total: sources.length, live, stubbed: sources.length - live, byAdapter, byJurisdiction };
}
