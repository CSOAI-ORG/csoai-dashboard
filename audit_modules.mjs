import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { testQuestions, trainingModules } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    TRAINING MODULES & EXAM QUESTIONS AUDIT                     ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

const modules = await db.select().from(trainingModules).orderBy(trainingModules.orderIndex);

console.log(`Total Modules Found: ${modules.length}\n`);
console.log('─'.repeat(80));

let totalQuestions = 0;
const moduleStats = [];

for (const module of modules) {
  const questions = await db.select().from(testQuestions).where(eq(testQuestions.moduleId, module.id));
  const count = questions.length;
  totalQuestions += count;
  
  const status = count >= 50 ? '✅' : count >= 30 ? '⚠️ ' : '❌';
  const percentage = Math.round((count / 50) * 100);
  
  moduleStats.push({
    id: module.id,
    code: module.code,
    title: module.title,
    questions: count,
    status: status
  });
  
  console.log(`${status} Module ${module.id.toString().padStart(2)} | ${module.code.padEnd(20)} | ${count.toString().padStart(3)}/50 (${percentage}%)`);
  console.log(`   ${module.title}`);
  console.log('');
}

console.log('─'.repeat(80));
console.log(`\n📊 SUMMARY:`);
console.log(`   Total Modules: ${modules.length}`);
console.log(`   Total Questions: ${totalQuestions}`);
console.log(`   Average per Module: ${Math.round(totalQuestions / modules.length)}`);
console.log(`   Modules Ready (50+): ${moduleStats.filter(m => m.questions >= 50).length}`);
console.log(`   Modules Need Work (<50): ${moduleStats.filter(m => m.questions < 50).length}`);
console.log('');

await connection.end();
process.exit(0);
