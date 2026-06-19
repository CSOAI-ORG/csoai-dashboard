// Simplified Chinese (zh). UI chrome only — framework legal content stays as-authored in source data.
import type { Dict } from './en';

const zh: Dict = {
  subtitle:
    '全球人工智能监管，尽在一图。点击任意国家，即可查看在当地具有约束力的框架、适用于各地的全球标准以及 CSOAI 对照映射，然后从侧边栏叠加您的工具。一份档案，覆盖全球。',
  searchPlaceholder: '查找国家…',
  searchAria: '搜索国家',
  frameworkOverlay: '框架叠加层',
  csoaiTools: 'CSOAI 工具',
  language: '语言',
  statusBar:
    '{jurisdictions} 个设有人工智能专项法律的司法管辖区 · {frameworks} 个框架 · {countries} 个国家已上线 · 拖动平移，滚动缩放',
  statusLoading: '—',
  zoomIn: '放大',
  zoomOut: '缩小',
  resetView: '重置视图',
  atlasError: '无法加载地图图集（{error}）。请检查网络连接并重新加载。',
  atlasLoading: '正在加载世界地图…',
  hoverNational: '{name} · {count} 个国家级框架',
  hoverGlobalSuffix: ' · 适用全球标准',
  legendDensity: '监管密度：',
  densityNone: '无',
  densityLight: '轻度',
  densityModerate: '中度',
  densityDense: '密集',
  region: '地区',
  nationalLaw: '国家／区域人工智能法律（{count}）',
  globalStandards: '同样适用的全球标准（{count}）',
  closePanel: '关闭地区面板',
  emptyState:
    '此处尚未收录人工智能专项的强制性法律。下方的全球标准仍然适用，CSOAI 正在监测该司法管辖区——{flagLink}。',
  emptyStateFlagLink: '标记一项进展',
  binding: '强制性',
  voluntary: '自愿性',
  effective: '生效日期：{date}',
  csoaiCrosswalk: 'CSOAI 对照映射',
};

export default zh;
