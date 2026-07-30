#!/usr/bin/env node
/**
 * Apply Performance Indexes to Database
 * 
 * This script applies database indexes to improve query performance
 * across frequently accessed tables in the COAI Dashboard.
 */

import { readFileSync } from 'fs';
import { getDb } from './server/db.js';

async function applyIndexes() {
  console.log('🚀 Starting database index optimization...\n');
  
  try {
    // Get database connection
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    console.log('✓ Connected to database\n');
    
    // Read SQL file
    const sql = readFileSync('add-performance-indexes.sql', 'utf-8');
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} index creation statements\n`);
    
    // Execute each statement
    let successCount = 0;
    let skipCount = 0;
    
    for (const statement of statements) {
      try {
        // Extract index name for logging
        const indexMatch = statement.match(/idx_[\w_]+/);
        const indexName = indexMatch ? indexMatch[0] : 'unknown';
        
        await db.execute(statement);
        console.log(`✓ Created/verified index: ${indexName}`);
        successCount++;
      } catch (error) {
        // Check if error is because index already exists
        if (error.message && error.message.includes('already exists')) {
          skipCount++;
        } else {
          console.error(`✗ Error creating index: ${error.message}`);
        }
      }
    }
    
    console.log(`\n✅ Index optimization complete!`);
    console.log(`   - Successfully created/verified: ${successCount} indexes`);
    if (skipCount > 0) {
      console.log(`   - Skipped (already exists): ${skipCount} indexes`);
    }
    console.log('\n🎯 Database performance optimized for faster queries!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error applying indexes:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
applyIndexes();
