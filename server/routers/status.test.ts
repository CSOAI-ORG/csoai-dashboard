import { describe, it, expect, vi } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import type { TrpcContext } from "../_core/context";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext['res'],
  };
}
import { 
  systemIncidents, 
  serviceStatus, 
  uptimeMetrics,
  statusSubscriptions 
} from "../../drizzle/schema-status";

describe("Status Router", () => {
  const ctx = createTestContext();
  const caller = appRouter.createCaller(ctx);

  describe("Service Status", () => {
    it("should get all service statuses", async () => {
      const services = await caller.status.getServiceStatus();
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      
      // Check that services have required fields
      if (services.length > 0) {
        const service = services[0];
        expect(service).toHaveProperty("serviceName");
        expect(service).toHaveProperty("displayName");
        expect(service).toHaveProperty("status");
        expect(service).toHaveProperty("category");
      }
    });
  });

  describe("Uptime Statistics", () => {
    it("should get overall uptime for 30 days", async () => {
      const uptime = await caller.status.getOverallUptime({ days: 30 });
      expect(uptime).toHaveProperty("uptime");
      expect(uptime).toHaveProperty("days", 30);
      expect(uptime).toHaveProperty("totalChecks");
      expect(uptime).toHaveProperty("successfulChecks");
      expect(typeof uptime.uptime).toBe("number");
      expect(uptime.uptime).toBeGreaterThanOrEqual(0);
      expect(uptime.uptime).toBeLessThanOrEqual(100);
    });

    it("should get overall uptime for 60 days", async () => {
      const uptime = await caller.status.getOverallUptime({ days: 60 });
      expect(uptime).toHaveProperty("days", 60);
      expect(typeof uptime.uptime).toBe("number");
    });

    it("should get overall uptime for 90 days", async () => {
      const uptime = await caller.status.getOverallUptime({ days: 90 });
      expect(uptime).toHaveProperty("days", 90);
      expect(typeof uptime.uptime).toBe("number");
    });

    it("should get uptime stats for specific service", async () => {
      const stats = await caller.status.getUptimeStats({ 
        serviceName: "api", 
        days: 30 
      });
      expect(Array.isArray(stats)).toBe(true);
    });
  });

  describe("Incident Management", () => {
    it("should get list of incidents", async () => {
      const incidents = await caller.status.getIncidents({ 
        limit: 10, 
        includeResolved: false 
      });
      expect(Array.isArray(incidents)).toBe(true);
    });

    it("should report a new incident", async () => {
      const result = await caller.status.reportIncident({
        title: "Test incident - API response timeout",
        description: "Experiencing slow API responses on the training endpoint. Response times exceeding 5 seconds.",
        severity: "major",
        affectedServices: ["api", "training"],
        reporterEmail: "test@example.com",
        reporterName: "Test User",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("incidentId");
      expect(typeof result.incidentId).toBe("number");
    });

    it("should get incident details", async () => {
      // First create an incident
      const created = await caller.status.reportIncident({
        title: "Test incident for details retrieval",
        description: "This is a test incident to verify detail retrieval functionality.",
        severity: "minor",
        reporterEmail: "test@example.com",
      });

      // Then retrieve its details
      const details = await caller.status.getIncidentDetails({ 
        id: created.incidentId 
      });

      expect(details).not.toBeNull();
      expect(details?.incident).toHaveProperty("title");
      expect(details?.incident.title).toBe("Test incident for details retrieval");
      expect(details?.updates).toBeDefined();
      expect(Array.isArray(details?.updates)).toBe(true);
    });

    it("should validate incident title length", async () => {
      await expect(
        caller.status.reportIncident({
          title: "Short", // Too short
          description: "This description is long enough to pass validation requirements.",
          severity: "minor",
        })
      ).rejects.toThrow();
    });

    it("should validate incident description length", async () => {
      await expect(
        caller.status.reportIncident({
          title: "Valid title for testing",
          description: "Too short", // Too short
          severity: "minor",
        })
      ).rejects.toThrow();
    });
  });

  describe("Status Subscriptions", () => {
    it("should subscribe to status updates", async () => {
      const result = await caller.status.subscribe({
        email: "subscriber@example.com",
        services: ["api", "dashboard"],
        notifyOnIncident: true,
        notifyOnResolution: true,
        notifyOnMaintenance: false,
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("subscriptionId");
      expect(typeof result.subscriptionId).toBe("number");
    });

    it("should validate email format for subscription", async () => {
      await expect(
        caller.status.subscribe({
          email: "invalid-email", // Invalid email
          notifyOnIncident: true,
        })
      ).rejects.toThrow();
    });
  });

  describe("API Metrics", () => {
    it("should get API metrics for last 24 hours", async () => {
      const metrics = await caller.status.getApiMetrics({ 
        hours: 24 
      });
      expect(Array.isArray(metrics)).toBe(true);
    });

    it("should get API metrics for specific endpoint", async () => {
      const metrics = await caller.status.getApiMetrics({ 
        endpoint: "/api/trpc/status.getServiceStatus",
        hours: 24 
      });
      expect(Array.isArray(metrics)).toBe(true);
    });
  });

  describe("Database Schema", () => {
    it("should have system_incidents table", async () => {
      const db = await getDb();
      expect(db).toBeDefined();
      
      // Query should not throw
      const incidents = await db!.select().from(systemIncidents).limit(1);
      expect(Array.isArray(incidents)).toBe(true);
    });

    it("should have service_status table", async () => {
      const db = await getDb();
      const services = await db!.select().from(serviceStatus).limit(1);
      expect(Array.isArray(services)).toBe(true);
    });

    it("should have uptime_metrics table", async () => {
      const db = await getDb();
      const metrics = await db!.select().from(uptimeMetrics).limit(1);
      expect(Array.isArray(metrics)).toBe(true);
    });

    it("should have status_subscriptions table", async () => {
      const db = await getDb();
      const subscriptions = await db!.select().from(statusSubscriptions).limit(1);
      expect(Array.isArray(subscriptions)).toBe(true);
    });
  });
});
