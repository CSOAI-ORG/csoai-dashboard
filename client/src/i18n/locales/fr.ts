// French (fr). UI chrome only — framework legal content stays as-authored in source data.
import type { Dict } from './en';

const fr: Dict = {
  subtitle:
    "Les réglementations de l'IA dans le monde, cartographiées. Cliquez sur n'importe quel pays pour voir les cadres qui s'y appliquent, les normes mondiales valables partout et les correspondances CSOAI — puis superposez vos outils depuis la barre latérale. Un seul profil, la planète entière.",
  searchPlaceholder: 'Rechercher un pays…',
  searchAria: 'Rechercher un pays',
  frameworkOverlay: 'Calque des cadres',
  csoaiTools: 'Outils CSOAI',
  language: 'Langue',
  statusBar:
    "{jurisdictions} juridictions dotées d'une législation propre à l'IA · {frameworks} cadres · {countries} pays actifs · glissez pour déplacer, faites défiler pour zoomer",
  statusLoading: '—',
  zoomIn: 'Zoom avant',
  zoomOut: 'Zoom arrière',
  resetView: 'Réinitialiser la vue',
  atlasError: "Impossible de charger l'atlas de la carte ({error}). Vérifiez la connexion et rechargez.",
  atlasLoading: "Chargement de l'atlas mondial…",
  hoverNational: '{name} · {count} cadre(s) national(aux)',
  hoverGlobalSuffix: ' · normes mondiales applicables',
  legendDensity: 'Densité réglementaire :',
  densityNone: 'aucune',
  densityLight: 'faible',
  densityModerate: 'modérée',
  densityDense: 'dense',
  region: 'Région',
  nationalLaw: 'Législation IA nationale / de bloc ({count})',
  globalStandards: "Normes mondiales également applicables ({count})",
  closePanel: 'Fermer le panneau de région',
  emptyState:
    "Aucune législation contraignante propre à l'IA répertoriée ici pour l'instant. Les normes mondiales ci-dessous s'appliquent toujours, et CSOAI surveille cette juridiction — {flagLink}.",
  emptyStateFlagLink: 'signaler une évolution',
  binding: 'contraignant',
  voluntary: 'volontaire',
  effective: "En vigueur : {date}",
  csoaiCrosswalk: 'Correspondance CSOAI',
};

export default fr;
