-- CSOAI GSPC D1 Schema
-- Aligned from Drift Product Spec + Decision Record Schema + Crosswalk

-- Registry (from Drift Product Spec §2.1)
CREATE TABLE IF NOT EXISTS registrant (
  id TEXT PRIMARY KEY,
  legal_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('provider', 'deployer', 'importer', 'distributor')),
  instruments TEXT NOT NULL,
  self_declared INTEGER DEFAULT 1,
  notify TEXT,
  cadence TEXT DEFAULT 'weekly',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS registered_system (
  id TEXT PRIMARY KEY,
  registrant_id TEXT NOT NULL REFERENCES registrant(id),
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('model', 'deployed_system', 'agent_estate', 'content_pipeline')),
  model_family TEXT,
  version TEXT,
  weights_hash TEXT,
  mode_scope TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS evidence_pack (
  id TEXT PRIMARY KEY,
  system_id TEXT NOT NULL REFERENCES registered_system(id),
  issued_at TEXT NOT NULL,
  axes TEXT NOT NULL,
  scores TEXT NOT NULL,
  anchors TEXT NOT NULL,
  harness_version TEXT,
  predicates TEXT,
  sigil_link TEXT,
  status TEXT DEFAULT 'valid' CHECK(status IN ('valid', 'stale', 'superseded', 'withdrawn')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Drift events (from Drift Product Spec §3.2)
CREATE TABLE IF NOT EXISTS drift_event (
  id TEXT PRIMARY KEY,
  detected_at TEXT NOT NULL,
  instrument TEXT NOT NULL,
  provision TEXT NOT NULL,
  hash_before TEXT,
  hash_after TEXT NOT NULL,
  change_class TEXT NOT NULL CHECK(change_class IN ('amended', 'superseded', 'repealed', 'guidance_added', 'corrigendum')),
  source_authority TEXT,
  source_uri TEXT,
  packs_staled TEXT,
  systems_affected TEXT,
  registrants_affected TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Decision ledger (from Decision Record Schema)
CREATE TABLE IF NOT EXISTS decision_record (
  id TEXT PRIMARY KEY,
  schema_version TEXT DEFAULT '1.0.0',
  kind TEXT NOT NULL CHECK(kind IN ('refutation', 'claim', 'correction', 'settled', 'law', 'definition', 'blocked')),
  claim TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK(verdict IN ('REFUTED', 'CONFIRMED', 'SETTLED', 'SUPERSEDED', 'OPEN')),
  evidence TEXT,
  tag TEXT CHECK(tag IN ('MEASURED', 'LEAD', 'GREENFIELD', 'VENDOR', 'REFUTED')),
  n INTEGER,
  interval_json TEXT,
  lower_bound INTEGER DEFAULT 0,
  decided_by TEXT,
  decided_on TEXT NOT NULL,
  method_ref TEXT,
  corpus_hash TEXT,
  supersedes TEXT,
  superseded_by TEXT,
  contested_by TEXT,
  sigil_link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Crosswalk (from Crosswalk spec §1.2)
CREATE TABLE IF NOT EXISTS crosswalk_entry (
  id TEXT PRIMARY KEY,
  instrument TEXT NOT NULL,
  provision TEXT NOT NULL,
  corpus_hash TEXT NOT NULL,
  obligation_type TEXT,
  axis TEXT NOT NULL CHECK(axis IN ('governance', 'safety', 'provenance', 'continuity')),
  mode TEXT NOT NULL CHECK(mode IN ('speaker', 'actor')),
  coverage_status TEXT NOT NULL CHECK(coverage_status IN ('covered', 'partial', 'absent')),
  sources TEXT,
  gap_reason TEXT CHECK(gap_reason IN ('no_benchmark', 'wrong_granularity', 'speaker_only', 'bare_model_only', 'judgement_based')),
  gspc_action TEXT CHECK(gspc_action IN ('author_original', 'adapt_with_attribution', 'cite_and_defer')),
  priority INTEGER,
  assessed_by TEXT,
  assessed_on TEXT,
  sigil_link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Watcher status (from Node Registry)
CREATE TABLE IF NOT EXISTS watcher_status (
  source TEXT PRIMARY KEY,
  last_checked TEXT,
  last_hash TEXT,
  status TEXT CHECK(status IN ('LIVE', 'STALE', 'UNREACHABLE')),
  uri TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_evidence_pack_system ON evidence_pack(system_id);
CREATE INDEX IF NOT EXISTS idx_evidence_pack_status ON evidence_pack(status);
CREATE INDEX IF NOT EXISTS idx_drift_event_instrument ON drift_event(instrument);
CREATE INDEX IF NOT EXISTS idx_drift_event_detected ON drift_event(detected_at);
CREATE INDEX IF NOT EXISTS idx_decision_record_kind ON decision_record(kind);
CREATE INDEX IF NOT EXISTS idx_decision_record_verdict ON decision_record(verdict);
CREATE INDEX IF NOT EXISTS idx_crosswalk_axis_mode ON crosswalk_entry(axis, mode);
CREATE INDEX IF NOT EXISTS idx_crosswalk_instrument ON crosswalk_entry(instrument);
