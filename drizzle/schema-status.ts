import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, decimal, tinyint, index } from "drizzle-orm/mysql-core";

// System Status Incidents Table - Public transparency for platform health
export const systemIncidents = mysqlTable("system_incidents", {
  id: int().autoincrement().notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  status: mysqlEnum(['investigating', 'identified', 'monitoring', 'resolved']).default('investigating').notNull(),
  severity: mysqlEnum(['minor', 'major', 'critical']).notNull(),
  affectedServices: text(), // JSON array of affected service names
  startedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  identifiedAt: timestamp({ mode: 'string' }),
  monitoringAt: timestamp({ mode: 'string' }),
  resolvedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
  reportedBy: int(), // user ID if reported by user, null if auto-detected
  reporterEmail: varchar({ length: 320 }), // for anonymous reports
  reporterName: varchar({ length: 255 }), // for anonymous reports
  isPublic: tinyint().default(1).notNull(),
}, (table) => [
  index("idx_status_incident").on(table.status),
  index("idx_severity_incident").on(table.severity),
  index("idx_started_at").on(table.startedAt),
]);

// Incident Updates Table - Timeline of incident resolution
export const incidentUpdates = mysqlTable("incident_updates", {
  id: int().autoincrement().notNull(),
  incidentId: int().notNull(),
  status: mysqlEnum(['investigating', 'identified', 'monitoring', 'resolved']).notNull(),
  message: text().notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  createdBy: int(), // admin user ID
}, (table) => [
  index("idx_incident_id_update").on(table.incidentId),
]);

// Service Status Table - Real-time status of platform services
export const serviceStatus = mysqlTable("service_status", {
  id: int().autoincrement().notNull(),
  serviceName: varchar({ length: 100 }).notNull(),
  displayName: varchar({ length: 255 }).notNull(),
  description: text(),
  status: mysqlEnum(['operational', 'degraded', 'partial_outage', 'major_outage']).default('operational').notNull(),
  category: mysqlEnum(['core', 'api', 'dashboard', 'training', 'compliance', 'other']).default('other').notNull(),
  lastCheckedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("idx_service_name").on(table.serviceName),
  index("idx_status_service").on(table.status),
]);

// Uptime Metrics Table - Historical uptime data
export const uptimeMetrics = mysqlTable("uptime_metrics", {
  id: int().autoincrement().notNull(),
  serviceName: varchar({ length: 100 }).notNull(),
  date: varchar({ length: 10 }).notNull(), // YYYY-MM-DD format
  uptimePercent: decimal({ precision: 5, scale: 2 }).notNull(),
  totalChecks: int().notNull(),
  successfulChecks: int().notNull(),
  failedChecks: int().notNull(),
  avgResponseTimeMs: decimal({ precision: 10, scale: 2 }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_service_date").on(table.serviceName, table.date),
]);

// API Response Time Metrics Table - Performance monitoring
export const apiMetrics = mysqlTable("api_metrics", {
  id: int().autoincrement().notNull(),
  endpoint: varchar({ length: 255 }).notNull(),
  method: varchar({ length: 10 }).notNull(), // GET, POST, etc.
  responseTimeMs: int().notNull(),
  statusCode: int().notNull(),
  timestamp: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  userId: int(), // if authenticated request
}, (table) => [
  index("idx_endpoint_metrics").on(table.endpoint),
  index("idx_timestamp_metrics").on(table.timestamp),
]);

// Status Page Subscriptions Table - Email/SMS alerts for incidents
export const statusSubscriptions = mysqlTable("status_subscriptions", {
  id: int().autoincrement().notNull(),
  email: varchar({ length: 320 }),
  phone: varchar({ length: 20 }),
  services: text(), // JSON array of service names to monitor
  notifyOnIncident: tinyint().default(1).notNull(),
  notifyOnResolution: tinyint().default(1).notNull(),
  notifyOnMaintenance: tinyint().default(1).notNull(),
  isActive: tinyint().default(1).notNull(),
  verifiedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("idx_email_subscription").on(table.email),
  index("idx_active_subscription").on(table.isActive),
]);

// Type exports
export type SystemIncident = typeof systemIncidents.$inferSelect;
export type IncidentUpdate = typeof incidentUpdates.$inferSelect;
export type ServiceStatus = typeof serviceStatus.$inferSelect;
export type UptimeMetric = typeof uptimeMetrics.$inferSelect;
export type ApiMetric = typeof apiMetrics.$inferSelect;
export type StatusSubscription = typeof statusSubscriptions.$inferSelect;
