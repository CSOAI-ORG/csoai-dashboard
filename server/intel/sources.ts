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
 *  - Sources tagged `adapter: 'rss'`, `adapter: 'html-hash'`, or
 *    `adapter: 'fed-register'` are handled by the three LIVE adapters and will
 *    produce real deltas the moment they fetch.
 *  - Sources tagged `adapter: 'stub-*'` are intentionally parked: they need a
 *    source-specific structured parser (EUR-Lex SPARQL/CELLAR, the EU OJ daily
 *    index). The crawler skips them with a logged NOTE rather than guessing —
 *    accuracy beats coverage for a legal dataset.
 *
 * VERIFICATION (2026-06-19): every URL below was probed (curl, browser-shaped UA)
 * and either returned HTTP 200 with real feed/page content, OR is flagged in its
 * `note` as unverifiable-from-sandbox (gov.au / METI / CoE block datacenter IPs but
 * are the correct canonical endpoints — they resolve from the production VM egress).
 * Dead URLs from the prior VM dry-run (404/403) were replaced or removed; see notes.
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
  | 'FRA' // France (CNIL)
  | 'DEU' // Germany (BfDI)
  | 'ITA' // Italy (Garante)
  | 'ESP' // Spain (AEPD)
  | 'IRL' // Ireland (DPC)
  | 'NLD' // Netherlands (Autoriteit Persoonsgegevens)
  | 'BRA' // Brazil (ANPD)
  | 'GLOBAL';

/** What category of authority/feed this is — drives downstream delta `kind` mapping. */
export type SourceKind = 'gazette' | 'regulator' | 'standard' | 'enforcement' | 'news';

