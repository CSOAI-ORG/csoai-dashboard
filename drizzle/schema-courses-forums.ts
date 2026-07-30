import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index, boolean, decimal, json } from "drizzle-orm/mysql-core";

// ============================================
// COURSE LESSON PROGRESS TRACKING
// ============================================

export const courseLessons = mysqlTable("course_lessons", {
  id: int().autoincrement().notNull(),
  courseId: int().notNull(),
  moduleId: int().notNull(),
  lessonKey: varchar({ length: 100 }).notNull(), // e.g., "lesson1", "lesson2"
  title: varchar({ length: 255 }).notNull(),
  type: mysqlEnum(['video', 'reading', 'quiz']).notNull(),
  duration: varchar({ length: 50 }), // e.g., "15 min"
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

export const userLessonProgress = mysqlTable("user_lesson_progress", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(),
  courseId: int().notNull(),
  lessonId: int().notNull(),
  status: mysqlEnum(['not_started', 'in_progress', 'completed']).default('not_started').notNull(),
  progressPercent: int().default(0).notNull(),
  timeSpentSeconds: int().default(0).notNull(),
  lastPositionSeconds: int().default(0), // For video playback resume
  startedAt: timestamp({ mode: 'string' }),
  completedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_userId_courseId").on(table.userId, table.courseId),
  index("idx_userId_lessonId").on(table.userId, table.lessonId),
]);

// ============================================
// QUIZ SYSTEM
// ============================================

export const lessonQuizzes = mysqlTable("lesson_quizzes", {
  id: int().autoincrement().notNull(),
  lessonId: int().notNull(),
  question: text().notNull(),
  options: json().$type<string[]>().notNull(), // Array of answer options
  correctAnswer: int().notNull(), // Index of correct option
  explanation: text(),
  orderIndex: int().default(0).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_lessonId").on(table.lessonId),
]);

export const userQuizAttempts = mysqlTable("user_quiz_attempts", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(),
  lessonId: int().notNull(),
  quizId: int().notNull(),
  selectedAnswer: int().notNull(),
  isCorrect: boolean().notNull(),
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
  score: decimal({ precision: 5, scale: 2 }).notNull(), // Percentage score
  passed: boolean().default(false).notNull(),
  attemptNumber: int().default(1).notNull(),
  completedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_userId_lessonId").on(table.userId, table.lessonId),
]);

// ============================================
// DISCUSSION FORUMS
// ============================================

export const forumThreads = mysqlTable("forum_threads", {
  id: int().autoincrement().notNull(),
  courseId: int().notNull(),
  lessonId: int(), // Optional - can be course-wide or lesson-specific
  userId: int().notNull(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  isPinned: boolean().default(false).notNull(),
  isLocked: boolean().default(false).notNull(),
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
]);

export const forumPosts = mysqlTable("forum_posts", {
  id: int().autoincrement().notNull(),
  threadId: int().notNull(),
  userId: int().notNull(),
  parentPostId: int(), // For nested replies
  content: text().notNull(),
  isEdited: boolean().default(false).notNull(),
  editedAt: timestamp({ mode: 'string' }),
  likeCount: int().default(0).notNull(),
  isInstructorPost: boolean().default(false).notNull(),
  isSolution: boolean().default(false).notNull(), // Mark as accepted solution
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_threadId").on(table.threadId),
  index("idx_userId").on(table.userId),
  index("idx_parentPostId").on(table.parentPostId),
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

export const forumNotifications = mysqlTable("forum_notifications", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(),
  threadId: int().notNull(),
  postId: int(),
  type: mysqlEnum(['reply', 'mention', 'like', 'solution_marked']).notNull(),
  isRead: boolean().default(false).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_userId").on(table.userId),
  index("idx_isRead").on(table.isRead),
]);

// ============================================
// TYPE EXPORTS
// ============================================

export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseLesson = typeof courseLessons.$inferInsert;

export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type InsertUserLessonProgress = typeof userLessonProgress.$inferInsert;

export type LessonQuiz = typeof lessonQuizzes.$inferSelect;
export type InsertLessonQuiz = typeof lessonQuizzes.$inferInsert;

export type UserQuizAttempt = typeof userQuizAttempts.$inferSelect;
export type InsertUserQuizAttempt = typeof userQuizAttempts.$inferInsert;

export type UserQuizScore = typeof userQuizScores.$inferSelect;
export type InsertUserQuizScore = typeof userQuizScores.$inferInsert;

export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = typeof forumThreads.$inferInsert;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

export type ForumPostLike = typeof forumPostLikes.$inferSelect;
export type InsertForumPostLike = typeof forumPostLikes.$inferInsert;

export type ForumNotification = typeof forumNotifications.$inferSelect;
export type InsertForumNotification = typeof forumNotifications.$inferInsert;
