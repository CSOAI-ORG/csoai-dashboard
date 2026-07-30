// Course and Module Translation Support
// This extends i18n to support dynamic course content translation

export interface CourseTranslation {
  id: string;
  title: string;
  description: string;
  language: string;
}

export interface ModuleTranslation {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  language: string;
}

export interface LessonTranslation {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  language: string;
}

// Cache for translated content
const translationCache = new Map<string, any>();

export function getCourseTranslation(courseId: string, language: string): CourseTranslation | null {
  const cacheKey = `course_${courseId}_${language}`;
  return translationCache.get(cacheKey) || null;
}

export function setCourseTranslation(courseId: string, language: string, translation: CourseTranslation): void {
  const cacheKey = `course_${courseId}_${language}`;
  translationCache.set(cacheKey, translation);
}

export function getModuleTranslation(moduleId: string, language: string): ModuleTranslation | null {
  const cacheKey = `module_${moduleId}_${language}`;
  return translationCache.get(cacheKey) || null;
}

export function setModuleTranslation(moduleId: string, language: string, translation: ModuleTranslation): void {
  const cacheKey = `module_${moduleId}_${language}`;
  translationCache.set(cacheKey, translation);
}

export function getLessonTranslation(lessonId: string, language: string): LessonTranslation | null {
  const cacheKey = `lesson_${lessonId}_${language}`;
  return translationCache.get(cacheKey) || null;
}

export function setLessonTranslation(lessonId: string, language: string, translation: LessonTranslation): void {
  const cacheKey = `lesson_${lessonId}_${language}`;
  translationCache.set(cacheKey, translation);
}

// Batch fetch translations from API
export async function fetchCourseTranslations(courseId: string, language: string): Promise<CourseTranslation | null> {
  try {
    const response = await fetch(`/api/courses/${courseId}/translations/${language}`);
    if (!response.ok) return null;
    
    const translation = await response.json();
    setCourseTranslation(courseId, language, translation);
    return translation;
  } catch (error) {
    console.error('Failed to fetch course translation:', error);
    return null;
  }
}

export async function fetchModuleTranslations(moduleId: string, language: string): Promise<ModuleTranslation | null> {
  try {
    const response = await fetch(`/api/modules/${moduleId}/translations/${language}`);
    if (!response.ok) return null;
    
    const translation = await response.json();
    setModuleTranslation(moduleId, language, translation);
    return translation;
  } catch (error) {
    console.error('Failed to fetch module translation:', error);
    return null;
  }
}

export async function fetchLessonTranslations(lessonId: string, language: string): Promise<LessonTranslation | null> {
  try {
    const response = await fetch(`/api/lessons/${lessonId}/translations/${language}`);
    if (!response.ok) return null;
    
    const translation = await response.json();
    setLessonTranslation(lessonId, language, translation);
    return translation;
  } catch (error) {
    console.error('Failed to fetch lesson translation:', error);
    return null;
  }
}

// Clear cache when language changes
export function clearTranslationCache(): void {
  translationCache.clear();
}
