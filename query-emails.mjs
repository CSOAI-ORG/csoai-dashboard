import mysql from 'mysql2/promise';

const config = {
  host: process.env.TIDB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER || '3YJqWHKXPbZaRPi.root',
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE || 'test',
  ssl: { rejectUnauthorized: true }
};

async function main() {
  const connection = await mysql.createConnection(config);
  
  try {
    // Get email-related tables
    console.log('=== EMAIL-RELATED TABLES ===');
    const [tables] = await connection.execute("SHOW TABLES LIKE '%email%'");
    console.log(tables);
    
    // Count users with emails
    console.log('\n=== USER EMAIL COUNTS ===');
    const [userCount] = await connection.execute("SELECT COUNT(*) as total FROM users WHERE email IS NOT NULL");
    console.log('Users with email:', userCount[0].total);
    
    // Check for email_logs or sent_emails table
    console.log('\n=== CHECKING FOR SENT EMAIL RECORDS ===');
    const [allTables] = await connection.execute("SHOW TABLES");
    console.log('All tables:', allTables.map(t => Object.values(t)[0]).filter(t => t.includes('email') || t.includes('sent') || t.includes('notification')));
    
    // Sample emails
    console.log('\n=== SAMPLE USER EMAILS (first 10) ===');
    const [sampleEmails] = await connection.execute("SELECT id, email, name, createdAt FROM users WHERE email IS NOT NULL LIMIT 10");
    console.log(sampleEmails);
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
