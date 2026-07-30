/**
 * Test Data Seeding Script
 * 
 * This script creates consistent test data for enrollment and certification flow tests.
 * Run this before running e2e tests to ensure predictable test data.
 * 
 * Usage: npx tsx server/tests/seed-test-data.ts
 */

import { getDb } from '../db';
import { 
  users, 
  courses, 
  trainingModules, 
  certificationTests,
  userTestAttempts,
  userTrainingProgress,
  certificates,
  certificateIssuances,
  regions,
  courseEnrollments
} from '../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

// Test user configurations
const TEST_USERS = {
  newUser: {
    openId: 'test-new-user-' + Date.now(),
    name: 'Test New User',
    email: 'test-new@example.com',
    role: 'user' as const,
    subscriptionTier: 'free' as const,
  },
  enrolledUser: {
    openId: 'test-enrolled-user-' + Date.now(),
    name: 'Test Enrolled User',
    email: 'test-enrolled@example.com',
    role: 'user' as const,
    subscriptionTier: 'pro' as const,
  },
  certifiedUser: {
    openId: 'test-certified-user-' + Date.now(),
    name: 'Test Certified User',
    email: 'test-certified@example.com',
    role: 'user' as const,
    subscriptionTier: 'pro' as const,
  },
  adminUser: {
    openId: 'test-admin-user-' + Date.now(),
    name: 'Test Admin User',
    email: 'test-admin@example.com',
    role: 'admin' as const,
    subscriptionTier: 'enterprise' as const,
  },
};

// Test course configurations
const TEST_COURSES = [
  {
    title: 'AI Safety Fundamentals - Test Course',
    description: 'A test course for e2e testing of enrollment flows',
    framework: 'EU AI Act',
    level: 'fundamentals' as const,
    durationHours: 4,
    price: 0, // Free course for testing
    certificationRequired: 1,
    active: 1,
    regionId: 1,
  },
  {
    title: 'Advanced AI Governance - Test Course',
    description: 'A test course for paid enrollment testing',
    framework: 'NIST AI RMF',
    level: 'advanced' as const,
    durationHours: 8,
    price: 9900, // $99.00
    certificationRequired: 1,
    active: 1,
    regionId: 1,
  },
];

// Test training modules
const TEST_MODULES = [
  {
    code: 'TEST-MOD-001',
    title: 'Introduction to AI Safety Testing',
    description: 'Test module for e2e testing',
    content: '<h1>Test Module Content</h1><p>This is test content for automated testing.</p>',
    orderIndex: 1,
    durationMinutes: 15,
    isRequired: 1,
    isActive: 1,
  },
  {
    code: 'TEST-MOD-002',
    title: 'Risk Assessment Basics Testing',
    description: 'Second test module for e2e testing',
    content: '<h1>Risk Assessment</h1><p>Test content for risk assessment module.</p>',
    orderIndex: 2,
    durationMinutes: 20,
    isRequired: 1,
    isActive: 1,
  },
  {
    code: 'TEST-MOD-003',
    title: 'Compliance Framework Testing',
    description: 'Third test module for e2e testing',
    content: '<h1>Compliance</h1><p>Test content for compliance module.</p>',
    orderIndex: 3,
    durationMinutes: 25,
    isRequired: 1,
    isActive: 1,
  },
];

// Test certification test configuration
const TEST_CERTIFICATION = {
  code: 'TEST-CERT-001',
  title: 'AI Safety Foundation Certification - Test',
  description: 'Test certification exam for e2e testing',
  passingScore: 70,
  timeLimitMinutes: 30,
  totalQuestions: 10,
  isActive: 1,
};

