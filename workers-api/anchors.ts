import type { Env } from '../types';

interface WatcherRow {
  source: string;
  status: string;
  last_checked: string | null;
  last_hash: string | null;
  uri: string | null;
}

export async function handleAnchors(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;
  const db = env.DB;

  // GET /api/anchors — all watcher statuses
  if (path === '/api/anchors' && method === 'GET') {
    const { results } = await db.prepare('SELECT * FROM watcher_status ORDER BY source').all();
    const watchers = results as unknown as WatcherRow[];

    return Response.json({
      watchers,
      count: watchers.length,
      live_count: watchers.filter(r => r.status === 'LIVE').length,
    });
  }

  // GET /api/anchors/:source — single watcher
  const sourceMatch = path.match(/^\/api\/anchors\/(.+)$/);
  if (sourceMatch && method === 'GET') {
    const source = decodeURIComponent(sourceMatch[1]);
    const row = await db.prepare('SELECT * FROM watcher_status WHERE source = ?').bind(source).first();
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    return Response.json(row);
  }

  // GET /api/anchors/health — health summary
  if (path === '/api/anchors/health' && method === 'GET') {
    const { results } = await db.prepare('SELECT * FROM watcher_status').all();
    const watchers = results as unknown as WatcherRow[];

    const now = Date.now();
    const ALARM_AFTER_HOURS = 72;
    const ALARM_MS = ALARM_AFTER_HOURS * 60 * 60 * 1000;

    const health = watchers.map(w => {
      const lastChecked = w.last_checked ? new Date(w.last_checked).getTime() : 0;
      const hoursSince = lastChecked ? Math.floor((now - lastChecked) / (1000 * 60 * 60)) : null;
      const stale = lastChecked ? (now - lastChecked) > ALARM_MS : true;

      return {
        source: w.source,
        status: w.status,
        last_checked: w.last_checked,
        hours_since_check: hoursSince,
        is_stale: stale,
        alarm: stale && w.status !== 'UNREACHABLE',
      };
    });

    const staleCount = health.filter(h => h.is_stale).length;
    const unreachableCount = watchers.filter(r => r.status === 'UNREACHABLE').length;

    return Response.json({
      watchers: health,
      summary: {
        total: watchers.length,
        live: watchers.filter(r => r.status === 'LIVE').length,
        throttled: watchers.filter(r => r.status === 'THROTTLED').length,
        unreachable: unreachableCount,
        stale: staleCount,
        healthy: staleCount === 0 && unreachableCount === 0,
      },
      alarm_note: staleCount > 0
        ? `${staleCount} watcher(s) haven't succeeded in ${ALARM_AFTER_HOURS}+ hours — they may be broken.`
        : 'All watchers healthy.',
    });
  }

  // PUT /api/anchors/:source — update watcher status (internal use)
  if (path.startsWith('/api/anchors/') && method === 'PUT') {
    const source = decodeURIComponent(path.replace('/api/anchors/', ''));
    const body = await request.json() as { status?: string; last_hash?: string; last_checked?: string };

    const existing = await db.prepare('SELECT * FROM watcher_status WHERE source = ?').bind(source).first();
    if (!existing) {
      return Response.json({ error: 'Watcher not found' }, { status: 404 });
    }

    await db.prepare(
      `UPDATE watcher_status SET status = ?, last_hash = ?, last_checked = ? WHERE source = ?`
    ).bind(
      body.status || existing.status,
      body.last_hash || existing.last_hash,
      body.last_checked || new Date().toISOString(),
      source
    ).run();

    return Response.json({ source, updated: true });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
