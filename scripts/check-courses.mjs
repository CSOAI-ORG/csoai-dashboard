import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Get courses by framework
const [courses] = await connection.execute(`
  SELECT framework, level, COUNT(*) as count, GROUP_CONCAT(title SEPARATOR ' | ') as titles
  FROM courses 
  GROUP BY framework, level 
  ORDER BY framework, level
`);

console.log('\n=== COURSES BY FRAMEWORK ===');
courses.forEach(c => {
  console.log(`${c.framework} (${c.level}): ${c.count} courses`);
});

// Get questions by category
const [questions] = await connection.execute(`
  SELECT 
    CASE 
      WHEN question_text LIKE '%EU AI Act%' THEN 'EU_AI_ACT'
      WHEN question_text LIKE '%NIST%' THEN 'NIST_RMF'
      WHEN question_text LIKE '%ISO 42001%' THEN 'ISO_42001'
      WHEN question_text LIKE '%TC260%' THEN 'TC260'
      ELSE 'OTHER'
    END as category,
    COUNT(*) as count
  FROM test_questions
  GROUP BY category
`);

console.log('\n=== QUESTIONS BY CATEGORY (estimated) ===');
questions.forEach(q => {
  console.log(`${q.category}: ${q.count} questions`);
});

// Get total counts
const [[totalCourses]] = await connection.execute('SELECT COUNT(*) as count FROM courses');
const [[totalQuestions]] = await connection.execute('SELECT COUNT(*) as count FROM test_questions');
const [[totalModules]] = await connection.execute('SELECT COUNT(*) as count FROM training_modules');

console.log('\n=== TOTALS ===');
console.log(`Total courses: ${totalCourses.count}`);
console.log(`Total questions: ${totalQuestions.count}`);
console.log(`Total training modules: ${totalModules.count}`);

await connection.end();
