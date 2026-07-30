-- Seed data for CSOAI GSPC D1 Database
-- Run with: wrangler d1 execute csoai-gspc --file=seed.sql

-- Decision Records (the refutation ledger)
INSERT INTO decision_record (id, schema_version, kind, claim, verdict, evidence, tag, n, interval_json, lower_bound, decided_by, decided_on, sigil_link) VALUES
('DR-0001', '1.0.0', 'correction', 'ProvBench CI upper bound', 'OPEN', 'Three values in circulation: 24.2% (n=12, mis-paired with n=108), 3.43% (n=108 Clopper-Pearson, assumes independence), 22.1% one-sided / 26.5% two-sided (n=12, asset as unit).', 'LEAD', 12, '[0, 24.2%]', 0, 'human', '2026-07-29', 'sig:dr0001'),
('DR-0002', '1.0.0', 'definition', 'IWM / OWM / VWM canonical mapping', 'SETTLED', 'IWM = gates + predicates (how it judges); OWM = C-space honey (what it knows, watcher-fed); VWM = render (what it shows, never decides).', 'MEASURED', NULL, NULL, 0, 'human', '2026-07-29', 'sig:dr0002'),
('DR-0003', '1.0.0', 'claim', 'ProvBench 0 survivals is MEASURED, not modelled', 'CONFIRMED', 'provbench.py: real c2pa import, real signing, real Pillow transforms, real read-back. Three outcomes SURVIVED/DESTROYED/UNMEASURED.', 'MEASURED', 12, '[0, 22.1%]', 0, 'human', '2026-07-29', 'sig:dr0003'),
('DR-0004', '1.0.0', 'blocked', 'corpus-watcher cron is deployed', 'OPEN', 'AUTHORED and packaged. Never pushed, never triggered. Overclaimed twice.', 'REFUTED', NULL, NULL, 0, 'human', '2026-07-29', 'sig:dr0004'),
('DR-0005', '1.0.0', 'refutation', 'Per-dimension expert routing beats one good model', 'REFUTED', '+0.90 [-1.99, +3.79] — zero within interval. Routing OFF.', 'REFUTED', 195, '[-1.99, +3.79]', 0, 'lane', '2026-07-29', 'sig:dr0005'),
('DR-0006', '1.0.0', 'refutation', 'Statute retrieval helps (ungated)', 'REFUTED', '-9.16 [-17.64, -0.69] — significant HARM. Semantic retrieval of source statute text harms at 0.5B.', 'REFUTED', 195, '[-17.64, -0.69]', 0, 'lane', '2026-07-29', 'sig:dr0006'),
('DR-0007', '1.0.0', 'refutation', '3-leg Byzantine quorum', 'REFUTED', 'n_eff 1.21 of 3, phi +0.743. Same blood, one vote with a bigger banner. Retracted everywhere.', 'REFUTED', NULL, NULL, 0, 'lane', '2026-07-29', 'sig:dr0007'),
('DR-0008', '1.0.0', 'refutation', 'CAD (context-aware decoding) alpha sweep', 'REFUTED', 'NULL — the mechanism produced no effect, not measured on the wrong axis.', 'REFUTED', NULL, NULL, 0, 'lane', '2026-07-29', 'sig:dr0008'),
('DR-0009', '1.0.0', 'refutation', 'Statute retrieval (relevance-gated)', 'REFUTED', '-5.26 [-12.66, +2.13] — still negative even with relevance gate.', 'REFUTED', 195, '[-12.66, +2.13]', 0, 'lane', '2026-07-29', 'sig:dr0009'),
('DR-0010', '1.0.0', 'refutation', 'Diet diversity decorrelates model errors', 'REFUTED', 'Qwen-0.5B (web) vs OLMo-2-1B (Dolma), both competent (0.667/0.533). error-rho=0.756. oracle = best_single. gain 0.0.', 'REFUTED', NULL, NULL, 0, 'lane', '2026-07-29', 'sig:dr0010'),
('DR-0011', '1.0.0', 'refutation', 'Vendor diversity decorrelates', 'REFUTED', 'Floor artifact — SmolLM2 and TinyLlama both Llama-architecture. No signal from vendor variation alone.', 'REFUTED', NULL, NULL, 0, 'lane', '2026-07-29', 'sig:dr0011'),
('DR-0012', '1.0.0', 'law', 'Every deterministic component works. Every judgement-based one failed.', 'SETTLED', 'Routing, retrieval, quorum, CAD, diet-diversity — all judgement, all dead. Gate (+34.84) and exact-match honey (+19.64) — deterministic, both alive.', 'MEASURED', NULL, NULL, 0, 'human', '2026-07-29', 'sig:dr0012');

-- Watcher Status
INSERT INTO watcher_status (source, last_checked, last_hash, status, uri) VALUES
('UK legislation.gov.uk', '2026-07-29T10:00:00Z', 'a3f9e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a39281706f5e4d3c2b1', 'LIVE', 'https://www.legislation.gov.uk'),
('EU EUR-Lex CELLAR', '2026-07-28T03:11:00Z', 'b1a09f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2', 'STALE', 'https://eur-lex.europa.eu'),
('C2PA Specification 2.4', '2026-07-29T10:00:00Z', 'c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6', 'LIVE', 'https://spec.c2pa.org'),
('NIST IR 8547 / FIPS 204', '2026-07-29T10:00:00Z', 'd6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7', 'LIVE', 'https://csrc.nist.gov'),
('RFC 9964 (ML-DSA for COSE)', '2026-07-29T10:00:00Z', 'e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a09f8', 'LIVE', 'https://www.rfc-editor.org/rfc/rfc9964'),
('Crosswalk registry', '2026-07-29T10:00:00Z', 'f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a09', 'LIVE', 'local');
