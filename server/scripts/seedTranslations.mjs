import { getDb } from '../db.js';
import { courseTranslations, moduleTranslations, lessonTranslations } from '../../drizzle/schema.js';

const languages = [
  'en-US', 'en-GB', 'fr', 'de', 'es', 'it', 'nl', 'pl', 'pt', 'sv', 'da', 'fi', 'zh-CN'
];

const courseData = {
  1: {
    'en-US': {
      title: 'AI Safety Fundamentals',
      description: 'Learn the basics of AI safety and governance',
      content: 'This course covers fundamental concepts of AI safety, risk assessment, and compliance frameworks.',
      learningObjectives: [
        'Understand AI safety principles',
        'Learn risk assessment methodologies',
        'Master compliance frameworks'
      ],
      duration: 120,
      difficulty: 'beginner'
    },
    'fr': {
      title: 'Principes Fondamentaux de la Sécurité de l\'IA',
      description: 'Apprenez les bases de la sécurité et de la gouvernance de l\'IA',
      content: 'Ce cours couvre les concepts fondamentaux de la sécurité de l\'IA, l\'évaluation des risques et les cadres de conformité.',
      learningObjectives: [
        'Comprendre les principes de sécurité de l\'IA',
        'Apprendre les méthodologies d\'évaluation des risques',
        'Maîtriser les cadres de conformité'
      ],
      duration: 120,
      difficulty: 'beginner'
    },
    'de': {
      title: 'Grundlagen der KI-Sicherheit',
      description: 'Lernen Sie die Grundlagen der KI-Sicherheit und Governance',
      content: 'Dieser Kurs behandelt grundlegende Konzepte der KI-Sicherheit, Risikobewertung und Compliance-Rahmen.',
      learningObjectives: [
        'KI-Sicherheitsprinzipien verstehen',
        'Risikobewertungsmethoden erlernen',
        'Compliance-Rahmen beherrschen'
      ],
      duration: 120,
      difficulty: 'beginner'
    },
    'es': {
      title: 'Fundamentos de Seguridad de IA',
      description: 'Aprenda los conceptos básicos de seguridad y gobernanza de IA',
      content: 'Este curso cubre conceptos fundamentales de seguridad de IA, evaluación de riesgos y marcos de cumplimiento.',
      learningObjectives: [
        'Comprender los principios de seguridad de IA',
        'Aprender metodologías de evaluación de riesgos',
        'Dominar marcos de cumplimiento'
      ],
      duration: 120,
      difficulty: 'beginner'
    },
  },
  2: {
    'en-US': {
      title: 'EU AI Act Compliance',
      description: 'Master the EU AI Act requirements and implementation',
      content: 'Comprehensive guide to EU AI Act compliance, risk classification, and regulatory requirements.',
      learningObjectives: [
        'Understand EU AI Act requirements',
        'Classify AI systems by risk level',
        'Implement compliance measures'
      ],
      duration: 180,
      difficulty: 'intermediate'
    },
    'fr': {
      title: 'Conformité à la Loi sur l\'IA de l\'UE',
      description: 'Maîtrisez les exigences et la mise en œuvre de la Loi sur l\'IA de l\'UE',
      content: 'Guide complet de la conformité à la Loi sur l\'IA de l\'UE, classification des risques et exigences réglementaires.',
      learningObjectives: [
        'Comprendre les exigences de la Loi sur l\'IA de l\'UE',
        'Classifier les systèmes d\'IA par niveau de risque',
        'Mettre en œuvre des mesures de conformité'
      ],
      duration: 180,
      difficulty: 'intermediate'
    },
    'de': {
      title: 'EU-KI-Gesetz Compliance',
      description: 'Beherrschen Sie die Anforderungen und Implementierung des EU-KI-Gesetzes',
      content: 'Umfassender Leitfaden zur Einhaltung des EU-KI-Gesetzes, Risikoeinstufung und behördliche Anforderungen.',
      learningObjectives: [
        'Anforderungen des EU-KI-Gesetzes verstehen',
        'KI-Systeme nach Risikostufe klassifizieren',
        'Compliance-Maßnahmen implementieren'
      ],
      duration: 180,
      difficulty: 'intermediate'
    },
  }
};

