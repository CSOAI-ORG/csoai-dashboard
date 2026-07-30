import { Resend } from 'resend';

async function main() {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not found in environment');
    process.exit(1);
  }
  
  const resend = new Resend(resendApiKey);
  
  console.log('=== RESEND EMAIL HISTORY ===\n');
  
  try {
    // Get emails sent
    console.log('Fetching sent emails from Resend...');
    const emails = await resend.emails.list();
    
    console.log('\n=== SENT EMAILS ===');
    console.log(`Total emails found: ${emails.data?.data?.length || 0}`);
    
    if (emails.data?.data && emails.data.data.length > 0) {
      console.log('\nRecent emails:');
      for (const email of emails.data.data.slice(0, 20)) {
        console.log(`\n- ID: ${email.id}`);
        console.log(`  To: ${email.to}`);
        console.log(`  Subject: ${email.subject}`);
        console.log(`  Created: ${email.created_at}`);
        console.log(`  Status: ${email.last_event || 'unknown'}`);
      }
    }
    
    // Get domains
    console.log('\n\n=== CONFIGURED DOMAINS ===');
    const domains = await resend.domains.list();
    console.log(domains.data);
    
    // Get API keys info
    console.log('\n\n=== API KEYS ===');
    const apiKeys = await resend.apiKeys.list();
    console.log(`API Keys configured: ${apiKeys.data?.data?.length || 0}`);
    
  } catch (error: any) {
    console.error('Error fetching from Resend:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
  
  process.exit(0);
}

main().catch(console.error);
