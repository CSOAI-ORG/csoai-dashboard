import { db } from './server/db.js';

try {
  const result = await db.execute('SELECT COUNT(*) as count FROM test_questions');
  console.log('✅ Test questions count:', JSON.stringify(result[0]));
  
  const sample = await db.execute('SELECT id, question, category, difficulty FROM test_questions LIMIT 3');
  console.log('\n📝 Sample questions:');
  sample.forEach((q, i) => {
    console.log(`${i+1}. [${q.category}] ${q.question.substring(0, 80)}...`);
  });
} catch (error) {
  console.error('❌ Error:', error.message);
}

process.exit(0);
