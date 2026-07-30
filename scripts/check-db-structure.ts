import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Get all courses with regions
const coursesWithRegions = await db.select({
  courseId: schema.courses.id,
  courseTitle: schema.courses.title,
  regionId: schema.courses.regionId,
  regionName: schema.courseRegions.name,
  regionCode: schema.courseRegions.code
}).from(schema.courses)
  .leftJoin(schema.courseRegions, schema.eq(schema.courses.regionId, schema.courseRegions.id));

console.log('Courses with Regions:');
console.log(JSON.stringify(coursesWithRegions, null, 2));

// Get training modules
const modules = await db.select().from(schema.trainingModules);
console.log('\nTraining Modules:');
console.log(JSON.stringify(modules, null, 2));

await connection.end();
