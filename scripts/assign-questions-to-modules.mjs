import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Get all modules
const [modules] = await connection.execute('SELECT id, code FROM training_modules');
const moduleMap = new Map(modules.map(m => [m.code, m.id]));

console.log('Available modules:', [...moduleMap.keys()]);

// Get unassigned questions and try to assign based on content
const [unassigned] = await connection.execute(
  'SELECT id, questionText FROM test_questions WHERE moduleId IS NULL'
);

console.log(`\nFound ${unassigned.length} unassigned questions`);

let assigned = 0;

for (const q of unassigned) {
  const text = q.questionText.toLowerCase();
  let moduleCode = null;
  
  // Determine module based on question content
  if (text.includes('eu ai act') || text.includes('article 5') || text.includes('article 6') || 
      text.includes('prohibited ai') || text.includes('high-risk ai') || text.includes('conformity assessment') ||
      text.includes('ce marking') || text.includes('european ai office')) {
    moduleCode = 'EU_AI_ACT';
  } else if (text.includes('nist') || text.includes('govern function') || text.includes('map function') ||
             text.includes('measure function') || text.includes('manage function') || text.includes('ai rmf') ||
             text.includes('trustworthy ai')) {
    moduleCode = 'NIST_RMF';
  } else if (text.includes('iso 42001') || text.includes('clause 4') || text.includes('clause 5') ||
             text.includes('clause 6') || text.includes('clause 7') || text.includes('clause 8') ||
             text.includes('ai management system') || text.includes('pdca')) {
    moduleCode = 'ISO_42001';
  } else if (text.includes('tc260') || text.includes('china') || text.includes('pipl') ||
             text.includes('algorithm registration') || text.includes('deep synthesis') ||
             (text.includes('generative ai') && text.includes('china'))) {
    moduleCode = 'TC260';
  } else if (text.includes('uk ai') || text.includes('ai safety institute') || text.includes('aisi') ||
             text.includes('foundation model') || text.includes('sector regulator')) {
    moduleCode = 'UK_AI_BILL';
  } else if (text.includes('canada') || text.includes('aida') || text.includes('bill c-27') ||
             text.includes('high-impact ai') || text.includes('privacy commissioner')) {
    moduleCode = 'CANADA_AIDA';
  } else if (text.includes('australia') || text.includes('ai ethics principle') || 
             text.includes('indigenous data') || text.includes('voluntary ai safety')) {
    moduleCode = 'AUSTRALIA_AI';
  } else if (text.includes('ethics') || text.includes('bias') || text.includes('fairness') ||
             text.includes('incident') || text.includes('root cause')) {
    moduleCode = 'ETHICS';
  }
  
  if (moduleCode && moduleMap.has(moduleCode)) {
    await connection.execute(
      'UPDATE test_questions SET moduleId = ? WHERE id = ?',
      [moduleMap.get(moduleCode), q.id]
    );
    assigned++;
  }
}

console.log(`Assigned ${assigned} questions to modules`);

// Verify final counts
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
final.forEach(m => {
  console.log(`${m.framework || 'UNASSIGNED'}: ${m.question_count} questions`);
});

await connection.end();
