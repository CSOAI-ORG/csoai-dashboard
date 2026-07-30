/**
 * Performance Monitoring Router
 * Provides API endpoints to view query performance metrics
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getSlowQueries, getQueryStats, clearSlowQueries } from "../middleware/queryPerformanceMonitor";

export const performanceMonitorRouter = router({
  /**
   * Get all recorded slow queries
   */
  getSlowQueries: publicProcedure.query(async () => {
    return {
      queries: getSlowQueries(),
    };
  }),

  /**
   * Get query performance statistics
   */
  getStats: publicProcedure.query(async () => {
    return getQueryStats();
  }),

  /**
   * Clear slow query history (admin only)
   */
  clearHistory: publicProcedure.mutation(async () => {
    clearSlowQueries();
    return { success: true, message: "Slow query history cleared" };
  }),
});
