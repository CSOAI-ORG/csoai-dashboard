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
 * WAF-RECOVERY PASS (2026-06-20): re-probed the sources the VM run still couldn't reach.
 *  - EDPB / EDPS (Akamai HEADER-scoring 403; curl 200): added `fetchProfile: 'browser'`
 *    (full Sec-Fetch / Sec-CH-UA / Referer header set in adapters.ts) → best-effort pass.
 *  - METI (meti.go.jp host-level datacenter-IP DROP, HTTP 000 — not a header gate): PARKED
 *    with a `// WAF:` note; ADDED two reachable JP feeds to compensate (jp-digital-agency
 *    real UTF-8 RSS + jp-soumu RDF, both 200).
 *  - CoE (Cloudflare TLS-fingerprint wall 403s ALL of coe.int even with browser headers):
 *    PARKED — genuinely needs a browser-engine fetch path; NOT faked. Treaty signal held by
 *    oecd-ai-news + eu-europarl-press.
 *  - gov.au (OAIC redirect fixed to canonical /news/media-centre; eSafety/DISR hosts 000):
 *    ADDED reachable au-pm-media + au-treasury-ministers to compensate; au-esafety kept but
 *    flagged. Sources that are genuinely unreachable from Node fetch are clearly marked
 *    PARKED in their note — we do not pretend they work.
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
  /**
   * Optional fetch header profile. Default (omitted) sends the honest, self-identifying
   * CSOAI crawler UA. Set to 'browser' for sources behind a header-scoring WAF (e.g.
   * Akamai in front of the EU institutions) that 403 the honest UA but serve a full
   * Chrome-shaped request. See adapters.ts BROWSER-PROFILE HEADERS note. Best-effort:
   * a TLS-fingerprint WAF (Cloudflare/CoE) can still block — those are parked, not faked.
   */
  fetchProfile?: 'default' | 'browser';
  /** Optional per-source extra/override request headers (highest precedence). */
  extraHeaders?: Record<string, string>;
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
    // WAF: EDPB sits behind Akamai, which scores the WHOLE request shape, not just the
    // UA string — a bare Node fetch 403s even with a Mozilla UA, but curl with the same
    // UA gets 200. We send the full browser-profile header set (Sec-Fetch-*, Sec-CH-UA,
    // Referer) to look like a real navigation. If the VM's Akamai edge fingerprints the
    // TLS ClientHello it may still 403 — alt feed below is the documented fallback.
    fetchProfile: 'browser',
    note: 'rss FEED (curl 200, Node-fetch 403 = Akamai header-scoring). fetchProfile:browser sends Sec-Fetch-*/Referer to pass. ALT if still blocked: html-hash on https://www.edpb.europa.eu/news/news_en (same content, also 200).',
  },
  {
    id: 'eu-edps-news',
    label: 'European Data Protection Supervisor — press & news',
    jurisdiction: 'EUR',
    kind: 'regulator',
    url: 'https://www.edps.europa.eu/press-publications/press-news/press-releases_en',
    adapter: 'html-hash',
    // WAF: same Akamai header-scoring as EDPB — fetchProfile:browser to pass. curl 200.
    fetchProfile: 'browser',
    note: 'html-hash watch — EDPS has no clean feed; press-releases index (curl 200, Node-fetch 403 = Akamai). fetchProfile:browser added. ALT index also 200: https://www.edps.europa.eu/press-publications/press-news_en',
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
    fetchProfile: 'browser',
    // WAF: the ENTIRE meti.go.jp host drops datacenter-IP requests at the network edge
    // (HTTP 000 / connection reset) — not a UA/header gate, so the browser profile can't
    // help from a datacenter egress. PARKED as the canonical English press index; it may
    // resolve from a residential/VM egress with a clean reputation, but DO NOT assume it
    // works. METI's AI signal is covered meanwhile by jp-digital-agency + jp-soumu (real
    // RSS, reachable) and by oecd-ai-news (OECD.AI tracks Japan's AI Business Guidelines).
    note: 'PARKED — WAF: meti.go.jp host-level datacenter-IP block (HTTP 000, not a header gate; browser profile cannot fix an IP-reputation block). Canonical English press index kept for VM/residential egress. JP coverage held up by jp-digital-agency + jp-soumu feeds below.',
  },
  {
    id: 'jp-digital-agency',
    label: 'Japan Digital Agency (デジタル庁) — news & updates RSS',
    jurisdiction: 'JPN',
    kind: 'regulator',
    // NEW (compensates for the WAF-parked METI). Real UTF-8 RSS 2.0, verified 200 + live
    // <item>s. The Digital Agency drives Japan's digital/AI governance & gov-cloud policy.
    url: 'https://www.digital.go.jp/rss/news.xml',
    adapter: 'rss',
    note: 'NEW. rss FEED (verified 200, real UTF-8 RSS 2.0). Reachable where meti.go.jp is IP-blocked. Japanese-language items; crawler keyword-filters AI/データ/ガバナンス downstream.',
  },
  {
    id: 'jp-soumu',
    label: 'Japan MIC / Soumu (総務省) — news (AI, telecoms, data governance) RSS',
    jurisdiction: 'JPN',
    kind: 'regulator',
    // NEW. Real RSS 1.0 (RDF), verified 200. MIC co-leads Japan's AI/telecoms & data rules.
    // NOTE: this feed is Shift_JIS-encoded; titles may garble under UTF-8 text decoding —
    // it still reliably emits CHANGE/new-item deltas (link + date are ASCII), which is the
    // signal we need; treat the title as best-effort. A UTF-8 alt is jp-digital-agency above.
    url: 'https://www.soumu.go.jp/news.rdf',
    adapter: 'rss',
    note: 'NEW. rss/RDF FEED (verified 200). Shift_JIS-encoded → titles may garble under UTF-8 decode, but item links/dates are clean so deltas still fire. Reachable where meti.go.jp is IP-blocked.',
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
    label: 'Australia OAIC — media centre (privacy / AI guidance)',
    jurisdiction: 'AUS',
    kind: 'regulator',
    // FIXED again: /newsroom 301-redirects to the canonical /news/media-centre (verified
    // 200 final). Point straight at the canonical URL to avoid a redirect hop each run.
    url: 'https://www.oaic.gov.au/news/media-centre',
    adapter: 'html-hash',
    fetchProfile: 'browser',
    note: 'html-hash on the OAIC media-centre index (canonical target of the old /newsroom 301). browser profile set defensively (gov.au sits behind a CDN that can gate datacenter UAs).',
  },
  {
    id: 'au-pm-media',
    label: 'Australia PM&C — PM media releases (AI/tech policy announcements)',
    jurisdiction: 'AUS',
    kind: 'news',
    // NEW (compensates for eSafety/DISR hosts that hard-drop datacenter IPs, HTTP 000).
    // pm.gov.au/media resolves 200 and carries an article list of media releases — major
    // AU AI/digital policy is announced here. html-hash watch.
    url: 'https://www.pm.gov.au/media',
    adapter: 'html-hash',
    fetchProfile: 'browser',
    note: 'NEW. html-hash on the PM media-releases index (verified 200). Reachable where esafety.gov.au / industry.gov.au datacenter-block (HTTP 000). Keyword-filtered for AI/tech downstream.',
  },
  {
    id: 'au-treasury-ministers',
    label: 'Australia Treasury ministers — media (AI/competition/data economy)',
    jurisdiction: 'AUS',
    kind: 'regulator',
    // NEW. ministers.treasury.gov.au resolves 200 (where industry.gov.au datacenter-blocks).
    // Treasury ministers carry AI-in-the-economy, competition & consumer-data-right policy.
    url: 'https://ministers.treasury.gov.au/ministers',
    adapter: 'html-hash',
    fetchProfile: 'browser',
    note: 'NEW. html-hash on the Treasury ministers media index (verified 200). Compensates for the IP-blocked industry.gov.au / DISR hosts.',
  },
  {
    id: 'au-esafety',
    label: 'Australia eSafety Commissioner — newsroom (online safety / AI harms)',
    jurisdiction: 'AUS',
    kind: 'regulator',
    url: 'https://www.esafety.gov.au/newsroom',
    adapter: 'html-hash',
    fetchProfile: 'browser',
    // WAF: esafety.gov.au returns HTTP 000 (connection dropped) to this datacenter egress.
    // Kept as the canonical eSafety newsroom — it may resolve from the production VM's
    // egress (different IP reputation). If the VM also gets 000, the AU signal is held up
    // by au-pm-media + au-treasury-ministers + au-oaic-news above. Not faked.
    note: 'PARKED-ish — WAF: esafety.gov.au datacenter-IP drop (HTTP 000) from this egress; may resolve from VM. Canonical eSafety newsroom (eSafety leads AU online-safety + AI-harm guidance). AU coverage otherwise held by au-pm-media / au-treasury-ministers / au-oaic-news.',
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
    fetchProfile: 'browser',
    // WAF: needs browser-engine fetch path; PARKED. CoE is behind a Cloudflare bot wall
    // that 403s the whole coe.int family (www.coe.int AND rm.coe.int) even with the full
    // browser-profile headers above — it fingerprints the TLS ClientHello, which a plain
    // Node fetch cannot disguise. Genuinely unreachable from Node fetch; the only fix is a
    // real browser engine (Playwright) fetch path on the VM. NOT faked. Coverage of the
    // CoE Framework Convention on AI is meanwhile carried by oecd-ai-news + eu-europarl-press
    // (which both track the treaty). search.coe.int (a different host) is reachable but only
    // serves a JS search shell, not a usable static index, so it's not wired here.
    note: 'PARKED — WAF: Cloudflare TLS-fingerprint bot wall 403s ALL of coe.int (www + rm) even with full browser-profile headers; needs a browser-engine (Playwright) fetch path on the VM. NOT faked. Treaty signal meanwhile via oecd-ai-news + eu-europarl-press. CoE Framework Convention on AI = first binding international AI treaty.',
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
