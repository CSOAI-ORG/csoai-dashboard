/**
 * Database Query Performance Monitoring Middleware
 * Logs execution time for slow queries (>500ms) to identify bottlenecks
 */

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  params?: any;
}

const SLOW_QUERY_THRESHOLD_MS = 500;
const slowQueries: QueryMetrics[] = [];
const MAX_STORED_QUERIES = 100;

/**
 * Monitor a database query and log if it exceeds the threshold
 */
export async function monitorQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>,
  params?: any
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;
    
    if (duration > SLOW_QUERY_THRESHOLD_MS) {
      const metrics: QueryMetrics = {
        query: queryName,
        duration: Math.round(duration),
        timestamp: new Date(),
        params: params ? JSON.stringify(params).substring(0, 200) : undefined,
      };
      
      // Log to console
      console.warn(`[SLOW QUERY] ${queryName} took ${metrics.duration}ms`, {
        params: metrics.params,
        timestamp: metrics.timestamp.toISOString(),
      });
      
      // Store in memory (circular buffer)
      slowQueries.push(metrics);
      if (slowQueries.length > MAX_STORED_QUERIES) {
        slowQueries.shift();
      }
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[QUERY ERROR] ${queryName} failed after ${Math.round(duration)}ms`, error);
    throw error;
  }
}

/**
 * Get all recorded slow queries
 */
export function getSlowQueries(): QueryMetrics[] {
  return [...slowQueries];
}

/**
 * Clear slow query history
 */
export function clearSlowQueries(): void {
  slowQueries.length = 0;
}

/**
 * Get query performance statistics
 */
export function getQueryStats() {
  if (slowQueries.length === 0) {
    return {
      totalSlowQueries: 0,
      averageDuration: 0,
      maxDuration: 0,
      minDuration: 0,
    };
  }
  
  const durations = slowQueries.map(q => q.duration);
  const sum = durations.reduce((a, b) => a + b, 0);
  
  return {
    totalSlowQueries: slowQueries.length,
    averageDuration: Math.round(sum / slowQueries.length),
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
    queries: slowQueries.slice(-10), // Last 10 slow queries
  };
}
