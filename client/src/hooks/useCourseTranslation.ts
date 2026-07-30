import { useEffect, useState } from 'react';
import { useLanguage } from './useLanguage';
import {
  getCourseTranslation,
  getModuleTranslation,
  getLessonTranslation,
  fetchCourseTranslations,
  fetchModuleTranslations,
  fetchLessonTranslations,
  clearTranslationCache,
  CourseTranslation,
  ModuleTranslation,
  LessonTranslation,
} from '@/lib/courseTranslations';

export function useCourseTranslation(courseId: string) {
  const { language } = useLanguage();
  const [translation, setTranslation] = useState<CourseTranslation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslation = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check cache first
        let cached = getCourseTranslation(courseId, language);
        if (cached) {
          setTranslation(cached);
          setLoading(false);
          return;
        }

        // Fetch from API
        const fetched = await fetchCourseTranslations(courseId, language);
        if (fetched) {
          setTranslation(fetched);
        } else {
          setError('Failed to load course translation');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadTranslation();
  }, [courseId, language]);

  return { translation, loading, error };
}

export function useModuleTranslation(moduleId: string) {
  const { language } = useLanguage();
  const [translation, setTranslation] = useState<ModuleTranslation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslation = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check cache first
        let cached = getModuleTranslation(moduleId, language);
        if (cached) {
          setTranslation(cached);
          setLoading(false);
          return;
        }

        // Fetch from API
        const fetched = await fetchModuleTranslations(moduleId, language);
        if (fetched) {
          setTranslation(fetched);
        } else {
          setError('Failed to load module translation');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadTranslation();
  }, [moduleId, language]);

  return { translation, loading, error };
}

export function useLessonTranslation(lessonId: string) {
  const { language } = useLanguage();
  const [translation, setTranslation] = useState<LessonTranslation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslation = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check cache first
        let cached = getLessonTranslation(lessonId, language);
        if (cached) {
          setTranslation(cached);
          setLoading(false);
          return;
        }

        // Fetch from API
        const fetched = await fetchLessonTranslations(lessonId, language);
        if (fetched) {
          setTranslation(fetched);
        } else {
          setError('Failed to load lesson translation');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadTranslation();
  }, [lessonId, language]);

  return { translation, loading, error };
}

// Hook to clear cache when language changes
export function useClearTranslationCacheOnLanguageChange() {
  const { language } = useLanguage();

  useEffect(() => {
    clearTranslationCache();
  }, [language]);
}
