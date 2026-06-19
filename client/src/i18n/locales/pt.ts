// Portuguese (pt). UI chrome only — framework legal content stays as-authored in source data.
import type { Dict } from './en';

const pt: Dict = {
  subtitle:
    'As regulamentações de IA do mundo, mapeadas. Clique em qualquer país para ver os marcos que vinculam ali, os padrões globais que se aplicam em todo lugar e as correspondências da CSOAI — depois sobreponha suas ferramentas pela barra lateral. Um único perfil, o planeta inteiro.',
  searchPlaceholder: 'Encontrar um país…',
  searchAria: 'Pesquisar um país',
  frameworkOverlay: 'Camada de marcos',
  csoaiTools: 'Ferramentas CSOAI',
  language: 'Idioma',
  statusBar:
    '{jurisdictions} jurisdições com legislação específica de IA · {frameworks} marcos · {countries} países ativos · arraste para mover, role para ampliar',
  statusLoading: '—',
  zoomIn: 'Ampliar',
  zoomOut: 'Reduzir',
  resetView: 'Redefinir visualização',
  atlasError: 'Não foi possível carregar o atlas do mapa ({error}). Verifique a conexão e recarregue.',
  atlasLoading: 'Carregando atlas mundial…',
  hoverNational: '{name} · {count} marco(s) nacional(is)',
  hoverGlobalSuffix: ' · padrões globais se aplicam',
  legendDensity: 'Densidade regulatória:',
  densityNone: 'nenhuma',
  densityLight: 'leve',
  densityModerate: 'moderada',
  densityDense: 'densa',
  region: 'Região',
  nationalLaw: 'Legislação de IA nacional / de bloco ({count})',
  globalStandards: 'Padrões globais que também se aplicam ({count})',
  closePanel: 'Fechar painel da região',
  emptyState:
    'Ainda não há legislação vinculante específica de IA catalogada aqui. Os padrões globais abaixo continuam se aplicando, e a CSOAI está monitorando esta jurisdição — {flagLink}.',
  emptyStateFlagLink: 'sinalizar uma novidade',
  binding: 'vinculante',
  voluntary: 'voluntário',
  effective: 'Em vigor: {date}',
  csoaiCrosswalk: 'Correspondência CSOAI',
};

export default pt;
