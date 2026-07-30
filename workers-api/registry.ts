import type { Env, Registrant, RegisteredSystem, EvidencePack } from '../types';

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function parseJsonField<T>(value: string | null): T | null {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

export async function handleRegistry(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method;
  const db = env.DB;

  // POST /api/registry/registrant
  if (path === '/api/registry/registrant' && method === 'POST') {
    const body = await request.json() as Partial<Registrant>;
    const id = generateId('REG');
    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO registrant (id, legal_name, jurisdiction, role, instruments, self_declared, notify, cadence, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.legal_name,
      body.jurisdiction,
      body.role,
      JSON.stringify(body.instruments || []),
      body.self_declared !== false ? 1 : 0,
      body.notify ? JSON.stringify(body.notify) : null,
      body.cadence || 'weekly',
      now
    ).run();

    return Response.json({ id, ...body, created_at: now }, { status: 201 });
  }

  // GET /api/registry/registrant/:id
  const registrantMatch = path.match(/^\/api\/registry\/registrant\/(.+)$/);
  if (registrantMatch && method === 'GET') {
    const id = registrantMatch[1];
    const row = await db.prepare('SELECT * FROM registrant WHERE id = ?').bind(id).first();
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    const registrant = {
      ...row,
      instruments: parseJsonField<string[]>(row.instruments as string) || [],
      self_declared: Boolean(row.self_declared),
      notify: parseJsonField<string[]>(row.notify as string),
    };
    return Response.json(registrant);
  }

  // POST /api/registry/system
  if (path === '/api/registry/system' && method === 'POST') {
    const body = await request.json() as Partial<RegisteredSystem>;
    const id = generateId('SYS');
    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO registered_system (id, registrant_id, name, kind, model_family, version, weights_hash, mode_scope, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.registrant_id,
      body.name,
      body.kind,
      body.model_family || null,
      body.version || null,
      body.weights_hash || null,
      body.mode_scope ? JSON.stringify(body.mode_scope) : null,
      now
    ).run();

    return Response.json({ id, ...body, created_at: now }, { status: 201 });
  }

  // GET /api/registry/system/:id
  const systemMatch = path.match(/^\/api\/registry\/system\/(.+)$/);
  if (systemMatch && method === 'GET') {
    const id = systemMatch[1];
    const row = await db.prepare('SELECT * FROM registered_system WHERE id = ?').bind(id).first();
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    const system = {
      ...row,
      mode_scope: parseJsonField<string[]>(row.mode_scope as string) || [],
    };
    return Response.json(system);
  }

  // POST /api/registry/evidence-pack
  if (path === '/api/registry/evidence-pack' && method === 'POST') {
    const body = await request.json() as Partial<EvidencePack>;
    const id = generateId('EV');
    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO evidence_pack (id, system_id, issued_at, axes, scores, anchors, harness_version, predicates, sigil_link, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.system_id,
      body.issued_at || now,
      JSON.stringify(body.axes || []),
      JSON.stringify(body.scores || []),
      JSON.stringify(body.anchors || []),
      body.harness_version || null,
      body.predicates ? JSON.stringify(body.predicates) : null,
      body.sigil_link || null,
      body.status || 'valid',
      now
    ).run();

    return Response.json({ id, ...body, created_at: now }, { status: 201 });
  }

  // GET /api/registry/evidence-pack/:id
  const packMatch = path.match(/^\/api\/registry\/evidence-pack\/([^/]+)$/);
  if (packMatch && method === 'GET') {
    const id = packMatch[1];
    const row = await db.prepare('SELECT * FROM evidence_pack WHERE id = ?').bind(id).first();
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    const pack = {
      ...row,
      axes: parseJsonField<string[]>(row.axes as string) || [],
      scores: parseJsonField(row.scores as string) || [],
      anchors: parseJsonField(row.anchors as string) || [],
      predicates: parseJsonField<string[]>(row.predicates as string),
    };

    // Check staleness: pack is stale if any corpus_hash no longer matches current
    if (pack.status === 'valid' && pack.anchors.length > 0) {
      const stale = await checkStaleness(db, pack.anchors as { instrument: string; provision: string; corpus_hash: string }[]);
      if (stale) {
        pack.status = 'stale';
      }
    }

    return Response.json(pack);
  }

  // GET /api/registry/registrants — list all
  if (path === '/api/registry/registrants' && method === 'GET') {
    const { results } = await db.prepare('SELECT * FROM registrant ORDER BY created_at DESC').all();
    return Response.json(results.map(r => ({
      ...r,
      instruments: parseJsonField<string[]>(r.instruments as string) || [],
      self_declared: Boolean(r.self_declared),
    })));
  }

  // GET /api/registry/systems — list all
  if (path === '/api/registry/systems' && method === 'GET') {
    const { results } = await db.prepare('SELECT * FROM registered_system ORDER BY created_at DESC').all();
    return Response.json(results.map(s => ({
      ...s,
      mode_scope: parseJsonField<string[]>(s.mode_scope as string) || [],
    })));
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}

async function checkStaleness(db: D1Database, anchors: { instrument: string; provision: string; corpus_hash: string }[]): Promise<boolean> {
  for (const anchor of anchors) {
    const watcher = await db.prepare(
      'SELECT last_hash FROM watcher_status WHERE source = ?'
    ).bind(anchor.instrument).first();

    if (watcher && watcher.last_hash && watcher.last_hash !== anchor.corpus_hash) {
      return true;
    }
  }
  return false;
}
