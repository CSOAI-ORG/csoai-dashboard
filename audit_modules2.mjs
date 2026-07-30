import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    TRAINING MODULES & EXAM QUESTIONS AUDIT                     ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

// Query directly with SQL
const modules = await connection.query('SELECT * FROM training_modules ORDER BY orderIndex');
const moduleRows = modules[0];

console.log(`Total Modules Found: ${moduleRows.length}\n`);
console.log('─'.repeat(80));

let totalQuestions = 0;
const moduleStats = [];

for (const module of moduleRows) {
  const questions = await connection.query('SELECT COUNT(*) as count FROM test_questions WHERE moduleId = ?', [module.id]);
  const count = questions[0][0].count;
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
console.log(`   Total Modules: ${moduleRows.length}`);
console.log(`   Total Questions: ${totalQuestions}`);
console.log(`   Average per Module: ${Math.round(totalQuestions / moduleRows.length)}`);
console.log(`   Modules Ready (50+): ${moduleStats.filter(m => m.questions >= 50).length}`);
console.log(`   Modules Need Work (<50): ${moduleStats.filter(m => m.questions < 50).length}`);
console.log('');

// Save to JSON file for reference
import { writeFileSync } from 'fs';
writeFileSync('/home/ubuntu/coai-dashboard/module_audit_results.json', JSON.stringify(moduleStats, null, 2));
console.log('✅ Results saved to module_audit_results.json\n');

await connection.end();
process.exit(0);
