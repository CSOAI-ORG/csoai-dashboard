// Italian (it). UI chrome only — framework legal content stays as-authored in source data.
import type { Dict } from './en';

const it: Dict = {
  subtitle:
    "Le normative sull'IA del mondo, mappate. Fai clic su un paese qualsiasi per vedere i quadri normativi vincolanti in quel luogo, gli standard globali validi ovunque e le corrispondenze CSOAI, quindi sovrapponi i tuoi strumenti dalla barra laterale. Un solo profilo, l'intero pianeta.",
  searchPlaceholder: 'Trova un paese…',
  searchAria: 'Cerca un paese',
  frameworkOverlay: 'Livello quadri normativi',
  csoaiTools: 'Strumenti CSOAI',
  language: 'Lingua',
  statusBar:
    "{jurisdictions} giurisdizioni con normativa specifica sull'IA · {frameworks} quadri · {countries} paesi attivi · trascina per spostare, scorri per ingrandire",
  statusLoading: '—',
  zoomIn: 'Ingrandisci',
  zoomOut: 'Riduci',
  resetView: 'Reimposta vista',
  atlasError: "Impossibile caricare l'atlante della mappa ({error}). Controlla la connessione e ricarica.",
  atlasLoading: "Caricamento dell'atlante mondiale…",
  hoverNational: '{name} · {count} quadro/i nazionale/i',
  hoverGlobalSuffix: ' · si applicano standard globali',
  legendDensity: 'Densità normativa:',
  densityNone: 'nessuna',
  densityLight: 'lieve',
  densityModerate: 'moderata',
  densityDense: 'densa',
  region: 'Regione',
  nationalLaw: "Normativa IA nazionale / di blocco ({count})",
  globalStandards: 'Standard globali che si applicano anche qui ({count})',
  closePanel: 'Chiudi pannello regione',
  emptyState:
    "Nessuna legge vincolante specifica sull'IA ancora catalogata qui. Gli standard globali qui sotto continuano ad applicarsi e CSOAI sta monitorando questa giurisdizione — {flagLink}.",
  emptyStateFlagLink: 'segnala uno sviluppo',
  binding: 'vincolante',
  voluntary: 'volontario',
  effective: 'In vigore: {date}',
  csoaiCrosswalk: 'Corrispondenza CSOAI',
};

export default it;
