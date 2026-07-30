// Debug script to check enrollments
import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';

config();

async function main() {
  const conn = await createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });
  
  // Get all Admin users with their enrollment counts
  const [adminUsers] = await conn.execute(`
    SELECT u.id, u.name, u.email,
      (SELECT COUNT(*) FROM course_enrollments WHERE userId = u.id AND courseId IS NOT NULL) as courses,
      (SELECT COUNT(*) FROM course_enrollments WHERE userId = u.id AND bundleId IS NOT NULL) as bundles
    FROM users u 
    WHERE u.name LIKE '%Admin%' 
    ORDER BY u.id
  `);
  console.log('Admin users:', JSON.stringify(adminUsers, null, 2));
  
  // Get all bundle enrollments
  const [bundleEnrollments] = await conn.execute(`
    SELECT e.id, e.userId, e.bundleId, u.name as userName, b.name as bundleName
    FROM course_enrollments e
    JOIN users u ON e.userId = u.id
    LEFT JOIN course_bundles b ON e.bundleId = b.id
    WHERE e.bundleId IS NOT NULL
  `);
  console.log('Bundle enrollments:', JSON.stringify(bundleEnrollments, null, 2));
  
  await conn.end();
}

main().catch(console.error);
