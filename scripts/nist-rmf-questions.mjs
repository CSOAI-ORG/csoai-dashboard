/**
 * NIST AI RMF Advanced Questions
 * Module 30006 - Need 27 more questions (currently 23/50)
 */

import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const questions = [
  {
    q: 'What does RMF stand for in NIST AI RMF?',
    o: ['A) Risk Management Framework', 'B) Regulatory Management Function', 'C) Resource Monitoring Facility', 'D) Research Methodology Forum'],
    a: 'A',
    e: 'RMF stands for Risk Management Framework, providing a structured approach to managing AI risks.',
    d: 'easy'
  },
  {
    q: 'How many core functions does the NIST AI RMF have?',
    o: ['A) 3', 'B) 4', 'C) 5', 'D) 7'],
    a: 'B',
    e: 'The NIST AI RMF has 4 core functions: Govern, Map, Measure, and Manage.',
    d: 'easy'
  },
  {
    q: 'Which NIST AI RMF function focuses on organizational culture and oversight?',
    o: ['A) Map', 'B) Measure', 'C) Govern', 'D) Manage'],
    a: 'C',
    e: 'The Govern function establishes organizational culture, policies, and oversight for trustworthy AI.',
    d: 'easy'
  },
  {
    q: 'What is the purpose of the MAP function in NIST AI RMF?',
    o: ['A) Create geographical maps', 'B) Understand AI system context and risks', 'C) Monitor performance', 'D) Manage incidents'],
    a: 'B',
    e: 'The Map function helps understand the AI system context, categorize risks, and identify impacts.',
    d: 'medium'
  },
  {
    q: 'Which characteristic is NOT part of NIST trustworthy AI?',
    o: ['A) Valid and reliable', 'B) Safe', 'C) Profitable', 'D) Accountable and transparent'],
    a: 'C',
    e: 'NIST trustworthy AI characteristics include validity, reliability, safety, security, resilience, accountability, transparency, explainability, interpretability, privacy, and fairness. Profitability is not included.',
    d: 'medium'
  },
  {
    q: 'What does the MEASURE function assess?',
    o: ['A) Financial costs', 'B) AI system trustworthiness and risks', 'C) Employee satisfaction', 'D) Market share'],
    a: 'B',
    e: 'The Measure function assesses, analyzes, and tracks AI system trustworthiness and risk metrics.',
    d: 'easy'
  },
  {
    q: 'What is the purpose of the MANAGE function?',
    o: ['A) Hire staff', 'B) Allocate resources and respond to risks', 'C) Develop marketing', 'D) Set prices'],
    a: 'B',
    e: 'The Manage function allocates resources and implements actions to address identified AI risks.',
    d: 'easy'
  },
  {
    q: 'Which NIST AI RMF category addresses harmful bias?',
    o: ['A) Valid and reliable only', 'B) Fair with harmful bias managed', 'C) Profitable', 'D) Fast processing'],
    a: 'B',
    e: 'The "Fair - with harmful bias managed" characteristic specifically addresses AI fairness and bias mitigation.',
    d: 'medium'
  },
  {
    q: 'What is a key principle of the GOVERN function?',
    o: ['A) Maximize profit', 'B) Establish accountability structures', 'C) Minimize costs', 'D) Avoid documentation'],
    a: 'B',
    e: 'The Govern function establishes clear accountability structures, roles, and responsibilities for AI systems.',
    d: 'easy'
  },
  {
    q: 'How does NIST AI RMF define "valid and reliable"?',
    o: ['A) Expensive systems', 'B) Systems that perform consistently and accurately', 'C) Fast processing', 'D) Popular systems'],
    a: 'B',
    e: 'Valid and reliable means AI systems perform consistently, accurately, and as intended across different contexts.',
    d: 'medium'
  },
  {
    q: 'What should organizations do in the MAP function?',
    o: ['A) Create office floor plans', 'B) Identify AI system context, impacts, and risks', 'C) Design logos', 'D) Plan parties'],
    a: 'B',
    e: 'Organizations should identify and document AI system context, potential impacts, and associated risks.',
    d: 'easy'
  },
  {
    q: 'Which stakeholders should be involved in AI risk management per NIST?',
    o: ['A) Only executives', 'B) Only developers', 'C) Diverse stakeholders including affected communities', 'D) Only shareholders'],
    a: 'C',
    e: 'NIST emphasizes involving diverse stakeholders including developers, users, affected communities, and domain experts.',
    d: 'medium'
  },
  {
    q: 'What is "explainability" in NIST AI RMF context?',
    o: ['A) System cost justification', 'B) Understanding how AI systems make decisions', 'C) Marketing materials', 'D) User manuals'],
    a: 'B',
    e: 'Explainability means stakeholders can understand how and why AI systems make specific decisions or predictions.',
    d: 'easy'
  },
  {
    q: 'How often should AI systems be reassessed per NIST guidance?',
    o: ['A) Never', 'B) Once at deployment', 'C) Continuously throughout lifecycle', 'D) Only when failures occur'],
    a: 'C',
    e: 'NIST recommends continuous monitoring and reassessment throughout the AI system lifecycle.',
    d: 'medium'
  },
  {
    q: 'What is "interpretability" in AI systems?',
    o: ['A) Translation capability', 'B) Degree to which humans can understand system outputs', 'C) Processing speed', 'D) Cost efficiency'],
    a: 'B',
    e: 'Interpretability is the degree to which humans can understand and reason about AI system outputs and behavior.',
    d: 'medium'
  },
  {
    q: 'Which is a key privacy consideration in NIST AI RMF?',
    o: ['A) Collect maximum data', 'B) Data minimization and purpose limitation', 'C) Share data freely', 'D) Ignore privacy laws'],
    a: 'B',
    e: 'NIST emphasizes data minimization, purpose limitation, and privacy-preserving techniques in AI systems.',
    d: 'easy'
  },
  {
    q: 'What does "resilience" mean for AI systems?',
    o: ['A) Cheap to maintain', 'B) Ability to withstand and recover from disruptions', 'C) Fast processing', 'D) Popular with users'],
    a: 'B',
    e: 'Resilience is the ability of AI systems to withstand, recover from, and adapt to adverse conditions or attacks.',
    d: 'medium'
  },
  {
    q: 'What should be documented in AI system records per NIST?',
    o: ['A) Nothing', 'B) Design decisions, data sources, testing results', 'C) Only final outputs', 'D) Employee names only'],
    a: 'B',
    e: 'NIST recommends documenting design decisions, data sources, model details, testing results, and risk assessments.',
    d: 'medium'
  },
  {
    q: 'How does NIST AI RMF address third-party AI components?',
    o: ['A) Ignore them', 'B) Assess and manage risks from third-party components', 'C) Always reject them', 'D) No guidance provided'],
    a: 'B',
    e: 'Organizations must assess and manage risks from third-party AI components, including pre-trained models and APIs.',
    d: 'hard'
  },
  {
    q: 'What is the relationship between NIST AI RMF and NIST Cybersecurity Framework?',
    o: ['A) Completely separate', 'B) AI RMF complements and aligns with CSF', 'C) AI RMF replaces CSF', 'D) No relationship'],
    a: 'B',
    e: 'The AI RMF is designed to complement and align with the NIST Cybersecurity Framework, sharing similar structure.',
    d: 'hard'
  },
  {
    q: 'What is "accountability" in NIST AI RMF?',
    o: ['A) Financial auditing', 'B) Clear responsibility and answerability for AI outcomes', 'C) Employee reviews', 'D) Stock performance'],
    a: 'B',
    e: 'Accountability means clear responsibility and answerability for AI system design, development, deployment, and outcomes.',
    d: 'easy'
  },
  {
    q: 'How should AI system failures be handled per NIST?',
    o: ['A) Hide them', 'B) Document, analyze, and learn from failures', 'C) Blame users', 'D) Ignore them'],
    a: 'B',
    e: 'Organizations should document failures, conduct root cause analysis, and implement lessons learned.',
    d: 'easy'
  },
  {
    q: 'What testing is recommended for AI systems?',
    o: ['A) No testing needed', 'B) One-time testing', 'C) Comprehensive testing including edge cases', 'D) Only user acceptance testing'],
    a: 'C',
    e: 'NIST recommends comprehensive testing including performance, security, fairness, and edge case testing.',
    d: 'medium'
  },
  {
    q: 'How does NIST AI RMF address AI system transparency?',
    o: ['A) Full source code disclosure required', 'B) Appropriate transparency based on context and stakeholders', 'C) No transparency needed', 'D) Only for government systems'],
    a: 'B',
    e: 'NIST recommends appropriate transparency tailored to context, stakeholders, and risk levels.',
    d: 'hard'
  },
  {
    q: 'What is the purpose of AI impact assessments in NIST RMF?',
    o: ['A) Calculate costs', 'B) Identify potential harms and benefits', 'C) Measure speed', 'D) Count users'],
    a: 'B',
    e: 'Impact assessments identify potential harms, benefits, and effects on individuals, groups, and society.',
    d: 'medium'
  },
  {
    q: 'How should AI training data be managed per NIST?',
    o: ['A) Use any available data', 'B) Assess quality, representativeness, and potential biases', 'C) Minimize data collection', 'D) Only use public data'],
    a: 'B',
    e: 'Organizations should assess training data quality, representativeness, potential biases, and appropriateness for intended use.',
    d: 'medium'
  },
  {
    q: 'What is NIST guidance on AI system decommissioning?',
    o: ['A) No guidance', 'B) Plan for responsible decommissioning including data handling', 'C) Never decommission', 'D) Delete everything immediately'],
    a: 'B',
    e: 'Organizations should plan for responsible decommissioning, including proper data handling, notification, and transition plans.',
    d: 'hard'
  }
];

console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    NIST AI RMF ADVANCED QUESTIONS                              ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

console.log(`📝 Inserting ${questions.length} questions for Module 30006 (NIST RMF Advanced)...\n`);

let inserted = 0;

for (const q of questions) {
  try {
    await connection.query(
      `INSERT INTO test_questions 
      (testId, moduleId, questionText, questionType, options, correctAnswer, explanation, points, difficulty, isActive) 
      VALUES (1, 30006, ?, 'multiple_choice', ?, ?, ?, 1, ?, 1)`,
      [q.q, JSON.stringify(q.o), q.a, q.e, q.d]
    );
    inserted++;
  } catch (error) {
    console.error(`   ⚠️  Failed: ${error.message}`);
  }
}

console.log(`✅ Inserted ${inserted}/${questions.length} questions\n`);

await connection.end();
process.exit(0);
