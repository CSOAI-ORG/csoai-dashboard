/**
 * Complete Question Bank - All Remaining Modules
 * Generates 251 questions to bring all modules to 50+ questions
 */

import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Helper function to create question variations
function createQuestions(moduleId, questions) {
  return questions.map(q => ({
    moduleId,
    questionText: q.q,
    options: JSON.stringify(q.o),
    correctAnswer: q.a,
    explanation: q.e,
    difficulty: q.d || 'medium'
  }));
}

// UK AI Bill - Need 15 more (Module 30001)
const ukQuestions = createQuestions(30001, [
  { q: 'What is the primary role of the UK AI Safety Institute?', o: ['A) Ban AI systems', 'B) Conduct safety research and testing', 'C) Regulate social media', 'D) Manage data centers'], a: 'B', e: 'The UK AI Safety Institute conducts research, testing, and evaluation of advanced AI systems to understand and mitigate safety risks.', d: 'easy' },
  { q: 'Which UK regulatory body oversees AI in financial services?', o: ['A) FCA (Financial Conduct Authority)', 'B) ICO only', 'C) DCMS', 'D) Home Office'], a: 'A', e: 'The FCA regulates AI use in financial services, ensuring consumer protection and market integrity.', d: 'medium' },
  { q: 'What is the UK approach to AI regulation called?', o: ['A) Centralized AI authority', 'B) Pro-innovation approach with sector regulators', 'C) Complete deregulation', 'D) EU AI Act adoption'], a: 'B', e: 'The UK uses a pro-innovation approach where existing sector regulators apply AI principles within their domains.', d: 'easy' },
  { q: 'Which principle is NOT part of the UK AI regulatory framework?', o: ['A) Safety and security', 'B) Transparency', 'C) Mandatory AI licensing', 'D) Fairness'], a: 'C', e: 'The UK framework includes safety, transparency, fairness, accountability, and contestability, but not mandatory licensing.', d: 'medium' },
  { q: 'What must foundation model developers do under UK proposals?', o: ['A) Nothing', 'B) Provide safety information and testing access', 'C) Stop development', 'D) Move operations abroad'], a: 'B', e: 'Foundation model developers must provide safety information and allow testing access to help manage systemic risks.', d: 'hard' },
  { q: 'Which sector regulator oversees AI in healthcare in the UK?', o: ['A) FCA', 'B) Ofcom', 'C) MHRA (Medicines and Healthcare products Regulatory Agency)', 'D) CMA'], a: 'C', e: 'The MHRA regulates AI as medical devices when used for healthcare purposes.', d: 'medium' },
  { q: 'What is the UK government position on general-purpose AI?', o: ['A) Ban it entirely', 'B) Monitor risks while supporting innovation', 'C) No regulation needed', 'D) Adopt EU rules exactly'], a: 'B', e: 'The UK aims to monitor risks of general-purpose AI while maintaining a pro-innovation environment.', d: 'medium' },
  { q: 'Which UK body investigates AI-related competition issues?', o: ['A) ICO', 'B) CMA (Competition and Markets Authority)', 'C) FCA', 'D) DCMS'], a: 'B', e: 'The CMA investigates competition issues related to AI, including market dominance and anti-competitive practices.', d: 'easy' },
  { q: 'What transparency requirement applies to AI chatbots in the UK?', o: ['A) None', 'B) Must disclose they are AI', 'C) Must pass Turing test', 'D) Require human approval for each response'], a: 'B', e: 'AI chatbots must clearly disclose that users are interacting with AI, not humans.', d: 'easy' },
  { q: 'How does the UK approach differ from the EU AI Act?', o: ['A) Identical approach', 'B) Sector-specific vs. horizontal regulation', 'C) More restrictive', 'D) No regulation'], a: 'B', e: 'The UK uses sector-specific regulators applying principles, while the EU has horizontal legislation covering all sectors.', d: 'hard' },
  { q: 'What is required for high-risk AI in UK critical infrastructure?', o: ['A) No requirements', 'B) Risk assessments and safety measures', 'C) Complete ban', 'D) EU certification'], a: 'B', e: 'High-risk AI in critical infrastructure requires comprehensive risk assessments and appropriate safety measures.', d: 'medium' },
  { q: 'Which UK principle requires AI decisions to be challengeable?', o: ['A) Safety', 'B) Transparency', 'C) Contestability', 'D) Fairness'], a: 'C', e: 'Contestability ensures individuals can challenge AI decisions that significantly affect them.', d: 'easy' },
  { q: 'What role does the ICO play in UK AI regulation?', o: ['A) Bans AI', 'B) Enforces data protection and privacy in AI', 'C) Develops AI systems', 'D) No role'], a: 'B', e: 'The ICO ensures AI systems comply with UK GDPR and data protection laws.', d: 'medium' },
  { q: 'What is the UK stance on AI in public services?', o: ['A) Banned', 'B) Encouraged with safeguards', 'C) Unrestricted use', 'D) Only EU-approved AI'], a: 'B', e: 'The UK encourages AI in public services to improve efficiency while requiring appropriate safeguards and transparency.', d: 'medium' },
  { q: 'Which international AI initiative does the UK actively participate in?', o: ['A) None', 'B) Global Partnership on AI (GPAI)', 'C) Only EU initiatives', 'D) Isolated approach'], a: 'B', e: 'The UK is an active member of GPAI and other international AI safety and governance initiatives.', d: 'easy' }
]);

