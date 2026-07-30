import { drizzle } from "drizzle-orm/mysql2";
import * as dotenv from 'dotenv';

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

try {
  console.log('🔍 Checking test_questions table schema...\n');
  
  const schema = await db.execute('DESCRIBE test_questions');
  console.log('✅ Table columns:');
  schema[0].forEach(col => {
    console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
  });
  
  console.log('\n🔍 Checking if testId column exists...');
  const hasTestId = schema[0].some(col => col.Field === 'testId');
  console.log(hasTestId ? '✅ testId column EXISTS' : '❌ testId column MISSING');
  
  console.log('\n🔍 Sample question data:');
  const sample = await db.execute('SELECT id, questionText, questionType, testId, isActive FROM test_questions LIMIT 3');
  sample[0].forEach((q, i) => {
    console.log(`\n${i+1}. ID: ${q.id} | testId: ${q.testId} | type: ${q.questionType} | active: ${q.isActive}`);
    console.log(`   ${q.questionText?.substring(0, 80)}...`);
  });
  
  console.log('\n🔍 Checking certification_tests table...');
  const tests = await db.execute('SELECT id, title, isActive FROM certification_tests LIMIT 5');
  console.log(`✅ Found ${tests[0].length} tests:`);
  tests[0].forEach(t => {
    console.log(`  - Test ID ${t.id}: ${t.title} (active: ${t.isActive})`);
  });
  
  console.log('\n🔍 Checking questions per test...');
  const questionCounts = await db.execute(`
    SELECT testId, COUNT(*) as count 
    FROM test_questions 
    WHERE isActive = 1 
    GROUP BY testId
  `);
  console.log('Questions per test:');
  questionCounts[0].forEach(row => {
    console.log(`  - Test ${row.testId}: ${row.count} questions`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

process.exit(0);
