import type { QuizQuestion } from '@/types/quiz';

export const euAiActModule10Quiz: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary purpose of maintaining Technical Documentation for high-risk AI systems under the EU AI Act?',
    options: [
      'To satisfy internal company requirements only',
      'To demonstrate compliance with EU AI Act requirements and enable regulatory authorities to verify conformity',
      'To keep competitors from understanding the system',
      'To reduce the cost of AI system development',
    ],
    correctAnswer: 1,
    explanation: 'Technical Documentation serves as evidence that the AI system complies with all applicable EU AI Act requirements. It must be available to regulatory authorities for inspection and verification of conformity.',
  },
  {
    id: 2,
    question: 'Which of the following should be included in the Technical Documentation of a high-risk AI system?',
    options: [
      'Only the source code',
      'General description, development process, training data, testing procedures, risk assessment, and mitigation measures',
      'Only the system performance metrics',
      'Marketing materials and sales information',
    ],
    correctAnswer: 1,
    explanation: 'Technical Documentation must comprehensively describe the AI system, including its general description, development process, training data characteristics, testing and validation procedures, risk assessments, and implemented mitigation measures.',
  },
  {
    id: 3,
    question: 'What is an Audit Trail in the context of AI system compliance?',
    options: [
      'A marketing document describing the system',
      'A chronological record of all activities, changes, and decisions related to the AI system for accountability and verification',
      'A list of employees who worked on the project',
      'A financial report of system development costs',
    ],
    correctAnswer: 1,
    explanation: 'An Audit Trail is a detailed chronological record documenting all activities, modifications, and decisions related to the AI system. This enables regulators and auditors to verify compliance and investigate any issues that may arise.',
  },
  {
    id: 4,
    question: 'How long must organizations retain documentation for high-risk AI systems?',
    options: [
      '1 year after deployment',
      '5 years after deployment',
      'Throughout the entire lifecycle of the AI system and for a period after it is discontinued',
      'Only during development',
    ],
    correctAnswer: 2,
    explanation: 'Organizations must maintain documentation throughout the entire lifecycle of the AI system and continue to retain it for a specified period even after the system is discontinued, to ensure ongoing accountability and enable regulatory oversight.',
  },
  {
    id: 5,
    question: 'What is the significance of Version Control in AI system documentation?',
    options: [
      'It is not important for compliance',
      'It helps track changes to the system, training data, and documentation to demonstrate continuous improvement and identify when issues were introduced',
      'It only applies to software development',
      'It is only required for non-EU systems',
    ],
    correctAnswer: 1,
    explanation: 'Version Control is crucial for maintaining an audit trail of all changes to the AI system, training data, and documentation. This enables organizations to track when modifications were made, who made them, and why, supporting compliance verification.',
  },
  {
    id: 6,
    question: 'What must be documented regarding the training data used for high-risk AI systems?',
    options: [
      'Only the data source',
      'Data source, volume, characteristics, collection methods, preprocessing steps, and any known limitations or biases',
      'Only the data volume',
      'Training data documentation is not required',
    ],
    correctAnswer: 1,
    explanation: 'Comprehensive training data documentation must include the data source, volume, key characteristics, collection methodology, preprocessing and labeling procedures, and any known limitations or potential biases that could affect system performance.',
  },
  {
    id: 7,
    question: 'What is the purpose of maintaining records of testing and validation procedures?',
    options: [
      'To impress customers with technical details',
      'To demonstrate that the AI system has been thoroughly tested and validated to meet performance and safety requirements',
      'To keep the system proprietary',
      'Testing records are not required',
    ],
    correctAnswer: 1,
    explanation: 'Testing and validation records demonstrate that the AI system has been rigorously evaluated against defined requirements and performance standards. These records are essential for proving compliance with EU AI Act requirements.',
  },
  {
    id: 8,
    question: 'Under the EU AI Act, who is responsible for maintaining compliance documentation?',
    options: [
      'Only the regulatory authorities',
      'Only the end users',
      'The provider of the high-risk AI system',
      'Only third-party auditors',
    ],
    correctAnswer: 2,
    explanation: 'The provider of the high-risk AI system bears the responsibility for creating, maintaining, and making available all required compliance documentation to regulatory authorities upon request.',
  },
  {
    id: 9,
    question: 'What should be documented regarding incidents and adverse events related to high-risk AI systems?',
    options: [
      'Incidents do not need to be documented',
      'Only major incidents affecting more than 1000 users',
      'All incidents, their causes, impacts, and corrective actions taken to prevent recurrence',
      'Only incidents that result in legal liability',
    ],
    correctAnswer: 2,
    explanation: 'Organizations must document all incidents and adverse events, including their causes, impacts on users and fundamental rights, and corrective actions implemented. This supports continuous improvement and regulatory oversight.',
  },
  {
    id: 10,
    question: 'How should documentation be organized to facilitate regulatory inspection?',
    options: [
      'Documentation can be scattered across multiple locations',
      'In a clear, organized manner with cross-references, making it easily accessible to regulatory authorities for inspection and verification',
      'Documentation does not need to be organized',
      'Only in formats that are difficult for regulators to access',
    ],
    correctAnswer: 1,
    explanation: 'Documentation must be well-organized, clearly structured, and easily accessible to regulatory authorities. This facilitates efficient compliance verification and demonstrates good faith in meeting transparency requirements.',
  },
];
