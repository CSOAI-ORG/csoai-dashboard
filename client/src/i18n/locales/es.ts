// Spanish (es). UI chrome only — framework legal content stays as-authored in source data.
import type { Dict } from './en';

const es: Dict = {
  subtitle:
    'Las normativas de IA del mundo, en un mapa. Haz clic en cualquier país para ver los marcos que rigen allí, los estándares globales que se aplican en todas partes y las correspondencias de CSOAI; luego superpón tus herramientas desde la barra lateral. Un solo perfil, todo el planeta.',
  searchPlaceholder: 'Buscar un país…',
  searchAria: 'Buscar un país',
  frameworkOverlay: 'Capa de marcos',
  csoaiTools: 'Herramientas CSOAI',
  language: 'Idioma',
  statusBar:
    '{jurisdictions} jurisdicciones con legislación específica de IA · {frameworks} marcos · {countries} países activos · arrastra para mover, desplaza para ampliar',
  statusLoading: '—',
  zoomIn: 'Ampliar',
  zoomOut: 'Reducir',
  resetView: 'Restablecer vista',
  atlasError: 'No se pudo cargar el atlas del mapa ({error}). Comprueba la conexión y vuelve a cargar.',
  atlasLoading: 'Cargando atlas mundial…',
  hoverNational: '{name} · {count} marco(s) nacional(es)',
  hoverGlobalSuffix: ' · se aplican estándares globales',
  legendDensity: 'Densidad normativa:',
  densityNone: 'ninguna',
  densityLight: 'ligera',
  densityModerate: 'moderada',
  densityDense: 'densa',
  region: 'Región',
  nationalLaw: 'Legislación de IA nacional / de bloque ({count})',
  globalStandards: 'Estándares globales que también aplican ({count})',
  closePanel: 'Cerrar panel de región',
  emptyState:
    'Aún no hay legislación vinculante específica de IA catalogada aquí. Los estándares globales a continuación siguen aplicándose, y CSOAI está supervisando esta jurisdicción — {flagLink}.',
  emptyStateFlagLink: 'señalar una novedad',
  binding: 'vinculante',
  voluntary: 'voluntario',
  effective: 'En vigor: {date}',
  csoaiCrosswalk: 'Correspondencia CSOAI',
};

export default es;
