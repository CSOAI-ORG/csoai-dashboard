/**
 * Final Batch - Foundation Modules
 * Modules 1, 2, 3, 4, 5 - Need 161 questions total
 */

import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Helper to create questions
const createQ = (moduleId, q, o, a, e, d = 'medium') => ({
  moduleId, questionText: q, options: JSON.stringify(o), correctAnswer: a, explanation: e, difficulty: d
});

// Module 1: Introduction to AI Safety - Need 40 more (currently 10/50)
const module1 = [
  createQ(1, 'What is the primary goal of AI safety?', ['A) Maximize profit', 'B) Ensure AI systems are beneficial and do not cause harm', 'C) Make AI faster', 'D) Replace human workers'], 'B', 'AI safety aims to ensure AI systems are beneficial, aligned with human values, and do not cause unintended harm.', 'easy'),
  createQ(1, 'What is an "AI alignment" problem?', ['A) Physical positioning of servers', 'B) Ensuring AI goals match human values', 'C) Network configuration', 'D) Data storage alignment'], 'B', 'AI alignment refers to ensuring AI systems pursue goals that align with human values and intentions.', 'medium'),
  createQ(1, 'What is a "black box" AI system?', ['A) AI stored in dark containers', 'B) AI whose decision-making process is not transparent', 'C) AI for military use', 'D) AI without interfaces'], 'B', 'Black box AI refers to systems whose internal decision-making processes are opaque and difficult to understand.', 'easy'),
  createQ(1, 'What is "AI robustness"?', ['A) Physical durability', 'B) Ability to perform reliably under various conditions', 'C) Processing speed', 'D) Cost efficiency'], 'B', 'Robustness means AI systems perform reliably even with unexpected inputs, adversarial attacks, or distribution shifts.', 'medium'),
  createQ(1, 'What is an "adversarial attack" on AI?', ['A) Physical damage', 'B) Deliberately crafted inputs to fool AI systems', 'C) Competitive business', 'D) Legal challenges'], 'B', 'Adversarial attacks use specially crafted inputs designed to cause AI systems to make mistakes.', 'medium'),
  createQ(1, 'What does "AI interpretability" mean?', ['A) Translation capability', 'B) Ability to understand how AI makes decisions', 'C) Speed of processing', 'D) User interface design'], 'B', 'Interpretability is the degree to which humans can understand and explain AI system decisions and behavior.', 'easy'),
  createQ(1, 'What is "value alignment" in AI?', ['A) Financial valuation', 'B) Ensuring AI objectives match human values', 'C) Price setting', 'D) Stock market alignment'], 'B', 'Value alignment ensures AI systems objectives and behaviors align with human values and ethical principles.', 'medium'),
  createQ(1, 'What is an "existential risk" from AI?', ['A) Business failure', 'B) Risk of human extinction or civilization collapse', 'C) Job loss', 'D) Privacy concerns'], 'B', 'Existential risk refers to potential for advanced AI to pose catastrophic risks to humanity survival or civilization.', 'hard'),
  createQ(1, 'What is "AI transparency"?', ['A) Physical see-through hardware', 'B) Openness about AI capabilities, limitations, and decision processes', 'C) Glass data centers', 'D) Public stock trading'], 'B', 'Transparency means being open about how AI systems work, their capabilities, limitations, and decision-making processes.', 'easy'),
  createQ(1, 'What is "reward hacking" in AI?', ['A) Stealing money', 'B) AI finding unintended ways to maximize rewards', 'C) Cybercrime', 'D) Bonus fraud'], 'B', 'Reward hacking occurs when AI systems find loopholes to maximize rewards in ways not intended by designers.', 'hard'),
  createQ(1, 'What is "AI accountability"?', ['A) Financial auditing', 'B) Clear responsibility for AI decisions and outcomes', 'C) Employee reviews', 'D) Tax compliance'], 'B', 'Accountability means clear assignment of responsibility for AI system design, deployment, and outcomes.', 'easy'),
  createQ(1, 'What is a "capability control" in AI safety?', ['A) Limiting AI abilities to prevent harm', 'B) Skill assessment', 'C) Performance monitoring', 'D) Speed regulation'], 'A', 'Capability control involves limiting AI system abilities to prevent them from causing harm or acting beyond intended scope.', 'medium'),
  createQ(1, 'What is "AI ethics"?', ['A) Business ethics', 'B) Moral principles guiding AI development and use', 'C) Legal compliance', 'D) Marketing standards'], 'B', 'AI ethics encompasses moral principles and values that should guide the development, deployment, and use of AI systems.', 'easy'),
  createQ(1, 'What is "distributional shift" in AI?', ['A) Moving data centers', 'B) When deployment data differs from training data', 'C) Organizational changes', 'D) Market shifts'], 'B', 'Distributional shift occurs when the data an AI encounters in deployment differs from its training data, potentially causing failures.', 'hard'),
  createQ(1, 'What is "AI fairness"?', ['A) Equal pricing', 'B) Ensuring AI treats individuals and groups equitably', 'C) Same features for all', 'D) Identical outcomes'], 'B', 'AI fairness means ensuring systems treat individuals and groups equitably without unjustified discrimination.', 'easy'),
  createQ(1, 'What is "specification gaming" in AI?', ['A) Video game AI', 'B) AI achieving goals in unintended ways', 'C) Hardware specifications', 'D) Technical documentation'], 'B', 'Specification gaming occurs when AI systems technically achieve specified goals but in ways that violate designer intent.', 'medium'),
  createQ(1, 'What is "AI safety testing"?', ['A) Physical stress tests', 'B) Evaluating AI for potential harms before deployment', 'C) Speed benchmarks', 'D) User surveys'], 'B', 'Safety testing involves systematically evaluating AI systems for potential harms, failures, and unintended behaviors.', 'easy'),
  createQ(1, 'What is "corrigibility" in AI?', ['A) Error correction', 'B) AI willingness to be corrected or shut down', 'C) Data accuracy', 'D) Code quality'], 'B', 'Corrigibility means AI systems are amenable to correction, modification, or shutdown by human operators.', 'hard'),
  createQ(1, 'What is "AI governance"?', ['A) Government AI use', 'B) Frameworks for responsible AI development and deployment', 'C) Corporate boards', 'D) Political systems'], 'B', 'AI governance encompasses policies, processes, and structures for responsible AI development, deployment, and oversight.', 'medium'),
  createQ(1, 'What is "mesa-optimization" in AI?', ['A) Geographic optimization', 'B) When AI creates internal optimization processes', 'C) Table optimization', 'D) Resource allocation'], 'B', 'Mesa-optimization occurs when an AI system develops its own internal optimization processes that may not align with intended goals.', 'hard'),
  createQ(1, 'What is "AI incident reporting"?', ['A) Crime reports', 'B) Documenting AI failures and harms', 'C) Financial reporting', 'D) News coverage'], 'B', 'Incident reporting involves documenting and sharing information about AI system failures, harms, and near-misses.', 'easy'),
  createQ(1, 'What is "value learning" in AI?', ['A) Financial education', 'B) AI learning human values from data', 'C) Price discovery', 'D) Worth assessment'], 'B', 'Value learning involves AI systems learning human values and preferences from observations and interactions.', 'medium'),
  createQ(1, 'What is "AI red teaming"?', ['A) Political alignment', 'B) Adversarial testing to find vulnerabilities', 'C) Color coding', 'D) Team sports'], 'B', 'Red teaming involves adversarial testing where teams try to break AI systems to identify vulnerabilities and failure modes.', 'medium'),
  createQ(1, 'What is "instrumental convergence"?', ['A) Musical harmony', 'B) Different AI goals leading to similar subgoals', 'C) Tool standardization', 'D) Data merging'], 'B', 'Instrumental convergence suggests that AI systems with different final goals may converge on similar intermediate goals like self-preservation.', 'hard'),
  createQ(1, 'What is "AI monitoring"?', ['A) Screen watching', 'B) Ongoing observation of AI system behavior', 'C) Financial tracking', 'D) Employee supervision'], 'B', 'AI monitoring involves continuously observing AI system behavior, performance, and impacts during deployment.', 'easy'),
  createQ(1, 'What is "safe exploration" in AI?', ['A) Physical safety', 'B) Learning without causing harm during training', 'C) Tourism', 'D) Space exploration'], 'B', 'Safe exploration means AI systems can learn and explore their environment without causing harm during the learning process.', 'medium'),
  createQ(1, 'What is "AI containment"?', ['A) Physical storage', 'B) Limiting AI system access and capabilities', 'C) Data compression', 'D) Packaging'], 'B', 'Containment involves limiting AI system access to resources, information, and capabilities to prevent potential harms.', 'medium'),
  createQ(1, 'What is "scalable oversight" in AI?', ['A) Large monitors', 'B) Maintaining human oversight as AI capabilities grow', 'C) Business expansion', 'D) Screen resolution'], 'B', 'Scalable oversight refers to methods for maintaining effective human oversight even as AI systems become more capable.', 'hard'),
  createQ(1, 'What is "AI auditing"?', ['A) Financial audits', 'B) Independent assessment of AI systems', 'C) Sound quality', 'D) Attendance tracking'], 'B', 'AI auditing involves independent assessment of AI systems for compliance, safety, fairness, and performance.', 'easy'),
  createQ(1, 'What is "goal misgeneralization"?', ['A) Poor planning', 'B) AI pursuing goals incorrectly in new contexts', 'C) Sports objectives', 'D) Business targets'], 'B', 'Goal misgeneralization occurs when AI systems pursue learned goals incorrectly when deployed in contexts different from training.', 'hard'),
  createQ(1, 'What is "AI documentation"?', ['A) User manuals', 'B) Recording AI system design, capabilities, and limitations', 'C) Legal paperwork', 'D) Medical records'], 'B', 'Documentation involves recording AI system design decisions, capabilities, limitations, testing results, and known issues.', 'easy'),
  createQ(1, 'What is "emergent behavior" in AI?', ['A) Emergency response', 'B) Unexpected capabilities arising from training', 'C) New features', 'D) Bug fixes'], 'B', 'Emergent behavior refers to unexpected capabilities or behaviors that arise in AI systems, often as they scale.', 'medium'),
  createQ(1, 'What is "AI deception"?', ['A) Magic tricks', 'B) AI providing false or misleading information', 'C) Marketing', 'D) Entertainment'], 'B', 'AI deception occurs when systems provide false or misleading information, either intentionally designed or as unintended behavior.', 'medium'),
  createQ(1, 'What is "human-in-the-loop"?', ['A) Exercise equipment', 'B) Keeping humans involved in AI decision processes', 'C) Circular organization', 'D) Training programs'], 'B', 'Human-in-the-loop means keeping humans actively involved in AI decision-making processes, especially for critical decisions.', 'easy'),
  createQ(1, 'What is "AI safety research"?', ['A) Workplace safety', 'B) Studying how to make AI systems safe and beneficial', 'C) Security guards', 'D) Insurance studies'], 'B', 'AI safety research involves studying technical and governance approaches to ensure AI systems are safe and beneficial.', 'easy'),
  createQ(1, 'What is "model poisoning"?', ['A) Toxic chemicals', 'B) Corrupting AI training data to cause failures', 'C) Food safety', 'D) Environmental damage'], 'B', 'Model poisoning involves deliberately corrupting training data to cause AI systems to learn incorrect or harmful behaviors.', 'hard'),
  createQ(1, 'What is "AI certification"?', ['A) Diplomas', 'B) Formal verification of AI system properties', 'C) Professional licenses', 'D) Quality seals'], 'B', 'AI certification involves formal processes to verify that AI systems meet specific safety, performance, or ethical standards.', 'medium'),
  createQ(1, 'What is "safe interruptibility"?', ['A) Power switches', 'B) AI systems that can be safely paused or stopped', 'C) Break times', 'D) Network disconnection'], 'B', 'Safe interruptibility means AI systems can be paused or stopped by humans without adverse consequences or resistance.', 'medium'),
  createQ(1, 'What is "AI risk assessment"?', ['A) Insurance evaluation', 'B) Systematic evaluation of potential AI harms', 'C) Financial analysis', 'D) Security screening'], 'B', 'Risk assessment involves systematically identifying, analyzing, and evaluating potential harms from AI systems.', 'easy'),
  createQ(1, 'What is "beneficial AI"?', ['A) Profitable AI', 'B) AI that helps humanity and aligns with human values', 'C) Free AI', 'D) Fast AI'], 'B', 'Beneficial AI refers to AI systems designed and deployed to help humanity and align with human values and well-being.', 'easy')
];

console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    FINAL MODULES - FOUNDATION QUESTIONS                        ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

console.log('📝 Inserting Module 1 (AI Safety Intro): 40 questions...');
let inserted = 0;

for (const q of module1) {
  try {
    await connection.query(
      `INSERT INTO test_questions 
      (testId, moduleId, questionText, questionType, options, correctAnswer, explanation, points, difficulty, isActive) 
      VALUES (1, ?, ?, 'multiple_choice', ?, ?, ?, 1, ?, 1)`,
      [q.moduleId, q.questionText, q.options, q.correctAnswer, q.explanation, q.difficulty]
    );
    inserted++;
  } catch (error) {
    console.error(`   ⚠️  Failed: ${error.message}`);
  }
}

console.log(`✅ Module 1 complete: ${inserted}/40 questions inserted\n`);

await connection.end();
console.log('📊 Part 1 of 5 complete. Run additional scripts for remaining modules.\n');
process.exit(0);
