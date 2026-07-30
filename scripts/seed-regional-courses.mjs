/**
 * Seed 7 Regional AI Safety Courses
 * Each course is £499 and has its own certification
 * Run with: node scripts/seed-regional-courses.mjs
 */

import mysql from 'mysql2/promise';

const regionalCourses = [
  {
    regionId: 1,
    title: 'EU AI Act Fundamentals',
    description: 'Comprehensive training on the European Union AI Act, covering all risk categories, compliance requirements, and implementation strategies for organizations operating in the EU.',
    framework: 'EU_AI_ACT',
    level: 'fundamentals',
    durationHours: 8,
    price: 49900,
    modules: JSON.stringify([
      { title: 'Introduction to EU AI Act', durationMinutes: 60 },
      { title: 'Risk Classification System', durationMinutes: 90 },
      { title: 'High-Risk AI Requirements', durationMinutes: 120 },
      { title: 'Prohibited AI Practices', durationMinutes: 60 },
      { title: 'Compliance and Enforcement', durationMinutes: 90 },
      { title: 'Implementation Strategies', durationMinutes: 60 }
    ]),
    certificationRequired: 1,
    active: 1
  },
  {
    regionId: 2,
    title: 'NIST AI RMF Fundamentals',
    description: 'Master the NIST AI Risk Management Framework, the US standard for AI governance. Learn risk assessment, mitigation strategies, and compliance best practices.',
    framework: 'NIST_AI_RMF',
    level: 'fundamentals',
    durationHours: 8,
    price: 49900,
    modules: JSON.stringify([
      { title: 'NIST AI RMF Overview', durationMinutes: 60 },
      { title: 'GOVERN Function', durationMinutes: 90 },
      { title: 'MAP Function', durationMinutes: 90 },
      { title: 'MEASURE Function', durationMinutes: 90 },
      { title: 'MANAGE Function', durationMinutes: 90 },
      { title: 'Implementation and Best Practices', durationMinutes: 60 }
    ]),
    certificationRequired: 1,
    active: 1
  },
  {
    regionId: 3,
    title: 'UK AI Safety Institute Framework',
    description: 'Learn the UK approach to AI safety through the AI Safety Institute framework. Covers testing, evaluation, and safety assurance for AI systems.',
    framework: 'UK_AI_SAFETY',
    level: 'fundamentals',
    durationHours: 7,
    price: 49900,
    modules: JSON.stringify([
      { title: 'UK AI Regulation Landscape', durationMinutes: 60 },
      { title: 'AI Safety Institute Mission', durationMinutes: 60 },
      { title: 'Testing and Evaluation Methods', durationMinutes: 90 },
      { title: 'Safety Assurance Principles', durationMinutes: 90 },
      { title: 'UK-Specific Compliance', durationMinutes: 90 },
      { title: 'Case Studies and Applications', durationMinutes: 60 }
    ]),
    certificationRequired: 1,
    active: 1
  },
  {
    regionId: 4,
    title: 'Canada AIDA Compliance',
    description: 'Understand Canada\'s Artificial Intelligence and Data Act (AIDA). Learn compliance requirements for AI systems deployed in Canadian markets.',
    framework: 'CANADA_AIDA',
    level: 'fundamentals',
    durationHours: 6,
    price: 49900,
    modules: JSON.stringify([
      { title: 'Introduction to AIDA', durationMinutes: 60 },
      { title: 'High-Impact AI Systems', durationMinutes: 90 },
      { title: 'Risk Mitigation Requirements', durationMinutes: 90 },
      { title: 'Transparency and Accountability', durationMinutes: 60 },
      { title: 'Enforcement and Penalties', durationMinutes: 60 },
      { title: 'Implementation Roadmap', durationMinutes: 60 }
    ]),
    certificationRequired: 1,
    active: 1
  },
  {
    regionId: 5,
    title: 'Australia AI Ethics Framework',
    description: 'Master Australia\'s AI Ethics Principles and governance framework. Learn responsible AI development and deployment practices for the Australian market.',
    framework: 'AUSTRALIA_AI',
    level: 'fundamentals',
    durationHours: 6,
    price: 49900,
    modules: JSON.stringify([
      { title: 'Australian AI Ethics Principles', durationMinutes: 60 },
      { title: 'Voluntary AI Safety Standard', durationMinutes: 90 },
      { title: 'Privacy and Data Protection', durationMinutes: 90 },
      { title: 'Fairness and Non-Discrimination', durationMinutes: 60 },
      { title: 'Transparency and Explainability', durationMinutes: 60 },
      { title: 'Implementation Guidelines', durationMinutes: 60 }
    ]),
    certificationRequired: 1,
    active: 1
  },
  {
    regionId: 6,
    title: 'ISO 42001 International Standard',
    description: 'Comprehensive training on ISO/IEC 42001, the international standard for AI management systems. Learn implementation, certification, and continuous improvement.',
    framework: 'ISO_42001',
    level: 'fundamentals',
    durationHours: 9,
    price: 49900,
    modules: JSON.stringify([
      { title: 'Introduction to ISO 42001', durationMinutes: 60 },
      { title: 'AI Management System Requirements', durationMinutes: 120 },
      { title: 'Risk Management and Controls', durationMinutes: 90 },
      { title: 'Documentation and Records', durationMinutes: 90 },
      { title: 'Internal Audits and Reviews', durationMinutes: 60 },
      { title: 'Certification Process', durationMinutes: 60 },
      { title: 'Continuous Improvement', durationMinutes: 60 }
    ]),
    certificationRequired: 1,
    active: 1
  },
  {
    regionId: 7,
    title: 'China TC260 AI Framework',
    description: 'Learn China\'s TC260 AI governance framework and compliance requirements. Essential for organizations operating AI systems in Chinese markets.',
    framework: 'TC260',
    level: 'fundamentals',
    durationHours: 7,
    price: 49900,
    modules: JSON.stringify([
      { title: 'TC260 Overview and Structure', durationMinutes: 60 },
      { title: 'Three-Tier Risk Classification', durationMinutes: 90 },
      { title: 'AI Algorithm Registration', durationMinutes: 90 },
      { title: 'Data Security Requirements', durationMinutes: 90 },
      { title: 'Compliance and Auditing', durationMinutes: 60 },
      { title: 'Cross-Border Data Transfer', durationMinutes: 60 }
    ]),
    certificationRequired: 1,
    active: 1
  }
];

