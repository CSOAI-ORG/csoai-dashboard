/**
 * Comprehensive Course and Question Seeding Script
 * Seeds 280+ new exam questions and updates course content for £500-level certification
 * Run with: pnpm tsx scripts/seed-comprehensive-courses.mjs
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const QUESTION_DATA_DIR = '/home/ubuntu/coai-dashboard/question-data';

// Framework to module code mapping
const FRAMEWORK_MODULE_MAP = {
  'EU_AI_ACT': 'EU_AI_ACT',
  'NIST_AI_RMF': 'NIST_RMF',
  'ISO_42001': 'ISO_42001',
  'UK_AI_BILL': 'UK_AI_BILL',
  'CANADA_AIDA': 'CANADA_AIDA',
  'AUSTRALIA_AI': 'AUSTRALIA_AI',
  'TC260': 'TC260',
  'ETHICS_INCIDENTS': 'ETHICS'
};

async function main() {
  console.log('🚀 Starting comprehensive course and question seeding...\n');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Get the main certification test ID (using correct column name isActive)
    const [tests] = await connection.execute(
      'SELECT id FROM certification_tests WHERE isActive = 1 LIMIT 1'
    );
    
    if (tests.length === 0) {
      console.log('Creating new certification test...');
      await connection.execute(`
        INSERT INTO certification_tests (code, title, description, passingScore, timeLimitMinutes, totalQuestions, isActive)
        VALUES ('CSOAI_ANALYST', 'CSOAI AI Safety Analyst Certification', 'Comprehensive certification exam for AI Safety Analysts covering all major regulatory frameworks', 70, 120, 50, 1)
      `);
      const [newTests] = await connection.execute('SELECT LAST_INSERT_ID() as id');
      tests.push({ id: newTests[0].id });
    }
    
    const testId = tests[0].id;
    console.log(`Using test ID: ${testId}`);
    
    // Get existing module IDs
    const [modules] = await connection.execute('SELECT id, code FROM training_modules');
    const moduleMap = new Map(modules.map(m => [m.code, m.id]));
    console.log(`Found ${modules.length} existing modules`);
    
    // Create modules for new frameworks if they don't exist
    const newFrameworks = [
      { code: 'UK_AI_BILL', title: 'UK AI Bill & AI Safety Institute', description: 'UK approach to AI regulation including AI Safety Institute framework' },
      { code: 'CANADA_AIDA', title: 'Canada AIDA (AI and Data Act)', description: 'Canadian AI legislation under Bill C-27' },
      { code: 'AUSTRALIA_AI', title: 'Australia AI Ethics Framework', description: 'Australian AI Ethics Principles and Voluntary Safety Standard' },
      { code: 'ETHICS', title: 'AI Ethics & Incident Analysis', description: 'Ethical AI principles and incident investigation methodology' }
    ];
    
    for (const fw of newFrameworks) {
      if (!moduleMap.has(fw.code)) {
        console.log(`Creating module: ${fw.code}`);
        await connection.execute(
          'INSERT INTO training_modules (code, title, description, content, orderIndex, durationMinutes, isRequired, isActive) VALUES (?, ?, ?, ?, ?, ?, 1, 1)',
          [fw.code, fw.title, fw.description, `Comprehensive training on ${fw.title}`, modules.length + 1, 240]
        );
        const [newModule] = await connection.execute('SELECT LAST_INSERT_ID() as id');
        moduleMap.set(fw.code, newModule[0].id);
      }
    }
    
    // Read and insert questions from all JSON files
    const questionFiles = fs.readdirSync(QUESTION_DATA_DIR).filter(f => f.endsWith('.json'));
    let totalInserted = 0;
    let totalSkipped = 0;
    
    for (const file of questionFiles) {
      const filePath = path.join(QUESTION_DATA_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Skip empty or invalid files
      if (content.trim().length < 10) {
        console.log(`Skipping empty file: ${file}`);
        continue;
      }
      
      let questions;
      try {
        questions = JSON.parse(content);
      } catch (e) {
        console.log(`Skipping invalid JSON file: ${file}`);
        continue;
      }
      
      if (!Array.isArray(questions) || questions.length === 0) {
        console.log(`Skipping file with no questions: ${file}`);
        continue;
      }
      
      const framework = questions[0].category || 'GENERAL';
      console.log(`\nProcessing ${file}: ${questions.length} questions for ${framework}`);
      
      // Map framework to module
      const moduleCode = FRAMEWORK_MODULE_MAP[framework] || framework;
      const moduleId = moduleMap.get(moduleCode) || null;
      
      for (const q of questions) {
        // Check if question already exists (by text similarity)
        const [existing] = await connection.execute(
          'SELECT id FROM test_questions WHERE questionText LIKE ? LIMIT 1',
          [`%${q.questionText.substring(0, 100)}%`]
        );
        
        if (existing.length > 0) {
          totalSkipped++;
          continue;
        }
        
        // Insert new question
        try {
          await connection.execute(
            `INSERT INTO test_questions 
             (testId, moduleId, questionText, questionType, options, correctAnswer, explanation, points, difficulty, isActive)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              testId,
              moduleId,
              q.questionText,
              q.questionType || 'multiple_choice',
              JSON.stringify(q.options),
              q.correctAnswer,
              q.explanation || '',
              q.points || 1,
              q.difficulty || 'medium'
            ]
          );
          totalInserted++;
        } catch (err) {
          console.log(`Error inserting question: ${err.message}`);
        }
      }
    }
    
    console.log(`\n✅ Seeding complete!`);
    console.log(`   Questions inserted: ${totalInserted}`);
    console.log(`   Questions skipped (duplicates): ${totalSkipped}`);
    
    // Get final counts
    const [[totalQuestions]] = await connection.execute('SELECT COUNT(*) as count FROM test_questions');
    const [[totalModules]] = await connection.execute('SELECT COUNT(*) as count FROM training_modules');
    
    console.log(`\n📊 Database totals:`);
    console.log(`   Total questions: ${totalQuestions.count}`);
    console.log(`   Total modules: ${totalModules.count}`);
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
