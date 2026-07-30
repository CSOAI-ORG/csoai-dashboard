import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import { testQuestions } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const result = await db.select({ count: sql<number>`COUNT(*)` }).from(testQuestions);
console.log('Total questions in database:', result[0].count);
