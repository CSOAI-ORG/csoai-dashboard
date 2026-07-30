import type { Env } from '../types';

interface CrosswalkRow {
  id: string;
  instrument: string;
  provision: string;
  corpus_hash: string;
  obligation_type: string | null;
  axis: string;
  mode: string;
  coverage_status: string;
  sources: string | null;
  gap_reason: string | null;
  gspc_action: string | null;
  priority: number | null;
  assessed_by: string | null;
  assessed_on: string | null;
  sigil_link: string | null;
  created_at: string;
}

export async function handleGap(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;
  const db = env.DB;
  const url = new URL(request.url);

  // GET /api/gap — gap map with filters
  if (path === '/api/gap' && method === 'GET') {
    const axis = url.searchParams.get('axis');
    const mode = url.searchParams.get('mode');
    const instrument = url.searchParams.get('instrument');
    const coverage = url.searchParams.get('coverage');
    const limit = parseInt(url.searchParams.get('limit') || '500');

    let query = 'SELECT * FROM crosswalk_entry';
    const conditions: string[] = [];
    const params: string[] = [];

    if (axis) { conditions.push('axis = ?'); params.push(axis); }
    if (mode) { conditions.push('mode = ?'); params.push(mode); }
    if (instrument) { conditions.push('instrument = ?'); params.push(instrument); }
    if (coverage) { conditions.push('coverage_status = ?'); params.push(coverage); }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY instrument, provision LIMIT ?';
    params.push(String(limit));

    const { results } = await db.prepare(query).bind(...params).all();
    const entries = results as unknown as CrosswalkRow[];

    return Response.json({
      entries: entries.map(r => ({
        ...r,
        sources: r.sources ? JSON.parse(r.sources) : null,
      })),
      count: entries.length,
    });
  }

  // GET /api/gap/summary — gap statistics
  if (path === '/api/gap/summary' && method === 'GET') {
    const total = await db.prepare('SELECT COUNT(*) as count FROM crosswalk_entry').first();

    const byCoverage = await db.prepare(
      'SELECT coverage_status, COUNT(*) as count FROM crosswalk_entry GROUP BY coverage_status'
    ).all();

    const byGapReason = await db.prepare(
      `SELECT gap_reason, COUNT(*) as count FROM crosswalk_entry
       WHERE coverage_status IN ('absent', 'partial') AND gap_reason IS NOT NULL
       GROUP BY gap_reason`
    ).all();

    const byAxisMode = await db.prepare(
      'SELECT axis, mode, COUNT(*) as count FROM crosswalk_entry GROUP BY axis, mode'
    ).all();

    const byInstrument = await db.prepare(
      'SELECT instrument, COUNT(*) as count FROM crosswalk_entry GROUP BY instrument'
    ).all();

    return Response.json({
      total: total?.count || 0,
      by_coverage: byCoverage.results,
      by_gap_reason: byGapReason.results,
      by_axis_mode: byAxisMode.results,
      by_instrument: byInstrument.results,
      note: 'field_coverage is the headline — "N cells have no measurement anywhere." gspc_coverage is internal only.',
    });
  }

  // GET /api/gap/matrix — coverage matrix for visualization
  if (path === '/api/gap/matrix' && method === 'GET') {
    const { results } = await db.prepare(
      'SELECT axis, mode, coverage_status, COUNT(*) as count FROM crosswalk_entry GROUP BY axis, mode, coverage_status'
    ).all();

    const matrix: Record<string, Record<string, Record<string, number>>> = {};
    for (const row of results) {
      const axis = row.axis as string;
      const mode = row.mode as string;
      const status = row.coverage_status as string;
      const count = row.count as number;

      if (!matrix[axis]) matrix[axis] = {};
      if (!matrix[axis][mode]) matrix[axis][mode] = {};
      matrix[axis][mode][status] = count;
    }

    return Response.json({
      matrix,
      axes: ['governance', 'safety', 'provenance', 'continuity'],
      modes: ['speaker', 'actor'],
      statuses: ['covered', 'partial', 'absent'],
    });
  }

  // GET /api/gap/blind-spots — provisions with zero field coverage
  if (path === '/api/gap/blind-spots' && method === 'GET') {
    const { results } = await db.prepare(
      `SELECT * FROM crosswalk_entry
       WHERE coverage_status = 'absent'
       ORDER BY instrument, provision`
    ).all();
    const entries = results as unknown as CrosswalkRow[];

    return Response.json({
      entries: entries.map(r => ({
        ...r,
        sources: r.sources ? JSON.parse(r.sources) : null,
      })),
      count: entries.length,
      note: 'These are the provisions with no measurement anywhere in the field — the headline finding.',
    });
  }

  // GET /api/gap/entry/:id — single crosswalk entry
  const entryMatch = path.match(/^\/api\/gap\/entry\/(.+)$/);
  if (entryMatch && method === 'GET') {
    const id = entryMatch[1];
    const row = await db.prepare('SELECT * FROM crosswalk_entry WHERE id = ?').bind(id).first() as CrosswalkRow | null;
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    return Response.json({
      ...row,
      sources: row.sources ? JSON.parse(row.sources) : null,
    });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
