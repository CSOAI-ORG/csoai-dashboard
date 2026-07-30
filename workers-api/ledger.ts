import type { Env, DecisionRecord } from '../workers-types';

function parseJsonField<T>(value: string | null): T | null {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

export async function handleLedger(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;
  const db = env.DB;
  const url = new URL(request.url);

  // GET /api/ledger — all decision records
  if (path === '/api/ledger' && method === 'GET') {
    const kind = url.searchParams.get('kind');
    const verdict = url.searchParams.get('verdict');
    const tag = url.searchParams.get('tag');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    let query = 'SELECT * FROM decision_record';
    const conditions: string[] = [];
    const params: string[] = [];

    if (kind) { conditions.push('kind = ?'); params.push(kind); }
    if (verdict) { conditions.push('verdict = ?'); params.push(verdict); }
    if (tag) { conditions.push('tag = ?'); params.push(tag); }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY decided_on DESC LIMIT ?';
    params.push(String(limit));

    const { results } = await db.prepare(query).bind(...params).all();

    return Response.json({
      records: results.map((r: any) => ({
        ...r,
        lower_bound: Boolean(r.lower_bound),
      })),
      count: results.length,
    });
  }

  // GET /api/ledger/contested — open contradictions (BEFORE :id match)
  if (path === '/api/ledger/contested' && method === 'GET') {
    const { results } = await db.prepare(
      "SELECT * FROM decision_record WHERE verdict = 'OPEN' OR contested_by IS NOT NULL ORDER BY decided_on DESC"
    ).all();

    return Response.json({
      records: results.map((r: any) => ({
        ...r,
        lower_bound: Boolean(r.lower_bound),
        contested_by: parseJsonField<string[]>(r.contested_by as string),
      })),
    });
  }

  // GET /api/ledger/stats — summary stats (BEFORE :id match)
  if (path === '/api/ledger/stats' && method === 'GET') {
    const total = await db.prepare('SELECT COUNT(*) as count FROM decision_record').first();
    const byKind = await db.prepare(
      'SELECT kind, COUNT(*) as count FROM decision_record GROUP BY kind'
    ).all();
    const byVerdict = await db.prepare(
      'SELECT verdict, COUNT(*) as count FROM decision_record GROUP BY verdict'
    ).all();
    const byTag = await db.prepare(
      'SELECT tag, COUNT(*) as count FROM decision_record WHERE tag IS NOT NULL GROUP BY tag'
    ).all();

    return Response.json({
      total: (total as any)?.count || 0,
      by_kind: byKind.results,
      by_verdict: byVerdict.results,
      by_tag: byTag.results,
    });
  }

  // GET /api/ledger/by-tag/:tag — records by tag (BEFORE :id match)
  const tagMatch = path.match(/^\/api\/ledger\/by-tag\/(.+)$/);
  if (tagMatch && method === 'GET') {
    const tag = tagMatch[1];
    const { results } = await db.prepare(
      'SELECT * FROM decision_record WHERE tag = ? ORDER BY decided_on DESC'
    ).bind(tag).all();

    return Response.json({
      records: results.map((r: any) => ({
        ...r,
        lower_bound: Boolean(r.lower_bound),
      })),
      tag,
      count: results.length,
    });
  }

  // GET /api/ledger/:id — single record (AFTER specific routes)
  const recordMatch = path.match(/^\/api\/ledger\/([a-zA-Z0-9-]+)$/);
  if (recordMatch && method === 'GET') {
    const id = recordMatch[1];
    const row = await db.prepare('SELECT * FROM decision_record WHERE id = ?').bind(id).first();
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    return Response.json({
      ...(row as any),
      lower_bound: Boolean((row as any).lower_bound),
    });
  }

  // POST /api/ledger — create new record (human-authored only)
  if (path === '/api/ledger' && method === 'POST') {
    const body = await request.json() as Partial<DecisionRecord>;

    // Invariant: only humans author records
    if (!body.decided_by || body.decided_by === 'auto') {
      return Response.json(
        { error: 'Decision records must be authored by a human or named lane' },
        { status: 400 }
      );
    }

    const id = body.id || `DR-${String(Date.now()).slice(-4)}`;
    const now = new Date().toISOString();

    // Verify supersedes target exists if provided
    if (body.supersedes) {
      const target = await db.prepare('SELECT id FROM decision_record WHERE id = ?').bind(body.supersedes).first();
      if (!target) {
        return Response.json(
          { error: `Superseded record ${body.supersedes} not found` },
          { status: 400 }
        );
      }
    }

    await db.prepare(
      `INSERT INTO decision_record (id, schema_version, kind, claim, verdict, evidence, tag, n, interval_json, lower_bound, decided_by, decided_on, method_ref, corpus_hash, supersedes, superseded_by, contested_by, sigil_link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.schema_version || '1.0.0',
      body.kind,
      body.claim,
      body.verdict,
      body.evidence || null,
      body.tag || null,
      body.n || null,
      body.interval_json || null,
      body.lower_bound ? 1 : 0,
      body.decided_by,
      body.decided_on,
      body.method_ref || null,
      body.corpus_hash || null,
      body.supersedes || null,
      body.superseded_by || null,
      body.contested_by ? JSON.stringify(body.contested_by) : null,
      body.sigil_link || null,
      now
    ).run();

    return Response.json({ id, ...body, created_at: now }, { status: 201 });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
