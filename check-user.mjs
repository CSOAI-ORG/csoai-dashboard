import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
  
  // Get user with 7 enrollments
  const [rows] = await conn.execute(`
    SELECT e.userId, u.name 
    FROM course_enrollments e 
    JOIN users u ON e.userId = u.id 
    WHERE e.courseId IS NOT NULL 
    GROUP BY e.userId, u.name 
    HAVING COUNT(*) = 7
  `);
  console.log('User with 7 enrollments:', JSON.stringify(rows, null, 2));
  
  // Get all bundle enrollments
  const [bundles] = await conn.execute(`
    SELECT e.id, e.userId, e.bundleId, u.name as userName, b.name as bundleName
    FROM course_enrollments e 
    JOIN users u ON e.userId = u.id 
    LEFT JOIN course_bundles b ON e.bundleId = b.id
    WHERE e.bundleId IS NOT NULL
  `);
  console.log('Bundle enrollments:', JSON.stringify(bundles, null, 2));
  
  await conn.end();
}

main().catch(console.error);
