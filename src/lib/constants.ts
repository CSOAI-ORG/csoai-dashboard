import type { Axis, Mode, PredicateType, SpectrumLens } from "./types";

export const AXES: { id: Axis; label: string; anchor: string }[] = [
  { id: "governance", label: "Governance", anchor: "obligations — Annex III, Art 43, GDPR, DORA, NIS2, CRA, CSRD" },
  { id: "safety", label: "Safety", anchor: "prohibitions — Art 5 + care battery" },
  { id: "provenance", label: "Provenance", anchor: "Art 50 + C2PA 2.4" },
  { id: "continuity", label: "Continuity", anchor: "NIST IR 8547, CNSA 2.0, RFC 9964" },
];

export const MODES: { id: Mode; label: string }[] = [
  { id: "speaker", label: "Speaker" },
  { id: "actor", label: "Actor" },
];

export const PREDICATES: { type: PredicateType; label: string; deterministic: boolean }[] = [
  { type: "exact_match", label: "Exact Match", deterministic: true },
  { type: "refusal", label: "Refusal", deterministic: true },
  { type: "action_forbidden", label: "Action Forbidden", deterministic: true },
  { type: "manifest_valid", label: "Manifest Valid", deterministic: true },
  { type: "signature_alg", label: "Signature Algorithm", deterministic: true },
];

export const INSTRUMENTS = [
  { id: "EU-AI-ACT", name: "EU AI Act", provisions: 113 },
  { id: "GDPR", name: "GDPR", provisions: 99 },
  { id: "CRA", name: "CRA", provisions: 71 },
  { id: "DORA", name: "DORA", provisions: 64 },
  { id: "NIS2", name: "NIS2", provisions: 46 },
  { id: "CSRD", name: "CSRD", provisions: 11 },
];

export const SPECTRUM_LENSES: SpectrumLens[] = [
  { id: "red", name: "Red", color: "#ef4444", description: "attacker — refusal / action_forbidden under adversarial probes", predicate: "refusal" },
  { id: "blue", name: "Blue", color: "#3b82f6", description: "defender — care_cost: protection and its over-block cost", predicate: "exact_match" },
  { id: "purple", name: "Purple", color: "#a855f7", description: "the loop — red + blue on the same item: the pair", predicate: "refusal" },
  { id: "yellow", name: "Yellow", color: "#eab308", description: "builder — manifest_valid, signature_alg", predicate: "manifest_valid" },
  { id: "orange", name: "Orange", color: "#f97316", description: "builder-with-abuse-lens — Yellow items under Red probes", predicate: "manifest_valid" },
  { id: "green", name: "Green", color: "#22c55e", description: "detection-by-design — Yellow items on Blue metric", predicate: "manifest_valid" },
  { id: "black", name: "Black", color: "#1e293b", description: "supply chain — signature_alg + provenance chain integrity", predicate: "signature_alg" },
  { id: "white", name: "White", color: "#f8fafc", description: "governance — exact_match vs the anchored obligation", predicate: "exact_match" },
];

export const BANNED_STRINGS = [
  "enforcer", "we enforce", "certified", "certification",
  "emergence", "emergent", "nothing exists", "the only",
  "unsafe", "non-compliant", "verified authentic",
  "C2PA is broken", "kill switch", "partners",
];

export const CLAIMED_RESULTS = {
  pipeline_gain: { value: 12.21, interval: "[+7.42, +17.00]", n: 195, tag: "MEASURED" as const },
  gate_gain: { value: 34.84, interval: "[+17.50, +52.18]", n: 31, tag: "MEASURED" as const },
  kb_gain: { value: 19.64, interval: "[+6.87, +32.41]", n: 14, tag: "MEASURED" as const, lower_bound: true },
  tuned_gain: { value: 9.42, interval: "[+4.82, +14.03]", n: 141, tag: "MEASURED" as const },
  overblock: { value: 0.011, n: 175, tag: "MEASURED" as const },
  provbench_survival: { survived: 0, total: 12, interval: "[0, 22.1%]", tag: "MEASURED" as const },
  cross_model_spread: { min: 43.7, max: 83.7, tag: "MEASURED" as const },
};
