import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, int, timestamp, mysqlEnum, json, varchar, text, decimal, char, foreignKey, tinyint, bigint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

// Re-export from schema-cohorts
export { cohorts, students, cohortCourses, studentCohortHistory } from './schema-cohorts';

// Re-export from schema-email-templates
export { emailTemplates, emailTemplateVersions, emailTemplatePreviews } from './schema-email-templates';



export const abAssignments = mysqlTable("ab_assignments", {
	id: int().autoincrement().notNull(),
	experimentId: int().notNull(),
	variantId: int().notNull(),
	studentId: int().notNull(),
	assignedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
	outcome: mysqlEnum(['success','failure','pending']).default('pending').notNull(),
	outcomeMetrics: json(),
},
(table) => [
	index("idx_experimentId").on(table.experimentId),
	index("idx_studentId").on(table.studentId),
	index("idx_variantId").on(table.variantId),
	index("unique_experiment_student").on(table.experimentId, table.studentId),
]);

export const abExperiments = mysqlTable("ab_experiments", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	hypothesis: text(),
	targetAudience: varchar({ length: 255 }),
	startDate: timestamp({ mode: 'string' }),
	endDate: timestamp({ mode: 'string' }),
	status: mysqlEnum(['draft','active','paused','completed']).default('draft').notNull(),
	successMetric: varchar({ length: 255 }),
	createdBy: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_status").on(table.status),
	index("idx_createdBy").on(table.createdBy),
]);

export const abTestResults = mysqlTable("ab_test_results", {
	id: int().autoincrement().notNull(),
	workflowId: int().notNull(),
	testName: varchar({ length: 255 }).notNull(),
	variantA: varchar({ length: 100 }).notNull(),
	variantB: varchar({ length: 100 }).notNull(),
	startDate: timestamp({ mode: 'string' }).notNull(),
	endDate: timestamp({ mode: 'string' }),
	status: mysqlEnum(['running','completed','paused']).default('running').notNull(),
	variantAsent: int().default(0).notNull(),
	variantAopened: int().default(0).notNull(),
	variantAclicked: int().default(0).notNull(),
	variantAconverted: int().default(0).notNull(),
	variantAopenRate: decimal({ precision: 5, scale: 2 }),
	variantAclickRate: decimal({ precision: 5, scale: 2 }),
	variantAconversionRate: decimal({ precision: 5, scale: 2 }),
	variantBsent: int().default(0).notNull(),
	variantBopened: int().default(0).notNull(),
	variantBclicked: int().default(0).notNull(),
	variantBconverted: int().default(0).notNull(),
	variantBopenRate: decimal({ precision: 5, scale: 2 }),
	variantBclickRate: decimal({ precision: 5, scale: 2 }),
	variantBconversionRate: decimal({ precision: 5, scale: 2 }),
	confidenceLevel: decimal({ precision: 5, scale: 2 }),
	pValue: decimal({ precision: 10, scale: 8 }),
	winner: mysqlEnum(['variant_a','variant_b','no_winner']),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_workflowId").on(table.workflowId),
	index("idx_status").on(table.status),
]);

export const abVariants = mysqlTable("ab_variants", {
	id: int().autoincrement().notNull(),
	experimentId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	interventionType: varchar({ length: 255 }),
	interventionContent: text(),
	weight: int().default(50).notNull(),
	isControl: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_experimentId").on(table.experimentId),
]);

export const adminMetrics = mysqlTable("admin_metrics", {
	id: int().autoincrement().notNull(),
	metricType: mysqlEnum(['websocket_connections','event_throughput','system_health','latency','error_rate']).notNull(),
	value: decimal({ precision: 10, scale: 2 }).notNull(),
	metadata: json(),
	recordedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_metricType_time").on(table.metricType, table.recordedAt),
	index("idx_recordedAt").on(table.recordedAt),
]);

