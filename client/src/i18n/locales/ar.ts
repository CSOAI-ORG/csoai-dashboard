// Arabic (ar) — right-to-left. UI chrome only — framework legal content stays as-authored in source data.
import type { Dict } from './en';

const ar: Dict = {
  subtitle:
    'لوائح الذكاء الاصطناعي في العالم، مُجمَّعة على خريطة. انقر على أي دولة لرؤية الأطر المُلزِمة فيها، والمعايير العالمية المطبَّقة في كل مكان، وجداول التناظر من CSOAI — ثم اعرض أدواتك من الشريط الجانبي فوقها. ملف واحد، الكوكب بأكمله.',
  searchPlaceholder: 'ابحث عن دولة…',
  searchAria: 'البحث عن دولة',
  frameworkOverlay: 'طبقة الأطر',
  csoaiTools: 'أدوات CSOAI',
  language: 'اللغة',
  statusBar:
    '{jurisdictions} ولاية قضائية لديها قانون خاص بالذكاء الاصطناعي · {frameworks} إطارًا · {countries} دولة نشطة · اسحب للتحريك، مرِّر للتكبير',
  statusLoading: '—',
  zoomIn: 'تكبير',
  zoomOut: 'تصغير',
  resetView: 'إعادة ضبط العرض',
  atlasError: 'تعذّر تحميل أطلس الخريطة ({error}). تحقق من الاتصال وأعد التحميل.',
  atlasLoading: 'جارٍ تحميل أطلس العالم…',
  hoverNational: '{name} · {count} إطار وطني',
  hoverGlobalSuffix: ' · تنطبق المعايير العالمية',
  legendDensity: 'كثافة التنظيم:',
  densityNone: 'لا شيء',
  densityLight: 'خفيفة',
  densityModerate: 'متوسطة',
  densityDense: 'كثيفة',
  region: 'المنطقة',
  nationalLaw: 'قانون الذكاء الاصطناعي الوطني / للتكتل ({count})',
  globalStandards: 'المعايير العالمية المطبَّقة أيضًا ({count})',
  closePanel: 'إغلاق لوحة المنطقة',
  emptyState:
    'لا يوجد بعدُ قانون مُلزِم خاص بالذكاء الاصطناعي مُدرَج هنا. المعايير العالمية أدناه لا تزال سارية، وتراقب CSOAI هذه الولاية القضائية — {flagLink}.',
  emptyStateFlagLink: 'الإبلاغ عن تطوّر',
  binding: 'مُلزِم',
  voluntary: 'طوعي',
  effective: 'سارٍ اعتبارًا من: {date}',
  csoaiCrosswalk: 'جدول تناظر CSOAI',
};

export default ar;
