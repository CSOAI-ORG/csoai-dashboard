import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [certCols] = await connection.execute(`
  SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'certification_tests' AND TABLE_SCHEMA = DATABASE()
`);
console.log('certification_tests columns:', certCols.map(c => c.COLUMN_NAME).join(', '));

const [questionCols] = await connection.execute(`
  SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'test_questions' AND TABLE_SCHEMA = DATABASE()
`);
console.log('test_questions columns:', questionCols.map(c => c.COLUMN_NAME).join(', '));

const [moduleCols] = await connection.execute(`
  SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'training_modules' AND TABLE_SCHEMA = DATABASE()
`);
console.log('training_modules columns:', moduleCols.map(c => c.COLUMN_NAME).join(', '));

// Get existing test
const [tests] = await connection.execute('SELECT id, title FROM certification_tests LIMIT 1');
console.log('Existing test:', tests[0]);

await connection.end();
