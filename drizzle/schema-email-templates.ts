import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index, boolean, json } from "drizzle-orm/mysql-core";

// ============================================
// EMAIL TEMPLATE SYSTEM
// ============================================

export const emailTemplates = mysqlTable("email_templates", {
  id: int().autoincrement().notNull(),
  key: varchar({ length: 100 }).notNull(), // Unique template identifier (e.g., "welcome_email", "course_reminder")
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  category: mysqlEnum(['onboarding', 'course', 'certification', 'notification', 'marketing', 'system']).notNull(),
  subject: varchar({ length: 500 }).notNull(), // Email subject line (supports merge tags)
  htmlBody: text().notNull(), // HTML email body (supports merge tags)
  textBody: text(), // Plain text version (optional, supports merge tags)
  previewText: varchar({ length: 255 }), // Email preview text
  availableMergeTags: json().$type<{
    tag: string;
    description: string;
    example: string;
    required?: boolean;
  }[]>().notNull(), // List of available merge tags for this template
  defaultValues: json().$type<Record<string, any>>(), // Default values for merge tags
  isActive: boolean().default(true).notNull(),
  version: int().default(1).notNull(),
  parentTemplateId: int(), // Reference to parent template for versioning
  metadata: json().$type<{
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: string[];
    customHeaders?: Record<string, string>;
  }>(),
  createdBy: int().notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
  lastUsedAt: timestamp({ mode: 'string' }),
  usageCount: int().default(0).notNull(),
},
(table) => [
  index("idx_key").on(table.key),
  index("idx_category").on(table.category),
  index("idx_isActive").on(table.isActive),
]);

export const emailTemplateVersions = mysqlTable("email_template_versions", {
  id: int().autoincrement().notNull(),
  templateId: int().notNull(),
  version: int().notNull(),
  subject: varchar({ length: 500 }).notNull(),
  htmlBody: text().notNull(),
  textBody: text(),
  changeDescription: text(),
  createdBy: int().notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_templateId").on(table.templateId),
  index("idx_version").on(table.version),
]);

export const emailTemplatePreviews = mysqlTable("email_template_previews", {
  id: int().autoincrement().notNull(),
  templateId: int().notNull(),
  previewName: varchar({ length: 255 }).notNull(),
  sampleData: json().$type<Record<string, any>>().notNull(), // Sample merge tag values
  renderedHtml: text(), // Cached rendered preview
  createdBy: int().notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_templateId").on(table.templateId),
]);

// ============================================
// TYPE EXPORTS
// ============================================

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

export type EmailTemplateVersion = typeof emailTemplateVersions.$inferSelect;
export type InsertEmailTemplateVersion = typeof emailTemplateVersions.$inferInsert;

export type EmailTemplatePreview = typeof emailTemplatePreviews.$inferSelect;
export type InsertEmailTemplatePreview = typeof emailTemplatePreviews.$inferInsert;
