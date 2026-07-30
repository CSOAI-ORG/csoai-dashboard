import type { Env, DriftEvent } from '../types';

function parseJsonField<T>(value: string | null): T | null {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

export async function handleDrift(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;
  const db = env.DB;
  const url = new URL(request.url);

  // GET /api/drift/public — public drift feed
  if (path === '/api/drift/public' && method === 'GET') {
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const instrument = url.searchParams.get('instrument');

    let query = 'SELECT * FROM drift_event';
    const params: string[] = [];

    if (instrument) {
      query += ' WHERE instrument = ?';
      params.push(instrument);
    }

    query += ' ORDER BY detected_at DESC LIMIT ?';
    params.push(String(limit));

    const { results } = await db.prepare(query).bind(...params).all();

    return Response.json({
      events: results.map(r => ({
        ...r,
        packs_staled: parseJsonField<string[]>(r.packs_staled as string),
        systems_affected: parseJsonField<string[]>(r.systems_affected as string),
        registrants_affected: parseJsonField<string[]>(r.registrants_affected as string),
      })),
      tier: 'public',
    });
  }

  // GET /api/drift/private — private drift feed (requires auth)
  if (path === '/api/drift/private' && method === 'GET') {
    // TODO: Implement authentication check
    // For now, return 401 indicating auth required
    return Response.json(
      { error: 'Authentication required for private drift feed' },
      { status: 401 }
    );
  }

  // GET /api/drift/event/:id
  const eventMatch = path.match(/^\/api\/drift\/event\/(.+)$/);
  if (eventMatch && method === 'GET') {
    const id = eventMatch[1];
    const row = await db.prepare('SELECT * FROM drift_event WHERE id = ?').bind(id).first();
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    return Response.json({
      ...row,
      packs_staled: parseJsonField<string[]>(row.packs_staled as string),
      systems_affected: parseJsonField<string[]>(row.systems_affected as string),
      registrants_affected: parseJsonField<string[]>(row.registrants_affected as string),
    });
  }

  // GET /api/drift/summary — drift summary stats
  if (path === '/api/drift/summary' && method === 'GET') {
    const total = await db.prepare('SELECT COUNT(*) as count FROM drift_event').first();
    const byInstrument = await db.prepare(
      'SELECT instrument, COUNT(*) as count FROM drift_event GROUP BY instrument'
    ).all();
    const recent = await db.prepare(
      'SELECT * FROM drift_event ORDER BY detected_at DESC LIMIT 5'
    ).all();

    return Response.json({
      total_events: total?.count || 0,
      by_instrument: byInstrument.results,
      recent: recent.results,
    });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
