import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Get email-related tables
  console.log('=== EMAIL-RELATED TABLES ===');
  const tables = await db.execute(sql`SHOW TABLES LIKE '%email%'`);
  console.log(tables[0]);
  
  // Count users with emails
  console.log('\n=== USER EMAIL COUNTS ===');
  const userCount = await db.execute(sql`SELECT COUNT(*) as total FROM users WHERE email IS NOT NULL`);
  console.log('Users with email:', userCount[0]);
  
  // Check for notification/email tables
  console.log('\n=== ALL EMAIL/NOTIFICATION TABLES ===');
  const allTables = await db.execute(sql`SHOW TABLES`);
  const tableNames = (allTables[0] as any[]).map(t => Object.values(t)[0] as string);
  const emailTables = tableNames.filter(t => 
    t.includes('email') || t.includes('sent') || t.includes('notification') || t.includes('subscriber')
  );
  console.log(emailTables);
  
  // Sample emails
  console.log('\n=== SAMPLE USER EMAILS (first 20) ===');
  const sampleEmails = await db.execute(sql`SELECT id, email, name, createdAt FROM users WHERE email IS NOT NULL LIMIT 20`);
  console.log(sampleEmails[0]);
  
  // Check email_subscribers table
  console.log('\n=== EMAIL SUBSCRIBERS COUNT ===');
  try {
    const subscriberCount = await db.execute(sql`SELECT COUNT(*) as total FROM email_subscribers`);
    console.log('Subscribers:', subscriberCount[0]);
  } catch (e) {
    console.log('email_subscribers table not found');
  }
  
  // Check sent_emails or email_logs
  console.log('\n=== SENT EMAILS/LOGS ===');
  for (const tableName of emailTables) {
    try {
      const count = await db.execute(sql.raw(`SELECT COUNT(*) as total FROM ${tableName}`));
      console.log(`${tableName}: ${(count[0] as any)[0]?.total || 0} records`);
    } catch (e) {
      console.log(`Error querying ${tableName}`);
    }
  }
  
  process.exit(0);
}

main().catch(console.error);
