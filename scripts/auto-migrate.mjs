#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('Starting automatic migration...');

const generate = spawn('pnpm', ['drizzle-kit', 'generate'], {
  cwd: projectRoot,
  stdio: ['pipe', 'inherit', 'inherit']
});

// Auto-answer all prompts with "create table" (first option)
generate.stdin.on('data', () => {
  // Ignore any data from stdin
});

// Simulate pressing Enter repeatedly to select default option
const interval = setInterval(() => {
  try {
    generate.stdin.write('\n');
  } catch (e) {
    // Process might have ended
  }
}, 500);

generate.on('close', (code) => {
  clearInterval(interval);
  if (code !== 0) {
    console.error(`Migration generation failed with code ${code}`);
    process.exit(code);
  }
  
  console.log('Migration files generated, now migrating...');
  
  const migrate = spawn('pnpm', ['drizzle-kit', 'migrate'], {
    cwd: projectRoot,
    stdio: 'inherit'
  });
  
  migrate.on('close', (migrateCode) => {
    if (migrateCode !== 0) {
      console.error(`Migration failed with code ${migrateCode}`);
      process.exit(migrateCode);
    }
    console.log('Migration completed successfully!');
  });
});
