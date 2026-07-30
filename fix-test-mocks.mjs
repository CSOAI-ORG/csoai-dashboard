#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllTestFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllTestFiles(filePath, arrayOfFiles);
    } else if (file.endsWith('.test.ts')) {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

const fullUserMock = `{
          id: testUserId,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user' as const,
          openId: 'test_user_openid',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        }`;

const files = getAllTestFiles('server/routers/__tests__');
let totalFixed = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    let originalContent = content;
    
    // Pattern 1: Simple user mock with just id, email, name, role
    const simpleUserPattern = /user:\s*\{\s*id:\s*\d+,\s*email:\s*['"][^'"]+['"],\s*name:\s*['"][^'"]+['"],\s*role:\s*['"]user['"]\s*\}/g;
    
    if (simpleUserPattern.test(content)) {
      // This is a simplified fix - in reality we'd need to preserve the actual values
      console.log(`Found simple user mocks in: ${file}`);
      // Skip for now as it needs more sophisticated parsing
    }
    
    if (content !== originalContent) {
      writeFileSync(file, content, 'utf-8');
      totalFixed++;
      console.log(`✓ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
}

console.log(`\n✓ Processed ${files.length} test files, fixed ${totalFixed} files`);
console.log(`\nNote: Some files may need manual fixes for complex mock patterns.`);
