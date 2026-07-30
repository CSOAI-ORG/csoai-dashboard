#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      if (!file.includes('__tests__') && !file.startsWith('.')) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

const files = getAllFiles('server/routers');
let totalFixed = 0;

for (const file of files) {
  try {
    let content = readFileSync(file, 'utf-8');
    let originalContent = content;
    
    // Find all instances of "const db = await getDb();" and add null check if missing
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      newLines.push(lines[i]);
      
      // If this line has "const db = await getDb();"
      if (lines[i].includes('const db = await getDb();')) {
        // Check if next line already has the null check
        const nextLine = lines[i + 1] || '';
        if (!nextLine.includes('if (!db)')) {
          // Get the indentation from current line
          const indent = lines[i].match(/^(\s*)/)[1];
          // Add the null check
          newLines.push(`${indent}if (!db) throw new Error('Database not available');`);
        }
      }
    }
    
    content = newLines.join('\n');
    
    if (content !== originalContent) {
      writeFileSync(file, content, 'utf-8');
      totalFixed++;
      console.log(`✓ Fixed: ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
}

console.log(`\n✓ Fixed ${totalFixed} files`);