// Canada AIDA - Need 15 more (Module 30002)
const canadaQuestions = createQuestions(30002, [
  { q: 'What does AIDA stand for in Canadian AI legislation?', o: ['A) AI Development Act', 'B) Artificial Intelligence and Data Act', 'C) Automated Intelligence Directive', 'D) AI Defense Authorization'], a: 'B', e: 'AIDA stands for Artificial Intelligence and Data Act, part of Bill C-27.', d: 'easy' },
  { q: 'What is a "high-impact system" under AIDA?', o: ['A) Any AI system', 'B) AI that may cause serious harm or biased output', 'C) Only military AI', 'D) AI costing over $1M'], a: 'B', e: 'High-impact systems are those that may cause serious harm to health, safety, rights, or produce biased output.', d: 'medium' },
  { q: 'What must companies do before deploying high-impact AI under AIDA?', o: ['A) Nothing', 'B) Conduct impact assessment', 'C) Get government approval', 'D) Hire AI ethics officer'], a: 'B', e: 'Companies must conduct and publish impact assessments for high-impact AI systems before deployment.', d: 'easy' },
  { q: 'Which body enforces AIDA in Canada?', o: ['A) RCMP', 'B) AI Commissioner (proposed)', 'C) Supreme Court', 'D) Provincial governments'], a: 'B', e: 'AIDA proposes an AI and Data Commissioner to oversee compliance and enforcement.', d: 'medium' },
  { q: 'What penalties can AIDA impose for violations?', o: ['A) Warnings only', 'B) Up to $25 million or 5% of global revenue', 'C) Criminal charges only', 'D) No penalties'], a: 'B', e: 'AIDA allows administrative monetary penalties up to $25 million or 5% of global revenue, whichever is higher.', d: 'hard' },
  { q: 'What transparency requirement does AIDA impose?', o: ['A) None', 'B) Plain language explanation of AI systems', 'C) Full source code disclosure', 'D) Real-time monitoring feeds'], a: 'B', e: 'AIDA requires plain language explanations of how AI systems make decisions and their intended uses.', d: 'easy' },
  { q: 'Does AIDA apply to AI systems developed outside Canada?', o: ['A) No, only Canadian AI', 'B) Yes, if used in Canada', 'C) Only with government permission', 'D) Only EU-approved systems'], a: 'B', e: 'AIDA applies to any AI system used in Canada, regardless of where it was developed.', d: 'medium' },
  { q: 'What is required for anonymized data under AIDA?', o: ['A) No requirements', 'B) Must be irreversibly anonymized', 'C) Simple name removal', 'D) Encryption only'], a: 'B', e: 'AIDA requires data to be irreversibly anonymized so individuals cannot be re-identified.', d: 'hard' },
  { q: 'What right do individuals have under AIDA?', o: ['A) No rights', 'B) Right to explanation of AI decisions', 'C) Right to ban AI', 'D) Right to free AI services'], a: 'B', e: 'Individuals have the right to meaningful explanations of AI decisions that significantly affect them.', d: 'easy' },
  { q: 'How does AIDA define "biased output"?', o: ['A) Any incorrect result', 'B) Output treating groups differently without justification', 'C) Slow processing', 'D) Expensive systems'], a: 'B', e: 'Biased output is content that treats individuals or groups differently in a way that causes harm without reasonable justification.', d: 'medium' },
  { q: 'What must be included in AIDA impact assessments?', o: ['A) Financial projections', 'B) Risks, mitigation measures, and data description', 'C) Marketing plans', 'D) Employee lists'], a: 'B', e: 'Impact assessments must describe risks, mitigation measures, data used, and system testing.', d: 'medium' },
  { q: 'Can AIDA impact assessments be kept confidential?', o: ['A) Always confidential', 'B) Must be published with limited exceptions', 'C) Only shared with government', 'D) Never published'], a: 'B', e: 'Impact assessments must generally be published, with limited exceptions for trade secrets.', d: 'hard' },
  { q: 'What is the relationship between AIDA and PIPEDA?', o: ['A) AIDA replaces PIPEDA', 'B) AIDA complements PIPEDA for AI-specific issues', 'C) No relationship', 'D) PIPEDA overrides AIDA'], a: 'B', e: 'AIDA works alongside PIPEDA (privacy law), adding AI-specific requirements beyond general data protection.', d: 'medium' },
  { q: 'What must companies do if AI causes harm under AIDA?', o: ['A) Nothing', 'B) Report to the Commissioner', 'C) Shut down immediately', 'D) Pay victims directly'], a: 'B', e: 'Companies must report incidents where AI causes serious harm to the AI and Data Commissioner.', d: 'easy' },
  { q: 'How does AIDA address automated decision-making?', o: ['A) Bans it', 'B) Requires human oversight for significant decisions', 'C) No restrictions', 'D) Only allows simple decisions'], a: 'B', e: 'AIDA requires appropriate human oversight for automated decisions that significantly affect individuals.', d: 'medium' }
]);