// Test questions for certification
const TEST_QUESTIONS = [
  {
    question: 'What is the primary goal of AI safety?',
    options: JSON.stringify([
      'Maximize AI capabilities',
      'Ensure AI systems are beneficial and do not cause harm',
      'Reduce AI development costs',
      'Speed up AI deployment'
    ]),
    correctAnswer: 1,
    explanation: 'AI safety focuses on ensuring AI systems are beneficial and do not cause unintended harm.',
    difficulty: 'easy' as const,
    points: 10,
  },
  {
    question: 'Which framework is specifically designed for AI governance in the European Union?',
    options: JSON.stringify([
      'NIST AI RMF',
      'ISO 42001',
      'EU AI Act',
      'TC260'
    ]),
    correctAnswer: 2,
    explanation: 'The EU AI Act is the European Union\'s comprehensive framework for AI regulation.',
    difficulty: 'easy' as const,
    points: 10,
  },
  {
    question: 'What risk level requires the most stringent compliance measures under the EU AI Act?',
    options: JSON.stringify([
      'Minimal risk',
      'Limited risk',
      'High risk',
      'Unacceptable risk'
    ]),
    correctAnswer: 3,
    explanation: 'High-risk AI systems require the most stringent compliance measures, while unacceptable risk systems are prohibited.',
    difficulty: 'medium' as const,
    points: 10,
  },
  {
    question: 'What does PDCA stand for in continuous improvement?',
    options: JSON.stringify([
      'Plan, Design, Check, Act',
      'Plan, Do, Check, Act',
      'Prepare, Do, Control, Analyze',
      'Plan, Develop, Control, Assess'
    ]),
    correctAnswer: 1,
    explanation: 'PDCA stands for Plan, Do, Check, Act - a continuous improvement methodology.',
    difficulty: 'easy' as const,
    points: 10,
  },
  {
    question: 'Which of the following is NOT a key principle of responsible AI?',
    options: JSON.stringify([
      'Transparency',
      'Fairness',
      'Profit maximization',
      'Accountability'
    ]),
    correctAnswer: 2,
    explanation: 'Profit maximization is not a principle of responsible AI. Key principles include transparency, fairness, accountability, and safety.',
    difficulty: 'medium' as const,
    points: 10,
  },
];

interface SeedResult {
  users: Record<string, number>;
  courses: number[];
  modules: number[];
  certificationTestId: number;
  enrollments: number[];
  certificates: number[];
}

