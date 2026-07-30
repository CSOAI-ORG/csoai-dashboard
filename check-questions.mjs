import { db } from './server/db/index.js';

const result = await db.execute('SELECT COUNT(*) as count FROM test_questions');
console.log('Test questions count:', result[0]);

const sample = await db.execute('SELECT id, question, category FROM test_questions LIMIT 5');
console.log('\nSample questions:');
console.log(JSON.stringify(sample, null, 2));

process.exit(0);