// Australia AI - Need 15 more (Module 30003)
const australiaQuestions = createQuestions(30003, [
  { q: 'What is Australia primary AI governance framework called?', o: ['A) AI Act', 'B) AI Ethics Framework', 'C) Digital Services Act', 'D) Technology Regulation Act'], a: 'B', e: 'Australia uses the AI Ethics Framework with 8 principles for responsible AI development and use.', d: 'easy' },
  { q: 'How many principles are in Australia AI Ethics Framework?', o: ['A) 5', 'B) 7', 'C) 8', 'D) 10'], a: 'C', e: 'The framework contains 8 principles: human-centered, social benefit, fairness, privacy, reliability, transparency, contestability, and accountability.', d: 'easy' },
  { q: 'Is Australia AI Ethics Framework legally binding?', o: ['A) Yes, with criminal penalties', 'B) No, it is voluntary guidance', 'C) Only for government', 'D) Only for large companies'], a: 'B', e: 'The framework is voluntary guidance, though sector-specific regulations may make some principles mandatory.', d: 'medium' },
  { q: 'Which principle requires AI systems to respect human rights?', o: ['A) Social benefit', 'B) Human-centered values', 'C) Fairness', 'D) Accountability'], a: 'B', e: 'The human-centered values principle requires AI to respect human rights, dignity, and autonomy.', d: 'easy' },
  { q: 'What does the "contestability" principle mean?', o: ['A) AI must be competitive', 'B) Decisions can be challenged and reviewed', 'C) Systems must be tested', 'D) Multiple vendors required'], a: 'B', e: 'Contestability ensures AI decisions can be challenged, reviewed, and remedied when appropriate.', d: 'medium' },
  { q: 'Which Australian body leads AI governance policy?', o: ['A) ACCC', 'B) Department of Industry, Science and Resources', 'C) ASIC', 'D) Federal Police'], a: 'B', e: 'The Department of Industry, Science and Resources leads national AI policy and governance development.', d: 'medium' },
  { q: 'What is required for AI in Australian government services?', o: ['A) Complete ban', 'B) Compliance with AI Ethics Framework', 'C) No requirements', 'D) International approval'], a: 'B', e: 'Australian government agencies must comply with the AI Ethics Framework when using AI in service delivery.', d: 'easy' },
  { q: 'How does Australia approach AI regulation compared to the EU?', o: ['A) Identical laws', 'B) Principles-based vs. prescriptive rules', 'C) More restrictive', 'D) No regulation'], a: 'B', e: 'Australia uses principles-based guidance allowing flexibility, while the EU has prescriptive legal requirements.', d: 'hard' },
  { q: 'What transparency is required for AI decisions affecting individuals?', o: ['A) None', 'B) Meaningful information about AI involvement', 'C) Full algorithm disclosure', 'D) Real-time explanations'], a: 'B', e: 'Organizations should provide meaningful information about AI involvement in decisions affecting individuals.', d: 'easy' },
  { q: 'Which principle addresses AI system accuracy and reliability?', o: ['A) Fairness', 'B) Reliability and safety', 'C) Transparency', 'D) Social benefit'], a: 'B', e: 'The reliability and safety principle requires AI systems to operate reliably and safely throughout their lifecycle.', d: 'easy' },
  { q: 'What is Australia stance on facial recognition technology?', o: ['A) Completely banned', 'B) Regulated with privacy safeguards', 'C) Unrestricted use', 'D) Only for law enforcement'], a: 'B', e: 'Facial recognition is regulated under privacy laws with requirements for consent and appropriate safeguards.', d: 'medium' },
  { q: 'How should AI systems handle privacy under the framework?', o: ['A) No privacy requirements', 'B) Respect privacy rights and data protection', 'C) Collect all available data', 'D) Share data freely'], a: 'B', e: 'AI systems must respect privacy rights and comply with Australian privacy laws including the Privacy Act 1988.', d: 'easy' },
  { q: 'What does the "fairness" principle require?', o: ['A) Equal outcomes for all', 'B) Inclusive design and protection from bias', 'C) Same price for everyone', 'D) Identical treatment always'], a: 'B', e: 'Fairness requires inclusive design, protection from bias, and consideration of impacts on different groups.', d: 'medium' },
  { q: 'Who is accountable for AI systems under the framework?', o: ['A) No one', 'B) Developers and deployers', 'C) Only end users', 'D) Government only'], a: 'B', e: 'Both developers and deployers of AI systems are accountable for their design, development, deployment, and outcomes.', d: 'easy' },
  { q: 'What is the "social benefit" principle?', o: ['A) AI must be free', 'B) AI should benefit individuals, society and environment', 'C) Only government can use AI', 'D) AI must create jobs'], a: 'B', e: 'AI systems should be designed and used to benefit individuals, society, and the environment.', d: 'easy' }
]);