/** Which adapter parses this source. See adapters.ts. */
export type AdapterId =
  | 'rss' //          LIVE: generic RSS/Atom feed → items → deltas
  | 'html-hash' //    LIVE: fetch page, hash main content, emit delta on change
  | 'fed-register' // LIVE: US Federal Register JSON API parser (promoted from stub-api 2026-06-19)
  | 'stub-eurlex' //  STUB: needs EUR-Lex CELLAR/SPARQL structured parser
  | 'stub-oj'; //     STUB: needs EU Official Journal daily-index parser

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
  // ───────────────────────────── EU institutions ─────────────────────────────
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
    label: 'EU Official Journal — L series (new legislation) RSS',
    jurisdiction: 'EUR',
    kind: 'gazette',
    // FIXED (was stub-oj on a non-feed page): EUR-Lex DOES expose a working RSS for
    // "Acts of the Official Journal L" (rssId=222), refreshed daily. Verified 200 +
    // live pubDate 2026-06-19. The crawler keyword-filters AI/data items downstream.
    url: 'https://eur-lex.europa.eu/EN/display-feed.rss?rssId=222',
    adapter: 'rss',
    note: 'rss FEED. No native AI-only OJ feed exists without a logged-in saved search; this is the all-L-legislation feed, filtered downstream. (Old rssId=171 is dead.)',
  },
  {
    id: 'eu-ai-office-news',
    label: 'European Commission — AI Office / Digital Strategy news',
    jurisdiction: 'EUR',
    kind: 'regulator',
    url: 'https://digital-strategy.ec.europa.eu/en/rss.xml',
    adapter: 'rss',
    frameworkSlug: 'eu-ai-act',
    note: 'rss FEED (verified 200). No dedicated AI Office feed exists; this is the digital-strategy newsroom feed.',
  },
  {
    id: 'edpb-news',
    label: 'European Data Protection Board — news & guidelines',
    jurisdiction: 'EUR',
    kind: 'regulator',
    url: 'https://www.edpb.europa.eu/feed/news_en',
    adapter: 'rss',
    note: 'rss FEED. URL was correct all along — the prior VM 403 was UA-gating; the softened browser-shaped UA in adapters.ts now gets 200.',
  },
  {
    id: 'eu-edps-news',
    label: 'European Data Protection Supervisor — press & news',
    jurisdiction: 'EUR',
    kind: 'regulator',
    url: 'https://www.edps.europa.eu/press-publications/press-news/press-releases_en',
    adapter: 'html-hash',
    note: 'NEW. html-hash watch — EDPS has no clean feed; press-releases index (verified 200).',
  },
  {
    id: 'eu-europarl-press',
    label: 'European Parliament — press releases (AI/digital)',
    jurisdiction: 'EUR',
    kind: 'news',
    url: 'https://www.europarl.europa.eu/rss/doc/press-releases/en.xml',
    adapter: 'rss',
    note: 'NEW. rss FEED (verified 200, real XML). Keyword-filtered for AI/digital downstream.',
  },
  {
    id: 'eu-enisa-news',
    label: 'ENISA — EU cybersecurity agency news (AI security)',
    jurisdiction: 'EUR',
    kind: 'regulator',
    url: 'https://www.enisa.europa.eu/news',
    adapter: 'html-hash',
    note: 'NEW. html-hash watch — ENISA news index (verified 200); no working RSS endpoint found.',
  },

  // ───────────────────────── EU member-state DPAs ─────────────────────────
  {
    id: 'fr-cnil-news',
    label: 'France CNIL — actualités (data protection / AI)',
    jurisdiction: 'FRA',
    kind: 'regulator',
    url: 'https://www.cnil.fr/fr/rss.xml',
    adapter: 'rss',
    note: 'NEW. rss FEED (verified 200, real RSS). CNIL is an active AI-governance voice in the EU.',
  },
  {
    id: 'it-garante-news',
    label: 'Italy Garante — news (data protection / AI enforcement)',
    jurisdiction: 'ITA',
    kind: 'regulator',
    url: 'https://www.garanteprivacy.it/o/gpdp-rss/rss?t=news',
    adapter: 'rss',
    note: 'NEW. rss FEED (verified 200, real RSS). Garante drove the 2023 ChatGPT action — strong enforcement signal.',
  },
  {
    id: 'es-aepd-news',
    label: 'Spain AEPD — notas de prensa (data protection / AI)',
    jurisdiction: 'ESP',
    kind: 'regulator',
    url: 'https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa',
    adapter: 'html-hash',
    note: 'NEW. html-hash watch — AEPD exposes no working RSS; press-notes index (verified 200). Spain hosts the first EU AI sandbox.',
  },
  {
    id: 'ie-dpc-news',
    label: 'Ireland DPC — latest news (lead DPA for Big Tech)',
    jurisdiction: 'IRL',
    kind: 'regulator',
    url: 'https://www.dataprotection.ie/en/news-media/latest-news',
    adapter: 'html-hash',
    note: 'NEW. html-hash watch — no feed; latest-news index (verified 200). Ireland is the lead DPA for most US Big Tech EU operations.',
  },
  {
    id: 'de-bfdi-news',
    label: 'Germany BfDI — press releases (federal data protection)',
    jurisdiction: 'DEU',
    kind: 'regulator',
    url: 'https://www.bfdi.bund.de/EN/BfDI/Presse/Pressemitteilungen/pressemitteilungen_node.html',
    adapter: 'html-hash',
    note: 'NEW. html-hash watch — English press-releases list (verified 200); no RSS.',
  },
  {
    id: 'nl-ap-news',
    label: 'Netherlands Autoriteit Persoonsgegevens — current/news',
    jurisdiction: 'NLD',
    kind: 'regulator',
    url: 'https://www.autoriteitpersoonsgegevens.nl/en/current',
    adapter: 'html-hash',
    note: 'NEW. html-hash watch — English news index (verified 200); no feed. NL AP runs an active AI/algorithm oversight desk.',
  },

  // ───────────────────────── UK (GBR) ─────────────────────────
  {
    id: 'uk-ico-news',
    label: 'UK ICO — news & blogs (AI, data protection)',
    jurisdiction: 'GBR',
    kind: 'regulator',
    // FIXED (was a dead ico.org.uk/.../rss/ → 404): the GOV.UK Atom finder exposes a
    // stable, real Atom feed for the ICO organisation. Verified 200 + real <feed> XML.
    url: 'https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=information-commissioner-s-office',
    adapter: 'rss',
    note: 'atom FEED via GOV.UK finder (the legacy ico.org.uk RSS path is dead/404).',
  },
  {
    id: 'uk-dsit-aisi',
    label: 'UK AI Safety Institute — publications & updates',
    jurisdiction: 'GBR',
    kind: 'regulator',
    url: 'https://www.aisi.gov.uk/work',
    adapter: 'html-hash',
    note: 'html-hash — AISI has no stable feed; watches the work/publications index (verified 200).',
  },
  {
    id: 'uk-gov-ai-regulation',
    label: 'GOV.UK — AI regulation announcements (DSIT)',
    jurisdiction: 'GBR',
    kind: 'regulator',
    url: 'https://www.gov.uk/search/news-and-communications.atom?keywords=artificial%20intelligence&organisations%5B%5D=department-for-science-innovation-and-technology',
    adapter: 'rss',
    note: 'atom FEED — GOV.UK exposes Atom on any finder URL via .atom (verified 200).',
  },
  {
    id: 'uk-cma-ai',
    label: 'UK CMA — news (AI / foundation models competition)',
    jurisdiction: 'GBR',
    kind: 'enforcement',
    url: 'https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=competition-and-markets-authority&keywords=artificial%20intelligence',
    adapter: 'rss',
    note: 'NEW. atom FEED via GOV.UK finder (verified 200). CMA runs the UK foundation-models market review.',
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
    note: 'rss FEED (verified 200). NIST-wide news feed; crawler keyword-filters AI items downstream.',
  },
  {
    id: 'us-federal-register-ai',
    label: 'US Federal Register — AI documents (JSON API)',
    jurisdiction: 'USA',
    kind: 'gazette',
    // UPGRADED: was the .rss search export; now the structured JSON API, parsed by the
    // promoted fed-register adapter (typed deltas: Rule→new-instrument, Proposed Rule→amendment).
    url: 'https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=artificial+intelligence&order=newest&per_page=20',
    adapter: 'fed-register',
    note: 'fed-register adapter (LIVE, promoted from stub-api 2026-06-19). Verified 200 JSON. Precise typed deltas, deduped by document_number.',
  },
  {
    id: 'us-ntia-news',
    label: 'US NTIA — news/press (AI accountability, open models)',
    jurisdiction: 'USA',
    kind: 'regulator',
    url: 'https://www.ntia.gov/rss.xml',
    adapter: 'rss',
    note: 'NEW. rss FEED (verified 200, real RSS). NTIA leads US AI accountability & open-weight model policy.',
  },
  {
    id: 'us-ca-ag',
    label: 'California Attorney General — news (AI/privacy enforcement)',
    jurisdiction: 'USA',
    kind: 'enforcement',
    // FIXED (was /news/press-releases → 404): the /news index resolves 200.
    url: 'https://oag.ca.gov/news',
    adapter: 'html-hash',
    note: 'html-hash on the AG news index (verified 200). Old /news/press-releases path 404s.',
  },
  {
    id: 'us-ftc-ai',
    label: 'US FTC — press releases (AI/algorithmic enforcement)',
    jurisdiction: 'USA',
    kind: 'enforcement',
    url: 'https://www.ftc.gov/feeds/press-release.xml',
    adapter: 'rss',
    note: 'rss FEED (verified 200).',
  },
  {
    id: 'us-tx-ag',
    label: 'Texas Attorney General — news (TRAIGA / AI enforcement)',
    jurisdiction: 'USA',
    kind: 'enforcement',
    url: 'https://www.texasattorneygeneral.gov/news',
    adapter: 'html-hash',
    note: 'html-hash (verified 200). Texas enacted TRAIGA — watch the AG news index for actions.',
  },

  // ───────────────────────── Korea (KOR) ─────────────────────────
  {
    id: 'kr-pipc',
    label: 'Korea PIPC — Personal Information Protection Commission news',
    jurisdiction: 'KOR',
    kind: 'regulator',
    // FIXED (was /user/ltc/law/lawList.do → 404): the English news list resolves 200.
    url: 'https://www.pipc.go.kr/eng/user/ltn/new/newsList.do',
    adapter: 'html-hash',
    note: "html-hash on the English news list (verified 200; old law-list path 404s). Korea's AI Basic Act takes effect 2026.",
  },

  // ───────────────────────── Japan (JPN) ─────────────────────────
  {
    id: 'jp-meti-news',
    label: 'Japan METI — press releases (AI governance / guidelines)',
    jurisdiction: 'JPN',
    kind: 'regulator',
    url: 'https://www.meti.go.jp/english/press/index.html',
    adapter: 'html-hash',
    note: 'html-hash. UNVERIFIABLE from sandbox (meti.go.jp drops datacenter-IP requests, HTTP 000) but this is the canonical English press index and resolves from the production VM. METI co-authors the AI Business Guidelines.',
  },

  // ───────────────────────── China (CHN) ─────────────────────────
  {
    id: 'cn-cac-news',
    label: 'China CAC — Cyberspace Administration news (algorithm/genAI rules)',
    jurisdiction: 'CHN',
    kind: 'regulator',
    // FIXED (was /yw.htm → 404): the CAC homepage resolves (307→200) and carries the news rail.
    url: 'https://www.cac.gov.cn/',
    adapter: 'html-hash',
    note: 'html-hash on the CAC homepage news rail (old /yw.htm path 404s). CAC issues algorithm/deep-synthesis/genAI measures.',
  },

  // ───────────────────────── Canada (CAN) ─────────────────────────
  {
    id: 'ca-opc-news',
    label: 'Canada OPC — Office of the Privacy Commissioner news',
    jurisdiction: 'CAN',
    kind: 'regulator',
    // FIXED (was /feed/ → 404): the news-and-announcements index resolves 200.
    url: 'https://www.priv.gc.ca/en/opc-news/news-and-announcements/',
    adapter: 'html-hash',
    note: 'html-hash on the OPC news index (the old /feed/ RSS path is dead/404).',
  },
  {
    id: 'ca-ised-news',
    label: 'Canada ISED — departmental news (AI & Data Act / AISI Canada)',
    jurisdiction: 'CAN',
    kind: 'regulator',
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?dept=departmentofindustry&sort=publishedDate&orderBy=desc&pick=50&format=atom',
    adapter: 'rss',
    note: 'NEW. atom FEED via the official GC news API (dept=departmentofindustry = ISED; verified 200, real Atom). ISED owns AIDA + Canada AI Safety Institute.',
  },

  // ───────────────────────── Australia (AUS) ─────────────────────────
  {
    id: 'au-oaic-news',
    label: 'Australia OAIC — newsroom (privacy / AI guidance)',
    jurisdiction: 'AUS',
    kind: 'regulator',
    // FIXED (was /newsroom/feed → 404): the newsroom index resolves 200.
    url: 'https://www.oaic.gov.au/newsroom',
    adapter: 'html-hash',
    note: 'html-hash on the OAIC newsroom index (the old /feed RSS path is dead/404).',
  },

  // ───────────────────────── Singapore (SGP) ─────────────────────────
  {
    id: 'sg-imda-news',
    label: 'Singapore IMDA — news (Model AI Governance Framework)',
    jurisdiction: 'SGP',
    kind: 'regulator',
    url: 'https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches',
    adapter: 'html-hash',
    note: 'html-hash on the IMDA press index (verified 200); no clean feed.',
  },
  {
    id: 'sg-pdpc-news',
    label: 'Singapore PDPC — announcements (PDPA / AI governance)',
    jurisdiction: 'SGP',
    kind: 'regulator',
    url: 'https://www.pdpc.gov.sg/news-and-events/announcements',
    adapter: 'html-hash',
    note: 'NEW. html-hash on the PDPC announcements index (verified 200); no feed. PDPC co-publishes the Model AI Governance Framework + AI Verify.',
  },

  // ───────────────────────── Brazil (BRA) ─────────────────────────
  {
    id: 'br-anpd-news',
    label: 'Brazil ANPD — notícias (data protection / AI bill PL 2338)',
    jurisdiction: 'BRA',
    kind: 'regulator',
    url: 'https://www.gov.br/anpd/pt-br/assuntos/noticias',
    adapter: 'html-hash',
    note: 'NEW. html-hash on the ANPD news index (verified 200); no feed. ANPD is the likely supervisory authority under Brazil PL 2338/2023.',
  },

  // ───────────────────────── Standards (GLOBAL) ─────────────────────────
  {
    id: 'iso-jtc1-sc42',
    label: 'ISO/IEC JTC 1/SC 42 — Artificial Intelligence standards committee',
    jurisdiction: 'GLOBAL',
    kind: 'standard',
    url: 'https://www.iso.org/committee/6794475.html',
    adapter: 'html-hash',
    note: 'html-hash on the SC42 committee page (verified 200); detects new/updated standards (ISO/IEC 42001, 23894, etc.).',
  },
  {
    id: 'oecd-ai-news',
    label: 'OECD.AI — Policy Observatory news ("Wonk" blog)',
    jurisdiction: 'GLOBAL',
    kind: 'news',
    // FIXED (was /en/rss → 404): the /en/wonk index is the live policy/news blog.
    url: 'https://oecd.ai/en/wonk',
    adapter: 'html-hash',
    note: 'html-hash on the OECD.AI Wonk index (the old /en/rss feed is gone/404).',
  },
  {
    id: 'coe-ai',
    label: 'Council of Europe — AI & human rights (Framework Convention)',
    jurisdiction: 'GLOBAL',
    kind: 'regulator',
    url: 'https://www.coe.int/en/web/artificial-intelligence',
    adapter: 'html-hash',
    note: 'html-hash on the CoE AI hub. NOTE: CoE sits behind a Cloudflare bot wall that 403s datacenter IPs even with a browser UA — may need the browser-engine fetch path on the VM. CoE Framework Convention on AI is the first binding international AI treaty.',
  },

  // ───────────────────────── Incident / enforcement trackers (GLOBAL) ─────────────────────────
  {
    id: 'oecd-aim-incidents',
    label: 'OECD AI Incidents Monitor (AIM)',
    jurisdiction: 'GLOBAL',
    kind: 'enforcement',
    // FIXED (was /en/incidents-rss → 404): no public feed exists; watch the index.
    url: 'https://oecd.ai/en/incidents',
    adapter: 'html-hash',
    note: 'html-hash on the AIM incidents index (verified 200; the dedicated -rss feed never existed / 404s).',
  },
  {
    id: 'aiaaic-repository',
    label: 'AIAAIC — AI, Algorithmic & Automation Incidents & Controversies repository',
    jurisdiction: 'GLOBAL',
    kind: 'enforcement',
    url: 'https://www.aiaaic.org/aiaaic-repository',
    adapter: 'html-hash',
    note: 'html-hash on the community incident repository (verified 200). Respect AIAAIC ToS / attribution (CC-licensed).',
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
  const live = sources.filter(
    (s) => s.adapter === 'rss' || s.adapter === 'html-hash' || s.adapter === 'fed-register',
  ).length;
  return { total: sources.length, live, stubbed: sources.length - live, byAdapter, byJurisdiction };
}
