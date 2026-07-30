import type { QuizQuestion } from '@/types/quiz';

export const ceasaFundamentalsModule4Quiz: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary purpose of data governance in high-risk AI systems?',
    options: [
      'To maximize data collection',
      'To ensure training data is representative, high-quality, and free from bias',
      'To reduce data storage costs',
      'To increase system speed',
    ],
    correctAnswer: 1,
    explanation: 'Data governance ensures that training data is representative of the population, high-quality, properly documented, and free from bias that could lead to discriminatory outcomes.',
  },
  {
    id: 2,
    question: 'What should be included in a Data Governance Plan?',
    options: [
      'Only data source',
      'Data collection methods, quality standards, bias detection, documentation, and lifecycle management',
      'Only data volume',
      'Marketing information',
    ],
    correctAnswer: 1,
    explanation: 'A Data Governance Plan must document data collection methods, quality standards, bias detection procedures, data documentation requirements, and data lifecycle management.',
  },
  {
    id: 3,
    question: 'What is training data representativeness?',
    options: [
      'All data is the same',
      'Training data reflects the diversity of the population the system will serve',
      'Data from one region only',
      'Data from the largest group only',
    ],
    correctAnswer: 1,
    explanation: 'Representativeness means training data reflects the demographic and characteristic diversity of the population the AI system will serve, preventing biased outcomes.',
  },
  {
    id: 4,
    question: 'How should organizations detect bias in training data?',
    options: [
      'Bias cannot be detected',
      'Through statistical analysis, fairness metrics, and testing across demographic groups',
      'Only through user complaints',
      'Bias detection is optional',
    ],
    correctAnswer: 1,
    explanation: 'Organizations should use statistical analysis, fairness metrics, and testing across demographic groups to identify and quantify bias in training data.',
  },
  {
    id: 5,
    question: 'What is data quality in the context of AI systems?',
    options: [
      'Large data volume',
      'Accurate, complete, consistent, and relevant data that meets defined standards',
      'Data from any source',
      'Data that is easy to collect',
    ],
    correctAnswer: 1,
    explanation: 'Data quality means the data is accurate, complete, consistent, and relevant to the AI systems purpose, meeting defined quality standards.',
  },
  {
    id: 6,
    question: 'Should training data be documented?',
    options: [
      'No documentation needed',
      'Yes, with details on source, collection method, characteristics, and known limitations',
      'Only for large datasets',
      'Documentation is optional',
    ],
    correctAnswer: 1,
    explanation: 'Training data must be thoroughly documented including source, collection methodology, key characteristics, known limitations, and potential biases.',
  },
  {
    id: 7,
    question: 'What is data minimization in the context of AI governance?',
    options: [
      'Using as little data as possible',
      'Collecting only the data necessary for the AI system purpose',
      'Not collecting any data',
      'Collecting all available data',
    ],
    correctAnswer: 1,
    explanation: 'Data minimization means collecting only the data necessary for the AI system purpose, reducing privacy risks and potential for bias.',
  },
  {
    id: 8,
    question: 'How should organizations handle sensitive data in AI systems?',
    options: [
      'Treat it like any other data',
      'Implement enhanced protections, restricted access, and additional safeguards',
      'Avoid using sensitive data',
      'Sensitive data requires no special handling',
    ],
    correctAnswer: 1,
    explanation: 'Sensitive data (biometric, health, racial/ethnic origin) requires enhanced protections including restricted access, encryption, and additional safeguards.',
  },
  {
    id: 9,
    question: 'What is the role of data stewardship in AI governance?',
    options: [
      'No role',
      'Assigning responsibility for data quality, documentation, and lifecycle management',
      'Only for IT departments',
      'Data stewardship is optional',
    ],
    correctAnswer: 1,
    explanation: 'Data stewardship involves assigning clear responsibility for ensuring data quality, maintaining documentation, and managing data throughout its lifecycle.',
  },
  {
    id: 10,
    question: 'Should data governance plans be updated?',
    options: [
      'No, they are permanent',
      'Yes, regularly and when significant changes occur',
      'Only when problems arise',
      'Updates are optional',
    ],
    correctAnswer: 1,
    explanation: 'Data governance plans should be reviewed and updated regularly and whenever significant changes occur in data, systems, or organizational context.',
  },
];
