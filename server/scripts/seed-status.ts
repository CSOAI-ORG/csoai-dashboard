import { getDb } from "../db";
import { serviceStatus, uptimeMetrics } from "../../drizzle/schema-status";

async function seedStatusData() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  console.log("Seeding status monitoring data...");

  // Seed service status
  const services = [
    {
      serviceName: "api",
      displayName: "API Services",
      description: "Core API endpoints for all platform operations",
      status: "operational" as const,
      category: "api" as const,
    },
    {
      serviceName: "dashboard",
      displayName: "Dashboard",
      description: "Web dashboard and user interface",
      status: "operational" as const,
      category: "dashboard" as const,
    },
    {
      serviceName: "training",
      displayName: "Training Platform",
      description: "Course delivery and certification system",
      status: "operational" as const,
      category: "training" as const,
    },
    {
      serviceName: "compliance",
      displayName: "Compliance Engine",
      description: "AI system assessment and compliance checking",
      status: "operational" as const,
      category: "compliance" as const,
    },
    {
      serviceName: "watchdog",
      displayName: "Public Watchdog",
      description: "Incident reporting and tracking system",
      status: "operational" as const,
      category: "core" as const,
    },
    {
      serviceName: "council",
      displayName: "33-Agent Council",
      description: "AI-powered voting and decision system",
      status: "operational" as const,
      category: "core" as const,
    },
    {
      serviceName: "database",
      displayName: "Database",
      description: "Primary data storage and retrieval",
      status: "operational" as const,
      category: "core" as const,
    },
    {
      serviceName: "authentication",
      displayName: "Authentication",
      description: "User login and session management",
      status: "operational" as const,
      category: "core" as const,
    },
  ];

  for (const service of services) {
    await db.insert(serviceStatus).values(service).onDuplicateKeyUpdate({
      set: {
        status: service.status,
        lastCheckedAt: new Date().toISOString(),
      },
    });
  }

  console.log(`✓ Seeded ${services.length} services`);

  // Seed historical uptime data (last 90 days)
  const today = new Date();
  const uptimeData = [];

  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    for (const service of services) {
      // Simulate high uptime (99.5% - 100%)
      const uptimePercent = 99.5 + Math.random() * 0.5;
      const totalChecks = 288; // Every 5 minutes = 288 checks per day
      const successfulChecks = Math.floor((uptimePercent / 100) * totalChecks);
      const failedChecks = totalChecks - successfulChecks;
      const avgResponseTimeMs = 50 + Math.random() * 150; // 50-200ms

      uptimeData.push({
        serviceName: service.serviceName,
        date: dateStr,
        uptimePercent: uptimePercent.toFixed(2),
        totalChecks,
        successfulChecks,
        failedChecks,
        avgResponseTimeMs: avgResponseTimeMs.toFixed(2),
      });
    }
  }

  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < uptimeData.length; i += batchSize) {
    const batch = uptimeData.slice(i, i + batchSize);
    await db.insert(uptimeMetrics).values(batch);
  }

  console.log(`✓ Seeded ${uptimeData.length} uptime metric records (90 days × ${services.length} services)`);
  console.log("✓ Status monitoring data seeded successfully!");
}

seedStatusData().catch(console.error);
