import type { QuizQuestion } from '@/types/quiz';

export const euAiActModule12Quiz: QuizQuestion[] = [
  {
    id: 1,
    question: 'How does the EU AI Act interact with GDPR regarding data used in AI systems?',
    options: [
      'The EU AI Act replaces GDPR',
      'Both regulations apply independently; organizations must comply with both GDPR and AI Act requirements for data handling',
      'GDPR does not apply to AI systems',
      'The AI Act supersedes GDPR',
    ],
    correctAnswer: 1,
    explanation: 'The EU AI Act and GDPR are complementary regulations. Organizations must comply with both GDPR requirements for data protection and AI Act requirements for AI system governance when using personal data in AI systems.',
  },
  {
    id: 2,
    question: 'What are the restrictions on transferring training data across borders under the EU AI Act?',
    options: [
      'No restrictions exist',
      'Data can be freely transferred anywhere',
      'Transfers must comply with GDPR restrictions and data must be protected against unauthorized access or misuse',
      'Data transfers are prohibited',
    ],
    correctAnswer: 2,
    explanation: 'Cross-border data transfers must comply with GDPR restrictions and mechanisms (like Standard Contractual Clauses). Additionally, data must be protected throughout transfer and storage to prevent unauthorized access or misuse.',
  },
  {
    id: 3,
    question: 'What is the significance of data residency requirements in EU AI Act compliance?',
    options: [
      'Data residency is not relevant to the AI Act',
      'All data must be stored in the EU',
      'Organizations should consider data residency requirements based on regulatory obligations and data protection needs',
      'Data residency is only for financial data',
    ],
    correctAnswer: 2,
    explanation: 'While the AI Act does not mandate EU data residency, organizations should consider residency requirements based on applicable regulations, data protection obligations, and the sensitivity of data used in AI systems.',
  },
  {
    id: 4,
    question: 'How should organizations handle data from multiple countries in a single AI system?',
    options: [
      'Mix data without any special considerations',
      'Document the origin of data, ensure compliance with each country\'s regulations, and implement appropriate safeguards for cross-border data flows',
      'Only use data from one country',
      'Data origin is not important',
    ],
    correctAnswer: 1,
    explanation: 'When using data from multiple countries, organizations must document data origins, ensure compliance with each jurisdiction\'s regulations, and implement appropriate technical and organizational measures to protect cross-border data flows.',
  },
  {
    id: 5,
    question: 'What is the role of Data Processing Agreements in AI system governance?',
    options: [
      'They are not necessary',
      'They establish terms and conditions for data handling, processor responsibilities, and data protection measures',
      'They only apply to financial data',
      'They are only required for non-EU organizations',
    ],
    correctAnswer: 1,
    explanation: 'Data Processing Agreements (or Data Processor Agreements under GDPR) establish clear terms for how data is handled, the responsibilities of data processors, and the technical and organizational measures protecting data in AI systems.',
  },
  {
    id: 6,
    question: 'How should organizations address data sovereignty concerns in AI systems?',
    options: [
      'Data sovereignty is not a concern',
      'Implement data governance policies that respect national regulations, maintain data control, and ensure compliance with local laws',
      'Store all data in the US',
      'Ignore local regulations',
    ],
    correctAnswer: 1,
    explanation: 'Organizations should implement comprehensive data governance policies that respect data sovereignty, maintain appropriate control over data, and ensure compliance with local and international regulations.',
  },
  {
    id: 7,
    question: 'What special considerations apply to sensitive data in cross-border AI systems?',
    options: [
      'Sensitive data can be transferred freely',
      'Enhanced protections, restricted transfers, explicit consent, and additional safeguards are required for sensitive data',
      'Sensitive data should not be used in AI systems',
      'Sensitive data has no special requirements',
    ],
    correctAnswer: 1,
    explanation: 'Sensitive data (such as biometric data, health data, or data revealing racial/ethnic origin) requires enhanced protections, restricted transfer mechanisms, explicit user consent, and additional technical safeguards.',
  },
  {
    id: 8,
    question: 'How does the EU AI Act address data localization requirements?',
    options: [
      'The AI Act mandates data localization in the EU',
      'The AI Act does not mandate localization but requires compliance with applicable data protection and residency regulations',
      'Data localization is not addressed',
      'All data must be stored outside the EU',
    ],
    correctAnswer: 1,
    explanation: 'The EU AI Act does not mandate data localization but requires organizations to comply with applicable data protection regulations and any localization requirements imposed by other laws or regulations.',
  },
  {
    id: 9,
    question: 'What documentation should be maintained for cross-border data flows in AI systems?',
    options: [
      'No documentation is necessary',
      'Data transfer agreements, legal basis for transfers, safeguards implemented, and compliance verification records',
      'Only marketing materials',
      'Documentation is only required for financial data',
    ],
    correctAnswer: 1,
    explanation: 'Organizations must maintain comprehensive documentation of cross-border data flows, including transfer agreements, legal basis for transfers, implemented safeguards, and records verifying compliance with applicable regulations.',
  },
  {
    id: 10,
    question: 'How should organizations prepare for potential future data localization requirements?',
    options: [
      'No preparation is needed',
      'Implement flexible data architecture, maintain data governance capabilities, and monitor regulatory developments',
      'Move all data immediately',
      'Ignore potential future requirements',
    ],
    correctAnswer: 1,
    explanation: 'Organizations should implement flexible data architecture that can adapt to potential localization requirements, maintain strong data governance capabilities, and actively monitor regulatory developments across jurisdictions.',
  },
];
