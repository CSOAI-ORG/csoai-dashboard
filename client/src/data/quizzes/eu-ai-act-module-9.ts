import type { QuizQuestion } from '@/types/quiz';

export const euAiActModule9Quiz: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary objective of a Conformity Assessment under the EU AI Act for high-risk AI systems?',
    options: [
      'To verify that the AI system meets all technical specifications',
      'To demonstrate that the AI system complies with all applicable requirements before placing it on the market',
      'To ensure the AI system generates maximum profit for the organization',
      'To test the AI system performance against competitors',
    ],
    correctAnswer: 1,
    explanation: 'Conformity Assessment is the process to verify and certify that a high-risk AI system meets all applicable EU AI Act requirements before it is placed on the market or put into service. This is a mandatory legal requirement.',
  },
  {
    id: 2,
    question: 'Which of the following is NOT a required element of a Risk Assessment for high-risk AI systems?',
    options: [
      'Identification of reasonably foreseeable misuse scenarios',
      'Assessment of potential harms to fundamental rights',
      'Evaluation of mitigation measures and their effectiveness',
      'Prediction of the exact number of users who will use the system',
    ],
    correctAnswer: 3,
    explanation: 'While Risk Assessments must identify foreseeable misuse, assess harms to fundamental rights, and evaluate mitigation measures, predicting the exact number of users is not a required element. The focus is on understanding risks, not predicting user adoption.',
  },
  {
    id: 3,
    question: 'What is the purpose of a Data Governance Plan in the context of EU AI Act compliance?',
    options: [
      'To maximize data collection from users',
      'To establish procedures for data quality, management, and lifecycle to ensure training data is representative and free from bias',
      'To ensure data is stored in the cheapest possible location',
      'To prevent any data from being shared with third parties',
    ],
    correctAnswer: 1,
    explanation: 'A Data Governance Plan establishes procedures for data quality management, ensuring training data is representative, properly documented, and free from bias. This is critical for high-risk AI systems to prevent discriminatory outcomes.',
  },
  {
    id: 4,
    question: 'Under the EU AI Act, what is the maximum acceptable error rate for high-risk AI systems used in critical infrastructure?',
    options: [
      'There is no specified maximum error rate; it depends on the specific use case',
      '0% error rate is required',
      '5% error rate is acceptable',
      '10% error rate is acceptable',
    ],
    correctAnswer: 0,
    explanation: 'The EU AI Act does not specify a universal maximum error rate. Instead, it requires organizations to conduct risk assessments and implement appropriate mitigation measures based on the specific context and potential harms of their AI system.',
  },
  {
    id: 5,
    question: 'What is the role of Human Oversight in mitigating risks for high-risk AI systems?',
    options: [
      'To eliminate the need for any other risk mitigation measures',
      'To ensure humans can understand, monitor, and override AI decisions when necessary to prevent harm',
      'To replace AI decision-making entirely',
      'To increase the speed of AI system deployment',
    ],
    correctAnswer: 1,
    explanation: 'Human Oversight is a critical mitigation measure that ensures humans can understand, monitor, and intervene in AI decision-making to prevent potential harms. This is especially important for high-risk applications affecting fundamental rights.',
  },
  {
    id: 6,
    question: 'What documentation must be maintained for a high-risk AI system throughout its lifecycle?',
    options: [
      'Only initial deployment documentation',
      'Only performance metrics',
      'Technical documentation, training data information, testing results, risk assessments, and post-market monitoring data',
      'Marketing materials only',
    ],
    correctAnswer: 2,
    explanation: 'Organizations must maintain comprehensive documentation throughout the AI system lifecycle, including technical specifications, training data details, testing and validation results, risk assessments, and post-market monitoring data to demonstrate compliance.',
  },
  {
    id: 7,
    question: 'What is the purpose of Post-Market Monitoring for high-risk AI systems?',
    options: [
      'To increase sales after the product launch',
      'To collect and analyze data on real-world performance, identify risks, and take corrective action if needed',
      'To prevent customers from using the system',
      'To avoid regulatory scrutiny',
    ],
    correctAnswer: 1,
    explanation: 'Post-Market Monitoring involves systematically collecting and analyzing data on how the AI system performs in real-world conditions, identifying any emerging risks or performance issues, and taking corrective action when necessary.',
  },
  {
    id: 8,
    question: 'Under the EU AI Act, what is the significance of a Quality Management System for high-risk AI providers?',
    options: [
      'It is optional and only recommended',
      'It is mandatory and must ensure compliance with all applicable requirements throughout the system lifecycle',
      'It only applies to non-EU providers',
      'It is only required for systems deployed in healthcare',
    ],
    correctAnswer: 1,
    explanation: 'A Quality Management System is mandatory for high-risk AI providers. It must establish procedures and processes to ensure compliance with all EU AI Act requirements throughout the AI system lifecycle, from development through post-market monitoring.',
  },
  {
    id: 9,
    question: 'What should be included in a Bias Mitigation Strategy for high-risk AI systems?',
    options: [
      'Only technical measures to detect bias',
      'Identification of potential bias sources, preventive measures during development, testing procedures, and ongoing monitoring for discriminatory outcomes',
      'Ignoring bias concerns to maintain system performance',
      'Bias mitigation is not required under the EU AI Act',
    ],
    correctAnswer: 1,
    explanation: 'A comprehensive Bias Mitigation Strategy must identify potential sources of bias, implement preventive measures during AI system development, conduct testing to detect bias, and establish ongoing monitoring to identify and address discriminatory outcomes.',
  },
  {
    id: 10,
    question: 'What is the relationship between Risk Assessment and Conformity Assessment in EU AI Act compliance?',
    options: [
      'They are the same process',
      'Risk Assessment identifies potential harms; Conformity Assessment verifies compliance with requirements based on risk assessment findings',
      'Only Risk Assessment is required',
      'Only Conformity Assessment is required',
    ],
    correctAnswer: 1,
    explanation: 'Risk Assessment is the foundational process that identifies potential harms and risks. Conformity Assessment then uses these findings to verify that the AI system meets all applicable EU AI Act requirements and that appropriate mitigation measures are in place.',
  },
];
