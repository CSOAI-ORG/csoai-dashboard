import mysql from 'mysql2/promise';

const REGIONAL_FRAMEWORKS = [
  { id: 1, code: 'EU_AI_ACT', name: 'EU AI Act' },
  { id: 2, code: 'NIST_RMF', name: 'NIST AI RMF' },
  { id: 3, code: 'UK_AI_SAFETY', name: 'UK AI Safety Institute' },
  { id: 4, code: 'CANADA_AIDA', name: 'Canada AIDA' },
  { id: 5, code: 'AUSTRALIA_AI_ETHICS', name: 'Australia AI Ethics' },
  { id: 6, code: 'ISO_42001', name: 'ISO 42001' },
  { id: 7, code: 'CHINA_TC260', name: 'China TC260' },
];

async function seedRegionalAnalytics() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  console.log('Connected to database');

  try {
    // Seed certificate templates for each region
    console.log('Seeding certificate templates...');
    for (const framework of REGIONAL_FRAMEWORKS) {
      await connection.execute(`
        INSERT INTO certificate_templates (
          region_id, framework_code, template_name, brand_color,
          header_text, footer_text, compliance_statement,
          regulatory_body, watermark_text, signature_title, signature_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
      `, [
        framework.id,
        framework.code,
        `${framework.name} Certification Template`,
        '#3b82f6',
        `Certificate of Completion - ${framework.name}`,
        'This certificate verifies successful completion of the training program',
        `This certification is issued in compliance with ${framework.name} requirements`,
        framework.name,
        'VERIFIED',
        'Director of Certification',
        'Dr. Sarah Johnson'
      ]);
    }

    // Seed regional course enrollments
    console.log('Seeding regional course enrollments...');
    const enrollmentData = [];
    for (let i = 0; i < 100; i++) {
      const regionId = Math.floor(Math.random() * 7) + 1;
      const courseId = Math.floor(Math.random() * 5) + 1;
      const userId = Math.floor(Math.random() * 50) + 1;
      const status = ['active', 'completed', 'cancelled'][Math.floor(Math.random() * 3)];
      const progress = status === 'completed' ? 100 : Math.floor(Math.random() * 100);
      
      enrollmentData.push([
        userId,
        courseId,
        regionId,
        'paid',
        Math.floor(Math.random() * 500) + 100,
        'one_time',
        `pi_${Math.random().toString(36).substring(7)}`,
        status,
        new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        status === 'completed' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
        null,
        new Date().toISOString().slice(0, 19).replace('T', ' '),
        progress
      ]);
    }

    for (const data of enrollmentData) {
      await connection.execute(`
        INSERT INTO regional_course_enrollments (
          user_id, course_id, region_id, enrollment_type, payment_amount,
          payment_type, stripe_payment_id, status, enrolled_at, completed_at,
          expires_at, last_accessed_at, progress_percent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, data);
    }

    // Seed certificate issuances
    console.log('Seeding certificate issuances...');
    for (let i = 0; i < 50; i++) {
      const regionId = Math.floor(Math.random() * 7) + 1;
      const framework = REGIONAL_FRAMEWORKS.find(f => f.id === regionId);
      const courseId = Math.floor(Math.random() * 5) + 1;
      const userId = Math.floor(Math.random() * 50) + 1;
      const score = Math.floor(Math.random() * 30) + 70; // 70-100
      
      await connection.execute(`
        INSERT INTO certificate_issuances (
          user_id, course_id, region_id, certificate_id, certificate_number,
          certificate_type, framework_code, score, issued_at,
          download_count, verification_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        courseId,
        regionId,
        Math.floor(Math.random() * 1000) + 1,
        `${framework.code}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        `${framework.name} Professional Certification`,
        framework.code,
        score,
        new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 5)
      ]);
    }

    // Seed regional analytics
    console.log('Seeding regional analytics...');
    for (const framework of REGIONAL_FRAMEWORKS) {
      for (let day = 0; day < 30; day++) {
        const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
        const enrollmentCount = Math.floor(Math.random() * 20) + 5;
        const completionCount = Math.floor(enrollmentCount * (Math.random() * 0.4 + 0.3)); // 30-70% completion
        const certificateCount = Math.floor(completionCount * 0.9); // 90% get certificates
        
        await connection.execute(`
          INSERT INTO regional_analytics (
            region_id, date, enrollment_count, active_enrollment_count,
            completion_count, certificate_issued_count, average_completion_time,
            average_score, revenue, refund_count, dropout_count, average_progress_percent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          framework.id,
          date.toISOString().slice(0, 19).replace('T', ' '),
          enrollmentCount,
          Math.floor(enrollmentCount * 0.7),
          completionCount,
          certificateCount,
          Math.floor(Math.random() * 20 + 10) * 24 * 60 * 60, // 10-30 days in seconds
          Math.floor(Math.random() * 15) + 75, // 75-90 average score
          enrollmentCount * (Math.random() * 200 + 100), // $100-300 per enrollment
          Math.floor(Math.random() * 2),
          Math.floor(enrollmentCount * 0.1), // 10% dropout
          Math.floor(Math.random() * 30) + 50 // 50-80% average progress
        ]);
      }
    }

    // Seed module completion metrics
    console.log('Seeding module completion metrics...');
    for (const framework of REGIONAL_FRAMEWORKS) {
      for (let courseId = 1; courseId <= 5; courseId++) {
        for (let moduleId = 1; moduleId <= 8; moduleId++) {
          for (let day = 0; day < 7; day++) {
            const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
            const startedCount = Math.floor(Math.random() * 30) + 10;
            const completedCount = Math.floor(startedCount * (Math.random() * 0.3 + 0.5)); // 50-80% completion
            
            await connection.execute(`
              INSERT INTO module_completion_metrics (
                course_id, module_id, region_id, date, started_count,
                completed_count, average_time_spent, average_score,
                pass_rate, dropout_rate
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              courseId,
              moduleId,
              framework.id,
              date.toISOString().slice(0, 19).replace('T', ' '),
              startedCount,
              completedCount,
              Math.floor(Math.random() * 3600) + 1800, // 30-90 minutes
              Math.floor(Math.random() * 20) + 70, // 70-90 score
              (completedCount / startedCount) * 100,
              ((startedCount - completedCount) / startedCount) * 100
            ]);
          }
        }
      }
    }

    console.log('✅ Regional analytics data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedRegionalAnalytics().catch(console.error);