export async function seedTestData(): Promise<SeedResult> {
  console.log('🌱 Starting test data seeding...\n');
  
  const result: SeedResult = {
    users: {},
    courses: [],
    modules: [],
    certificationTestId: 0,
    enrollments: [],
    certificates: [],
  };

  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    // 1. Ensure test region exists
    console.log('📍 Setting up test region...');
    const existingRegion = await db.select().from(regions).where(eq(regions.code, 'TEST')).limit(1);
    let regionId: number;
    
    if (existingRegion.length === 0) {
      const regionResult = await db.insert(regions).values({
        code: 'TEST',
        name: 'Test Region',
        description: 'Region for automated testing',
        active: 1,
      });
      regionId = Number(regionResult[0].insertId);
      console.log(`  ✓ Created test region with ID: ${regionId}`);
    } else {
      regionId = existingRegion[0].id;
      console.log(`  ✓ Using existing test region with ID: ${regionId}`);
    }

    // 2. Create test users
    console.log('\n👤 Creating test users...');
    for (const [key, userData] of Object.entries(TEST_USERS)) {
      // Check if user already exists
      const existing = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
      
      if (existing.length > 0) {
        result.users[key] = existing[0].id;
        console.log(`  ✓ User "${key}" already exists with ID: ${existing[0].id}`);
      } else {
        const userResult = await db.insert(users).values(userData);
        const newUserId = Number(userResult[0].insertId);
        result.users[key] = newUserId;
        console.log(`  ✓ Created user "${key}" with ID: ${newUserId}`);
      }
    }

    // 3. Create test courses
    console.log('\n📚 Creating test courses...');
    for (const courseData of TEST_COURSES) {
      const existing = await db.select().from(courses).where(eq(courses.title, courseData.title)).limit(1);
      
      if (existing.length > 0) {
        result.courses.push(existing[0].id);
        console.log(`  ✓ Course "${courseData.title}" already exists with ID: ${existing[0].id}`);
      } else {
        const courseResult = await db.insert(courses).values({
          ...courseData,
          regionId,
        });
        const newCourseId = Number(courseResult[0].insertId);
        result.courses.push(newCourseId);
        console.log(`  ✓ Created course "${courseData.title}" with ID: ${newCourseId}`);
      }
    }

    // 4. Create test training modules
    console.log('\n📖 Creating test training modules...');
    for (const moduleData of TEST_MODULES) {
      const existing = await db.select().from(trainingModules).where(eq(trainingModules.code, moduleData.code)).limit(1);
      
      if (existing.length > 0) {
        result.modules.push(existing[0].id);
        console.log(`  ✓ Module "${moduleData.code}" already exists with ID: ${existing[0].id}`);
      } else {
        const moduleResult = await db.insert(trainingModules).values({
          ...moduleData,
          courseId: result.courses[0], // Link to first test course
        });
        const newModuleId = Number(moduleResult[0].insertId);
        result.modules.push(newModuleId);
        console.log(`  ✓ Created module "${moduleData.code}" with ID: ${newModuleId}`);
      }
    }

    // 5. Create test certification test
    console.log('\n🎓 Creating test certification...');
    const existingCert = await db.select().from(certificationTests).where(eq(certificationTests.code, TEST_CERTIFICATION.code)).limit(1);
    
    if (existingCert.length > 0) {
      result.certificationTestId = existingCert[0].id;
      console.log(`  ✓ Certification "${TEST_CERTIFICATION.code}" already exists with ID: ${existingCert[0].id}`);
    } else {
      const certTestResult = await db.insert(certificationTests).values(TEST_CERTIFICATION);
      result.certificationTestId = Number(certTestResult[0].insertId);
      console.log(`  ✓ Created certification "${TEST_CERTIFICATION.code}" with ID: ${result.certificationTestId}`);
    }

    // 6. Create enrollment for enrolled user
    console.log('\n📝 Creating test enrollments...');
    const enrolledUserId = result.users['enrolledUser'];
    const courseId = result.courses[0];
    
    const existingEnrollment = await db.select().from(courseEnrollments)
      .where(and(
        eq(courseEnrollments.userId, enrolledUserId),
        eq(courseEnrollments.courseId, courseId)
      )).limit(1);
    
    if (existingEnrollment.length > 0) {
      result.enrollments.push(existingEnrollment[0].id);
      console.log(`  ✓ Enrollment already exists with ID: ${existingEnrollment[0].id}`);
    } else {
      const enrollmentResult = await db.insert(courseEnrollments).values({
        userId: enrolledUserId,
        courseId: courseId,
        enrollmentType: 'course',
        paymentStatus: 'completed',
        amountPaid: 0,
        progress: 50,
        status: 'in_progress',
      });
      const newEnrollmentId = Number(enrollmentResult[0].insertId);
      result.enrollments.push(newEnrollmentId);
      console.log(`  ✓ Created enrollment with ID: ${newEnrollmentId}`);
    }

    // 7. Create training progress for enrolled user
    console.log('\n📊 Creating training progress...');
    for (let i = 0; i < result.modules.length; i++) {
      const moduleId = result.modules[i];
      const isCompleted = i < Math.floor(result.modules.length / 2); // Complete half the modules
      
      const existingProgress = await db.select().from(userTrainingProgress)
        .where(and(
          eq(userTrainingProgress.userId, enrolledUserId),
          eq(userTrainingProgress.moduleId, moduleId)
        )).limit(1);
      
      if (existingProgress.length === 0) {
        await db.insert(userTrainingProgress).values({
          userId: enrolledUserId,
          moduleId: moduleId,
          status: isCompleted ? 'completed' : 'in_progress',
          progressPercent: isCompleted ? 100 : 50,
          startedAt: new Date().toISOString(),
          completedAt: isCompleted ? new Date().toISOString() : null,
        });
        console.log(`  ✓ Created progress for module ${moduleId} (${isCompleted ? 'completed' : 'in progress'})`);
      }
    }

    // 8. Create completed certification for certified user
    console.log('\n🏆 Creating test certificate for certified user...');
    const certifiedUserId = result.users['certifiedUser'];
    const certificateId = `TEST-CERT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    const existingUserCert = await db.select().from(certificates)
      .where(eq(certificates.userId, certifiedUserId)).limit(1);
    
    if (existingUserCert.length > 0) {
      result.certificates.push(existingUserCert[0].id);
      console.log(`  ✓ Certificate already exists with ID: ${existingUserCert[0].id}`);
    } else {
      // Create test attempt (passed)
      const testAttemptResult = await db.insert(userTestAttempts).values({
        userId: certifiedUserId,
        testId: result.certificationTestId,
        score: 85,
        totalPoints: 100,
        percentScore: '85.00',
        passed: 1,
        answers: JSON.stringify({ '1': 1, '2': 2, '3': 3, '4': 1, '5': 2 }),
        completedAt: new Date().toISOString(),
      });
      const testAttemptId = Number(testAttemptResult[0].insertId);
      console.log(`  ✓ Created passed test attempt with ID: ${testAttemptId}`);

      // Create certificate
      const certResult = await db.insert(certificates).values({
        userId: certifiedUserId,
        certificateId: certificateId,
        courseName: TEST_COURSES[0].title,
        framework: TEST_COURSES[0].framework,
        studentName: TEST_USERS.certifiedUser.name,
        examScore: 85,
        certificationLevel: 'Foundation',
        isValid: 1,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      });
      const newCertId = Number(certResult[0].insertId);
      result.certificates.push(newCertId);
      console.log(`  ✓ Created certificate with ID: ${newCertId}`);
    }

    console.log('\n✅ Test data seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  - Users created: ${Object.keys(result.users).length}`);
    console.log(`  - Courses created: ${result.courses.length}`);
    console.log(`  - Modules created: ${result.modules.length}`);
    console.log(`  - Certification test ID: ${result.certificationTestId}`);
    console.log(`  - Enrollments created: ${result.enrollments.length}`);
    console.log(`  - Certificates created: ${result.certificates.length}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

export async function cleanupTestData(): Promise<void> {
  console.log('🧹 Cleaning up test data...\n');
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    // Delete in reverse order of dependencies
    
    // 1. Delete test certificates
    await db.delete(certificates).where(
      sql`${certificates.courseName} LIKE '%Test Course%'`
    );
    console.log('  ✓ Deleted test certificates');
    
    // 2. Delete test enrollments
    const testUserEmails = Object.values(TEST_USERS).map(u => u.email);
    const testUsers = await db.select({ id: users.id }).from(users)
      .where(sql`${users.email} IN (${testUserEmails.join(',')})`);
    
    if (testUsers.length > 0) {
      const testUserIds = testUsers.map(u => u.id);
      await db.delete(courseEnrollments).where(
        sql`${courseEnrollments.userId} IN (${testUserIds.join(',')})`
      );
      console.log('  ✓ Deleted test enrollments');
      
      // 3. Delete test progress
      await db.delete(userTrainingProgress).where(
        sql`${userTrainingProgress.userId} IN (${testUserIds.join(',')})`
      );
      console.log('  ✓ Deleted test training progress');
      
      // 4. Delete test attempts
      await db.delete(userTestAttempts).where(
        sql`${userTestAttempts.userId} IN (${testUserIds.join(',')})`
      );
      console.log('  ✓ Deleted test attempts');
    }
    
    // 5. Delete test modules
    await db.delete(trainingModules).where(
      sql`${trainingModules.code} LIKE 'TEST-MOD-%'`
    );
    console.log('  ✓ Deleted test modules');
    
    // 6. Delete test certification
    await db.delete(certificationTests).where(
      eq(certificationTests.code, TEST_CERTIFICATION.code)
    );
    console.log('  ✓ Deleted test certification');
    
    // 7. Delete test courses
    await db.delete(courses).where(
      sql`${courses.title} LIKE '%Test Course%'`
    );
    console.log('  ✓ Deleted test courses');
    
    // 8. Delete test users
    for (const userData of Object.values(TEST_USERS)) {
      await db.delete(users).where(eq(users.email, userData.email));
    }
    console.log('  ✓ Deleted test users');
    
    // 9. Delete test region
    await db.delete(regions).where(eq(regions.code, 'TEST'));
    console.log('  ✓ Deleted test region');
    
    console.log('\n✅ Test data cleanup completed!\n');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    throw error;
  }
}

// Export test data constants for use in tests
export const TEST_DATA = {
  users: TEST_USERS,
  courses: TEST_COURSES,
  modules: TEST_MODULES,
  certification: TEST_CERTIFICATION,
  questions: TEST_QUESTIONS,
};

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    cleanupTestData()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    seedTestData()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}