export const agentVotes = mysqlTable("agent_votes", {
	id: int().autoincrement().notNull(),
	sessionId: int().notNull(),
	agentId: varchar({ length: 50 }).notNull(),
	agentType: mysqlEnum(['guardian','arbiter','scribe']).notNull(),
	agentProvider: mysqlEnum(['openai','anthropic','google','kimi','deepseek']).notNull(),
	vote: mysqlEnum(['approve','reject','escalate']).notNull(),
	confidence: decimal({ precision: 5, scale: 2 }),
	reasoning: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const aiSystems = mysqlTable("ai_systems", {
	id: int().autoincrement().notNull(),
	organizationId: int(),
	userId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	systemType: mysqlEnum(['chatbot','recommendation','classification','generation','analysis','other']).notNull(),
	riskLevel: mysqlEnum(['minimal','limited','high','unacceptable']).default('minimal').notNull(),
	status: mysqlEnum(['draft','active','under_review','compliant','non_compliant','archived']).default('draft').notNull(),
	deploymentDate: timestamp({ mode: 'string' }),
	lastAssessmentDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_ai_systems_userId").on(table.userId),
]);

export const analystAssignments = mysqlTable("analyst_assignments", {
	id: int().autoincrement().notNull(),
	analystId: int().notNull(),
	specialistId: int().notNull(),
	regionId: int().notNull(),
	industry: varchar({ length: 100 }),
	assignedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	status: mysqlEnum(['active','suspended','terminated']).default('active').notNull(),
	qualityScore: int().default(0),
	reportsCompleted: int().default(0).notNull(),
	averageTurnaroundHours: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_analyst_assignments_analystId").on(table.analystId),
]);

export const analystDecisions = mysqlTable("analyst_decisions", {
	id: int().autoincrement().notNull(),
	assignmentId: int().notNull(),
	analystId: int().notNull(),
	decision: mysqlEnum(['approve','reject','escalate','needs_more_info']).notNull(),
	confidence: mysqlEnum(['low','medium','high']).default('medium').notNull(),
	reasoning: text().notNull(),
	evidenceReviewed: json(),
	timeSpentMinutes: int(),
	submittedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const analystPerformance = mysqlTable("analyst_performance", {
	id: int().autoincrement().notNull(),
	analystId: int().notNull(),
	totalCasesAssigned: int().default(0).notNull(),
	totalCasesCompleted: int().default(0).notNull(),
	totalCasesExpired: int().default(0).notNull(),
	accuracyRate: decimal({ precision: 5, scale: 2 }),
	avgResponseTimeMinutes: decimal({ precision: 10, scale: 2 }),
	qualityScore: decimal({ precision: 5, scale: 2 }),
	rank: int(),
	totalEarnings: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
	lastActiveAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("analyst_performance_analystId_unique").on(table.analystId),
]);

export const apiKeys = mysqlTable("api_keys", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	keyPrefix: varchar({ length: 10 }).notNull(),
	keyHash: varchar({ length: 64 }).notNull(),
	tier: mysqlEnum(['free','pro','enterprise']).default('free').notNull(),
	permissions: json(),
	rateLimit: int().default(100).notNull(),
	lastUsedAt: timestamp({ mode: 'string' }),
	expiresAt: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const apiMetrics = mysqlTable("api_metrics", {
	id: int().autoincrement().notNull(),
	endpoint: varchar({ length: 255 }).notNull(),
	method: varchar({ length: 10 }).notNull(),
	responseTimeMs: int().notNull(),
	statusCode: int().notNull(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	userId: int(),
},
(table) => [
	index("idx_endpoint_metrics").on(table.endpoint),
	index("idx_timestamp_metrics").on(table.timestamp),
]);

export const assessmentItems = mysqlTable("assessment_items", {
	id: int().autoincrement().notNull(),
	assessmentId: int().notNull(),
	requirementId: int().notNull(),
	status: mysqlEnum(['not_started','in_progress','compliant','non_compliant','not_applicable']).default('not_started').notNull(),
	evidence: text(),
	notes: text(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const assessmentQuestions = mysqlTable("assessment_questions", {
	id: int().autoincrement().notNull(),
	assessmentId: int("assessment_id").notNull(),
	question: text().notNull(),
	options: json().notNull(),
	correctAnswer: int("correct_answer").notNull(),
	explanation: text(),
	difficulty: mysqlEnum(['easy','medium','hard']).default('medium').notNull(),
	points: int().default(1).notNull(),
	orderIndex: int("order_index").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_assessmentId").on(table.assessmentId),
]);

export const assessments = mysqlTable("assessments", {
	id: int().autoincrement().notNull(),
	aiSystemId: int().notNull(),
	frameworkId: int().notNull(),
	assessorId: int().notNull(),
	status: mysqlEnum(['pending','in_progress','completed','approved','rejected']).default('pending').notNull(),
	overallScore: decimal({ precision: 5, scale: 2 }),
	findings: text(),
	recommendations: text(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
	id: int().autoincrement().notNull(),
	userId: int(),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar({ length: 100 }).notNull(),
	entityId: int(),
	details: text(),
	ipAddress: varchar({ length: 45 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const badges = mysqlTable("badges", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	category: varchar({ length: 50 }).notNull(),
	icon: varchar({ length: 50 }),
	color: varchar({ length: 20 }),
	requirement: text(),
	points: int().default(0),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const caseAssignments = mysqlTable("case_assignments", {
	id: int().autoincrement().notNull(),
	analystId: int().notNull(),
	reportId: int().notNull(),
	councilSessionId: int(),
	priority: mysqlEnum(['low','medium','high','urgent']).default('medium').notNull(),
	status: mysqlEnum(['assigned','in_progress','completed','expired','reassigned']).default('assigned').notNull(),
	assignedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	dueAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
});

export const certificateIssuances = mysqlTable("certificate_issuances", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	courseId: int("course_id").notNull(),
	regionId: int("region_id").notNull(),
	certificateId: int("certificate_id").notNull(),
	certificateNumber: varchar("certificate_number", { length: 100 }).notNull(),
	certificateType: varchar("certificate_type", { length: 100 }).notNull(),
	frameworkCode: varchar("framework_code", { length: 50 }).notNull(),
	score: decimal({ precision: 5, scale: 2 }),
	issuedAt: timestamp("issued_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isRevoked: tinyint("is_revoked").default(0).notNull(),
	revokedAt: timestamp("revoked_at", { mode: 'string' }),
	revokedReason: text("revoked_reason"),
	downloadCount: int("download_count").default(0).notNull(),
	lastDownloadedAt: timestamp("last_downloaded_at", { mode: 'string' }),
	verificationCount: int("verification_count").default(0).notNull(),
	lastVerifiedAt: timestamp("last_verified_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_userId").on(table.userId),
	index("idx_courseId").on(table.courseId),
	index("idx_regionId").on(table.regionId),
	index("idx_certificateNumber").on(table.certificateNumber),
	index("idx_frameworkCode").on(table.frameworkCode),
	index("idx_issuedAt").on(table.issuedAt),
]);

export const certificateTemplates = mysqlTable("certificate_templates", {
	id: int().autoincrement().notNull(),
	regionId: int("region_id").notNull(),
	courseId: int("course_id"),
	frameworkCode: varchar("framework_code", { length: 50 }).notNull(),
	templateName: varchar("template_name", { length: 255 }).notNull(),
	logoUrl: varchar("logo_url", { length: 500 }),
	brandColor: varchar("brand_color", { length: 7 }).default('#3b82f6').notNull(),
	headerText: text("header_text"),
	footerText: text("footer_text"),
	complianceStatement: text("compliance_statement"),
	regulatoryBody: varchar("regulatory_body", { length: 255 }),
	watermarkText: varchar("watermark_text", { length: 100 }),
	signatureTitle: varchar("signature_title", { length: 100 }),
	signatureName: varchar("signature_name", { length: 100 }),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_regionId").on(table.regionId),
	index("idx_frameworkCode").on(table.frameworkCode),
	index("idx_courseId").on(table.courseId),
]);

export const certificates = mysqlTable("certificates", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	certificateId: varchar({ length: 100 }).notNull(),
	courseName: varchar({ length: 255 }).notNull(),
	framework: varchar({ length: 100 }),
	studentName: varchar({ length: 255 }).notNull(),
	completionDate: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	examScore: int(),
	certificationLevel: varchar({ length: 50 }).default('Foundation'),
	pdfUrl: varchar({ length: 500 }),
	verificationUrl: varchar({ length: 500 }),
	isValid: tinyint().default(1),
	expiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
},
(table) => [
	index("certificateId").on(table.certificateId),
]);

export const certificationTests = mysqlTable("certification_tests", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	passingScore: int().default(70).notNull(),
	timeLimitMinutes: int().default(60).notNull(),
	totalQuestions: int().default(50).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("certification_tests_code_unique").on(table.code),
]);

export const cohortStudents = mysqlTable("cohort_students", {
	id: int().autoincrement().notNull(),
	cohortId: int().notNull(),
	studentId: int().notNull(),
	enrolledAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	status: mysqlEnum(['active','completed','dropped']).default('active').notNull(),
},
(table) => [
	index("idx_cohortId").on(table.cohortId),
	index("idx_studentId").on(table.studentId),
	index("unique_cohort_student").on(table.cohortId, table.studentId),
]);

export const complianceReports = mysqlTable("compliance_reports", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	organizationId: int(),
	reportType: mysqlEnum(['compliance_summary','audit_history','enforcement_timeline','risk_analysis','certification_status']).notNull(),
	jurisdiction: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	data: json().notNull(),
	generatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	exportFormat: mysqlEnum(['pdf','excel','json']).default('pdf').notNull(),
	fileUrl: varchar({ length: 500 }),
	isScheduled: tinyint().default(0),
	scheduleFrequency: mysqlEnum(['daily','weekly','monthly','quarterly','annually']),
	nextScheduledDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_userId_reports").on(table.userId),
	index("idx_organizationId_reports").on(table.organizationId),
	index("idx_jurisdiction").on(table.jurisdiction),
	index("idx_createdAt_reports").on(table.createdAt),
]);

export const complianceRules = mysqlTable("compliance_rules", {
	id: int().autoincrement().notNull(),
	jurisdiction: varchar({ length: 50 }).notNull(),
	framework: varchar({ length: 100 }).notNull(),
	ruleCode: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	requirement: text().notNull(),
	severity: mysqlEnum(['info','warning','critical']).default('info').notNull(),
	category: varchar({ length: 100 }).notNull(),
	applicableToRiskLevel: mysqlEnum(['minimal','low','medium','high','prohibited']).notNull(),
	implementationGuidance: text(),
	evidenceRequired: json(),
	version: int().default(1),
	isActive: tinyint().default(1),
	effectiveDate: timestamp({ mode: 'string' }),
	deprecatedDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("unique_rule").on(table.jurisdiction, table.framework, table.ruleCode),
	index("idx_jurisdiction_rules").on(table.jurisdiction),
	index("idx_framework").on(table.framework),
	index("idx_category").on(table.category),
	index("idx_isActive").on(table.isActive),
]);

export const councilSessions = mysqlTable("council_sessions", {
	id: int().autoincrement().notNull(),
	subjectType: mysqlEnum(['watchdog_report','assessment','policy_proposal','system_review']).notNull(),
	subjectId: int().notNull(),
	subjectTitle: varchar({ length: 255 }).notNull(),
	subjectDescription: text(),
	status: mysqlEnum(['voting','consensus_reached','escalated_to_human','completed']).default('voting').notNull(),
	consensusThreshold: decimal({ precision: 5, scale: 2 }).default('0.67').notNull(),
	totalVotes: int().default(0).notNull(),
	approveVotes: int().default(0).notNull(),
	rejectVotes: int().default(0).notNull(),
	escalateVotes: int().default(0).notNull(),
	finalDecision: mysqlEnum(['approved','rejected','escalated']),
	humanReviewerId: int(),
	humanDecision: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
});

export const couponUsage = mysqlTable("coupon_usage", {
	id: int().autoincrement().notNull(),
	couponId: int().notNull(),
	userId: int().notNull(),
	orderId: int(),
	usedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_couponId").on(table.couponId),
	index("idx_userId").on(table.userId),
]);

export const coupons = mysqlTable("coupons", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).notNull(),
	description: varchar({ length: 255 }),
	discountType: varchar({ length: 20 }).notNull(),
	discountValue: decimal({ precision: 10, scale: 2 }).notNull(),
	maxUses: int().notNull(),
	usedCount: int().default(0).notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	active: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("code").on(table.code),
]);

export const courseBundles = mysqlTable("course_bundles", {
	id: int().autoincrement().notNull(),
	regionId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	courseIds: json().notNull(),
	regularPrice: int().notNull(),
	bundlePrice: int().notNull(),
	savings: int().notNull(),
	stripePriceId: varchar({ length: 255 }),
	active: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	bundlePrice3Month: int(),
	bundlePrice6Month: int(),
	bundlePrice12Month: int(),
	stripePriceId3Month: varchar({ length: 255 }),
	stripePriceId6Month: varchar({ length: 255 }),
	stripePriceId12Month: varchar({ length: 255 }),
});

export const courseCertificates = mysqlTable("course_certificates", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	courseId: int().notNull(),
	certificateId: varchar({ length: 100 }).notNull(),
	issuedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("certificateId").on(table.certificateId),
]);

export const courseEnrollments = mysqlTable("course_enrollments", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	courseId: int(),
	bundleId: int(),
	enrollmentType: varchar({ length: 20 }).default('course').notNull(),
	status: mysqlEnum(['enrolled','in_progress','completed','failed']).default('enrolled').notNull(),
	progress: int().default(0).notNull(),
	paymentStatus: varchar({ length: 20 }).default('pending').notNull(),
	enrolledAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
	score: int(),
	certificateIssued: tinyint().default(0).notNull(),
	paidAmount: int().default(0).notNull(),
	amountPaid: int().default(0).notNull(),
	stripePaymentIntentId: varchar({ length: 255 }),
	stripePriceId: varchar({ length: 255 }),
	couponId: int(),
	referredBySpecialistId: int(),
	commissionPaid: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	paymentType: mysqlEnum(['one_time','3_month','6_month','12_month']).default('one_time').notNull(),
	stripeSubscriptionId: varchar({ length: 255 }),
	subscriptionStatus: mysqlEnum(['active','cancelled','past_due','none']).default('none').notNull(),
	timeSpentMinutes: int().default(0),
	lastAccessedAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("idx_course_enrollments_userId").on(table.userId),
	index("idx_course_enrollments_courseId").on(table.courseId),
	index("idx_course_enrollments_paymentStatus").on(table.paymentStatus),
	index("idx_course_enrollments_user_course").on(table.userId, table.courseId),
]);

export const courseLessons = mysqlTable("course_lessons", {
	id: int().autoincrement().notNull(),
	courseId: int().notNull(),
	moduleId: int().notNull(),
	lessonKey: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	type: mysqlEnum(['video','reading','quiz']).notNull(),
	duration: varchar({ length: 50 }),
	orderIndex: int().default(0).notNull(),
	videoUrl: varchar({ length: 500 }),
	content: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_courseId_moduleId").on(table.courseId, table.moduleId),
	index("idx_lessonKey").on(table.lessonKey),
]);

export const courseRegions = mysqlTable("course_regions", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	code: varchar({ length: 10 }).notNull(),
	description: text(),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const courseTranslations = mysqlTable("course_translations", {
	id: int().autoincrement().notNull(),
	courseId: int().notNull(),
	language: varchar({ length: 10 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	content: text(),
	learningObjectives: json(),
	duration: int(),
	difficulty: mysqlEnum(['beginner','intermediate','advanced']),
	isPublished: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_courseId_language").on(table.courseId, table.language),
	index("idx_language").on(table.language),
]);

export const courses = mysqlTable("courses", {
	id: int().autoincrement().notNull(),
	regionId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	framework: varchar({ length: 100 }),
	level: mysqlEnum(['fundamentals','advanced','specialist']).notNull(),
	durationHours: int().notNull(),
	price: int().notNull(),
	stripePriceId: varchar({ length: 255 }),
	modules: json(),
	prerequisites: json(),
	certificationRequired: tinyint().default(0).notNull(),
	active: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	price3Month: int(),
	price6Month: int(),
	price12Month: int(),
	stripePriceId3Month: varchar({ length: 255 }),
	stripePriceId6Month: varchar({ length: 255 }),
	stripePriceId12Month: varchar({ length: 255 }),
});

export const dailyActivityLog = mysqlTable("daily_activity_log", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	activityDate: varchar({ length: 10 }).notNull(),
	minutesSpent: int().default(0).notNull(),
	coursesAccessed: int().default(0).notNull(),
	modulesCompleted: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("unique_user_date").on(table.userId, table.activityDate),
]);

export const emailEngagement = mysqlTable("email_engagement", {
	id: int().autoincrement().notNull(),
	workflowId: int().notNull(),
	emailTemplate: varchar({ length: 100 }).notNull(),
	date: varchar({ length: 10 }).notNull(),
	totalSent: int().default(0).notNull(),
	totalDelivered: int().default(0).notNull(),
	totalOpened: int().default(0).notNull(),
	totalClicked: int().default(0).notNull(),
	totalBounced: int().default(0).notNull(),
	uniqueOpens: int().default(0).notNull(),
	uniqueClicks: int().default(0).notNull(),
	avgTimeToOpen: int(),
	avgTimeToClick: int(),
	topClickedLinks: json(),
	deviceBreakdown: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_workflowId").on(table.workflowId),
	index("idx_emailTemplate").on(table.emailTemplate),
	index("idx_date").on(table.date),
]);

export const emailEvents = mysqlTable("email_events", {
	id: int().autoincrement().notNull(),
	emailLogId: int(),
	resendEmailId: varchar({ length: 255 }),
	eventType: mysqlEnum(['email.sent','email.delivered','email.delivery_delayed','email.bounced','email.complained','email.opened','email.clicked']).notNull(),
	recipientEmail: varchar({ length: 320 }).notNull(),
	timestamp: timestamp({ mode: 'string' }).notNull(),
	metadata: json(),
	rawPayload: json(),
	processedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_emailLogId").on(table.emailLogId),
	index("idx_resendEmailId").on(table.resendEmailId),
	index("idx_eventType").on(table.eventType),
	index("idx_recipientEmail").on(table.recipientEmail),
]);

export const emailExecutionLogs = mysqlTable("email_execution_logs", {
	id: int().autoincrement().notNull(),
	executionId: int().notNull(),
	stepExecutionId: int(),
	workflowId: int().notNull(),
	recipientUserId: int(),
	recipientEmail: varchar({ length: 320 }).notNull(),
	recipientName: varchar({ length: 255 }),
	emailSubject: varchar({ length: 500 }).notNull(),
	emailTemplate: varchar({ length: 100 }),
	status: mysqlEnum(['queued','sent','delivered','bounced','failed','opened','clicked']).default('queued').notNull(),
	sentAt: timestamp({ mode: 'string' }),
	deliveredAt: timestamp({ mode: 'string' }),
	openedAt: timestamp({ mode: 'string' }),
	clickedAt: timestamp({ mode: 'string' }),
	errorMessage: text(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const emailLogs = mysqlTable("email_logs", {
	id: int().autoincrement().notNull(),
	queueId: int().notNull(),
	userId: int().notNull(),
	toEmail: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	templateKey: varchar({ length: 100 }),
	status: mysqlEnum(['sent','delivered','opened','clicked','bounced','complained']).notNull(),
	externalId: varchar({ length: 255 }),
	eventData: json(),
	occurredAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_queueId").on(table.queueId),
	index("idx_userId").on(table.userId),
	index("idx_status").on(table.status),
	index("idx_occurredAt").on(table.occurredAt),
]);

export const emailPreferences = mysqlTable("email_preferences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	certificatesEnabled: tinyint().default(1).notNull(),
	progressReportsEnabled: tinyint().default(1).notNull(),
	atRiskAlertsEnabled: tinyint().default(1).notNull(),
	courseUpdatesEnabled: tinyint().default(1).notNull(),
	achievementsEnabled: tinyint().default(1).notNull(),
	instructorMessagesEnabled: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_userId").on(table.userId),
]);

export const emailQueue = mysqlTable("email_queue", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	toEmail: varchar({ length: 255 }).notNull(),
	fromEmail: varchar({ length: 255 }).default('noreply@coai.org').notNull(),
	subject: varchar({ length: 255 }).notNull(),
	htmlContent: text().notNull(),
	textContent: text().notNull(),
	templateKey: varchar({ length: 100 }),
	templateData: json(),
	status: mysqlEnum(['pending','sending','sent','failed','cancelled']).default('pending').notNull(),
	priority: mysqlEnum(['low','normal','high','urgent']).default('normal').notNull(),
	attempts: int().default(0).notNull(),
	maxAttempts: int().default(3).notNull(),
	lastAttemptAt: timestamp({ mode: 'string' }),
	sentAt: timestamp({ mode: 'string' }),
	failedAt: timestamp({ mode: 'string' }),
	errorMessage: text(),
	externalId: varchar({ length: 255 }),
	scheduledFor: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_userId").on(table.userId),
	index("idx_status").on(table.status),
	index("idx_scheduledFor").on(table.scheduledFor),
	index("idx_toEmail").on(table.toEmail),
]);

export const emailScheduleRuns = mysqlTable("email_schedule_runs", {
	id: int().autoincrement().notNull(),
	scheduleId: int().notNull(),
	runType: mysqlEnum(['scheduled','manual','test']).notNull(),
	status: mysqlEnum(['pending','running','completed','failed','cancelled']).default('pending').notNull(),
	targetUserCount: int().default(0).notNull(),
	emailsSent: int().default(0).notNull(),
	emailsFailed: int().default(0).notNull(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	errorMessage: text(),
	executionDetails: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_scheduleId").on(table.scheduleId),
	index("idx_status").on(table.status),
	index("idx_startedAt").on(table.startedAt),
]);

export const emailSchedules = mysqlTable("email_schedules", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	templateKey: varchar({ length: 100 }).notNull(),
	triggerType: mysqlEnum(['user_activity','time_based','manual']).notNull(),
	triggerCondition: json().notNull(),
	targetAudience: mysqlEnum(['all_users','cohort','course_enrollees','inactive_users','custom_filter']).notNull(),
	audienceFilter: json(),
	isActive: tinyint().default(1).notNull(),
	priority: mysqlEnum(['low','normal','high','urgent']).default('normal').notNull(),
	sendCount: int().default(0).notNull(),
	lastRunAt: timestamp({ mode: 'string' }),
	nextRunAt: timestamp({ mode: 'string' }),
	createdBy: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_triggerType").on(table.triggerType),
	index("idx_isActive").on(table.isActive),
	index("idx_nextRunAt").on(table.nextRunAt),
]);

// Note: emailTemplates is re-exported from schema-email-templates at the top of this file

export const emailWorkflows = mysqlTable("email_workflows", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	triggerType: mysqlEnum(['cohort_join','date_based','manual','enrollment','completion']).notNull(),
	triggerConfig: json(),
	workflowData: json().notNull(),
	isActive: tinyint().default(0).notNull(),
	schedule: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const examQuestions = mysqlTable("exam_questions", {
	id: int().autoincrement().notNull(),
	category: varchar({ length: 100 }).notNull(),
	question: text().notNull(),
	optionA: text().notNull(),
	optionB: text().notNull(),
	optionC: text().notNull(),
	optionD: text().notNull(),
	correctAnswer: char({ length: 1 }).notNull(),
	explanation: text(),
	difficulty: varchar({ length: 20 }).default('medium'),
	points: int().default(1),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
});

export const forumNotifications = mysqlTable("forum_notifications", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	threadId: int().notNull(),
	postId: int(),
	type: mysqlEnum(['reply','mention','like','solution_marked']).notNull(),
	isRead: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_userId").on(table.userId),
	index("idx_isRead").on(table.isRead),
]);

export const forumPostLikes = mysqlTable("forum_post_likes", {
	id: int().autoincrement().notNull(),
	postId: int().notNull(),
	userId: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_postId").on(table.postId),
	index("idx_userId_postId").on(table.userId, table.postId),
]);

export const forumPosts = mysqlTable("forum_posts", {
	id: int().autoincrement().notNull(),
	threadId: int().notNull(),
	userId: int().notNull(),
	parentPostId: int(),
	content: text().notNull(),
	isEdited: tinyint().default(0).notNull(),
	editedAt: timestamp({ mode: 'string' }),
	likeCount: int().default(0).notNull(),
	isInstructorPost: tinyint().default(0).notNull(),
	isSolution: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_threadId").on(table.threadId),
	index("idx_userId").on(table.userId),
	index("idx_parentPostId").on(table.parentPostId),
	index("idx_forum_posts_threadId").on(table.threadId),
]);

export const forumThreads = mysqlTable("forum_threads", {
	id: int().autoincrement().notNull(),
	courseId: int().notNull(),
	lessonId: int(),
	userId: int().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	isPinned: tinyint().default(0).notNull(),
	isLocked: tinyint().default(0).notNull(),
	viewCount: int().default(0).notNull(),
	replyCount: int().default(0).notNull(),
	lastActivityAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_courseId").on(table.courseId),
	index("idx_lessonId").on(table.lessonId),
	index("idx_userId").on(table.userId),
	index("idx_lastActivityAt").on(table.lastActivityAt),
	index("idx_forum_threads_courseId").on(table.courseId),
	index("idx_forum_threads_userId").on(table.userId),
]);

export const foundingMembers = mysqlTable("founding_members", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	userId: int("user_id"),
	membershipNumber: varchar("membership_number", { length: 50 }).notNull(),
	purchasedAt: timestamp("purchased_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	lifetimeAccess: tinyint("lifetime_access").default(1),
	equityAllocation: decimal("equity_allocation", { precision: 5, scale: 4 }),
	referralCode: varchar("referral_code", { length: 50 }).notNull(),
},
(table) => [
	index("id").on(table.id),
	index("membership_number").on(table.membershipNumber),
	index("referral_code").on(table.referralCode),
]);

export const frameworks = mysqlTable("frameworks", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	version: varchar({ length: 50 }),
	jurisdiction: varchar({ length: 100 }),
	description: text(),
	effectiveDate: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("frameworks_code_unique").on(table.code),
]);

export const incidentUpdates = mysqlTable("incident_updates", {
	id: int().autoincrement().notNull(),
	incidentId: int().notNull(),
	status: mysqlEnum(['investigating','identified','monitoring','resolved']).notNull(),
	message: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdBy: int(),
},
(table) => [
	index("idx_incident_id_update").on(table.incidentId),
]);

export const instructorCohorts = mysqlTable("instructor_cohorts", {
	id: int().autoincrement().notNull(),
	instructorId: int().notNull(),
	cohortName: varchar({ length: 255 }).notNull(),
	description: text(),
	courseId: int(),
	startDate: timestamp({ mode: 'string' }),
	endDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_instructorId").on(table.instructorId),
	index("idx_courseId").on(table.courseId),
]);

export const jobApplications = mysqlTable("job_applications", {
	id: int().autoincrement().notNull(),
	jobId: int().notNull(),
	userId: int().notNull(),
	applicantName: varchar({ length: 255 }).notNull(),
	applicantEmail: varchar({ length: 320 }).notNull(),
	resumeUrl: varchar({ length: 500 }),
	coverLetter: text(),
	certifications: text(),
	yearsExperience: int(),
	status: mysqlEnum(['submitted','reviewing','shortlisted','rejected','accepted']).default('submitted').notNull(),
	employerResponse: text("employer_response"),
	statusUpdatedAt: timestamp("status_updated_at", { mode: 'string' }).defaultNow().onUpdateNow(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const jobPostings = mysqlTable("job_postings", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	company: varchar({ length: 255 }).notNull(),
	location: varchar({ length: 255 }).notNull(),
	locationType: mysqlEnum(['remote','hybrid','onsite']).default('remote').notNull(),
	country: varchar({ length: 100 }),
	payRate: int().notNull(),
	payRateMax: int(),
	payCurrency: varchar({ length: 3 }).default('USD').notNull(),
	experienceLevel: mysqlEnum(['entry','mid','senior','lead']).default('entry').notNull(),
	employmentType: mysqlEnum(['full_time','part_time','contract','freelance']).default('full_time').notNull(),
	description: text().notNull(),
	responsibilities: text(),
	requirements: text(),
	requiredCertifications: text(),
	preferredCertifications: text(),
	benefits: text(),
	applicationUrl: varchar({ length: 500 }),
	contactEmail: varchar({ length: 320 }),
	status: mysqlEnum(['active','closed','draft']).default('active').notNull(),
	postedBy: int(),
	viewCount: int().default(0).notNull(),
	applicationCount: int().default(0).notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const leaderboardSnapshots = mysqlTable("leaderboard_snapshots", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	period: varchar({ length: 20 }).notNull(),
	periodStart: timestamp({ mode: 'string' }).notNull(),
	periodEnd: timestamp({ mode: 'string' }),
	category: varchar({ length: 30 }).notNull(),
	score: int().default(0).notNull(),
	rank: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_period_category").on(table.period, table.category),
	index("idx_user_period").on(table.userId, table.period),
]);

export const lessonQuizzes = mysqlTable("lesson_quizzes", {
	id: int().autoincrement().notNull(),
	lessonId: int().notNull(),
	question: text().notNull(),
	options: json().notNull(),
	correctAnswer: int().notNull(),
	explanation: text(),
	orderIndex: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_lessonId").on(table.lessonId),
]);

export const lessonTranslations = mysqlTable("lesson_translations", {
	id: int().autoincrement().notNull(),
	lessonId: int().notNull(),
	language: varchar({ length: 10 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	content: text(),
	videoUrl: varchar({ length: 500 }),
	videoCaptions: text(),
	resources: json(),
	isPublished: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_lessonId_language").on(table.lessonId, table.language),
	index("idx_lesson_language").on(table.language),
]);

export const loiSignups = mysqlTable("loi_signups", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	email: varchar({ length: 255 }).notNull(),
	ecosystem: varchar({ length: 50 }).notNull(),
	source: varchar({ length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
	converted: tinyint().default(0),
	convertedAt: timestamp("converted_at", { mode: 'string' }),
	conversionValue: decimal("conversion_value", { precision: 10, scale: 2 }),
},
(table) => [
	index("id").on(table.id),
	index("email").on(table.email),
]);

export const moduleAssessments = mysqlTable("module_assessments", {
	id: int().autoincrement().notNull(),
	moduleId: int("module_id").notNull(),
	courseId: int("course_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	passingScore: int("passing_score").default(70).notNull(),
	timeLimit: int("time_limit").default(60).notNull(),
	maxAttempts: int("max_attempts").default(3).notNull(),
	orderIndex: int("order_index").default(0).notNull(),
	isActive: tinyint("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_moduleId").on(table.moduleId),
	index("idx_courseId").on(table.courseId),
]);

export const moduleCompletionMetrics = mysqlTable("module_completion_metrics", {
	id: int().autoincrement().notNull(),
	courseId: int("course_id").notNull(),
	moduleId: int("module_id").notNull(),
	regionId: int("region_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	startedCount: int("started_count").default(0).notNull(),
	completedCount: int("completed_count").default(0).notNull(),
	averageTimeSpent: int("average_time_spent"),
	averageScore: decimal("average_score", { precision: 5, scale: 2 }),
	passRate: decimal("pass_rate", { precision: 5, scale: 2 }),
	dropoutRate: decimal("dropout_rate", { precision: 5, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_courseId_moduleId").on(table.courseId, table.moduleId),
	index("idx_regionId_date").on(table.regionId, table.date),
]);

export const moduleTranslations = mysqlTable("module_translations", {
	id: int().autoincrement().notNull(),
	moduleId: int().notNull(),
	language: varchar({ length: 10 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	content: text(),
	learningObjectives: json(),
	keyTakeaways: json(),
	duration: int(),
	isPublished: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_moduleId_language").on(table.moduleId, table.language),
	index("idx_module_language").on(table.language),
]);

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 320 }).notNull(),
	name: varchar({ length: 255 }),
	company: varchar({ length: 255 }),
	source: varchar({ length: 100 }),
	status: mysqlEnum(['active','unsubscribed','bounced']).default('active').notNull(),
	confirmedAt: timestamp("confirmed_at", { mode: 'string' }),
	unsubscribedAt: timestamp("unsubscribed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_email_newsletter").on(table.email),
	index("idx_status_newsletter").on(table.status),
]);

export const notificationPreferences = mysqlTable("notification_preferences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	emailEnabled: tinyint().default(1).notNull(),
	slackEnabled: tinyint().default(0).notNull(),
	slackWebhookUrl: varchar({ length: 500 }),
	complianceAlerts: tinyint().default(1).notNull(),
	systemUpdates: tinyint().default(1).notNull(),
	jobApplications: tinyint().default(1).notNull(),
	certificateIssued: tinyint().default(1).notNull(),
	councilDecisions: tinyint().default(1).notNull(),
	reportUpdates: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	digestEnabled: tinyint("digest_enabled").default(0),
	digestFrequency: mysqlEnum("digest_frequency", ['daily','weekly']).default('daily'),
	lastDigestSentAt: timestamp("last_digest_sent_at", { mode: 'string' }),
},
(table) => [
	index("userId").on(table.userId),
]);

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	type: mysqlEnum(['compliance_alert','system_update','job_application','certificate_issued','council_decision','report_update']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	link: varchar({ length: 500 }),
	priority: mysqlEnum(['low','medium','high','urgent']).default('medium').notNull(),
	isRead: tinyint().default(0).notNull(),
	readAt: timestamp({ mode: 'string' }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_userId_isRead").on(table.userId, table.isRead),
	index("idx_createdAt").on(table.createdAt),
]);

export const organizations = mysqlTable("organizations", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	industry: varchar({ length: 100 }),
	size: mysqlEnum(['startup','small','medium','large','enterprise']),
	country: varchar({ length: 100 }),
	subscriptionTier: mysqlEnum(['free','professional','enterprise']).default('free').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("password_reset_tokens_userId_idx").on(table.userId),
	index("password_reset_tokens_token_idx").on(table.token),
]);

export const pdcaCycles = mysqlTable("pdca_cycles", {
	id: int().autoincrement().notNull(),
	aiSystemId: int(),
	organizationId: int(),
	cycleNumber: int().default(1).notNull(),
	phase: mysqlEnum(['plan','do','check','act']).default('plan').notNull(),
	planSummary: text(),
	doSummary: text(),
	checkSummary: text(),
	actSummary: text(),
	status: mysqlEnum(['active','completed','paused']).default('active').notNull(),
	startedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
	watchdogIncidentId: int("watchdog_incident_id"),
});

export const realtimeEvents = mysqlTable("realtime_events", {
	id: int().autoincrement().notNull(),
	userId: int(),
	organizationId: int(),
	aiSystemId: int(),
	eventType: mysqlEnum(['compliance_update','enforcement_action','audit_result','risk_alert','certification_issued','framework_update','council_decision','watchdog_report']).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	severity: mysqlEnum(['info','warning','critical']).default('info').notNull(),
	data: json(),
	isRead: tinyint().default(0).notNull(),
	readAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_userId_realtime").on(table.userId),
	index("idx_organizationId_realtime").on(table.organizationId),
	index("idx_aiSystemId_realtime").on(table.aiSystemId),
	index("idx_eventType").on(table.eventType),
	index("idx_createdAt_realtime").on(table.createdAt),
]);

export const recommendationAnalytics = mysqlTable("recommendation_analytics", {
	id: int().autoincrement().notNull(),
	period: varchar({ length: 20 }).notNull(),
	periodType: mysqlEnum(['daily','weekly','monthly']).notNull(),
	totalGenerated: int().default(0).notNull(),
	totalViewed: int().default(0).notNull(),
	totalImplemented: int().default(0).notNull(),
	totalDismissed: int().default(0).notNull(),
	totalSnoozed: int().default(0).notNull(),
	helpfulCount: int().default(0).notNull(),
	notHelpfulCount: int().default(0).notNull(),
	byCategory: json(),
	byPriority: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_period").on(table.period, table.periodType),
]);

export const recommendationInteractions = mysqlTable("recommendation_interactions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	recommendationId: varchar({ length: 100 }).notNull(),
	recommendationType: varchar({ length: 50 }).notNull(),
	action: mysqlEnum(['viewed','implemented','dismissed','snoozed']).notNull(),
	feedback: mysqlEnum(['helpful','not_helpful','irrelevant']),
	feedbackNote: text(),
	snoozeUntil: timestamp({ mode: 'string' }),
	aiSystemId: int(),
	frameworkId: int(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_user_rec").on(table.userId, table.recommendationId),
	index("idx_user_action").on(table.userId, table.action),
]);

export const recommendationPreferences = mysqlTable("recommendation_preferences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	complianceGapWeight: int().default(100).notNull(),
	incidentPreventionWeight: int().default(80).notNull(),
	governanceWeight: int().default(70).notNull(),
	riskMitigationWeight: int().default(90).notNull(),
	bestPracticeWeight: int().default(50).notNull(),
	regulatoryUpdateWeight: int().default(85).notNull(),
	emailDigestEnabled: tinyint().default(0).notNull(),
	emailDigestFrequency: mysqlEnum(['daily','weekly','monthly']).default('weekly').notNull(),
	minPriorityForEmail: mysqlEnum(['critical','high','medium','low']).default('high').notNull(),
	defaultLimit: int().default(10).notNull(),
	showDismissedAfterDays: int().default(30).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("userId").on(table.userId),
]);

export const referralClicks = mysqlTable("referral_clicks", {
	id: int().autoincrement().notNull(),
	referralCodeId: int().notNull(),
	referrerId: int().notNull(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	referrerSource: mysqlEnum(['email','social','direct','other']).default('direct').notNull(),
	clickedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("referral_clicks_referrerId_idx").on(table.referrerId),
	index("referral_clicks_referralCodeId_idx").on(table.referralCodeId),
]);

export const referralCodes = mysqlTable("referral_codes", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	code: varchar({ length: 50 }).notNull(),
	status: mysqlEnum(['active','inactive','expired']).default('active').notNull(),
	totalClicks: int().default(0).notNull(),
	totalConversions: int().default(0).notNull(),
	totalEarnings: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("referral_codes_userId_idx").on(table.userId),
	index("referral_codes_code_idx").on(table.code),
	index("code").on(table.code),
]);

export const referralConversions = mysqlTable("referral_conversions", {
	id: int().primaryKey().autoincrement(),
	referralCodeId: int().notNull(),
	referrerId: int().notNull(),
	referredUserId: int().notNull(),
	referredEmail: varchar({ length: 255 }).notNull(),
	certificationId: int(),
	certificationName: varchar({ length: 255 }),
	certificationPrice: decimal({ precision: 10, scale: 2 }).notNull(),
	commissionRate: int().default(20).notNull(),
	commissionAmount: decimal({ precision: 10, scale: 2 }).notNull(),
	status: mysqlEnum(['pending', 'earned', 'processed', 'failed']).default('pending').notNull(),
	payoutId: varchar({ length: 255 }),
	payoutDate: timestamp({ mode: 'string' }),
	clickedAt: timestamp({ mode: 'string' }).notNull(),
	convertedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
	index("referral_conversions_referrerId_idx").on(table.referrerId),
	index("referral_conversions_referredUserId_idx").on(table.referredUserId),
	index("referral_conversions_status_idx").on(table.status),
]);

export const referralPayouts = mysqlTable("referral_payouts", {
	id: int().autoincrement().notNull(),
	referrerId: int().notNull(),
	totalAmount: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	conversionCount: int().default(0).notNull(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	stripePayoutId: varchar({ length: 255 }),
	stripeTransferId: varchar({ length: 255 }),
	errorMessage: text(),
	scheduledFor: timestamp({ mode: 'string' }),
	processedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
});

export const referralProgram = mysqlTable("referral_program", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	referrerUserId: int("referrer_user_id"),
	referredUserId: int("referred_user_id"),
	referralCode: varchar("referral_code", { length: 50 }).notNull(),
	commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).default('0.10'),
	commissionEarned: decimal("commission_earned", { precision: 10, scale: 2 }).default('0'),
	status: varchar({ length: 50 }).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP'),
},
(table) => [
	index("id").on(table.id),
]);

export const regionalAnalytics = mysqlTable("regional_analytics", {
	id: int().autoincrement().notNull(),
	regionId: int("region_id").notNull(),
	courseId: int("course_id"),
	date: timestamp({ mode: 'string' }).notNull(),
	enrollmentCount: int("enrollment_count").default(0).notNull(),
	activeEnrollmentCount: int("active_enrollment_count").default(0).notNull(),
	completionCount: int("completion_count").default(0).notNull(),
	certificateIssuedCount: int("certificate_issued_count").default(0).notNull(),
	averageCompletionTime: int("average_completion_time"),
	averageScore: decimal("average_score", { precision: 5, scale: 2 }),
	revenue: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
	refundCount: int("refund_count").default(0).notNull(),
	dropoutCount: int("dropout_count").default(0).notNull(),
	averageProgressPercent: decimal("average_progress_percent", { precision: 5, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_regionId_date").on(table.regionId, table.date),
	index("idx_courseId_date").on(table.courseId, table.date),
]);

export const regionalCourseEnrollments = mysqlTable("regional_course_enrollments", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	courseId: int("course_id").notNull(),
	regionId: int("region_id").notNull(),
	enrollmentType: mysqlEnum("enrollment_type", ['free','paid','trial','scholarship']).default('paid').notNull(),
	paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
	paymentType: mysqlEnum("payment_type", ['one_time','3_month','6_month','12_month']).default('one_time').notNull(),
	stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
	status: mysqlEnum(['active','completed','cancelled','expired']).default('active').notNull(),
	enrolledAt: timestamp("enrolled_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	lastAccessedAt: timestamp("last_accessed_at", { mode: 'string' }),
	progressPercent: int("progress_percent").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_userId").on(table.userId),
	index("idx_courseId").on(table.courseId),
	index("idx_regionId").on(table.regionId),
	index("idx_enrolledAt").on(table.enrolledAt),
	index("idx_status").on(table.status),
]);

export const regions = mysqlTable("regions", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 10 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	primaryFramework: varchar({ length: 100 }),
	regulatoryBody: varchar({ length: 255 }),
	active: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("code").on(table.code),
]);

export const reportAssignments = mysqlTable("report_assignments", {
	id: int().autoincrement().notNull(),
	reportId: int().notNull(),
	analystId: int().notNull(),
	specialistId: int().notNull(),
	assignedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	dueAt: timestamp({ mode: 'string' }).notNull(),
	completedAt: timestamp({ mode: 'string' }),
	status: mysqlEnum(['assigned','in_progress','completed','escalated']).default('assigned').notNull(),
	reviewedAt: timestamp({ mode: 'string' }),
	qualityScore: int(),
	specialistFeedback: text(),
	escalated: tinyint().default(0).notNull(),
	escalationReason: text(),
	escalatedTo: mysqlEnum(['regional_specialist','council']),
	paymentAmount: int(),
	paymentStatus: mysqlEnum(['pending','paid']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const requirements = mysqlTable("requirements", {
	id: int().autoincrement().notNull(),
	frameworkId: int().notNull(),
	articleNumber: varchar({ length: 50 }),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }),
	riskLevelApplicable: mysqlEnum(['all','minimal','limited','high','unacceptable']).default('all'),
	isMandatory: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const ruleUpdates = mysqlTable("rule_updates", {
	id: int().autoincrement().notNull(),
	ruleId: int().notNull().references(() => complianceRules.id, { onDelete: "cascade" } ),
	changeType: mysqlEnum(['created','updated','deprecated','activated','deactivated']).notNull(),
	previousValue: json(),
	newValue: json(),
	changeReason: text(),
	changedBy: int(),
	notificationSent: tinyint().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_ruleId_updates").on(table.ruleId),
	index("idx_changeType").on(table.changeType),
	index("idx_createdAt_updates").on(table.createdAt),
]);

export const scheduleExecutionHistory = mysqlTable("schedule_execution_history", {
	id: int().autoincrement().notNull(),
	scheduleId: int().notNull(),
	workflowId: int().notNull(),
	executionId: int(),
	scheduledFor: timestamp({ mode: 'string' }).notNull(),
	actualExecutionTime: timestamp({ mode: 'string' }).notNull(),
	status: mysqlEnum(['success','failed','skipped','partial']).notNull(),
	targetUserCount: int().default(0).notNull(),
	successfulCount: int().default(0).notNull(),
	failedCount: int().default(0).notNull(),
	duration: int(),
	errorMessage: text(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_scheduleId").on(table.scheduleId),
	index("idx_workflowId").on(table.workflowId),
	index("idx_scheduledFor").on(table.scheduledFor),
	index("idx_status").on(table.status),
]);

export const scheduleStatusLog = mysqlTable("schedule_status_log", {
	id: int().autoincrement().notNull(),
	scheduleId: int().notNull(),
	action: mysqlEnum(['created','activated','paused','resumed','deleted','completed']).notNull(),
	reason: text(),
	performedBy: int(),
	timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_scheduleId").on(table.scheduleId),
	index("idx_action").on(table.action),
]);

export const serviceStatus = mysqlTable("service_status", {
	id: int().autoincrement().notNull(),
	serviceName: varchar({ length: 100 }).notNull(),
	displayName: varchar({ length: 255 }).notNull(),
	description: text(),
	status: mysqlEnum(['operational','degraded','partial_outage','major_outage']).default('operational').notNull(),
	category: mysqlEnum(['core','api','dashboard','training','compliance','other']).default('other').notNull(),
	lastCheckedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_service_name").on(table.serviceName),
	index("idx_status_service").on(table.status),
]);

export const specialistEarnings = mysqlTable("specialist_earnings", {
	id: int().autoincrement().notNull(),
	specialistId: int().notNull(),
	period: varchar({ length: 20 }).notNull(),
	baseSalary: int().notNull(),
	analystCommissions: int().default(0).notNull(),
	courseCommissions: int().default(0).notNull(),
	performanceBonus: int().default(0).notNull(),
	totalEarnings: int().notNull(),
	paidAt: timestamp({ mode: 'string' }),
	paymentStatus: mysqlEnum(['pending','processing','paid']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const specialists = mysqlTable("specialists", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	regionId: int().notNull(),
	specialistType: mysqlEnum(['regional','industry']).notNull(),
	industry: varchar({ length: 100 }),
	supervisorId: int(),
	certifications: json(),
	yearsExperience: int(),
	bio: text(),
	baseSalary: int().default(5000).notNull(),
	commissionRate: int().default(10).notNull(),
	courseCommissionRate: int().default(20).notNull(),
	status: mysqlEnum(['active','probation','suspended','inactive']).default('probation').notNull(),
	probationStartDate: timestamp({ mode: 'string' }),
	probationEndDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const statusSubscriptions = mysqlTable("status_subscriptions", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 20 }),
	services: text(),
	notifyOnIncident: tinyint().default(1).notNull(),
	notifyOnResolution: tinyint().default(1).notNull(),
	notifyOnMaintenance: tinyint().default(1).notNull(),
	isActive: tinyint().default(1).notNull(),
	verifiedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_email_subscription").on(table.email),
	index("idx_active_subscription").on(table.isActive),
]);

export const systemIncidents = mysqlTable("system_incidents", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	status: mysqlEnum(['investigating','identified','monitoring','resolved']).default('investigating').notNull(),
	severity: mysqlEnum(['minor','major','critical']).notNull(),
	affectedServices: text(),
	startedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	identifiedAt: timestamp({ mode: 'string' }),
	monitoringAt: timestamp({ mode: 'string' }),
	resolvedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	reportedBy: int(),
	reporterEmail: varchar({ length: 320 }),
	reporterName: varchar({ length: 255 }),
	isPublic: tinyint().default(1).notNull(),
},
(table) => [
	index("idx_status_incident").on(table.status),
	index("idx_severity_incident").on(table.severity),
	index("idx_started_at").on(table.startedAt),
]);

export const teamInvitations = mysqlTable("team_invitations", {
	id: int().autoincrement().notNull(),
	teamId: int().notNull(),
	email: varchar({ length: 255 }).notNull(),
	invitedBy: int().notNull(),
	token: varchar({ length: 64 }).notNull(),
	status: mysqlEnum(['pending','accepted','declined','expired']).default('pending').notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_team_invitations_team").on(table.teamId),
	index("idx_team_invitations_email").on(table.email),
	index("idx_team_invitations_token").on(table.token),
]);

export const teamLeaderboardSnapshots = mysqlTable("team_leaderboard_snapshots", {
	id: int().autoincrement().notNull(),
	teamId: int().notNull(),
	period: varchar({ length: 20 }).notNull(),
	periodStart: timestamp({ mode: 'string' }).notNull(),
	periodEnd: timestamp({ mode: 'string' }),
	rankings: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_team_snapshots_team").on(table.teamId),
	index("idx_team_snapshots_period").on(table.period),
]);

export const teamMemberships = mysqlTable("team_memberships", {
	id: int().autoincrement().notNull(),
	teamId: int().notNull(),
	userId: int().notNull(),
	role: mysqlEnum(['owner','admin','member']).default('member').notNull(),
	joinedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	invitedBy: int(),
	status: mysqlEnum(['active','pending','removed']).default('active').notNull(),
	cachedStreak: int().default(0),
	cachedBadgeCount: int().default(0),
	cachedCoursesCompleted: int().default(0),
	cachedTotalPoints: int().default(0),
	lastStatsUpdate: timestamp({ mode: 'string' }),
},
(table) => [
	index("idx_team_memberships_team").on(table.teamId),
	index("idx_team_memberships_user").on(table.userId),
	index("idx_team_memberships_status").on(table.status),
]);

export const teams = mysqlTable("teams", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	slug: varchar({ length: 100 }).notNull(),
	inviteCode: varchar({ length: 20 }).notNull(),
	logoUrl: varchar({ length: 500 }),
	ownerId: int().notNull(),
	visibility: mysqlEnum(['private','public']).default('private').notNull(),
	maxMembers: int().default(100),
	memberCount: int().default(1).notNull(),
	settings: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_teams_slug").on(table.slug),
	index("idx_teams_invite_code").on(table.inviteCode),
	index("idx_teams_owner").on(table.ownerId),
]);

export const templateUsage = mysqlTable("template_usage", {
	id: int().autoincrement().notNull(),
	templateId: int().notNull(),
	userId: int().notNull(),
	workflowId: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const testQuestions = mysqlTable("test_questions", {
	id: int().autoincrement().notNull(),
	testId: int().notNull(),
	moduleId: int(),
	questionText: text().notNull(),
	questionType: mysqlEnum(['multiple_choice','true_false','scenario']).default('multiple_choice').notNull(),
	options: json().notNull(),
	correctAnswer: varchar({ length: 255 }).notNull(),
	explanation: text(),
	points: int().default(1).notNull(),
	difficulty: mysqlEnum(['easy','medium','hard']).default('medium').notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const trainingModules = mysqlTable("training_modules", {
	id: int().autoincrement().notNull(),
	code: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	content: text().notNull(),
	orderIndex: int().default(0).notNull(),
	durationMinutes: int().default(30).notNull(),
	isRequired: tinyint().default(1).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	courseId: int(),
},
(table) => [
	index("training_modules_code_unique").on(table.code),
]);

export const uptimeMetrics = mysqlTable("uptime_metrics", {
	id: int().autoincrement().notNull(),
	serviceName: varchar({ length: 100 }).notNull(),
	date: varchar({ length: 10 }).notNull(),
	uptimePercent: decimal({ precision: 5, scale: 2 }).notNull(),
	totalChecks: int().notNull(),
	successfulChecks: int().notNull(),
	failedChecks: int().notNull(),
	avgResponseTimeMs: decimal({ precision: 10, scale: 2 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_service_date").on(table.serviceName, table.date),
]);

export const userActivityTriggers = mysqlTable("user_activity_triggers", {
	id: int().autoincrement().notNull(),
	scheduleId: int().notNull(),
	userId: int().notNull(),
	activityType: varchar({ length: 100 }).notNull(),
	activityDate: timestamp({ mode: 'string' }).notNull(),
	scheduledSendDate: timestamp({ mode: 'string' }).notNull(),
	status: mysqlEnum(['pending','sent','cancelled','failed']).default('pending').notNull(),
	queueId: int(),
	processedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_scheduleId").on(table.scheduleId),
	index("idx_userId").on(table.userId),
	index("idx_status").on(table.status),
	index("idx_scheduledSendDate").on(table.scheduledSendDate),
]);

export const userAssessmentAttempts = mysqlTable("user_assessment_attempts", {
	id: int().autoincrement().notNull(),
	userId: int("user_id").notNull(),
	assessmentId: int("assessment_id").notNull(),
	courseId: int("course_id").notNull(),
	moduleId: int("module_id").notNull(),
	score: decimal({ precision: 5, scale: 2 }).notNull(),
	totalQuestions: int("total_questions").notNull(),
	correctAnswers: int("correct_answers").notNull(),
	passed: tinyint().notNull(),
	timeSpentSeconds: int("time_spent_seconds").notNull(),
	answers: json().notNull(),
	attemptNumber: int("attempt_number").default(1).notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_userId_assessmentId").on(table.userId, table.assessmentId),
	index("idx_userId_courseId").on(table.userId, table.courseId),
]);

export const userBadges = mysqlTable("user_badges", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	badgeId: int().notNull(),
	earnedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	progress: int().default(0),
	metadata: text(),
});

export const userCertificates = mysqlTable("user_certificates", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	testId: int().notNull(),
	attemptId: int().notNull(),
	certificateNumber: varchar({ length: 100 }).notNull(),
	certificateType: mysqlEnum(['basic','advanced','expert']).default('basic').notNull(),
	issuedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	isRevoked: tinyint().default(0).notNull(),
	revokedReason: text(),
},
(table) => [
	index("user_certificates_certificateNumber_unique").on(table.certificateNumber),
]);

export const userEmailPreferences = mysqlTable("user_email_preferences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	enrollmentConfirmation: tinyint().default(1).notNull(),
	courseCompletion: tinyint().default(1).notNull(),
	certificateIssuance: tinyint().default(1).notNull(),
	weeklyProgress: tinyint().default(1).notNull(),
	forumNotifications: tinyint().default(1).notNull(),
	marketingEmails: tinyint().default(0).notNull(),
	systemAnnouncements: tinyint().default(1).notNull(),
	unsubscribedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_userId").on(table.userId),
]);

export const userLessonProgress = mysqlTable("user_lesson_progress", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	courseId: int().notNull(),
	lessonId: int().notNull(),
	status: mysqlEnum(['not_started','in_progress','completed']).default('not_started').notNull(),
	progressPercent: int().default(0).notNull(),
	timeSpentSeconds: int().default(0).notNull(),
	lastPositionSeconds: int().default(0),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_userId_courseId").on(table.userId, table.courseId),
	index("idx_userId_lessonId").on(table.userId, table.lessonId),
	index("idx_user_lesson_progress_userId").on(table.userId),
	index("idx_user_lesson_progress_lessonId").on(table.lessonId),
	index("idx_user_lesson_progress_courseId").on(table.courseId),
]);

export const userQuizAttempts = mysqlTable("user_quiz_attempts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	lessonId: int().notNull(),
	quizId: int().notNull(),
	selectedAnswer: int().notNull(),
	isCorrect: tinyint().notNull(),
	attemptedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_userId_lessonId").on(table.userId, table.lessonId),
	index("idx_userId_quizId").on(table.userId, table.quizId),
]);

export const userQuizScores = mysqlTable("user_quiz_scores", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	lessonId: int().notNull(),
	totalQuestions: int().notNull(),
	correctAnswers: int().notNull(),
	score: decimal({ precision: 5, scale: 2 }).notNull(),
	passed: tinyint().default(0).notNull(),
	attemptNumber: int().default(1).notNull(),
	completedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_userId_lessonId").on(table.userId, table.lessonId),
	index("idx_user_quiz_scores_userId").on(table.userId),
]);

export const userStreaks = mysqlTable("user_streaks", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	currentStreak: int().default(0).notNull(),
	longestStreak: int().default(0).notNull(),
	lastActivityDate: timestamp({ mode: 'string' }),
	totalActiveDays: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const userTestAttempts = mysqlTable("user_test_attempts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	testId: int().notNull(),
	score: int().default(0).notNull(),
	totalPoints: int().default(0).notNull(),
	percentScore: decimal({ precision: 5, scale: 2 }),
	passed: tinyint().default(0).notNull(),
	answers: json(),
	startedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_user_test_attempts_userId").on(table.userId),
	index("idx_user_test_attempts_testId").on(table.testId),
]);

export const userTrainingProgress = mysqlTable("user_training_progress", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	moduleId: int().notNull(),
	status: mysqlEnum(['not_started','in_progress','completed']).default('not_started').notNull(),
	progressPercent: int().default(0).notNull(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	password: varchar({ length: 255 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin','watchdog_analyst','regulator','enterprise_admin','compliance_officer']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	stripeCustomerId: varchar({ length: 255 }),
	stripeSubscriptionId: varchar({ length: 255 }),
	subscriptionTier: mysqlEnum(['free','starter','pro','enterprise']).default('free').notNull(),
	subscriptionStatus: mysqlEnum(['active','canceled','past_due','trialing','none']).default('none').notNull(),
	brand: varchar({ length: 50 }).default('councilof.ai'),
	foundingMember: tinyint("founding_member").default(0),
	referralCode: varchar("referral_code", { length: 50 }),
	payoutFrequency: mysqlEnum("payout_frequency", ['weekly','biweekly','monthly']).default('monthly'),
	lastPayoutDate: timestamp("last_payout_date", { mode: 'string' }),
	stripeConnectAccountId: varchar("stripe_connect_account_id", { length: 255 }),
},
(table) => [
	index("users_openId_unique").on(table.openId),
	index("idx_users_email").on(table.email),
	index("idx_users_role").on(table.role),
	index("idx_users_subscription_tier").on(table.subscriptionTier),
]);

export const watchdogApplications = mysqlTable("watchdog_applications", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 320 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	country: varchar({ length: 100 }),
	timezone: varchar({ length: 100 }),
	experience: text(),
	motivation: text(),
	availableHoursPerWeek: int(),
	status: mysqlEnum(['pending','approved','rejected','waitlisted']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_watchdog_applications_email").on(table.email),
]);

export const watchdogComments = mysqlTable("watchdog_comments", {
	id: int().autoincrement().notNull(),
	reportId: int().notNull(),
	userId: int(),
	authorName: varchar({ length: 255 }),
	content: text().notNull(),
	isOfficial: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const watchdogReports = mysqlTable("watchdog_reports", {
	id: int().autoincrement().notNull(),
	reporterId: int(),
	reporterEmail: varchar({ length: 320 }),
	reporterName: varchar({ length: 255 }),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	aiSystemName: varchar({ length: 255 }),
	companyName: varchar({ length: 255 }),
	incidentType: mysqlEnum(['bias','privacy','safety','misinformation','manipulation','other']).notNull(),
	severity: mysqlEnum(['low','medium','high','critical']).default('medium').notNull(),
	status: mysqlEnum(['submitted','under_review','investigating','resolved','dismissed']).default('submitted').notNull(),
	upvotes: int().default(0).notNull(),
	downvotes: int().default(0).notNull(),
	isPublic: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	resolutionNotes: text("resolution_notes"),
	resolutionDate: timestamp("resolution_date", { mode: 'string' }),
	resolvedById: int("resolved_by_id"),
	resolvedByName: varchar("resolved_by_name", { length: 255 }),
});

export const websocketConnections = mysqlTable("websocket_connections", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	connectionId: varchar({ length: 255 }).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	lastHeartbeat: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_userId_ws").on(table.userId),
	index("idx_connectionId_ws").on(table.connectionId),
]);

export const workflowConversions = mysqlTable("workflow_conversions", {
	id: int().autoincrement().notNull(),
	workflowId: int().notNull(),
	executionId: int().notNull(),
	userId: int().notNull(),
	conversionType: mysqlEnum(['enrollment','completion','purchase','signup','custom']).notNull(),
	conversionValue: decimal({ precision: 10, scale: 2 }),
	metadata: json(),
	convertedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("idx_workflowId").on(table.workflowId),
	index("idx_executionId").on(table.executionId),
	index("idx_userId").on(table.userId),
	index("idx_conversionType").on(table.conversionType),
]);

export const workflowExecutions = mysqlTable("workflow_executions", {
	id: int().autoincrement().notNull(),
	workflowId: int().notNull(),
	userId: int().notNull(),
	status: mysqlEnum(['pending','running','completed','failed','cancelled']).default('pending').notNull(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	executionLog: json(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const workflowMetrics = mysqlTable("workflow_metrics", {
	id: int().autoincrement().notNull(),
	workflowId: int().notNull(),
	date: varchar({ length: 10 }).notNull(),
	totalExecutions: int().default(0).notNull(),
	successfulExecutions: int().default(0).notNull(),
	failedExecutions: int().default(0).notNull(),
	avgExecutionTimeSeconds: decimal({ precision: 10, scale: 2 }),
	totalEmailsSent: int().default(0).notNull(),
	totalEmailsDelivered: int().default(0).notNull(),
	totalEmailsOpened: int().default(0).notNull(),
	totalEmailsClicked: int().default(0).notNull(),
	totalEmailsBounced: int().default(0).notNull(),
	deliveryRate: decimal({ precision: 5, scale: 2 }),
	openRate: decimal({ precision: 5, scale: 2 }),
	clickRate: decimal({ precision: 5, scale: 2 }),
	bounceRate: decimal({ precision: 5, scale: 2 }),
	conversionCount: int().default(0).notNull(),
	conversionRate: decimal({ precision: 5, scale: 2 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_workflowId").on(table.workflowId),
	index("idx_date").on(table.date),
	index("idx_workflowId_date").on(table.workflowId, table.date),
]);

export const workflowSchedules = mysqlTable("workflow_schedules", {
	id: int().autoincrement().notNull(),
	workflowId: int().notNull(),
	userId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	scheduleType: mysqlEnum(['cron','interval','conditional']).notNull(),
	cronExpression: varchar({ length: 100 }),
	timezone: varchar({ length: 50 }).default('UTC').notNull(),
	intervalValue: int(),
	intervalUnit: mysqlEnum(['minutes','hours','days','weeks','months']),
	conditions: json(),
	targetFilters: json(),
	isActive: tinyint().default(1).notNull(),
	startDate: timestamp({ mode: 'string' }),
	endDate: timestamp({ mode: 'string' }),
	maxExecutions: int(),
	executionCount: int().default(0).notNull(),
	lastExecutedAt: timestamp({ mode: 'string' }),
	nextExecutionAt: timestamp({ mode: 'string' }),
	lastExecutionStatus: mysqlEnum(['success','failed','partial']),
	lastExecutionError: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_workflowId").on(table.workflowId),
	index("idx_userId").on(table.userId),
	index("idx_isActive").on(table.isActive),
	index("idx_nextExecutionAt").on(table.nextExecutionAt),
	index("idx_scheduleType").on(table.scheduleType),
]);

export const workflowStepExecutions = mysqlTable("workflow_step_executions", {
	id: int().autoincrement().notNull(),
	executionId: int().notNull(),
	stepId: varchar({ length: 100 }).notNull(),
	stepType: mysqlEnum(['trigger','send_email','wait','condition','action']).notNull(),
	status: mysqlEnum(['pending','running','completed','failed','skipped']).default('pending').notNull(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	result: json(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const workflowTemplates = mysqlTable("workflow_templates", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	category: mysqlEnum(['welcome','course','engagement','certification','reminder','nurture']).notNull(),
	triggerType: mysqlEnum(['cohort_join','date_based','manual','enrollment','completion']).notNull(),
	triggerConfig: json(),
	workflowData: json().notNull(),
	previewImage: varchar({ length: 500 }),
	tags: json(),
	usageCount: int().default(0).notNull(),
	isPublic: tinyint().default(1).notNull(),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});


// Analytics events table
export const analyticsEvents = mysqlTable("analytics_events", {
	id: int().autoincrement().notNull(),
	eventType: varchar({ length: 100 }).notNull(),
	userId: int(),
	sessionId: varchar({ length: 255 }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
	index("idx_eventType").on(table.eventType),
	index("idx_userId").on(table.userId),
	index("idx_createdAt").on(table.createdAt),
]);


// Conversion funnels table
export const conversionFunnels = mysqlTable("conversion_funnels", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	steps: json().$type<string[]>(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

// Payment analytics table
export const paymentAnalytics = mysqlTable("payment_analytics", {
	id: int().autoincrement().notNull(),
	userId: int(),
	amount: decimal({ precision: 10, scale: 2 }),
	currency: varchar({ length: 10 }),
	status: varchar({ length: 50 }),
	paymentMethod: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
	index("idx_userId").on(table.userId),
	index("idx_status").on(table.status),
]);


// Course completion tracking table
export const courseCompletionTracking = mysqlTable("course_completion_tracking", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	courseId: int().notNull(),
	completedAt: timestamp({ mode: 'string' }),
	progress: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
	index("idx_userId").on(table.userId),
	index("idx_courseId").on(table.courseId),
	index("idx_createdAt").on(table.createdAt),
]);


// Email sequences table
export const emailSequences = mysqlTable("email_sequences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	sequenceType: varchar({ length: 100 }).notNull(),
	status: mysqlEnum(['pending', 'active', 'completed', 'cancelled']).default('pending').notNull(),
	currentStep: int().default(0).notNull(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
	index("idx_userId").on(table.userId),
	index("idx_status").on(table.status),
	index("idx_createdAt").on(table.createdAt),
]);


// Giveaway applications table
export const giveawayApplications = mysqlTable("giveaway_applications", {
	id: int().autoincrement().notNull(),
	userId: int(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	company: varchar({ length: 255 }),
	reason: text(),
	status: mysqlEnum(['pending', 'approved', 'rejected']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
	index("idx_email").on(table.email),
	index("idx_status").on(table.status),
]);


// User cohorts table
export const userCohorts = mysqlTable("user_cohorts", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	cohortId: int().notNull(),
	joinedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	status: mysqlEnum(['active', 'inactive', 'completed']).default('active').notNull(),
}, (table) => [
	index("idx_userId").on(table.userId),
	index("idx_cohortId").on(table.cohortId),
]);


// Note: cohortCourses, studentCohortHistory, instructorCohorts and cohortStudents are already defined/re-exported earlier in the schema
