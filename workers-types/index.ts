// Types aligned with D1 schema + spec documents

// Cloudflare D1 type stub (full types from @cloudflare/workers-types when deployed)
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T>;
  run(): Promise<D1RunResult>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  error?: string;
  meta: { duration: number; rows_read: number; rows_written: number };
}

interface D1RunResult {
  success: boolean;
  error?: string;
  meta: { duration: number; rows_read: number; rows_written: number; last_row_id: number };
}

interface D1ExecResult {
  count: number;
  duration: number;
}

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

export interface Registrant {
  id: string;
  legal_name: string;
  jurisdiction: string;
  role: 'provider' | 'deployer' | 'importer' | 'distributor';
  instruments: string[];
  self_declared: boolean;
  notify: string[] | null;
  cadence: 'immediate' | 'daily' | 'weekly';
  created_at: string;
}

export interface RegisteredSystem {
  id: string;
  registrant_id: string;
  name: string;
  kind: 'model' | 'deployed_system' | 'agent_estate' | 'content_pipeline';
  model_family: string | null;
  version: string | null;
  weights_hash: string | null;
  mode_scope: ('speaker' | 'actor')[];
  created_at: string;
}

export interface EvidencePack {
  id: string;
  system_id: string;
  issued_at: string;
  axes: string[];
  scores: ScoreEntry[];
  anchors: AnchorEntry[];
  harness_version: string | null;
  predicates: string[] | null;
  sigil_link: string | null;
  status: 'valid' | 'stale' | 'superseded' | 'withdrawn';
  created_at: string;
}

export interface ScoreEntry {
  axis: string;
  dimension: string;
  value: number;
  ci: [number, number];
  n: number;
  lower_bound: boolean;
}

export interface AnchorEntry {
  instrument: string;
  provision: string;
  corpus_hash: string;
}

export interface DriftEvent {
  id: string;
  detected_at: string;
  instrument: string;
  provision: string;
  hash_before: string | null;
  hash_after: string;
  change_class: 'amended' | 'superseded' | 'repealed' | 'guidance_added' | 'corrigendum';
  source_authority: string | null;
  source_uri: string | null;
  packs_staled: string[] | null;
  systems_affected: string[] | null;
  registrants_affected: string[] | null;
  created_at: string;
}

export interface DecisionRecord {
  id: string;
  schema_version: string;
  kind: 'refutation' | 'claim' | 'correction' | 'settled' | 'law' | 'definition' | 'blocked';
  claim: string;
  verdict: 'REFUTED' | 'CONFIRMED' | 'SETTLED' | 'SUPERSEDED' | 'OPEN';
  evidence: string | null;
  tag: 'MEASURED' | 'LEAD' | 'GREENFIELD' | 'VENDOR' | 'REFUTED' | null;
  n: number | null;
  interval_json: string | null;
  lower_bound: boolean;
  decided_by: string | null;
  decided_on: string;
  method_ref: string | null;
  corpus_hash: string | null;
  supersedes: string | null;
  superseded_by: string | null;
  contested_by: string | null;
  sigil_link: string | null;
  created_at: string;
}

export interface CrosswalkEntry {
  id: string;
  instrument: string;
  provision: string;
  corpus_hash: string;
  obligation_type: string | null;
  axis: 'governance' | 'safety' | 'provenance' | 'continuity';
  mode: 'speaker' | 'actor';
  coverage_status: 'covered' | 'partial' | 'absent';
  sources: SourceEntry[] | null;
  gap_reason: string | null;
  gspc_action: string | null;
  priority: number | null;
  assessed_by: string | null;
  assessed_on: string | null;
  sigil_link: string | null;
  created_at: string;
}

export interface SourceEntry {
  benchmark: string;
  version: string;
  item_refs: string[];
  granularity: 'provision' | 'category' | 'thematic';
  mode: string;
  licence: string;
  ingestible: boolean;
  confidence: 'high' | 'medium' | 'low';
  note: string | null;
}

export interface WatcherStatus {
  source: string;
  last_checked: string | null;
  last_hash: string | null;
  status: 'LIVE' | 'STALE' | 'UNREACHABLE';
  uri: string | null;
}

export interface JRecord {
  record_id: string;
  schema_version: string;
  item_id: string;
  item_hash: string;
  subject: {
    name: string;
    family: string;
    version: string;
    endpoint: string;
    as_shipped: boolean;
    weights_hash: string | null;
  };
  execution: {
    harness_version: string;
    seed: number;
    temperature: number;
    started_at: string;
    completed_at: string;
    status: 'complete' | 'INCOMPLETE';
    transcript_ref: string | null;
  };
  score: {
    passed: boolean | null;
    value: number;
    care_cost: number | null;
    explanation: string;
  };
  anchors: AnchorEntry[];
  attestation: {
    sigil_link: string;
  };
  status: 'valid' | 'stale' | 'superseded' | 'withdrawn';
}
