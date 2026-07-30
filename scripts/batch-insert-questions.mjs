/**
 * Batch Question Insertion Script
 * Inserts all remaining questions to bring modules up to 50+ questions
 */

import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Comprehensive question bank for all modules
const questionBank = {
  // TC260 - Need 7 more (already added 3)
  30008: [
    {
      questionText: 'What penalty applies to AI systems violating TC260 content safety requirements?',
      options: ['A) Warning only', 'B) Up to ¥100,000 RMB', 'C) Up to ¥10 million RMB or 5% of annual revenue', 'D) Criminal prosecution only'],
      correctAnswer: 'C',
      explanation: 'Violations can result in fines up to ¥10 million RMB or 5% of annual revenue, whichever is higher, plus potential service suspension.',
      difficulty: 'hard'
    },
    {
      questionText: 'Which AI application is classified as high-risk under TC260?',
      options: ['A) E-commerce recommendations', 'B) Facial recognition for public security', 'C) Customer service chatbots', 'D) Translation services'],
      correctAnswer: 'B',
      explanation: 'Facial recognition for public security is high-risk due to its impact on civil rights and potential for mass surveillance.',
      difficulty: 'easy'
    },
    {
      questionText: 'What labeling is required for AI-generated content under TC260?',
      options: ['A) Watermark only', 'B) Visible label only', 'C) Both visible and invisible markers', 'D) No labeling required'],
      correctAnswer: 'C',
      explanation: 'TC260 requires both visible labels for user awareness and invisible technical markers for traceability.',
      difficulty: 'medium'
    },
    {
      questionText: 'Which data localization requirement applies under TC260?',
      options: ['A) All data must stay in China', 'B) Only personal data', 'C) Critical infrastructure data must stay in China', 'D) No localization required'],
      correctAnswer: 'C',
      explanation: 'Critical information infrastructure operators must store data collected in China within China.',
      difficulty: 'hard'
    },
    {
      questionText: 'Minimum frequency for security assessments of generative AI under TC260?',
      options: ['A) Monthly', 'B) Quarterly', 'C) Annually', 'D) Only when changes occur'],
      correctAnswer: 'C',
      explanation: 'Generative AI providers must conduct security assessments at least annually, plus when significant changes occur.',
      difficulty: 'medium'
    },
    {
      questionText: 'What must be disclosed about recommendation algorithms under TC260?',
      options: ['A) Source code', 'B) Training data sources', 'C) Basic principles and mechanisms', 'D) Employee information'],
      correctAnswer: 'C',
      explanation: 'Providers must disclose basic principles, purposes, and main operating mechanisms without full source code.',
      difficulty: 'easy'
    },
    {
      questionText: 'How does TC260 approach AI ethics compared to Western frameworks?',
      options: ['A) Focuses on individual rights only', 'B) Emphasizes collective harmony and national security', 'C) Identical to EU AI Act', 'D) No ethical requirements'],
      correctAnswer: 'B',
      explanation: 'TC260 emphasizes collective social harmony and national security alongside individual rights.',
      difficulty: 'medium'
    }
  ],
  
  // ISO 42001 - Need 14 more
  30007: [
    {
      questionText: 'What is the primary purpose of ISO/IEC 42001:2023?',
      options: ['A) To ban AI systems', 'B) To establish AI management system requirements', 'C) To promote AI without restrictions', 'D) To create AI standards body'],
      correctAnswer: 'B',
      explanation: 'ISO 42001 establishes requirements for establishing, implementing, maintaining and continually improving an AI Management System (AIMS).',
      difficulty: 'easy'
    },
    {
      questionText: 'Which clause in ISO 42001 addresses leadership and commitment?',
      options: ['A) Clause 4', 'B) Clause 5', 'C) Clause 6', 'D) Clause 7'],
      correctAnswer: 'B',
      explanation: 'Clause 5 covers Leadership, including top management commitment, AI policy, and organizational roles.',
      difficulty: 'medium'
    },
    {
      questionText: 'What does the PDCA cycle stand for in ISO 42001 context?',
      options: ['A) Plan-Do-Check-Act', 'B) Prevent-Detect-Correct-Audit', 'C) Policy-Deploy-Control-Assess', 'D) Prepare-Develop-Certify-Approve'],
      correctAnswer: 'A',
      explanation: 'PDCA (Plan-Do-Check-Act) is the continuous improvement cycle used in ISO management systems.',
      difficulty: 'easy'
    },
    {
      questionText: 'Which is NOT a key principle of ISO 42001?',
      options: ['A) Risk-based approach', 'B) Stakeholder engagement', 'C) Profit maximization', 'D) Continuous improvement'],
      correctAnswer: 'C',
      explanation: 'ISO 42001 focuses on risk management, stakeholder engagement, and continuous improvement, not profit maximization.',
      difficulty: 'easy'
    },
    {
      questionText: 'What is required in Clause 6 of ISO 42001?',
      options: ['A) Context of the organization', 'B) Planning and risk assessment', 'C) Support and resources', 'D) Performance evaluation'],
      correctAnswer: 'B',
      explanation: 'Clause 6 covers Planning, including actions to address risks and opportunities, and AI objectives.',
      difficulty: 'medium'
    },
    {
      questionText: 'How often should internal audits be conducted under ISO 42001?',
      options: ['A) Weekly', 'B) Monthly', 'C) At planned intervals', 'D) Only when incidents occur'],
      correctAnswer: 'C',
      explanation: 'ISO 42001 requires internal audits at planned intervals to ensure the AIMS conforms to requirements.',
      difficulty: 'medium'
    },
    {
      questionText: 'What documentation is mandatory under ISO 42001?',
      options: ['A) AI policy only', 'B) Risk assessments only', 'C) AI policy, objectives, and documented information', 'D) No documentation required'],
      correctAnswer: 'C',
      explanation: 'ISO 42001 requires documented AI policy, objectives, and various documented information to demonstrate conformity.',
      difficulty: 'hard'
    },
    {
      questionText: 'Which clause addresses operational planning and control?',
      options: ['A) Clause 6', 'B) Clause 7', 'C) Clause 8', 'D) Clause 9'],
      correctAnswer: 'C',
      explanation: 'Clause 8 covers Operation, including operational planning, control, and AI system lifecycle management.',
      difficulty: 'medium'
    },
    {
      questionText: 'What is the purpose of management review in ISO 42001?',
      options: ['A) To punish employees', 'B) To ensure continuing suitability and effectiveness', 'C) To reduce costs', 'D) To eliminate AI systems'],
      correctAnswer: 'B',
      explanation: 'Management review ensures the AIMS continues to be suitable, adequate, effective, and aligned with strategic direction.',
      difficulty: 'easy'
    },
    {
      questionText: 'Which stakeholders must be considered in ISO 42001?',
      options: ['A) Shareholders only', 'B) Customers only', 'C) All interested parties', 'D) Management only'],
      correctAnswer: 'C',
      explanation: 'ISO 42001 requires consideration of all interested parties including customers, regulators, employees, and society.',
      difficulty: 'medium'
    },
    {
      questionText: 'What is required for AI system changes under ISO 42001?',
      options: ['A) No requirements', 'B) Controlled and documented changes', 'C) Immediate implementation', 'D) External approval only'],
      correctAnswer: 'B',
      explanation: 'Changes to AI systems must be controlled, documented, and subject to appropriate review and approval.',
      difficulty: 'medium'
    },
    {
      questionText: 'Which clause covers performance evaluation?',
      options: ['A) Clause 7', 'B) Clause 8', 'C) Clause 9', 'D) Clause 10'],
      correctAnswer: 'C',
      explanation: 'Clause 9 covers Performance Evaluation, including monitoring, measurement, analysis, internal audit, and management review.',
      difficulty: 'medium'
    },
    {
      questionText: 'What is the purpose of continual improvement in ISO 42001?',
      options: ['A) To increase costs', 'B) To enhance AIMS suitability and effectiveness', 'C) To complicate processes', 'D) To delay implementation'],
      correctAnswer: 'B',
      explanation: 'Continual improvement aims to enhance the suitability, adequacy, and effectiveness of the AIMS.',
      difficulty: 'easy'
    },
    {
      questionText: 'Which is a key output of the planning process in ISO 42001?',
      options: ['A) Financial statements', 'B) AI objectives and plans to achieve them', 'C) Marketing materials', 'D) Employee contracts'],
      correctAnswer: 'B',
      explanation: 'Planning must produce AI objectives and plans to achieve them, addressing risks and opportunities.',
      difficulty: 'medium'
    }
  ]
};

console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    BATCH QUESTION INSERTION                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

let totalInserted = 0;

for (const [moduleId, questions] of Object.entries(questionBank)) {
  console.log(`\n📝 Inserting ${questions.length} questions for Module ${moduleId}...`);
  
  for (const q of questions) {
    try {
      await connection.query(
        `INSERT INTO test_questions 
        (testId, moduleId, questionText, questionType, options, correctAnswer, explanation, points, difficulty, isActive) 
        VALUES (1, ?, ?, 'multiple_choice', ?, ?, ?, 1, ?, 1)`,
        [
          parseInt(moduleId),
          q.questionText,
          JSON.stringify(q.options),
          q.correctAnswer,
          q.explanation,
          q.difficulty
        ]
      );
      totalInserted++;
    } catch (error) {
      console.error(`   ⚠️  Failed: ${error.message}`);
    }
  }
  
  console.log(`   ✅ Inserted ${questions.length} questions`);
}

console.log('\n' + '─'.repeat(80));
console.log(`\n📊 INSERTION COMPLETE: ${totalInserted} questions added\n`);

await connection.end();
process.exit(0);
