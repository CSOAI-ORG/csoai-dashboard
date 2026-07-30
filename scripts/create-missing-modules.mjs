import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Create missing modules
const newModules = [
  { code: 'EU_AI_ACT', title: 'EU AI Act (Regulation 2024/1689)', description: 'Comprehensive training on EU AI Act covering risk classification, prohibited practices, high-risk requirements, transparency, and penalties' },
  { code: 'NIST_RMF', title: 'NIST AI Risk Management Framework', description: 'Training on NIST AI RMF covering GOVERN, MAP, MEASURE, MANAGE functions and trustworthy AI characteristics' },
  { code: 'ISO_42001', title: 'ISO/IEC 42001:2023 AI Management Systems', description: 'Training on ISO 42001 covering AI management system implementation, risk assessment, and continuous improvement' },
  { code: 'TC260', title: 'TC260 China AI Standards', description: 'Training on China AI governance including PIPL, algorithm registration, content moderation, and generative AI regulations' }
];

for (const mod of newModules) {
  const [existing] = await connection.execute(
    'SELECT id FROM training_modules WHERE code = ?',
    [mod.code]
  );
  
  if (existing.length === 0) {
    console.log(`Creating module: ${mod.code}`);
    await connection.execute(
      'INSERT INTO training_modules (code, title, description, content, orderIndex, durationMinutes, isRequired, isActive) VALUES (?, ?, ?, ?, ?, ?, 1, 1)',
      [mod.code, mod.title, mod.description, `Comprehensive training on ${mod.title}`, 10, 240]
    );
  } else {
    console.log(`Module ${mod.code} already exists`);
  }
}

// Now reassign questions
const [modules] = await connection.execute('SELECT id, code FROM training_modules');
const moduleMap = new Map(modules.map(m => [m.code, m.id]));

console.log('\nUpdated module map:', [...moduleMap.keys()]);

// Get unassigned questions
const [unassigned] = await connection.execute(
  'SELECT id, questionText FROM test_questions WHERE moduleId IS NULL'
);

console.log(`\nFound ${unassigned.length} unassigned questions to process`);

let assigned = 0;

for (const q of unassigned) {
  const text = q.questionText.toLowerCase();
  let moduleCode = null;
  
  if (text.includes('eu ai act') || text.includes('article 5') || text.includes('article 6') || 
      text.includes('prohibited ai') || text.includes('high-risk ai') || text.includes('conformity assessment') ||
      text.includes('ce marking') || text.includes('european ai office') || text.includes('regulation 2024')) {
    moduleCode = 'EU_AI_ACT';
  } else if (text.includes('nist') || text.includes('govern function') || text.includes('map function') ||
             text.includes('measure function') || text.includes('manage function') || text.includes('ai rmf') ||
             text.includes('trustworthy ai') || text.includes('risk management framework')) {
    moduleCode = 'NIST_RMF';
  } else if (text.includes('iso 42001') || text.includes('iso/iec 42001') || text.includes('clause 4') || 
             text.includes('clause 5') || text.includes('clause 6') || text.includes('clause 7') || 
             text.includes('clause 8') || text.includes('clause 9') || text.includes('clause 10') ||
             text.includes('ai management system') || text.includes('pdca cycle')) {
    moduleCode = 'ISO_42001';
  } else if (text.includes('tc260') || text.includes('china') || text.includes('pipl') ||
             text.includes('algorithm registration') || text.includes('deep synthesis') ||
             text.includes('chinese') || text.includes('cyberspace administration')) {
    moduleCode = 'TC260';
  }
  
  if (moduleCode && moduleMap.has(moduleCode)) {
    await connection.execute(
      'UPDATE test_questions SET moduleId = ? WHERE id = ?',
      [moduleMap.get(moduleCode), q.id]
    );
    assigned++;
  }
}

console.log(`\nAssigned ${assigned} more questions to modules`);

// Final verification
const [final] = await connection.execute(`
  SELECT 
    tm.code as framework,
    COUNT(tq.id) as question_count
  FROM test_questions tq
  LEFT JOIN training_modules tm ON tq.moduleId = tm.id
  GROUP BY tm.id, tm.code
  ORDER BY question_count DESC
`);

console.log('\n=== FINAL QUESTION DISTRIBUTION ===');
let total = 0;
final.forEach(m => {
  console.log(`${m.framework || 'UNASSIGNED'}: ${m.question_count} questions`);
  total += parseInt(m.question_count);
});
console.log(`\nTOTAL: ${total} questions`);

await connection.end();
