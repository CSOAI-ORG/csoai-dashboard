import type { QuizQuestion } from '@/types/quiz';

export const ceasaFundamentalsModule1Quiz: QuizQuestion[] = [
  {
    id: 1,
    question: 'When did the EU AI Act enter into force?',
    options: [
      'January 1, 2024',
      'August 1, 2024',
      'December 1, 2024',
      'February 2, 2025',
    ],
    correctAnswer: 1,
    explanation: 'The EU AI Act was published in the Official Journal on July 12, 2024, and entered into force 20 days later on August 1, 2024. This marks the beginning of its phased implementation.',
  },
  {
    id: 2,
    question: 'What is the risk-based approach of the EU AI Act?',
    options: [
      'All AI systems are treated equally',
      'AI systems are categorized into four risk tiers: Prohibited, High-Risk, Limited-Risk, and Minimal-Risk',
      'Only high-risk systems need compliance',
      'Risk assessment is optional',
    ],
    correctAnswer: 1,
    explanation: 'The EU AI Act uses a four-tier risk-based framework: Unacceptable Risk (prohibited), High Risk (strict requirements), Limited Risk (transparency obligations), and Minimal Risk (no obligations).',
  },
  {
    id: 3,
    question: 'Which of the following is an example of a prohibited AI practice?',
    options: [
      'Using AI for customer service',
      'Real-time remote biometric identification in public spaces by law enforcement (with limited exceptions)',
      'Using AI for medical diagnosis support',
      'Automated data analysis',
    ],
    correctAnswer: 1,
    explanation: 'Real-time remote biometric identification in public spaces is prohibited under Article 5, except in specific law enforcement scenarios. This is one of 8 prohibited practices under the EU AI Act.',
  },
  {
    id: 4,
    question: 'What is the maximum fine for deploying a prohibited AI system?',
    options: [
      '€10 million or 2% of global annual turnover',
      '€20 million or 4% of global annual turnover',
      '€35 million or 7% of global annual turnover',
      '€50 million or 10% of global annual turnover',
    ],
    correctAnswer: 2,
    explanation: 'The highest penalty tier is €35 million or 7% of global annual turnover (whichever is higher) for deploying prohibited AI systems. This reflects the serious nature of these violations.',
  },
  {
    id: 5,
    question: 'Who is responsible for ensuring compliance with the EU AI Act?',
    options: [
      'Only software developers',
      'Only data scientists',
      'The provider of the AI system (the organization deploying it)',
      'Only regulators',
    ],
    correctAnswer: 2,
    explanation: 'The provider of the AI system bears primary responsibility for ensuring compliance with EU AI Act requirements. This includes conducting risk assessments, implementing safeguards, and maintaining documentation.',
  },
  {
    id: 6,
    question: 'What is the scope of the EU AI Act?',
    options: [
      'It only applies to EU companies',
      'It applies to any AI system placed on the EU market or affecting EU residents, regardless of where the provider is located',
      'It only applies to large tech companies',
      'It only applies to government AI systems',
    ],
    correctAnswer: 1,
    explanation: 'The EU AI Act has extraterritorial scope. It applies to any AI system placed on the EU market or affecting EU residents, regardless of whether the provider is based in the EU or elsewhere.',
  },
  {
    id: 7,
    question: 'What is a high-risk AI system under the EU AI Act?',
    options: [
      'Any AI system that uses machine learning',
      'AI systems that could cause significant harm to fundamental rights or safety, listed in Annex III',
      'Only AI systems used by governments',
      'All AI systems are considered high-risk',
    ],
    correctAnswer: 1,
    explanation: 'High-risk AI systems are those that could cause significant harm to fundamental rights or safety. These are specifically listed in Annex III and include systems for criminal justice, employment, education, and biometric identification.',
  },
  {
    id: 8,
    question: 'What is the phased implementation timeline of the EU AI Act?',
    options: [
      'All requirements apply immediately',
      'Prohibited practices (Feb 2, 2025), High-risk requirements (Aug 2, 2025), Other requirements (2026)',
      'Implementation is not phased',
      'Implementation begins in 2027',
    ],
    correctAnswer: 1,
    explanation: 'The EU AI Act has a phased implementation: Prohibited practices enforcement begins Feb 2, 2025; High-risk requirements follow Aug 2, 2025; Other transparency and limited-risk requirements follow in 2026.',
  },
  {
    id: 9,
    question: 'What does "Conformity Assessment" mean?',
    options: [
      'Marketing the AI system',
      'The process to verify that an AI system meets all applicable EU AI Act requirements',
      'Testing system performance',
      'User acceptance testing',
    ],
    correctAnswer: 1,
    explanation: 'Conformity Assessment is the formal process to verify and certify that a high-risk AI system complies with all applicable EU AI Act requirements before it is placed on the market or put into service.',
  },
  {
    id: 10,
    question: 'What is the role of Notified Bodies under the EU AI Act?',
    options: [
      'They have no role',
      'They conduct independent conformity assessments of high-risk AI systems and issue certificates',
      'They only provide marketing advice',
      'They develop AI systems',
    ],
    correctAnswer: 1,
    explanation: 'Notified Bodies are third-party organizations designated by Member States to conduct independent conformity assessments of high-risk AI systems and issue Conformity Assessment Certificates.',
  },
];
