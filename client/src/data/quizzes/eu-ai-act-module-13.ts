import type { QuizQuestion } from '@/types/quiz';

export const euAiActModule13Quiz: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary objective of transparency requirements in the EU AI Act?',
    options: [
      'To make AI systems easier to use',
      'To enable users, affected individuals, and regulators to understand how AI systems make decisions',
      'To reduce AI system performance',
      'To eliminate AI systems entirely',
    ],
    correctAnswer: 1,
    explanation: 'Transparency requirements aim to ensure that users, affected individuals, and regulatory authorities can understand how AI systems function, what data they use, and how they reach decisions, enabling informed decision-making and accountability.',
  },
  {
    id: 2,
    question: 'What information must be disclosed to users of high-risk AI systems?',
    options: [
      'Only the system name',
      'The fact that an AI system is being used, its purpose, its limitations, and how to exercise their rights',
      'Only technical specifications',
      'No information needs to be disclosed',
    ],
    correctAnswer: 1,
    explanation: 'Users must be informed that they are interacting with an AI system, understand its intended purpose, be aware of its limitations, and know how to exercise their rights including the right to human review or appeal.',
  },
  {
    id: 3,
    question: 'What is Explainability in the context of AI systems?',
    options: [
      'Making the system faster',
      'The ability to understand and interpret why an AI system made a particular decision or prediction',
      'Reducing system complexity',
      'Marketing the system to customers',
    ],
    correctAnswer: 1,
    explanation: 'Explainability refers to the capacity to provide understandable explanations for AI system decisions. This is critical for high-risk systems to enable users and regulators to verify that decisions are fair, accurate, and comply with requirements.',
  },
  {
    id: 4,
    question: 'What is the difference between Transparency and Explainability?',
    options: [
      'They are the same thing',
      'Transparency is about disclosing information about the system; Explainability is about making decisions understandable',
      'Transparency is not required',
      'Explainability is not required',
    ],
    correctAnswer: 1,
    explanation: 'Transparency involves disclosing factual information about the AI system (what it does, how it works). Explainability goes further by making the reasoning behind specific decisions understandable to users and regulators.',
  },
  {
    id: 5,
    question: 'What documentation should be provided regarding the limitations of high-risk AI systems?',
    options: [
      'Limitations do not need to be documented',
      'Clear documentation of performance limitations, accuracy rates, and scenarios where the system may not perform reliably',
      'Only positive performance metrics',
      'Limitations should be hidden from users',
    ],
    correctAnswer: 1,
    explanation: 'Organizations must clearly document and communicate the limitations of high-risk AI systems, including performance limitations, accuracy rates, and scenarios where the system may fail or perform poorly.',
  },
  {
    id: 6,
    question: 'How should organizations address the "black box" problem in AI systems?',
    options: [
      'Black box systems are acceptable',
      'Implement interpretability techniques, provide explanations for decisions, and ensure human oversight can override AI decisions',
      'Black box systems should not be used',
      'The problem does not exist',
    ],
    correctAnswer: 1,
    explanation: 'Organizations should address the black box problem by implementing interpretability techniques (like feature importance analysis), providing explanations for decisions, and ensuring human oversight mechanisms can override AI decisions when necessary.',
  },
  {
    id: 7,
    question: 'What is the role of Model Cards in AI system transparency?',
    options: [
      'Model Cards are not relevant',
      'Model Cards document the intended use, performance characteristics, limitations, and ethical considerations of AI models',
      'Model Cards are only for marketing',
      'Model Cards are only for non-EU systems',
    ],
    correctAnswer: 1,
    explanation: 'Model Cards are documentation that provides comprehensive information about AI models, including intended use cases, performance characteristics, limitations, potential biases, and ethical considerations, supporting transparency and accountability.',
  },
  {
    id: 8,
    question: 'What information should be included in Data Sheets for datasets used in AI systems?',
    options: [
      'Data Sheets are not necessary',
      'Dataset composition, collection process, potential biases, intended use, and limitations',
      'Only data volume',
      'Data Sheets are only for large datasets',
    ],
    correctAnswer: 1,
    explanation: 'Data Sheets should document dataset composition, collection methodology, potential biases, intended use cases, and known limitations. This supports transparency about the data used to train and validate AI systems.',
  },
  {
    id: 9,
    question: 'How should organizations communicate AI system decisions to affected individuals?',
    options: [
      'No communication is necessary',
      'Provide clear, understandable explanations of decisions, the factors that influenced them, and how individuals can appeal or request review',
      'Use technical jargon that only experts understand',
      'Hide decision-making processes',
    ],
    correctAnswer: 1,
    explanation: 'Organizations must communicate AI system decisions to affected individuals in clear, understandable language, explaining the factors that influenced the decision and providing information about how to request human review or appeal.',
  },
  {
    id: 10,
    question: 'What is the significance of Interpretable Machine Learning in EU AI Act compliance?',
    options: [
      'Interpretability is not important',
      'Interpretable ML techniques help ensure that AI system decisions can be understood and verified to comply with transparency and fairness requirements',
      'Only for non-high-risk systems',
      'Interpretability reduces system performance',
    ],
    correctAnswer: 1,
    explanation: 'Interpretable Machine Learning techniques are important for EU AI Act compliance because they enable organizations to explain AI decisions, verify fairness, detect biases, and demonstrate compliance with transparency requirements.',
  },
];