async function main() {
  console.log('🌍 Seeding 7 Regional AI Safety Courses...\n');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Check if courses already exist
    const [existing] = await connection.execute(
      'SELECT COUNT(*) as count FROM courses WHERE regionId BETWEEN 1 AND 7'
    );
    
    if (existing[0].count > 0) {
      console.log(`⚠️  Found ${existing[0].count} existing regional courses. Updating...`);
      
      // Update existing courses
      for (const course of regionalCourses) {
        await connection.execute(`
          UPDATE courses 
          SET title = ?, description = ?, framework = ?, level = ?, durationHours = ?, 
              price = ?, modules = ?, certificationRequired = ?, active = ?
          WHERE regionId = ?
        `, [
          course.title,
          course.description,
          course.framework,
          course.level,
          course.durationHours,
          course.price,
          course.modules,
          course.certificationRequired,
          course.active,
          course.regionId
        ]);
        console.log(`✅ Updated: ${course.title}`);
      }
    } else {
      console.log('📝 Inserting new regional courses...');
      
      // Insert new courses
      for (const course of regionalCourses) {
        await connection.execute(`
          INSERT INTO courses (regionId, title, description, framework, level, durationHours, price, modules, certificationRequired, active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          course.regionId,
          course.title,
          course.description,
          course.framework,
          course.level,
          course.durationHours,
          course.price,
          course.modules,
          course.certificationRequired,
          course.active
        ]);
        console.log(`✅ Inserted: ${course.title}`);
      }
    }
    
    // Verify the data
    const [courses] = await connection.execute(
      'SELECT regionId, title, framework, price FROM courses WHERE regionId BETWEEN 1 AND 7 ORDER BY regionId'
    );
    
    console.log('\n📊 Regional Courses Summary:');
    console.log('═'.repeat(80));
    courses.forEach(c => {
      console.log(`Region ${c.regionId}: ${c.title} (${c.framework}) - £${c.price}`);
    });
    console.log('═'.repeat(80));
    
    console.log('\n✨ Successfully seeded 7 regional courses!');
    console.log('💡 Each course has its own certification requirement.');
    
  } catch (error) {
    console.error('❌ Error seeding regional courses:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
