#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  multipleStatements: true
};

async function runMigrations() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection(config);
  
  try {
    const sqlFile = join(__dirname, 'migrate-regional-analytics.sql');
    const sql = readFileSync(sqlFile, 'utf8');
    
    console.log('Executing migrations...');
    await connection.query(sql);
    
    console.log('✓ All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
