// Russian (ru). UI chrome only — framework legal content stays as-authored in source data.
import type { Dict } from './en';

const ru: Dict = {
  subtitle:
    'Регулирование ИИ по всему миру — на карте. Нажмите на любую страну, чтобы увидеть обязательные там нормативные базы, глобальные стандарты, применимые повсюду, и кросс-схемы CSOAI, а затем наложите свои инструменты из боковой панели. Один профиль — вся планета.',
  searchPlaceholder: 'Найти страну…',
  searchAria: 'Поиск страны',
  frameworkOverlay: 'Слой нормативных баз',
  csoaiTools: 'Инструменты CSOAI',
  language: 'Язык',
  statusBar:
    '{jurisdictions} юрисдикций с законами об ИИ · {frameworks} нормативных баз · {countries} стран активно · перетаскивайте для перемещения, прокручивайте для масштабирования',
  statusLoading: '—',
  zoomIn: 'Увеличить',
  zoomOut: 'Уменьшить',
  resetView: 'Сбросить вид',
  atlasError: 'Не удалось загрузить атлас карты ({error}). Проверьте подключение и перезагрузите.',
  atlasLoading: 'Загрузка атласа мира…',
  hoverNational: '{name} · {count} национальных нормативных баз',
  hoverGlobalSuffix: ' · применяются глобальные стандарты',
  legendDensity: 'Плотность регулирования:',
  densityNone: 'нет',
  densityLight: 'низкая',
  densityModerate: 'средняя',
  densityDense: 'высокая',
  region: 'Регион',
  nationalLaw: 'Национальное / блоковое право об ИИ ({count})',
  globalStandards: 'Глобальные стандарты, также применимые здесь ({count})',
  closePanel: 'Закрыть панель региона',
  emptyState:
    'Здесь пока не внесено обязательного законодательства об ИИ. Приведённые ниже глобальные стандарты по-прежнему действуют, и CSOAI отслеживает эту юрисдикцию — {flagLink}.',
  emptyStateFlagLink: 'сообщить об изменении',
  binding: 'обязательный',
  voluntary: 'добровольный',
  effective: 'Вступает в силу: {date}',
  csoaiCrosswalk: 'Кросс-схема CSOAI',
};

export default ru;
