import type { QuizQuestion } from '@/types/quiz';

export const euAiActModule15Quiz: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary purpose of Post-Market Monitoring for high-risk AI systems?',
    options: [
      'To increase sales after deployment',
      'To collect and analyze real-world performance data, identify risks, and take corrective action',
      'To reduce development costs',
      'Post-Market Monitoring is not required',
    ],
    correctAnswer: 1,
    explanation: 'Post-Market Monitoring involves systematically collecting and analyzing data on how AI systems perform in real-world conditions, identifying emerging risks, and taking corrective action to ensure continued compliance and safety.',
  },
  {
    id: 2,
    question: 'What data should be collected during Post-Market Monitoring?',
    options: [
      'Only sales figures',
      'System performance metrics, user feedback, incident reports, accuracy rates, and any adverse events or failures',
      'Only marketing data',
      'No specific data is required',
    ],
    correctAnswer: 1,
    explanation: 'Post-Market Monitoring should collect comprehensive data including system performance metrics, user feedback and complaints, incident and adverse event reports, accuracy rates, and any deviations from expected behavior.',
  },
  {
    id: 3,
    question: 'What constitutes a Serious Incident that must be reported under the EU AI Act?',
    options: [
      'Any system malfunction',
      'An incident that causes or could cause death, serious injury, or significant harm to fundamental rights',
      'Only incidents affecting more than 1000 users',
      'Incidents do not need to be reported',
    ],
    correctAnswer: 1,
    explanation: 'A Serious Incident is defined as an incident that causes or could reasonably cause death, serious injury, or significant harm to fundamental rights. These must be reported to regulatory authorities without undue delay.',
  },
  {
    id: 4,
    question: 'What is the timeline for reporting Serious Incidents to regulatory authorities?',
    options: [
      'Within 30 days',
      'Within 15 days',
      'Without undue delay, typically within 72 hours of discovery',
      'Reporting timeline is not specified',
    ],
    correctAnswer: 2,
    explanation: 'Serious Incidents must be reported to regulatory authorities without undue delay. Best practice is to report within 72 hours of discovery to ensure timely regulatory response and protection of affected individuals.',
  },
  {
    id: 5,
    question: 'What information must be included in a Serious Incident Report?',
    options: [
      'Only the incident description',
      'Incident description, date and time, affected individuals/systems, root cause analysis, impact assessment, and corrective actions taken',
      'Only system technical specifications',
      'No specific information is required',
    ],
    correctAnswer: 1,
    explanation: 'Serious Incident Reports must include a detailed description of the incident, when it occurred, which individuals or systems were affected, preliminary root cause analysis, assessment of impact, and corrective actions implemented or planned.',
  },
  {
    id: 6,
    question: 'What is a Recall in the context of AI systems?',
    options: [
      'Recalling is not applicable to AI systems',
      'Removing an AI system from the market or service due to serious risks or non-compliance',
      'Only for hardware systems',
      'Recalls are only for consumer products',
    ],
    correctAnswer: 1,
    explanation: 'A Recall involves removing an AI system from the market or service when it poses serious risks to fundamental rights or safety, or when it does not comply with EU AI Act requirements. This is a significant corrective action.',
  },
  {
    id: 7,
    question: 'How should organizations handle Post-Market Monitoring data to protect privacy?',
    options: [
      'Collect all data without restrictions',
      'Implement data minimization, anonymization, and comply with GDPR when collecting and analyzing monitoring data',
      'Do not collect any data',
      'Privacy is not relevant to Post-Market Monitoring',
    ],
    correctAnswer: 1,
    explanation: 'Organizations must implement data minimization principles, anonymize data where possible, and comply with GDPR requirements when collecting and analyzing Post-Market Monitoring data to protect user privacy.',
  },
  {
    id: 8,
    question: 'What is the significance of Trend Analysis in Post-Market Monitoring?',
    options: [
      'Trend Analysis is not important',
      'Identifying patterns in incidents or performance issues can reveal systemic problems requiring corrective action',
      'Trends are only for marketing',
      'Trend Analysis is only for large systems',
    ],
    correctAnswer: 1,
    explanation: 'Trend Analysis of Post-Market Monitoring data can reveal patterns indicating systemic problems, emerging risks, or performance degradation that may require corrective action, system updates, or even recall.',
  },
  {
    id: 9,
    question: 'What corrective actions might be taken based on Post-Market Monitoring findings?',
    options: [
      'No corrective actions are necessary',
      'Software updates, retraining the model, restricting system use, issuing warnings, or recalling the system',
      'Only marketing adjustments',
      'Corrective actions are only for critical systems',
    ],
    correctAnswer: 1,
    explanation: 'Based on Post-Market Monitoring findings, organizations might implement software updates, retrain the AI model, restrict system use to lower-risk scenarios, issue user warnings, or in severe cases, recall the system.',
  },
  {
    id: 10,
    question: 'How long should organizations maintain Post-Market Monitoring data?',
    options: [
      '1 year after deployment',
      '5 years after deployment',
      'Throughout the system lifecycle and for a specified period after discontinuation',
      'Post-Market Monitoring data does not need to be retained',
    ],
    correctAnswer: 2,
    explanation: 'Organizations must maintain Post-Market Monitoring data throughout the entire lifecycle of the AI system and continue to retain it for a specified period even after the system is discontinued, to support accountability and regulatory oversight.',
  },
];
