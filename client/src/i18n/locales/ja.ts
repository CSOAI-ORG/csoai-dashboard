// Japanese (ja). UI chrome only — framework legal content stays as-authored in source data.
import type { Dict } from './en';

const ja: Dict = {
  subtitle:
    '世界のAI規制を地図に。任意の国をクリックすると、その地域で拘束力を持つ枠組み、どこでも適用される世界標準、そしてCSOAIクロスウォークが表示されます。さらにサイドバーからご自身のツールを重ねられます。ひとつのプロファイルで、地球全体を。',
  searchPlaceholder: '国を検索…',
  searchAria: '国を検索',
  frameworkOverlay: '枠組みオーバーレイ',
  csoaiTools: 'CSOAI ツール',
  language: '言語',
  statusBar:
    'AI固有の法律を持つ管轄区域 {jurisdictions} · 枠組み {frameworks} · 稼働中の国 {countries} · ドラッグで移動、スクロールでズーム',
  statusLoading: '—',
  zoomIn: '拡大',
  zoomOut: '縮小',
  resetView: '表示をリセット',
  atlasError: '地図アトラスを読み込めませんでした（{error}）。接続を確認して再読み込みしてください。',
  atlasLoading: '世界地図を読み込み中…',
  hoverNational: '{name} · 国内の枠組み {count} 件',
  hoverGlobalSuffix: ' · 世界標準が適用されます',
  legendDensity: '規制密度：',
  densityNone: 'なし',
  densityLight: '低',
  densityModerate: '中',
  densityDense: '高',
  region: '地域',
  nationalLaw: '国内／圏内のAI法（{count}）',
  globalStandards: '同様に適用される世界標準（{count}）',
  closePanel: '地域パネルを閉じる',
  emptyState:
    'ここにはまだAI固有の拘束力ある法律が登録されていません。以下の世界標準は引き続き適用され、CSOAIはこの管轄区域を監視しています — {flagLink}。',
  emptyStateFlagLink: '動向を報告する',
  binding: '拘束力あり',
  voluntary: '任意',
  effective: '施行：{date}',
  csoaiCrosswalk: 'CSOAI クロスウォーク',
};

export default ja;
