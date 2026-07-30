-- CSOAI D1 Schema
-- Evidence Registry + J-Space Store

-- Registrants (who holds evidence)
CREATE TABLE IF NOT EXISTS registrant (
  id TEXT PRIMARY KEY,
  legal_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('provider', 'deployer', 'importer', 'distributor')),
  instruments TEXT NOT NULL DEFAULT '[]',  -- JSON array
  self_declared INTEGER NOT NULL DEFAULT 1,
  notify TEXT,  -- JSON array
  cadence TEXT NOT NULL DEFAULT 'weekly' CHECK (cadence IN ('immediate', 'daily', 'weekly')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Registered systems
CREATE TABLE IF NOT EXISTS registered_system (
  id TEXT PRIMARY KEY,
  registrant_id TEXT NOT NULL REFERENCES registrant(id),
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('model', 'deployed_system', 'agent_estate', 'content_pipeline')),
  model_family TEXT,
  version TEXT,
  weights_hash TEXT,
  mode_scope TEXT NOT NULL DEFAULT '[]',  -- JSON array
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Evidence packs
CREATE TABLE IF NOT EXISTS evidence_pack (
  id TEXT PRIMARY KEY,
  system_id TEXT NOT NULL REFERENCES registered_system(id),
  issued_at TEXT NOT NULL,
  axes TEXT NOT NULL DEFAULT '[]',  -- JSON array
  scores TEXT NOT NULL DEFAULT '[]',  -- JSON array
  anchors TEXT NOT NULL DEFAULT '[]',  -- JSON array of {instrument, provision, corpus_hash}
  harness_version TEXT,
  predicates TEXT,  -- JSON array
  sigil_link TEXT,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'stale', 'superseded', 'withdrawn')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- J-records (signed evidence cells)
CREATE TABLE IF NOT EXISTS j_record (
  id TEXT PRIMARY KEY,
  schema_version TEXT NOT NULL DEFAULT '1.0.0',
  item_id TEXT NOT NULL,
  item_hash TEXT NOT NULL,
  subject_json TEXT NOT NULL,  -- JSON
  execution_json TEXT NOT NULL,  -- JSON
  score_json TEXT NOT NULL,  -- JSON
  anchors_json TEXT NOT NULL DEFAULT '[]',  -- JSON array
  attestation_json TEXT NOT NULL DEFAULT '{}',  -- JSON
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'stale', 'superseded', 'withdrawn')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Decision records (the refutation ledger)
CREATE TABLE IF NOT EXISTS decision_record (
  id TEXT PRIMARY KEY,
  schema_version TEXT NOT NULL DEFAULT '1.0.0',
  kind TEXT NOT NULL CHECK (kind IN ('refutation', 'claim', 'correction', 'settled', 'law', 'definition', 'blocked')),
  claim TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('REFUTED', 'CONFIRMED', 'SETTLED', 'SUPERSEDED', 'OPEN')),
  evidence TEXT,
  tag TEXT CHECK (tag IN ('MEASURED', 'LEAD', 'GREENFIELD', 'VENDOR', 'REFUTED')),
  n INTEGER,
  interval_json TEXT,
  lower_bound INTEGER NOT NULL DEFAULT 0,
  decided_by TEXT,
  decided_on TEXT NOT NULL,
  method_ref TEXT,
  corpus_hash TEXT,
  supersedes TEXT,
  superseded_by TEXT,
  contested_by TEXT,  -- JSON array
  sigil_link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Crosswalk entries (gap map)
CREATE TABLE IF NOT EXISTS crosswalk_entry (
  id TEXT PRIMARY KEY,
  instrument TEXT NOT NULL,
  provision TEXT NOT NULL,
  corpus_hash TEXT NOT NULL,
  obligation_type TEXT,
  axis TEXT NOT NULL CHECK (axis IN ('governance', 'safety', 'provenance', 'continuity')),
  mode TEXT NOT NULL CHECK (mode IN ('speaker', 'actor')),
  coverage_status TEXT NOT NULL DEFAULT 'absent' CHECK (coverage_status IN ('covered', 'partial', 'absent', 'queued')),
  sources TEXT,  -- JSON array
  gap_reason TEXT,
  gspc_action TEXT,
  priority INTEGER,
  assessed_by TEXT,
  assessed_on TEXT,
  sigil_link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Drift events
CREATE TABLE IF NOT EXISTS drift_event (
  id TEXT PRIMARY KEY,
  detected_at TEXT NOT NULL,
  instrument TEXT NOT NULL,
  provision TEXT NOT NULL,
  hash_before TEXT,
  hash_after TEXT NOT NULL,
  change_class TEXT NOT NULL CHECK (change_class IN ('amended', 'superseded', 'repealed', 'guidance_added', 'corrigendum')),
  source_authority TEXT,
  source_uri TEXT,
  packs_staled TEXT,  -- JSON array
  systems_affected TEXT,  -- JSON array
  registrants_affected TEXT,  -- JSON array
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Watcher status
CREATE TABLE IF NOT EXISTS watcher_status (
  source TEXT PRIMARY KEY,
  last_checked TEXT,
  last_hash TEXT,
  status TEXT NOT NULL DEFAULT 'LIVE' CHECK (status IN ('LIVE', 'STALE', 'UNREACHABLE')),
  uri TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_j_record_item ON j_record(item_id);
CREATE INDEX IF NOT EXISTS idx_j_record_created ON j_record(created_at);
CREATE INDEX IF NOT EXISTS idx_decision_record_kind ON decision_record(kind);
CREATE INDEX IF NOT EXISTS idx_decision_record_verdict ON decision_record(verdict);
CREATE INDEX IF NOT EXISTS idx_crosswalk_instrument ON crosswalk_entry(instrument);
CREATE INDEX IF NOT EXISTS idx_crosswalk_provision ON crosswalk_entry(provision);
CREATE INDEX IF NOT EXISTS idx_drift_instrument ON drift_event(instrument);
CREATE INDEX IF NOT EXISTS idx_evidence_pack_system ON evidence_pack(system_id);
CREATE INDEX IF NOT EXISTS idx_evidence_pack_status ON evidence_pack(status);
