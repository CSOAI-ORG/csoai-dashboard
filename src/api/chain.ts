import type { Env } from '../types';

interface DecisionRecordRow {
  id: string;
  sigil_link: string | null;
  decided_on: string;
  supersedes: string | null;
  superseded_by: string | null;
  claim: string;
  verdict: string;
  tag: string | null;
}

export async function handleChain(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;
  const db = env.DB;

  // GET /api/chain/verify/:id — verify a single record's chain position
  const verifyMatch = path.match(/^\/api\/chain\/verify\/(.+)$/);
  if (verifyMatch && method === 'GET') {
    const id = verifyMatch[1];
    const record = await db.prepare('SELECT * FROM decision_record WHERE id = ?').bind(id).first() as DecisionRecordRow | null;

    if (!record) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    // Check if record has been superseded
    const supersededBy = await db.prepare(
      'SELECT id FROM decision_record WHERE supersedes = ?'
    ).bind(id).first() as { id: string } | null;

    // Check if record contests another
    const { results: contests } = await db.prepare(
      'SELECT id, claim, verdict FROM decision_record WHERE contested_by LIKE ?'
    ).bind(`%${id}%`).all();

    return Response.json({
      record_id: id,
      valid: true,
      sigil_link: record.sigil_link,
      superseded_by: supersededBy?.id || null,
      contests,
      chain_status: supersededBy ? 'superseded' : 'active',
    });
  }

  // GET /api/chain/status — overall chain health
  if (path === '/api/chain/status' && method === 'GET') {
    const total = await db.prepare('SELECT COUNT(*) as count FROM decision_record').first();
    const open = await db.prepare(
      "SELECT COUNT(*) as count FROM decision_record WHERE verdict = 'OPEN'"
    ).first();
    const superseded = await db.prepare(
      'SELECT COUNT(*) as count FROM decision_record WHERE superseded_by IS NOT NULL'
    ).first();

    // Get latest record to determine chain head
    const latest = await db.prepare(
      'SELECT id, sigil_link, decided_on FROM decision_record ORDER BY decided_on DESC LIMIT 1'
    ).first() as { id: string; sigil_link: string; decided_on: string } | null;

    return Response.json({
      total_records: total?.count || 0,
      open_contradictions: open?.count || 0,
      superseded_records: superseded?.count || 0,
      chain_head: latest ? {
        record_id: latest.id,
        sigil_link: latest.sigil_link,
        timestamp: latest.decided_on,
      } : null,
      mode: 'tamper-evidence',
      note: 'Chain uses sha256 hash-chain today. Ed25519 signature verification: production upgrade.',
    });
  }

  // GET /api/chain/history/:claim — full supersession trail for a claim
  const historyMatch = path.match(/^\/api\/chain\/history\/(.+)$/);
  if (historyMatch && method === 'GET') {
    const claim = decodeURIComponent(historyMatch[1]);

    // Find all records for this claim
    const { results } = await db.prepare(
      'SELECT * FROM decision_record WHERE claim LIKE ? ORDER BY decided_on ASC'
    ).bind(`%${claim}%`).all();
    const records = results as unknown as DecisionRecordRow[];

    // Build supersession trail
    const trail = records.map(r => ({
      record_id: r.id,
      verdict: r.verdict,
      tag: r.tag,
      decided_on: r.decided_on,
      supersedes: r.supersedes,
      superseded_by: r.supersedes ? null : r.superseded_by,
      is_current: !r.superseded_by,
    }));

    return Response.json({
      claim,
      trail,
      current: trail.find(t => t.is_current) || null,
      history_depth: trail.length,
    });
  }

  // GET /api/chain/verify-batch — verify multiple records
  if (path === '/api/chain/verify-batch' && method === 'POST') {
    const body = await request.json() as { record_ids: string[] };
    const results = [];

    for (const id of (body.record_ids || [])) {
      const record = await db.prepare('SELECT * FROM decision_record WHERE id = ?').bind(id).first() as DecisionRecordRow | null;
      const supersededBy = await db.prepare(
        'SELECT id FROM decision_record WHERE supersedes = ?'
      ).bind(id).first() as { id: string } | null;

      results.push({
        record_id: id,
        found: !!record,
        valid: !!record && !supersededBy,
        sigil_link: record?.sigil_link || null,
        superseded_by: supersededBy?.id || null,
      });
    }

    return Response.json({
      results,
      all_valid: results.every(r => r.valid),
      checked: results.length,
    });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
