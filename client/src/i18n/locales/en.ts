// English (en) — canonical key set for the OpenGridWorks i18n layer.
//
// IMPORTANT: This dictionary covers ONLY the app's own UI chrome. The legal
// framework descriptions, citations, names and "effective" dates that come from
// `@/data/frameworks.ts` are deliberately NOT translated here — auto-translating
// legal text is an accuracy risk, so it stays as-authored in the source data.
// Localizing framework *content* is a future pass (per-locale data overlays).
//
// Proper nouns (EU AI Act, NIST, ISO 42001, CSOAI, CEASAI, OpenGridWorks) are
// kept untranslated across every locale.
//
// To add a new language: copy this file to locales/<lang>.ts, translate the
// values (keep the keys identical and the {placeholders} intact), then register
// it in ../index.ts (LOCALES map + LANGUAGE_NAMES). That is the only wiring needed.

export type Dict = {
  // page header
  subtitle: string;
  // sidebar
  searchPlaceholder: string;
  searchAria: string;
  frameworkOverlay: string;
  csoaiTools: string;
  language: string;
  // map status bar — uses {jurisdictions} {frameworks} {countries}
  statusBar: string;
  statusLoading: string; // shown before country count resolves
  // zoom controls (aria)
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  // map states
  atlasError: string; // uses {error}
  atlasLoading: string;
  // hover label — uses {name} {count}
  hoverNational: string; // "{name} · {count} national framework(s)"
  hoverGlobalSuffix: string; // " · global standards apply"
  // legend
  legendDensity: string;
  densityNone: string;
  densityLight: string;
  densityModerate: string;
  densityDense: string;
  // region panel
  region: string;
  nationalLaw: string; // uses {count}
  globalStandards: string; // uses {count}
  closePanel: string;
  emptyState: string; // honest empty-state; contains {flagLink}
  emptyStateFlagLink: string; // anchor text for the flag-a-development link
  // badges
  binding: string;
  voluntary: string;
  effective: string; // "Effective: {date}"
  csoaiCrosswalk: string;
};

const en: Dict = {
  subtitle:
    "The world's AI regulations, mapped. Click any country to see the frameworks that bind there, the global standards that apply everywhere, and CSOAI crosswalks — then overlay your tools from the sidebar. One profile, the whole planet.",
  searchPlaceholder: 'Find a country…',
  searchAria: 'Search for a country',
  frameworkOverlay: 'Framework overlay',
  csoaiTools: 'CSOAI tools',
  language: 'Language',
  statusBar:
    '{jurisdictions} jurisdictions with AI-specific law · {frameworks} frameworks · {countries} countries live · drag to pan, scroll to zoom',
  statusLoading: '—',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  resetView: 'Reset view',
  atlasError: "Couldn't load the map atlas ({error}). Check the connection and reload.",
  atlasLoading: 'Loading world atlas…',
  hoverNational: '{name} · {count} national framework(s)',
  hoverGlobalSuffix: ' · global standards apply',
  legendDensity: 'Regulation density:',
  densityNone: 'none',
  densityLight: 'light',
  densityModerate: 'moderate',
  densityDense: 'dense',
  region: 'Region',
  nationalLaw: 'National / bloc AI law ({count})',
  globalStandards: 'Global standards that also apply ({count})',
  closePanel: 'Close region panel',
  emptyState:
    'No AI-specific binding law catalogued here yet. The global standards below still apply, and CSOAI is monitoring this jurisdiction — {flagLink}.',
  emptyStateFlagLink: 'flag a development',
  binding: 'binding',
  voluntary: 'voluntary',
  effective: 'Effective: {date}',
  csoaiCrosswalk: 'CSOAI crosswalk',
};

export default en;
