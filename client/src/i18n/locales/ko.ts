// Korean (ko). UI chrome only — framework legal content stays as-authored in source data.
import type { Dict } from './en';

const ko: Dict = {
  subtitle:
    '전 세계 AI 규제를 지도로. 아무 국가나 클릭하면 해당 지역에서 구속력을 갖는 프레임워크, 어디서나 적용되는 글로벌 표준, 그리고 CSOAI 크로스워크를 확인할 수 있습니다. 사이드바에서 도구를 겹쳐 보세요. 하나의 프로필로 지구 전체를.',
  searchPlaceholder: '국가 찾기…',
  searchAria: '국가 검색',
  frameworkOverlay: '프레임워크 오버레이',
  csoaiTools: 'CSOAI 도구',
  language: '언어',
  statusBar:
    'AI 전용 법률이 있는 관할권 {jurisdictions}곳 · 프레임워크 {frameworks}개 · 활성 국가 {countries}개 · 드래그하여 이동, 스크롤하여 확대/축소',
  statusLoading: '—',
  zoomIn: '확대',
  zoomOut: '축소',
  resetView: '보기 초기화',
  atlasError: '지도 아틀라스를 불러오지 못했습니다({error}). 연결을 확인하고 다시 불러오세요.',
  atlasLoading: '세계 지도를 불러오는 중…',
  hoverNational: '{name} · 국가 프레임워크 {count}개',
  hoverGlobalSuffix: ' · 글로벌 표준 적용',
  legendDensity: '규제 밀도:',
  densityNone: '없음',
  densityLight: '낮음',
  densityModerate: '보통',
  densityDense: '높음',
  region: '지역',
  nationalLaw: '국가/연합 AI 법률 ({count})',
  globalStandards: '함께 적용되는 글로벌 표준 ({count})',
  closePanel: '지역 패널 닫기',
  emptyState:
    '아직 이곳에 등재된 AI 전용 구속력 있는 법률이 없습니다. 아래 글로벌 표준은 여전히 적용되며, CSOAI가 이 관할권을 모니터링하고 있습니다 — {flagLink}.',
  emptyStateFlagLink: '동향 제보하기',
  binding: '구속력 있음',
  voluntary: '자발적',
  effective: '시행: {date}',
  csoaiCrosswalk: 'CSOAI 크로스워크',
};

export default ko;
