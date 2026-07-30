-- Performance Optimization: Add indexes for frequently queried fields
-- This migration adds indexes to improve query performance across the COAI Dashboard

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscriptionTier);

-- Course enrollment indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_userId ON course_enrollments(userId);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_courseId ON course_enrollments(courseId);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_bundleId ON course_enrollments(bundleId);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_paymentStatus ON course_enrollments(paymentStatus);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_course ON course_enrollments(userId, courseId);

-- Lesson progress indexes
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_userId ON user_lesson_progress(userId);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lessonId ON user_lesson_progress(lessonId);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_courseId ON user_lesson_progress(courseId);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_lesson ON user_lesson_progress(userId, lessonId);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_status ON user_lesson_progress(status);

-- Quiz and test indexes
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_userId ON user_quiz_scores(userId);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_quizId ON user_quiz_scores(quizId);
CREATE INDEX IF NOT EXISTS idx_user_quiz_scores_user_quiz ON user_quiz_scores(userId, quizId);

CREATE INDEX IF NOT EXISTS idx_user_test_attempts_userId ON user_test_attempts(userId);
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_testId ON user_test_attempts(testId);
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_user_test ON user_test_attempts(userId, testId);
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_status ON user_test_attempts(status);

-- Forum indexes
CREATE INDEX IF NOT EXISTS idx_forum_threads_courseId ON forum_threads(courseId);
CREATE INDEX IF NOT EXISTS idx_forum_threads_userId ON forum_threads(userId);
CREATE INDEX IF NOT EXISTS idx_forum_threads_lastActivityAt ON forum_threads(lastActivityAt);

CREATE INDEX IF NOT EXISTS idx_forum_posts_threadId ON forum_posts(threadId);
CREATE INDEX IF NOT EXISTS idx_forum_posts_userId ON forum_posts(userId);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parentPostId ON forum_posts(parentPostId);

-- Watchdog analyst indexes
CREATE INDEX IF NOT EXISTS idx_analyst_assignments_analystId ON analyst_assignments(analystId);
CREATE INDEX IF NOT EXISTS idx_analyst_assignments_specialistId ON analyst_assignments(specialistId);
CREATE INDEX IF NOT EXISTS idx_analyst_assignments_status ON analyst_assignments(status);

CREATE INDEX IF NOT EXISTS idx_analyst_decisions_assignmentId ON analyst_decisions(assignmentId);
CREATE INDEX IF NOT EXISTS idx_analyst_decisions_analystId ON analyst_decisions(analystId);

CREATE INDEX IF NOT EXISTS idx_analyst_performance_analystId ON analyst_performance(analystId);

-- Certification indexes
CREATE INDEX IF NOT EXISTS idx_user_certifications_userId ON user_certifications(userId);
CREATE INDEX IF NOT EXISTS idx_user_certifications_certificationId ON user_certifications(certificationId);
CREATE INDEX IF NOT EXISTS idx_user_certifications_status ON user_certifications(status);

-- Watchdog application indexes
CREATE INDEX IF NOT EXISTS idx_watchdog_applications_email ON watchdog_applications(email);
CREATE INDEX IF NOT EXISTS idx_watchdog_applications_status ON watchdog_applications(status);

-- AI systems indexes
CREATE INDEX IF NOT EXISTS idx_ai_systems_userId ON ai_systems(userId);
CREATE INDEX IF NOT EXISTS idx_ai_systems_organizationId ON ai_systems(organizationId);
CREATE INDEX IF NOT EXISTS idx_ai_systems_status ON ai_systems(status);
CREATE INDEX IF NOT EXISTS idx_ai_systems_riskLevel ON ai_systems(riskLevel);

-- Compliance indexes
CREATE INDEX IF NOT EXISTS idx_compliance_reports_systemId ON compliance_reports(systemId);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_userId ON compliance_reports(userId);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON compliance_reports(status);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_forum_notifications_userId ON forum_notifications(userId);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_threadId ON forum_notifications(threadId);
CREATE INDEX IF NOT EXISTS idx_forum_notifications_isRead ON forum_notifications(isRead);

-- Coupon indexes
CREATE INDEX IF NOT EXISTS idx_coupon_usage_couponId ON coupon_usage(couponId);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_userId ON coupon_usage(userId);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_status ON course_enrollments(userId, paymentStatus);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_course_status ON user_lesson_progress(userId, courseId, status);
CREATE INDEX IF NOT EXISTS idx_forum_threads_course_activity ON forum_threads(courseId, lastActivityAt);
CREATE INDEX IF NOT EXISTS idx_analyst_assignments_analyst_status ON analyst_assignments(analystId, status);
