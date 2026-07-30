import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Get questions by module
const [byModule] = await connection.execute(`
  SELECT 
    tm.code as framework,
    tm.title as module_title,
    COUNT(tq.id) as question_count
  FROM test_questions tq
  LEFT JOIN training_modules tm ON tq.moduleId = tm.id
  GROUP BY tm.id, tm.code, tm.title
  ORDER BY question_count DESC
`);

console.log('\n=== QUESTIONS BY FRAMEWORK/MODULE ===');
byModule.forEach(m => {
  console.log(`${m.framework || 'UNASSIGNED'}: ${m.question_count} questions - ${m.module_title || 'No module'}`);
});

// Get questions by difficulty
const [byDifficulty] = await connection.execute(`
  SELECT difficulty, COUNT(*) as count
  FROM test_questions
  GROUP BY difficulty
`);

console.log('\n=== QUESTIONS BY DIFFICULTY ===');
byDifficulty.forEach(d => {
  console.log(`${d.difficulty}: ${d.count} questions`);
});

// Get total
const [[total]] = await connection.execute('SELECT COUNT(*) as count FROM test_questions');
console.log(`\n=== TOTAL: ${total.count} QUESTIONS ===`);

// Get modules
const [[modules]] = await connection.execute('SELECT COUNT(*) as count FROM training_modules');
console.log(`=== TOTAL: ${modules.count} TRAINING MODULES ===`);

// Get courses
const [[courses]] = await connection.execute('SELECT COUNT(*) as count FROM courses');
console.log(`=== TOTAL: ${courses.count} COURSES ===`);

await connection.end();
