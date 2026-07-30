import { drizzle } from "drizzle-orm/mysql2";
import * as dotenv from 'dotenv';

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

try {
  const result = await db.execute('SELECT COUNT(*) as count FROM test_questions');
  console.log('✅ Test questions in database:', result[0][0].count);
  
  if (result[0][0].count > 0) {
    const sample = await db.execute('SELECT id, question, category, difficulty FROM test_questions LIMIT 5');
    console.log('\n📝 Sample questions:');
    sample[0].forEach((q, i) => {
      console.log(`\n${i+1}. [${q.category}] [${q.difficulty}]`);
      console.log(`   ${q.question.substring(0, 100)}...`);
    });
  } else {
    console.log('\n⚠️  NO QUESTIONS FOUND - This is the problem!');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}

process.exit(0);
