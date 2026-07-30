-- CSOAI D1 Seed Data
-- Run: wrangler d1 execute csoai-gspc --file=./seed.sql

-- Decision Records (the refutation ledger)
INSERT OR IGNORE INTO decision_record (id, schema_version, kind, claim, verdict, evidence, tag, n, interval_json, lower_bound, decided_by, decided_on, sigil_link) VALUES
('DR-0001', '1.0.0', 'correction', 'ProvBench CI upper bound', 'OPEN', 'Three values in circulation: 24.2% (n=12, mis-paired with n=108), 3.43% (n=108 Clopper-Pearson, assumes independence), 22.1% one-sided / 26.5% two-sided (n=12, asset as unit).', 'LEAD', NULL, NULL, 0, 'human', '2026-07-29', 'sig:dr0001'),
('DR-0002', '1.0.0', 'definition', 'IWM / OWM / VWM canonical mapping', 'SETTLED', 'IWM = gates + predicates (how it judges); OWM = C-space honey (what it knows, watcher-fed); VWM = render (what it shows, never decides).', 'MEASURED', NULL, NULL, 0, 'human', '2026-07-29', 'sig:dr0002'),
('DR-0003', '1.0.0', 'claim', 'ProvBench 0 survivals is MEASURED, not modelled', 'CONFIRMED', 'provbench.py: real c2pa import, real signing, real Pillow transforms, real read-back. Independently traced by two lanes.', 'MEASURED', 12, '[0, 22.1%]', 0, 'human', '2026-07-29', 'sig:dr0003'),
('DR-0004', '1.0.0', 'blocked', 'corpus-watcher cron is deployed', 'OPEN', 'AUTHORED and packaged. Never pushed to a remote, never triggered. Overclaimed twice.', 'REFUTED', NULL, NULL, 0, 'human', '2026-07-29', 'sig:dr0004'),
('DR-0005', '1.0.0', 'refutation', 'Per-dimension expert routing beats one good model', 'REFUTED', '+0.90 [-1.99, +3.79] — zero within interval. Routing OFF.', 'REFUTED', 195, '[-1.99, +3.79]', 0, 'lane', '2026-07-29', 'sig:dr0005'),
('DR-0006', '1.0.0', 'refutation', 'Statute retrieval helps (ungated)', 'REFUTED', '-9.16 [-17.64, -0.69] — significant HARM. Semantic retrieval of source statute text harms at 0.5B.', 'REFUTED', 195, '[-17.64, -0.69]', 0, 'lane', '2026-07-29', 'sig:dr0006'),
('DR-0007', '1.0.0', 'refutation', '3-leg Byzantine quorum', 'REFUTED', 'n_eff 1.21 of 3, phi +0.743. Same blood, one vote with a bigger banner. Retracted everywhere.', 'REFUTED', NULL, NULL, 0, 'lane', '2026-07-29', 'sig:dr0007'),
('DR-0008', '1.0.0', 'refutation', 'CAD (context-aware decoding) alpha sweep', 'REFUTED', 'NULL — the mechanism produced no effect.', 'REFUTED', NULL, NULL, 0, 'lane', '2026-07-29', 'sig:dr0008'),
('DR-0009', '1.0.0', 'refutation', 'Statute retrieval (relevance-gated)', 'REFUTED', '-5.26 [-12.66, +2.13] — still negative even with relevance gate.', 'REFUTED', 195, '[-12.66, +2.13]', 0, 'lane', '2026-07-29', 'sig:dr0009'),
('DR-0010', '1.0.0', 'refutation', 'Diet diversity decorrelates model errors', 'REFUTED', 'Qwen-0.5B vs OLMo-2-1B, both competent. error-rho=0.756. oracle = best_single. gain 0.0.', 'REFUTED', NULL, NULL, 0, 'lane', '2026-07-29', 'sig:dr0010'),
('DR-0011', '1.0.0', 'refutation', 'Vendor diversity decorrelates', 'REFUTED', 'Floor artifact — SmolLM2 and TinyLlama both Llama-architecture. No signal.', 'REFUTED', NULL, NULL, 0, 'lane', '2026-07-29', 'sig:dr0011'),
('DR-0012', '1.0.0', 'law', 'Every deterministic component works. Every judgement-based one failed.', 'SETTLED', 'Routing, retrieval, quorum, CAD, diet-diversity — all judgement, all dead. Gate (+34.84) and exact-match honey (+19.64) — deterministic, both alive.', 'MEASURED', NULL, NULL, 0, 'human', '2026-07-29', 'sig:dr0012');

-- Watcher Status
INSERT OR IGNORE INTO watcher_status (source, last_checked, last_hash, status, uri) VALUES
('UK legislation.gov.uk', '2026-07-29T10:00:00Z', 'hash_uk_20260729', 'LIVE', 'https://www.legislation.gov.uk'),
('EU EUR-Lex CELLAR', '2026-07-28T03:11:00Z', 'hash_eu_20260728', 'STALE', 'https://eur-lex.europa.eu'),
('C2PA Specification 2.4', '2026-07-29T10:00:00Z', 'hash_c2pa_20260729', 'LIVE', 'https://spec.c2pa.org'),
('NIST IR 8547 / FIPS 204', '2026-07-29T10:00:00Z', 'hash_nist_20260729', 'LIVE', 'https://csrc.nist.gov'),
('RFC 9964 (ML-DSA for COSE)', '2026-07-29T10:00:00Z', 'hash_rfc_20260729', 'LIVE', 'https://www.rfc-editor.org/rfc/rfc9964'),
('Crosswalk registry', '2026-07-29T10:00:00Z', 'hash_crosswalk_20260729', 'LIVE', 'local');

-- Crosswalk Entries (gap map sample)
INSERT OR IGNORE INTO crosswalk_entry (id, instrument, provision, corpus_hash, axis, mode, coverage_status, gap_reason) VALUES
('CW-001', 'EU-AI-ACT', 'Art.5(1)(a)', 'hash_eu_art5_1a', 'safety', 'speaker', 'partial', 'wrong_granularity'),
('CW-002', 'EU-AI-ACT', 'Art.5(1)(a)', 'hash_eu_art5_1a', 'safety', 'actor', 'absent', 'no_benchmark'),
('CW-003', 'EU-AI-ACT', 'Art.50(2)', 'hash_eu_art50_2', 'provenance', 'speaker', 'absent', 'no_benchmark'),
('CW-004', 'EU-AI-ACT', 'Art.50(2)', 'hash_eu_art50_2', 'provenance', 'actor', 'queued', 'no_benchmark'),
('CW-005', 'EU-AI-ACT', 'Art.14(1)', 'hash_eu_art14_1', 'governance', 'speaker', 'partial', 'wrong_granularity'),
('CW-006', 'EU-AI-ACT', 'Art.14(1)', 'hash_eu_art14_1', 'governance', 'actor', 'absent', 'no_benchmark'),
('CW-007', 'GDPR', 'Art.22(1)', 'hash_gdpr_art22_1', 'governance', 'speaker', 'partial', 'bare_model_only'),
('CW-008', 'GDPR', 'Art.22(1)', 'hash_gdpr_art22_1', 'governance', 'actor', 'queued', 'no_benchmark'),
('CW-009', 'NIST-IR-8547', 'S3.2', 'hash_nist_s3_2', 'continuity', 'speaker', 'absent', 'no_benchmark'),
('CW-010', 'NIST-IR-8547', 'S3.2', 'hash_nist_s3_2', 'continuity', 'actor', 'queued', 'no_benchmark');
