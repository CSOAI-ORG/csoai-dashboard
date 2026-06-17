/**
 * Automated Health Check Monitoring Service
 * Periodically checks service health and creates incidents when services go down
 */

import { getDb } from "../db";
import { serviceStatus, systemIncidents } from "../../drizzle/schema-status";
import { eq, and, desc } from "drizzle-orm";
import { notifyIncidentCreated, notifyIncidentResolved } from "./statusNotifications";

function toMySQLDate(d: Date = new Date()): string {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

interface HealthCheckResult {
  serviceName: string;
  isHealthy: boolean;
  responseTime?: number;
  error?: string;
}

/**
 * Check health of all registered services
 */
export async function runHealthChecks(): Promise<HealthCheckResult[]> {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed for health checks');
    return [];
  }

  // Get all services to monitor
  const services = await db.select().from(serviceStatus);
  const results: HealthCheckResult[] = [];

  for (const service of services) {
    const result = await checkServiceHealth(service);
    results.push(result);

    // Update service status in database
    const newStatus = result.isHealthy ? 'operational' : 'major_outage';
    
    await db
      .update(serviceStatus)
      .set({
        status: newStatus,
        lastCheckedAt: toMySQLDate(),
        updatedAt: toMySQLDate(),
      })
      .where(eq(serviceStatus.id, service.id));

    // Check if we need to create or resolve incidents
    await handleIncidentLifecycle(service, result);
  }

  console.log(`Health checks completed: ${results.length} services checked`);
  return results;
}

/**
 * Check individual service health
 */
async function checkServiceHealth(service: any): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Define health check endpoints for each service
    const healthCheckUrls: Record<string, string> = {
      'api': `${process.env.VITE_FRONTEND_URL}/api/health`,
      'dashboard': `${process.env.VITE_FRONTEND_URL}/`,
      'training': `${process.env.VITE_FRONTEND_URL}/training`,
      'compliance': `${process.env.VITE_FRONTEND_URL}/compliance`,
      'database': 'internal', // Special case - check DB connection
    };

    const url = healthCheckUrls[service.serviceName];

    if (!url) {
      // Service doesn't have a health check endpoint - assume operational
      return {
        serviceName: service.serviceName,
        isHealthy: true,
        responseTime: 0,
      };
    }

    if (url === 'internal') {
      // Check database connection
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }
      
      // Try a simple query
      await db.select().from(serviceStatus).limit(1);
      
      return {
        serviceName: service.serviceName,
        isHealthy: true,
        responseTime: Date.now() - startTime,
      };
    }

    // HTTP health check
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        serviceName: service.serviceName,
        isHealthy: true,
        responseTime,
      };
    } else {
      return {
        serviceName: service.serviceName,
        isHealthy: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    return {
      serviceName: service.serviceName,
      isHealthy: false,
      responseTime: Date.now() - startTime,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Handle incident creation and resolution based on health check results
 */
async function handleIncidentLifecycle(service: any, result: HealthCheckResult) {
  const db = await getDb();
  if (!db) return;

  // Check if there's an active incident for this service
  const activeIncidents = await db
    .select()
    .from(systemIncidents)
    .where(
      and(
        eq(systemIncidents.status, 'investigating' as any),
        // Check if this service is in affectedServices
      )
    )
    .orderBy(desc(systemIncidents.createdAt))
    .limit(10);

  // Find incident affecting this service
  const existingIncident = activeIncidents.find(incident => {
    if (!incident.affectedServices) return false;
    const affected = JSON.parse(incident.affectedServices);
    return affected.includes(service.serviceName);
  });

  if (!result.isHealthy && !existingIncident) {
    // Service is down and no incident exists - create one
    console.log(`Creating incident for ${service.serviceName} - service is down`);
    
    const incidentResult = await db
      .insert(systemIncidents)
      .values({
        title: `${service.displayName} Service Outage`,
        description: `Automated health check detected that ${service.displayName} is not responding. ${result.error ? `Error: ${result.error}` : 'Service is unavailable.'}`,
        severity: 'major',
        status: 'investigating',
        affectedServices: JSON.stringify([service.serviceName]),
        startedAt: toMySQLDate(),
        reportedBy: null, // Auto-detected, not reported by user
      });

    // Extract incident ID safely - handle both array and object responses
    let incidentId: number | null = null;
    if (Array.isArray(incidentResult) && incidentResult[0]?.insertId) {
      incidentId = Number(incidentResult[0].insertId);
    } else if ((incidentResult as any).insertId) {
      incidentId = Number((incidentResult as any).insertId);
    }
    
    // Send notifications only if we have a valid ID
    if (incidentId && !isNaN(incidentId) && incidentId > 0) {
      await notifyIncidentCreated(incidentId);
    } else {
      console.error(`Failed to create incident for ${service.serviceName}: Invalid incident ID`, incidentResult);
    }
    
  } else if (result.isHealthy && existingIncident && existingIncident.status !== 'resolved') {
    // Service is back up and there's an active incident - resolve it
    console.log(`Resolving incident ${existingIncident.id} for ${service.serviceName} - service is back up`);
    
    await db
      .update(systemIncidents)
      .set({
        status: 'resolved',
        resolvedAt: toMySQLDate(),
        updatedAt: toMySQLDate(),
      })
      .where(eq(systemIncidents.id, existingIncident.id));

    // Send resolution notification
    await notifyIncidentResolved(existingIncident.id);
  }
}

/**
 * Initialize health monitoring with periodic checks
 * Call this function on server startup
 */
export function startHealthMonitoring() {
  console.log('Starting automated health monitoring (every 5 minutes)');
  
  // Run initial health check
  runHealthChecks().catch(error => {
    console.error('Initial health check failed:', error);
  });

  // Schedule periodic health checks every 5 minutes
  const interval = setInterval(() => {
    runHealthChecks().catch(error => {
      console.error('Scheduled health check failed:', error);
    });
  }, 5 * 60 * 1000); // 5 minutes

  // Return cleanup function
  return () => {
    clearInterval(interval);
    console.log('Health monitoring stopped');
  };
}

/**
 * Manual health check trigger (for admin use)
 */
export async function triggerManualHealthCheck() {
  console.log('Manual health check triggered');
  return await runHealthChecks();
}
