/**
 * Public Watchdog API Routes
 * Allows researchers, regulators, and media to query anonymized AI safety data
 * 
 * Endpoints:
 * - GET /api/watchdog/reports - List anonymized reports with filtering
 * - GET /api/watchdog/statistics - Aggregate statistics
 * - GET /api/watchdog/trends - Time-series trends
 * - GET /api/watchdog/systems - Most reported AI systems
 * - GET /api/watchdog/categories - Report categories breakdown
 */

import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";

const router = Router();

// Rate limiting: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Mock data - in production, this would query the database
const mockReports = [
  {
    id: 1,
    title: "ChatGPT hallucinating medical advice",
    severity: "critical",
    aiSystem: "ChatGPT-4",
    region: "United States",
    date: "2025-12-26",
    category: "Healthcare",
    views: 1243,
    status: "verified",
  },
  {
    id: 2,
    title: "Facial recognition bias in hiring",
    severity: "high",
    aiSystem: "HireBot Pro",
    region: "Europe",
    date: "2025-12-25",
    category: "Employment",
    views: 856,
    status: "investigating",
  },
  {
    id: 3,
    title: "Autonomous vehicle near-miss",
    severity: "critical",
    aiSystem: "Tesla FSD v12",
    region: "United States",
    date: "2025-12-24",
    category: "Transportation",
    views: 2156,
    status: "verified",
  },
  {
    id: 4,
    title: "Financial AI recommending risky investments",
    severity: "high",
    aiSystem: "WealthBot",
    region: "Asia",
    date: "2025-12-23",
    category: "Finance",
    views: 654,
    status: "verified",
  },
  {
    id: 5,
    title: "Content moderation AI censoring legitimate speech",
    severity: "medium",
    aiSystem: "ContentGuard",
    region: "Global",
    date: "2025-12-22",
    category: "Content Moderation",
    views: 1089,
    status: "investigating",
  },
];

/**
 * GET /api/watchdog/reports
 * List anonymized reports with filtering and pagination
 * 
 * Query parameters:
 * - severity: critical|high|medium|low (optional)
 * - category: Healthcare|Employment|Finance|Transportation|Content Moderation (optional)
 * - region: string (optional)
 * - status: verified|investigating|pending (optional)
 * - sort: recent|views|critical (default: recent)
 * - limit: 1-100 (default: 20)
 * - offset: number (default: 0)
 */
router.get("/reports", apiLimiter, (req: Request, res: Response) => {
  const {
    severity,
    category,
    region,
    status,
    sort = "recent",
    limit = "20",
    offset = "0",
  } = req.query;

  let filtered = [...mockReports];

  // Apply filters
  if (severity) {
    filtered = filtered.filter((r: any) => r.severity === severity);
  }
  if (category) {
    filtered = filtered.filter((r: any) => r.category === category);
  }
  if (region) {
    filtered = filtered.filter((r: any) =>
      r.region.toLowerCase().includes((region as string).toLowerCase())
    );
  }
  if (status) {
    filtered = filtered.filter((r: any) => r.status === status);
  }

  // Apply sorting
  if (sort === "views") {
    filtered.sort((a, b) => b.views - a.views);
  } else if (sort === "critical") {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    filtered.sort(
      (a, b) =>
        (severityOrder[a.severity as keyof typeof severityOrder] || 4) -
        (severityOrder[b.severity as keyof typeof severityOrder] || 4)
    );
  } else {
    // Default: recent
    filtered.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Apply pagination
  const limitNum = Math.min(Math.max(1, parseInt(limit as string) || 20), 100);
  const offsetNum = Math.max(0, parseInt(offset as string) || 0);
  const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      total: filtered.length,
      limit: limitNum,
      offset: offsetNum,
      returned: paginated.length,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0",
    },
  });
});

/**
 * GET /api/watchdog/statistics
 * Aggregate statistics about reports
 */
router.get("/statistics", apiLimiter, (req: Request, res: Response) => {
  const stats = {
    total_reports: mockReports.length,
    by_severity: {
      critical: mockReports.filter((r: any) => r.severity === "critical").length,
      high: mockReports.filter((r: any) => r.severity === "high").length,
      medium: mockReports.filter((r: any) => r.severity === "medium").length,
      low: mockReports.filter((r: any) => r.severity === "low").length,
    },
    by_category: mockReports.reduce(
      (acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    by_region: mockReports.reduce(
      (acc, r) => {
        acc[r.region] = (acc[r.region] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    by_status: {
      verified: mockReports.filter((r: any) => r.status === "verified").length,
      investigating: mockReports.filter((r: any) => r.status === "investigating")
        .length,
      pending: mockReports.filter((r: any) => r.status === "pending").length,
    },
    total_views: mockReports.reduce((sum: number, r: any) => sum + r.views, 0),
    average_views_per_report: Math.round(
      mockReports.reduce((sum: number, r: any) => sum + r.views, 0) / mockReports.length
    ),
  };

  res.json({
    success: true,
    data: stats,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0",
    },
  });
});

/**
 * GET /api/watchdog/trends
 * Time-series trends of reports
 * 
 * Query parameters:
 * - days: number (default: 30)
 */
router.get("/trends", apiLimiter, (req: Request, res: Response) => {
  const days = Math.min(Math.max(1, parseInt(req.query.days as string) || 30), 365);
  
  // Generate trend data
  const trends: Record<string, number> = {};
  const today = new Date().toISOString();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    
    // Mock trend data
    trends[dateStr] = Math.floor(Math.random() * 10) + 1;
  }

  res.json({
    success: true,
    data: {
      period_days: days,
      trends,
      summary: {
        total_in_period: Object.values(trends).reduce((a, b) => a + b, 0),
        average_per_day: Math.round(
          Object.values(trends).reduce((a, b) => a + b, 0) / days
        ),
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0",
    },
  });
});

/**
 * GET /api/watchdog/systems
 * Most reported AI systems
 * 
 * Query parameters:
 * - limit: 1-50 (default: 10)
 */
router.get("/systems", apiLimiter, (req: Request, res: Response) => {
  const limit = Math.min(Math.max(1, parseInt(req.query.limit as string) || 10), 50);

  const systemCounts = mockReports.reduce(
    (acc, r) => {
      acc[r.aiSystem] = (acc[r.aiSystem] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topSystems = Object.entries(systemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([system, count]) => ({
      system,
      report_count: count,
      percentage: Math.round((count / mockReports.length) * 100),
    }));

  res.json({
    success: true,
    data: topSystems,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0",
    },
  });
});

/**
 * GET /api/watchdog/categories
 * Report categories breakdown
 */
router.get("/categories", apiLimiter, (req: Request, res: Response) => {
  const categories = mockReports.reduce(
    (acc, r) => {
      const cat = acc.find((c) => c.category === r.category);
      if (cat) {
        cat.count++;
      } else {
        acc.push({ category: r.category, count: 1 });
      }
      return acc;
    },
    [] as Array<{ category: string; count: number }>
  );

  categories.sort((a, b) => b.count - a.count);

  res.json({
    success: true,
    data: categories.map((c: any) => ({
      ...c,
      percentage: Math.round((c.count / mockReports.length) * 100),
    })),
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0",
    },
  });
});

/**
 * GET /api/watchdog/health
 * API health check
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healthy",
    version: "1.0",
    timestamp: new Date().toISOString(),
  });
});

export default router;
