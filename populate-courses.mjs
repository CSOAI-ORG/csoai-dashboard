/**
 * Populate Courses for COAI Dashboard
 * 
 * This script populates the database with production-ready courses for:
 * - EU AI Act (Fundamentals, Advanced, Specialist)
 * - NIST AI RMF (Fundamentals, Advanced, Specialist)
 * - ISO 42001 (Fundamentals, Advanced, Specialist)
 * - CEASA (Fundamentals)
 * 
 * Run with: node populate-courses.mjs
 */

import mysql from 'mysql2/promise';

const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coai_dashboard',
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }, // Enable SSL for TiDB Cloud
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Parse DATABASE_URL if provided (format: mysql://user:password@host:port/database)
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    connectionConfig.host = url.hostname;
    connectionConfig.user = url.username;
    connectionConfig.password = url.password;
    connectionConfig.database = url.pathname.slice(1);
    if (url.port) connectionConfig.port = parseInt(url.port);
    // Enable SSL for TiDB Cloud
    if (url.hostname.includes('tidbcloud.com')) {
      connectionConfig.ssl = { rejectUnauthorized: false };
    }
  } catch (e) {
    console.log('DATABASE_URL parsing failed, using individual env vars');
  }
}

const coursesData = [
  // EU AI Act Courses
  {
    regionId: 1,
    title: 'EU AI Act Fundamentals',
    description: 'Master the basics of the EU AI Act, the world\'s first comprehensive AI regulation. Learn risk classification, prohibited practices, high-risk requirements, and compliance timelines.',
    framework: 'EU AI Act',
    level: 'fundamentals',
    durationHours: 8,
    price: 49900,
    price3Month: 16900,
    price6Month: 8900,
    price12Month: 4900,
    stripePriceId: null,
    stripePriceId3Month: null,
    stripePriceId6Month: null,
    stripePriceId12Month: null,
    modules: JSON.stringify(['Module 1: Introduction', 'Module 2: Risk Classification', 'Module 3: Prohibited Practices', 'Module 4: High-Risk Requirements', 'Module 5: Compliance Timeline', 'Module 6: Provider Obligations', 'Module 7: Deployer Obligations', 'Module 8: Enforcement']),
    prerequisites: JSON.stringify([]),
    certificationRequired: 0,
    active: 1,
  },
  {
    regionId: 1,
    title: 'EU AI Act Advanced',
    description: 'Deep dive into advanced topics of the EU AI Act including transparency requirements, documentation, testing, and real-world compliance strategies.',
    framework: 'EU AI Act',
    level: 'advanced',
    durationHours: 12,
    price: 79900,
    price3Month: 26900,
    price6Month: 13900,
    price12Month: 7900,
    stripePriceId: null,
    stripePriceId3Month: null,
    stripePriceId6Month: null,
    stripePriceId12Month: null,
    modules: JSON.stringify(['Module 1: Transparency Requirements', 'Module 2: Documentation Standards', 'Module 3: Testing and Validation', 'Module 4: Conformity Assessment', 'Module 5: CE Marking', 'Module 6: Post-Market Monitoring', 'Module 7: Incident Reporting', 'Module 8: Penalties and Enforcement', 'Module 9: Case Studies', 'Module 10: Implementation Roadmap']),
    prerequisites: JSON.stringify(['EU AI Act Fundamentals']),
    certificationRequired: 0,
    active: 1,
  },
  {
    regionId: 1,
    title: 'EU AI Act Specialist',
    description: 'Expert-level course covering sector-specific applications, edge cases, and strategic compliance for organizations deploying high-risk AI systems.',
    framework: 'EU AI Act',
    level: 'specialist',
    durationHours: 16,
    price: 129900,
    price3Month: 43900,
    price6Month: 21900,
    price12Month: 12900,
    stripePriceId: null,
    stripePriceId3Month: null,
    stripePriceId6Month: null,
    stripePriceId12Month: null,
    modules: JSON.stringify(['Module 1: Sector-Specific Analysis', 'Module 2: Biometric Systems', 'Module 3: Predictive Policing', 'Module 4: Employment Screening', 'Module 5: Credit Scoring', 'Module 6: Edge Cases and Ambiguities', 'Module 7: International Compliance', 'Module 8: Supply Chain Management', 'Module 9: Governance Structures', 'Module 10: Risk Management Systems']),
    prerequisites: JSON.stringify(['EU AI Act Advanced']),
    certificationRequired: 1,
    active: 1,
  },
  // NIST AI RMF Courses
  {
    regionId: 2,
    title: 'NIST AI Risk Management Framework Fundamentals',
    description: 'Learn the NIST AI RMF approach to managing AI risks. Understand the four functions: MAP, MEASURE, MANAGE, and GOVERN.',
    framework: 'NIST AI RMF',
    level: 'fundamentals',
    durationHours: 8,
    price: 49900,
    price3Month: 16900,
    price6Month: 8900,
    price12Month: 4900,
    stripePriceId: null,
    stripePriceId3Month: null,
    stripePriceId6Month: null,
    stripePriceId12Month: null,
    modules: JSON.stringify(['Module 1: Introduction to NIST AI RMF', 'Module 2: MAP Function', 'Module 3: MEASURE Function', 'Module 4: MANAGE Function', 'Module 5: GOVERN Function', 'Module 6: Integration with NIST CSF', 'Module 7: Practical Applications', 'Module 8: Implementation Roadmap']),
    prerequisites: JSON.stringify([]),
    certificationRequired: 0,
    active: 1,
  },
  // ISO 42001 Courses
  {
    regionId: 3,
    title: 'ISO 42001 AI Management System Fundamentals',
    description: 'Master the ISO 42001 standard for AI management systems. Learn requirements, implementation, and certification.',
    framework: 'ISO 42001',
    level: 'fundamentals',
    durationHours: 8,
    price: 49900,
    price3Month: 16900,
    price6Month: 8900,
    price12Month: 4900,
    stripePriceId: null,
    stripePriceId3Month: null,
    stripePriceId6Month: null,
    stripePriceId12Month: null,
    modules: JSON.stringify(['Module 1: ISO 42001 Overview', 'Module 2: Management System Requirements', 'Module 3: Risk Assessment', 'Module 4: Controls and Mitigation', 'Module 5: Documentation', 'Module 6: Audit and Review', 'Module 7: Certification Process', 'Module 8: Continuous Improvement']),
    prerequisites: JSON.stringify([]),
    certificationRequired: 0,
    active: 1,
  },
  // CEASA Courses
  {
    regionId: 4,
    title: 'CEASA AI Safety Fundamentals',
    description: 'Comprehensive introduction to AI safety principles, techniques, and best practices.',
    framework: 'CEASA',
    level: 'fundamentals',
    durationHours: 10,
    price: 59900,
    price3Month: 19900,
    price6Month: 9900,
    price12Month: 5900,
    stripePriceId: null,
    stripePriceId3Month: null,
    stripePriceId6Month: null,
    stripePriceId12Month: null,
    modules: JSON.stringify(['Module 1: AI Safety Fundamentals', 'Module 2: Alignment Challenges', 'Module 3: Robustness and Reliability', 'Module 4: Transparency and Interpretability', 'Module 5: Safety Testing', 'Module 6: Governance and Oversight', 'Module 7: Industry Standards', 'Module 8: Future Challenges', 'Module 9: Case Studies', 'Module 10: Implementation Guide']),
    prerequisites: JSON.stringify([]),
    certificationRequired: 0,
    active: 1,
  },
];

async function populateCourses() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(connectionConfig);
    
    console.log('Connected successfully!');
    console.log(`Populating ${coursesData.length} courses...`);
    
    for (const course of coursesData) {
      try {
        const query = `
          INSERT INTO courses (
            regionId, title, description, framework, level, durationHours, price,
            price3Month, price6Month, price12Month, stripePriceId,
            stripePriceId3Month, stripePriceId6Month, stripePriceId12Month,
            modules, prerequisites, certificationRequired, active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          course.regionId,
          course.title,
          course.description,
          course.framework,
          course.level,
          course.durationHours,
          course.price,
          course.price3Month,
          course.price6Month,
          course.price12Month,
          course.stripePriceId,
          course.stripePriceId3Month,
          course.stripePriceId6Month,
          course.stripePriceId12Month,
          course.modules,
          course.prerequisites,
          course.certificationRequired,
          course.active,
        ];
        
        const [result] = await connection.execute(query, values);
        console.log(`✓ Created course: ${course.title} (ID: ${result.insertId})`);
      } catch (error) {
        console.error(`✗ Failed to create course "${course.title}":`, error.message);
      }
    }
    
    console.log('\nCourse population completed!');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

populateCourses();
