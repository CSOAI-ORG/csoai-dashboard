import { getDb } from '../server/db.js';
import { courses, courseBundles } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const db = await getDb();

console.log('🧹 Cleaning existing courses and bundles...');

// Delete all existing courses and bundles
await db.delete(courseBundles);
await db.delete(courses);

console.log('✅ Cleaned database');

console.log('📚 Creating 7 regional modules...');

// Create 7 core regional modules
const moduleData = [
  {
    id: 100001,
    regionId: 1, // EU
    title: 'EU AI Act Fundamentals',
    description: 'Comprehensive training on the European Union AI Act, covering all risk categories, compliance requirements, and implementation strategies for organizations operating in the EU.',
    framework: 'EU AI Act',
    level: 'fundamentals',
    durationHours: 8,
    price: 49900, // £499
    active: 1,
  },
  {
    id: 100002,
    regionId: 2, // US
    title: 'NIST AI RMF Fundamentals',
    description: 'Master the NIST AI Risk Management Framework, the US standard for AI governance. Learn risk assessment, mitigation strategies, and compliance best practices.',
    framework: 'NIST AI RMF',
    level: 'fundamentals',
    durationHours: 8,
    price: 49900,
    active: 1,
  },
  {
    id: 100003,
    regionId: 3, // UK
    title: 'UK AI Safety Institute Framework',
    description: 'Learn the UK approach to AI safety through the AI Safety Institute framework. Covers testing, evaluation, and safety assurance for AI systems.',
    framework: 'UK AI Safety Institute',
    level: 'fundamentals',
    durationHours: 7,
    price: 49900,
    active: 1,
  },
  {
    id: 100004,
    regionId: 4, // Canada
    title: 'Canada AIDA Compliance',
    description: 'Understand Canada\'s Artificial Intelligence and Data Act (AIDA). Learn compliance requirements for AI systems deployed in Canadian markets.',
    framework: 'Canada AIDA',
    level: 'fundamentals',
    durationHours: 6,
    price: 49900,
    active: 1,
  },
  {
    id: 100005,
    regionId: 5, // Australia
    title: 'Australia AI Ethics Framework',
    description: 'Master Australia\'s AI Ethics Principles and governance framework. Learn responsible AI development and deployment practices for the Australian market.',
    framework: 'Australia AI Ethics',
    level: 'fundamentals',
    durationHours: 6,
    price: 49900,
    active: 1,
  },
  {
    id: 100006,
    regionId: 6, // International
    title: 'ISO 42001 International Standard',
    description: 'Comprehensive training on ISO/IEC 42001, the international standard for AI management systems. Learn implementation, certification, and continuous improvement.',
    framework: 'ISO 42001',
    level: 'fundamentals',
    durationHours: 9,
    price: 49900,
    active: 1,
  },
  {
    id: 100007,
    regionId: 7, // China
    title: 'China TC260 AI Framework',
    description: 'Learn China\'s TC260 AI governance framework and compliance requirements. Essential for organizations operating AI systems in Chinese markets.',
    framework: 'China TC260',
    level: 'fundamentals',
    durationHours: 7,
    price: 49900,
    active: 1,
  },
];

for (const module of moduleData) {
  await db.insert(courses).values(module);
  console.log(`✅ Created: ${module.title}`);
}

console.log('\n📦 Creating course bundles...');

// Create bundles
const bundleData = [
  {
    id: 200001,
    title: 'Foundation Bundle - 3 Core Frameworks',
    description: 'Master the three most important AI safety frameworks: EU AI Act, NIST AI RMF, and ISO 42001. Perfect for beginners.',
    bundlePrice: 99900, // £999
    regularPrice: 149700, // £1,497 (3 x £499)
    savings: 49800, // £498 off
    active: 1,
    courseIds: [100001, 100002, 100006], // EU, NIST, ISO
  },
  {
    id: 200002,
    title: 'Complete Certification - All 7 Modules',
    description: 'The ultimate AI safety certification covering ALL regional frameworks. Become a globally recognized AI safety expert.',
    bundlePrice: 199900, // £1,999
    regularPrice: 349300, // £3,493 (7 x £499)
    savings: 149400, // £1,494 off
    active: 1,
    courseIds: [100001, 100002, 100003, 100004, 100005, 100006, 100007],
  },
];

for (const bundle of bundleData) {
  const { courseIds, ...bundleWithoutCourses } = bundle;
  
  // Insert bundle with courseIds as JSON
  const bundleToInsert = {
    ...bundleWithoutCourses,
    regionId: 1, // Global
    name: bundle.title,
    courseIds: JSON.stringify(courseIds),
  };
  
  await db.insert(courseBundles).values(bundleToInsert);
  console.log(`✅ Created bundle: ${bundle.title}`);
  console.log(`   Linked ${courseIds.length} courses`);
}

console.log('\n✅ Database seeded successfully!');
console.log('\n📊 Summary:');
console.log('   - 7 regional modules @ £499 each');
console.log('   - Foundation Bundle (3 modules) @ £999');
console.log('   - Complete Certification (7 modules) @ £1,999');

process.exit(0);