const moduleData = {
  1: {
    'en-US': {
      title: 'Risk Assessment Framework',
      description: 'Learn how to assess AI system risks',
      content: 'Detailed methodology for assessing risks in AI systems using industry-standard frameworks.',
      learningObjectives: [
        'Identify potential risks',
        'Assess risk severity',
        'Develop mitigation strategies'
      ],
      keyTakeaways: [
        'Risk assessment is critical for AI governance',
        'Use standardized frameworks for consistency',
        'Document all assessments'
      ],
      duration: 60
    },
    'fr': {
      title: 'Cadre d\'Évaluation des Risques',
      description: 'Apprenez à évaluer les risques des systèmes d\'IA',
      content: 'Méthodologie détaillée pour évaluer les risques dans les systèmes d\'IA en utilisant des cadres standards du secteur.',
      learningObjectives: [
        'Identifier les risques potentiels',
        'Évaluer la gravité des risques',
        'Développer des stratégies d\'atténuation'
      ],
      keyTakeaways: [
        'L\'évaluation des risques est essentielle pour la gouvernance de l\'IA',
        'Utiliser des cadres standardisés pour la cohérence',
        'Documenter toutes les évaluations'
      ],
      duration: 60
    },
  }
};

const lessonData = {
  1: {
    'en-US': {
      title: 'Introduction to AI Safety',
      description: 'Overview of AI safety concepts',
      content: 'This lesson introduces the fundamental concepts of AI safety, including transparency, fairness, and accountability.',
      videoUrl: 'https://example.com/videos/ai-safety-intro.mp4',
      videoCaptions: 'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nWelcome to AI Safety Fundamentals\n\n00:00:05.000 --> 00:00:10.000\nIn this lesson, we will explore key concepts',
      resources: [
        {
          title: 'AI Safety Whitepaper',
          url: 'https://example.com/papers/ai-safety.pdf',
          type: 'pdf'
        },
        {
          title: 'EU AI Act Text',
          url: 'https://example.com/docs/eu-ai-act.html',
          type: 'html'
        }
      ]
    },
    'fr': {
      title: 'Introduction à la Sécurité de l\'IA',
      description: 'Aperçu des concepts de sécurité de l\'IA',
      content: 'Cette leçon introduit les concepts fondamentaux de la sécurité de l\'IA, notamment la transparence, l\'équité et la responsabilité.',
      videoUrl: 'https://example.com/videos/ai-safety-intro-fr.mp4',
      videoCaptions: 'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nBienvenue aux Principes Fondamentaux de la Sécurité de l\'IA\n\n00:00:05.000 --> 00:00:10.000\nDans cette leçon, nous explorerons les concepts clés',
      resources: [
        {
          title: 'Livre Blanc sur la Sécurité de l\'IA',
          url: 'https://example.com/papers/ai-safety-fr.pdf',
          type: 'pdf'
        }
      ]
    },
    'de': {
      title: 'Einführung in die KI-Sicherheit',
      description: 'Übersicht über KI-Sicherheitskonzepte',
      content: 'Diese Lektion führt die grundlegenden Konzepte der KI-Sicherheit ein, einschließlich Transparenz, Fairness und Rechenschaftspflicht.',
      videoUrl: 'https://example.com/videos/ai-safety-intro-de.mp4',
      videoCaptions: 'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nWillkommen zu KI-Sicherheitsgrundsätzen\n\n00:00:05.000 --> 00:00:10.000\nIn dieser Lektion werden wir Schlüsselkonzepte erkunden',
      resources: []
    },
  }
};

async function seedTranslations() {
  const db = await getDb();
  if (!db) {
    console.error('Failed to connect to database');
    process.exit(1);
  }

  try {
    console.log('Seeding course translations...');
    for (const [courseId, translations] of Object.entries(courseData)) {
      for (const [language, data] of Object.entries(translations)) {
        await db.insert(courseTranslations).values({
          courseId: parseInt(courseId),
          language,
          ...data,
          isPublished: true,
        }).onDuplicateKeyUpdate({
          set: data
        });
        console.log(`✓ Course ${courseId} - ${language}`);
      }
    }

    console.log('\nSeeding module translations...');
    for (const [moduleId, translations] of Object.entries(moduleData)) {
      for (const [language, data] of Object.entries(translations)) {
        await db.insert(moduleTranslations).values({
          moduleId: parseInt(moduleId),
          language,
          ...data,
          isPublished: true,
        }).onDuplicateKeyUpdate({
          set: data
        });
        console.log(`✓ Module ${moduleId} - ${language}`);
      }
    }

    console.log('\nSeeding lesson translations...');
    for (const [lessonId, translations] of Object.entries(lessonData)) {
      for (const [language, data] of Object.entries(translations)) {
        await db.insert(lessonTranslations).values({
          lessonId: parseInt(lessonId),
          language,
          ...data,
          isPublished: true,
        }).onDuplicateKeyUpdate({
          set: data
        });
        console.log(`✓ Lesson ${lessonId} - ${language}`);
      }
    }

    console.log('\n✅ Translations seeded successfully!');
  } catch (error) {
    console.error('Error seeding translations:', error);
    process.exit(1);
  }
}

seedTranslations();
