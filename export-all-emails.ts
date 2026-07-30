import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import * as fs from 'fs';

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  console.log('=== COMPREHENSIVE EMAIL EXPORT ===\n');
  
  // 1. Get all user emails
  console.log('1. EXPORTING USER EMAILS...');
  const userEmails = await db.execute(sql`SELECT id, email, name, createdAt FROM users WHERE email IS NOT NULL ORDER BY id`);
  const users = userEmails[0] as any[];
  console.log(`   Found ${users.length} users with emails`);
  
  // 2. Get newsletter subscribers
  console.log('\n2. EXPORTING NEWSLETTER SUBSCRIBERS...');
  const subscribers = await db.execute(sql`SELECT * FROM newsletter_subscribers ORDER BY id`);
  const subs = subscribers[0] as any[];
  console.log(`   Found ${subs.length} newsletter subscribers`);
  
  // 3. Get notifications
  console.log('\n3. EXPORTING NOTIFICATIONS...');
  const notifications = await db.execute(sql`SELECT * FROM notifications ORDER BY id`);
  const notifs = notifications[0] as any[];
  console.log(`   Found ${notifs.length} notifications`);
  
  // 4. Get email logs (sent emails)
  console.log('\n4. CHECKING EMAIL LOGS...');
  const emailLogs = await db.execute(sql`SELECT * FROM email_logs ORDER BY id LIMIT 100`);
  const logs = emailLogs[0] as any[];
  console.log(`   Found ${logs.length} email log entries`);
  
  // 5. Get email queue
  console.log('\n5. CHECKING EMAIL QUEUE...');
  const emailQueue = await db.execute(sql`SELECT * FROM email_queue ORDER BY id LIMIT 100`);
  const queue = emailQueue[0] as any[];
  console.log(`   Found ${queue.length} queued emails`);
  
  // 6. Get email workflows
  console.log('\n6. CHECKING EMAIL WORKFLOWS...');
  const workflows = await db.execute(sql`SELECT * FROM email_workflows ORDER BY id`);
  const wfs = workflows[0] as any[];
  console.log(`   Found ${wfs.length} email workflows`);
  
  // 7. Get email templates
  console.log('\n7. CHECKING EMAIL TEMPLATES...');
  const templates = await db.execute(sql`SELECT * FROM email_templates ORDER BY id`);
  const temps = templates[0] as any[];
  console.log(`   Found ${temps.length} email templates`);
  
  // 8. Check applications table for LOI emails
  console.log('\n8. CHECKING APPLICATIONS (LOI)...');
  let apps: any[] = [];
  try {
    const applications = await db.execute(sql`SELECT id, email, name, status, createdAt FROM applications ORDER BY id`);
    apps = applications[0] as any[];
    console.log(`   Found ${apps.length} applications`);
  } catch (e) {
    console.log('   Applications table not found');
  }
  
  // Export to JSON
  const exportData = {
    exportDate: new Date().toISOString(),
    summary: {
      totalUsers: users.length,
      totalSubscribers: subs.length,
      totalNotifications: notifs.length,
      totalEmailLogs: logs.length,
      totalEmailQueue: queue.length,
      totalWorkflows: wfs.length,
      totalTemplates: temps.length,
      totalApplications: apps.length,
    },
    users: users,
    newsletterSubscribers: subs,
    notifications: notifs,
    emailLogs: logs,
    emailQueue: queue,
    emailWorkflows: wfs,
    emailTemplates: temps,
    applications: apps,
  };
  
  fs.writeFileSync('/home/ubuntu/email-export.json', JSON.stringify(exportData, null, 2));
  console.log('\n=== EXPORT COMPLETE ===');
  console.log('Data saved to: /home/ubuntu/email-export.json');
  
  // Create CSV of all unique emails
  const allEmails = new Set<string>();
  users.forEach(u => u.email && allEmails.add(u.email));
  subs.forEach(s => s.email && allEmails.add(s.email));
  apps.forEach(a => a.email && allEmails.add(a.email));
  
  const emailList = Array.from(allEmails).join('\n');
  fs.writeFileSync('/home/ubuntu/all-emails.txt', emailList);
  console.log(`\nUnique emails exported: ${allEmails.size}`);
  console.log('Email list saved to: /home/ubuntu/all-emails.txt');
  
  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total unique emails: ${allEmails.size}`);
  console.log(`Users: ${users.length}`);
  console.log(`Newsletter subscribers: ${subs.length}`);
  console.log(`Applications: ${apps.length}`);
  
  process.exit(0);
}

main().catch(console.error);
