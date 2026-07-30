// D1 Client — connects to the Cloudflare Worker API
// In development, uses mock data. In production, calls the worker.

import { MOCK_J_RECORDS, MOCK_DECISION_RECORDS, MOCK_GAP_CELLS, MOCK_WATCHERS, MOCK_CLAIMABLE } from './mock-data';
import type { JRecord, DecisionRecord, GapCell, WatcherStatus } from './types';

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || '';

// Use mock data when worker is not available
const USE_MOCK = !WORKER_URL;

export async function fetchJRecords(params?: {
  axis?: string;
  mode?: string;
  limit?: number;
}): Promise<JRecord[]> {
  if (USE_MOCK) {
    let records = MOCK_J_RECORDS;
    if (params?.axis) records = records.filter(r => r.axis === params.axis);
    if (params?.mode) records = records.filter(r => r.mode === params.mode);
    return records.slice(0, params?.limit || 100);
  }

  const searchParams = new URLSearchParams();
  if (params?.axis) searchParams.set('axis', params.axis);
  if (params?.mode) searchParams.set('mode', params.mode);
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const response = await fetch(`${WORKER_URL}/api/ledger?${searchParams}`);
  const data = await response.json();
  return data.records || [];
}

export async function fetchDecisionRecords(params?: {
  kind?: string;
  verdict?: string;
  tag?: string;
  limit?: number;
}): Promise<DecisionRecord[]> {
  if (USE_MOCK) {
    let records = MOCK_DECISION_RECORDS;
    if (params?.kind) records = records.filter(r => r.kind === params.kind);
    if (params?.verdict) records = records.filter(r => r.verdict === params.verdict);
    if (params?.tag) records = records.filter(r => r.tag === params.tag);
    return records.slice(0, params?.limit || 100);
  }

  const searchParams = new URLSearchParams();
  if (params?.kind) searchParams.set('kind', params.kind);
  if (params?.verdict) searchParams.set('verdict', params.verdict);
  if (params?.tag) searchParams.set('tag', params.tag);
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const response = await fetch(`${WORKER_URL}/api/ledger?${searchParams}`);
  const data = await response.json();
  return data.records || [];
}

export async function fetchGapCells(params?: {
  instrument?: string;
  axis?: string;
  mode?: string;
}): Promise<GapCell[]> {
  if (USE_MOCK) {
    let cells = MOCK_GAP_CELLS;
    if (params?.instrument) cells = cells.filter(c => c.instrument === params.instrument);
    if (params?.axis) cells = cells.filter(c => c.axis === params.axis);
    if (params?.mode) cells = cells.filter(c => c.mode === params.mode);
    return cells;
  }

  const searchParams = new URLSearchParams();
  if (params?.instrument) searchParams.set('instrument', params.instrument);
  if (params?.axis) searchParams.set('axis', params.axis);
  if (params?.mode) searchParams.set('mode', params.mode);

  const response = await fetch(`${WORKER_URL}/api/gap?${searchParams}`);
  const data = await response.json();
  return data.cells || [];
}

export async function fetchWatchers(): Promise<WatcherStatus[]> {
  if (USE_MOCK) {
    return MOCK_WATCHERS;
  }

  const response = await fetch(`${WORKER_URL}/api/anchors`);
  const data = await response.json();
  return data.watchers || [];
}

export async function submitProbe(probe: {
  model: string;
  prompt?: string;
  goal?: string;
  tools?: string[];
  max_steps?: number;
  axis: string;
  mode: string;
  provision: string;
  instrument: string;
}): Promise<{
  record: JRecord;
  predicate: { passed: boolean | null; value: number; explanation: string };
  panel: string[];
}> {
  if (USE_MOCK) {
    // Return mock result
    const record = MOCK_J_RECORDS[0];
    return {
      record,
      predicate: { passed: true, value: 1, explanation: 'mock: head[:400] matched refusal pattern' },
      panel: [
        `▸ anchored     ${probe.instrument} ${probe.provision} · corpus_hash mock_hash…`,
        `▸ probe sent   ${probe.model} · seed 42 · temp 0.0 · harness v1.0.0`,
        `▸ response     Mock response from ${probe.model}`,
        `▸ predicate    refusal → head[:400] matched refusal pattern`,
        `▸ verdict      PASS · deterministic`,
        `▸ budget       step_cap ${probe.max_steps || 12} · steps_used 1`,
        `▸ signed       mock-record · chain intact · [ verify ↓ ]`,
      ],
    };
  }

  const response = await fetch(`${WORKER_URL}/api/probe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(probe),
  });

  return response.json();
}
