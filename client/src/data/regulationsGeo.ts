/**
 * OpenGridWorks regulation geo-data — maps CSOAI frameworks (see frameworks.ts)
 * onto geography so the world map can show, for any region, which AI regulations
 * apply + the CSOAI crosswalk for each. Region granularity is national/bloc
 * (AI law is national/EU-level today); the map supports deeper zoom for when
 * state/county data lands.
 */
import { FRAMEWORKS, type Framework } from './frameworks';

// ISO 3166-1 alpha-3 (matches world-atlas TopoJSON `id`) → framework slugs that bind/apply there.
// Org/standards frameworks (ISO, OECD, UNESCO, IEEE, G7/G20, FLI, AI-company specs) are GLOBAL — see GLOBAL_SLUGS.
const EU27 = [
  'AUT','BEL','BGR','HRV','CYP','CZE','DNK','EST','FIN','FRA','DEU','GRC','HUN',
  'IRL','ITA','LVA','LTU','LUX','MLT','NLD','POL','PRT','ROU','SVK','SVN','ESP','SWE',
];

const EU_SLUGS = ['eu-ai-act','dora','nis2','cra','gdpr'];

export const COUNTRY_FRAMEWORKS: Record<string, string[]> = {
  ...Object.fromEntries(EU27.map((c) => [c, EU_SLUGS])),
  GBR: ['uk-aisi','gdpr'],            // UK
  USA: ['nist-ai-rmf','hipaa'],       // US
  KOR: ['korea-ai-basic-act'],        // South Korea
  SGP: [],                            // Singapore (Model AI Governance — org/advisory)
  CHN: [],                            // China (TC260/BAAI — see GLOBAL/advisory)
  CAN: [],                            // Canada (AIDA pending)
};

// Frameworks that apply everywhere (standards, intergovernmental, voluntary, AI-company specs).
export const GLOBAL_SLUGS = FRAMEWORKS
  .filter((f) => ['ISO/IEC','OECD','UNESCO','IEEE','G7/G20','FLI','AI Company','CSOAI Original','CSOAI','Council of Europe','Amnesty','Université de Montréal','BAAI'].includes(f.region))
  .map((f) => f.slug);

export function frameworkBySlug(slug: string): Framework | undefined {
  return FRAMEWORKS.find((f) => f.slug === slug);
}

/** All frameworks that apply to a country = its national/bloc ones + the global set. */
export function frameworksForCountry(iso3: string): Framework[] {
  const national = (COUNTRY_FRAMEWORKS[iso3] || []).map(frameworkBySlug).filter(Boolean) as Framework[];
  const global = GLOBAL_SLUGS.map(frameworkBySlug).filter(Boolean) as Framework[];
  // national first (binding/most relevant), then global standards
  return [...national, ...global];
}

/** Coverage score 0-3 by count of BINDING national frameworks — drives the choropleth heat. */
export function coverageLevel(iso3: string): number {
  const binding = (COUNTRY_FRAMEWORKS[iso3] || [])
    .map(frameworkBySlug)
    .filter((f) => f?.binding).length;
  if (binding >= 4) return 3;
  if (binding >= 2) return 2;
  if (binding >= 1) return 1;
  return 0;
}

// Human-readable country names for the panel (the atlas gives codes/names; this is a fallback for our keyed set).
export const COUNTRY_NAMES: Record<string, string> = {
  USA: 'United States', GBR: 'United Kingdom', KOR: 'South Korea', SGP: 'Singapore',
  CHN: 'China', CAN: 'Canada', DEU: 'Germany', FRA: 'France', ITA: 'Italy', ESP: 'Spain',
  NLD: 'Netherlands', IRL: 'Ireland', POL: 'Poland', SWE: 'Sweden',
};

// CSOAI tools/features that overlay onto a region from the sidebar (the "use one profile" layer).
export type OverlayTool = { id: string; label: string; blurb: string; href: string; color: string };
export const CSOAI_TOOLS: OverlayTool[] = [
  { id: 'classify', label: 'Classify a system',   blurb: 'Free EU AI Act risk classifier — is your AI high-risk here?', href: '/eu-ai-act-classifier', color: '#34d399' },
  { id: 'assess',   label: 'Run Assessment',      blurb: 'Score this region\'s frameworks against your AI system.', href: '/compliance', color: '#10b981' },
  { id: 'watchdog', label: 'Watchdog',            blurb: 'AI-incident reports & obligations for this jurisdiction.', href: '/watchdog', color: '#38bdf8' },
  { id: 'certify',  label: 'Get Certified',       blurb: 'CEASAI certification mapped to local requirements.',      href: '/certification', color: '#f59e0b' },
  { id: 'mcp',      label: 'MCP Tools',           blurb: '293 compliance MCP servers callable per framework.',      href: '/mcp', color: '#a78bfa' },
  { id: 'crosswalk',label: 'Crosswalks',          blurb: 'EU AI Act ⇄ NIST ⇄ ISO 42001 mappings.',                  href: '/crosswalks', color: '#f472b6' },
];

// world-atlas feature `id` is ISO 3166-1 NUMERIC; map the codes we hold data for → alpha-3.
// Compare by parseInt to be robust to leading-zero formatting.
export const NUMERIC_TO_A3: Record<number, string> = {
  40:'AUT',56:'BEL',100:'BGR',191:'HRV',196:'CYP',203:'CZE',208:'DNK',233:'EST',246:'FIN',
  250:'FRA',276:'DEU',300:'GRC',348:'HUN',372:'IRL',380:'ITA',428:'LVA',440:'LTU',442:'LUX',
  470:'MLT',528:'NLD',616:'POL',620:'PRT',642:'ROU',703:'SVK',705:'SVN',724:'ESP',752:'SWE',
  826:'GBR',840:'USA',410:'KOR',702:'SGP',156:'CHN',124:'CAN',
};
export function isoFromNumeric(id: string | number): string | undefined {
  return NUMERIC_TO_A3[parseInt(String(id), 10)];
}

// World atlas TopoJSON (countries, 110m) from a CDN — keeps the bundle light.
export const WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