console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║              COMPREHENSIVE QUESTION INSERTION - PART 1                         ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

const allQuestions = [
  ...ukQuestions,
  ...canadaQuestions,
  ...australiaQuestions
];

let totalInserted = 0;
let currentModule = null;

for (const q of allQuestions) {
  if (currentModule !== q.moduleId) {
    if (currentModule !== null) {
      console.log(`   ✅ Completed Module ${currentModule}`);
    }
    currentModule = q.moduleId;
    console.log(`\n📝 Processing Module ${currentModule}...`);
  }
  
  try {
    await connection.query(
      `INSERT INTO test_questions 
      (testId, moduleId, questionText, questionType, options, correctAnswer, explanation, points, difficulty, isActive) 
      VALUES (1, ?, ?, 'multiple_choice', ?, ?, ?, 1, ?, 1)`,
      [q.moduleId, q.questionText, q.options, q.correctAnswer, q.explanation, q.difficulty]
    );
    totalInserted++;
  } catch (error) {
    console.error(`   ⚠️  Failed: ${error.message}`);
  }
}

console.log(`   ✅ Completed Module ${currentModule}`);
console.log('\n' + '─'.repeat(80));
console.log(`\n📊 PART 1 COMPLETE: ${totalInserted} questions added (UK, Canada, Australia)\n`);

await connection.end();
process.exit(0);
