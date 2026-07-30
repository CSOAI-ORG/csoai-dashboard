// CSOAI shared types — matches spec schemas

export type Axis = "governance" | "safety" | "provenance" | "continuity";
export type Mode = "speaker" | "actor";
export type PredicateType = "exact_match" | "refusal" | "action_forbidden" | "manifest_valid" | "signature_alg";
export type VerdictStatus = "PASS" | "FAIL" | "INCOMPLETE" | "UNKNOWN";
export type Tag = "MEASURED" | "LEAD" | "GREENFIELD" | "VENDOR" | "REFUTED";
export type DecisionKind = "refutation" | "claim" | "correction" | "settled" | "law" | "definition" | "blocked";
export type DecisionVerdict = "REFUTED" | "CONFIRMED" | "SETTLED" | "SUPERSEDED" | "OPEN";
export type CoverageStatus = "covered" | "partial" | "absent" | "queued";
export type EvidenceStatus = "valid" | "stale" | "superseded" | "withdrawn";

export interface CorpusHash {
  instrument: string;
  provision: string;
  corpus_hash: string;
  as_of: string;
}

export interface JRecord {
  record_id: string;
  anchor: CorpusHash;
  subject: {
    model: string;
    family: string;
    kind: "model" | "deployed_system" | "agent_estate";
  };
  probe: {
    prompt?: string;
    goal?: string;
    tools?: string[];
    max_steps?: number;
  };
  response: string;
  predicate: {
    type: PredicateType;
    reason: string;
    pointer: string;
  };
  verdict: VerdictStatus;
  budget?: {
    step_cap: number;
    steps_used: number;
  };
  harness?: {
    version: string;
    seed: number;
    temperature: number;
  };
  axis: Axis;
  mode: Mode;
  ts: string;
  sigil_link: string;
  chain_index: number;
}

export interface DecisionRecord {
  record_id: string;
  kind: DecisionKind;
  claim: string;
  verdict: DecisionVerdict;
  evidence: string;
  tag: Tag;
  n?: number;
  interval?: string;
  lower_bound?: boolean;
  decided_by: "human" | string;
  decided_on: string;
  method_ref?: string;
  corpus_hash?: string;
  supersedes?: string;
  superseded_by?: string;
  contested_by?: string[];
  sigil_link: string;
}

export interface GapCell {
  provision: string;
  instrument: string;
  axis: Axis;
  mode: Mode;
  field_coverage: CoverageStatus;
  gspc_coverage: CoverageStatus;
  field_source?: string;
  field_granularity?: string;
  gap_reason?: "no_benchmark" | "wrong_granularity" | "speaker_only" | "bare_model_only" | "judgement_based";
}

export interface WatcherStatus {
  source: string;
  jurisdiction: string;
  status: "LIVE" | "CITED" | "AUTHORED" | "THROTTLED";
  last_checked: string;
  provisions_tracked: number;
  url: string;
}

export interface SpectrumLens {
  id: string;
  name: string;
  color: string;
  description: string;
  predicate: PredicateType;
  score?: number;
  n?: number;
  interval?: string;
}
