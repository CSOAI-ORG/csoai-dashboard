export type Framework = {
  slug: string;
  name: string;
  region: string;
  binding: boolean;
  effective?: string;
  phase: number;
  phaseLabel: string;
  description: string;
  cite: string;
  pdfName?: string;
};

export const FRAMEWORKS: Framework[] = [
  // Phase 1 — Foundation (AI Company Constitutions)
  { slug: "anthropic-constitutional-ai", name: "Anthropic Constitutional AI", region: "AI Company", binding: false, phase: 1, phaseLabel: "Foundation", description: "Constitutional AI principles → CSOAI care-generative paradigm.", cite: "Bai et al., 2022", pdfName: "CSOAI-ANTHROPIC-CONSTITUTIONAL-AI-CROSSWALK.pdf" },
  { slug: "openai-model-spec", name: "OpenAI Model Spec", region: "AI Company", binding: false, phase: 1, phaseLabel: "Foundation", description: "Model Spec rules → CSOAI Charter operational articles.", cite: "OpenAI, 2024", pdfName: "CSOAI-OPENAI-MODEL-SPEC-CROSSWALK.pdf" },

  // Phase 2 — Regulatory Compliance
  { slug: "eu-ai-act", name: "EU AI Act", region: "EU", binding: true, effective: "2 Aug 2026 (GPAI) · 2 Dec 2027 (Annex III high-risk)", phase: 2, phaseLabel: "Regulatory", description: "Regulation 2024/1689 — Articles 9 (RMS), 13 (IFU), 26 (deployer), 50 (transparency), 73 (incident).", cite: "EU 2024/1689", pdfName: "CSOAI-EU-AI-ACT-CROSSWALK.pdf" },
  { slug: "nist-ai-rmf", name: "NIST AI RMF 1.0", region: "US", binding: false, phase: 2, phaseLabel: "Regulatory", description: "Govern / Map / Measure / Manage — four functions, 19 categories, 72 subcategories.", cite: "NIST AI 100-1", pdfName: "CSOAI-NIST-AI-RMF-CROSSWALK.pdf" },
  { slug: "uk-aisi", name: "UK AISI", region: "UK", binding: false, phase: 2, phaseLabel: "Regulatory", description: "UK AI Safety Institute evaluation framework.", cite: "UK AISI 2024", pdfName: "CSOAI-UK-AISI-CROSSWALK.pdf" },
  { slug: "korea-ai-basic-act", name: "Korea AI Basic Act", region: "KR", binding: true, effective: "22 Jan 2026", phase: 2, phaseLabel: "Regulatory", description: "High-impact AI requirements + GenAI labelling.", cite: "Act No. 20193", pdfName: "CSOAI-KOREA-AI-BASIC-ACT-CROSSWALK.pdf" },
  { slug: "china-genai-measures", name: "China GenAI & Algorithm Rules", region: "CN", binding: true, effective: "15 Aug 2023", phase: 2, phaseLabel: "Regulatory", description: "Interim Measures for Generative AI Services (15 Aug 2023) + Deep Synthesis Provisions (10 Jan 2023) + Algorithm Recommendation Provisions (1 Mar 2022) — binding CAC rules: security review, labelling, training-data legality.", cite: "CAC Interim Measures 2023" },
  { slug: "colorado-ai-act", name: "Colorado AI Act (SB24-205)", region: "US-State", binding: true, effective: "1 Jan 2027", phase: 2, phaseLabel: "Regulatory", description: "First US state comprehensive AI law. Original risk-based duty-of-care text (SB24-205) was overhauled by SB 26-189 (May 2026) into a narrower disclosure/transparency regime for automated decision-making; effective 1 Jan 2027.", cite: "Colo. SB24-205 (as amended by SB26-189)" },
  { slug: "japan-ai-promotion-act", name: "Japan AI Promotion Act", region: "JP", binding: false, effective: "4 Jun 2025", phase: 2, phaseLabel: "Regulatory", description: "Act on Promotion of R&D and Utilization of AI-Related Technologies — Japan's first AI statute. In force but innovation-first / non-punitive: sets principles and coordination duties, imposes NO fines or penalties.", cite: "Japan AI Promotion Act 2025" },
  { slug: "canada-aida", name: "Canada AIDA (lapsed)", region: "CA", binding: false, phase: 2, phaseLabel: "Regulatory", description: "Artificial Intelligence and Data Act (part of Bill C-27). Died on the order paper at the Jan 2025 prorogation and was not re-introduced — NOT in force. Canada has no comprehensive federal AI law (operates under PIPEDA).", cite: "Bill C-27 (AIDA) — lapsed 2025" },
  { slug: "australia-voluntary-ai-standard", name: "Australia Voluntary AI Safety Standard", region: "AU", binding: false, effective: "Sept 2024", phase: 2, phaseLabel: "Regulatory", description: "Voluntary AI Safety Standard (10 guardrails). Voluntary; the proposed mandatory guardrails for high-risk AI remain a government proposal, not yet law.", cite: "AU DISR Voluntary AI Safety Standard 2024" },
  { slug: "india-it-synthetic-rules", name: "India IT Rules — Synthetic Content", region: "IN", binding: true, effective: "20 Feb 2026", phase: 2, phaseLabel: "Regulatory", description: "IT (Intermediary Guidelines & Digital Media Ethics Code) Amendment Rules 2026 — binding AI/deepfake labelling, provenance metadata + takedown duties on platforms. India has NO comprehensive horizontal AI statute (MeitY governance guidelines are advisory).", cite: "India IT Amendment Rules 2026" },
  { slug: "dora", name: "DORA", region: "EU", binding: true, effective: "17 Jan 2025", phase: 2, phaseLabel: "Regulatory", description: "Regulation 2022/2554 — Article 19 (4-hour incident clock for financial sector ICT).", cite: "EU 2022/2554" },
  { slug: "nis2", name: "NIS2", region: "EU", binding: true, effective: "18 Oct 2024", phase: 2, phaseLabel: "Regulatory", description: "Directive 2022/2555 — Article 23 (24h early warning / 72h incident / 1mo final report).", cite: "EU 2022/2555" },
  { slug: "cra", name: "CRA", region: "EU", binding: true, effective: "11 Sept 2026", phase: 2, phaseLabel: "Regulatory", description: "EU 2024/2847 — Article 14 active exploitation reports (24h early warning, 72h vulnerability).", cite: "EU 2024/2847" },
  { slug: "gdpr", name: "GDPR / UK GDPR", region: "EU/UK", binding: true, effective: "25 May 2018", phase: 2, phaseLabel: "Regulatory", description: "Article 22 — automated decision-making safeguards. Article 35 DPIA for high-risk.", cite: "EU 2016/679" },
  { slug: "hipaa", name: "HIPAA", region: "US", binding: true, effective: "1996", phase: 2, phaseLabel: "Regulatory", description: "US healthcare data protection + AI-specific applications.", cite: "Pub.L. 104-191" },

  // Phase 3 — International Standards
  { slug: "iso-42001", name: "ISO/IEC 42001", region: "ISO/IEC", binding: false, effective: "Dec 2023", phase: 3, phaseLabel: "Standards", description: "AI Management System standard. PDCA cycle. 10 clauses + Annex A controls.", cite: "ISO/IEC 42001:2023", pdfName: "CSOAI-ISO-IEC-42001-CROSSWALK.pdf" },
  { slug: "iso-42005", name: "ISO/IEC 42005", region: "ISO/IEC", binding: false, effective: "2025", phase: 3, phaseLabel: "Standards", description: "AI Impact Assessment standard.", cite: "ISO/IEC 42005:2025" },
  { slug: "oecd-ai-principles", name: "OECD AI Principles", region: "OECD", binding: false, phase: 3, phaseLabel: "Standards", description: "2019 + 2024 updates — 5 principles + 5 recommendations.", cite: "OECD/LEGAL/0449", pdfName: "CSOAI-OECD-AI-PRINCIPLES-CROSSWALK.pdf" },
  { slug: "unesco-ai-ethics", name: "UNESCO AI Ethics Recommendation", region: "UNESCO", binding: false, effective: "Nov 2021", phase: 3, phaseLabel: "Standards", description: "Values, principles, policy actions — adopted by 193 member states.", cite: "UNESCO 2021", pdfName: "CSOAI-UNESCO-AI-ETHICS-CROSSWALK.pdf" },
  { slug: "council-of-europe-ai-convention", name: "Council of Europe AI Convention", region: "Council of Europe", binding: false, effective: "Opened for signature 5 Sept 2024 — NOT yet in force", phase: 3, phaseLabel: "Standards", description: "First international AI treaty (CETS 225). Opened for signature Sept 2024; needs 5 ratifications (≥3 CoE members) to enter into force — not yet met as of 2026 (EU ratified May 2026). Binding only on parties once in force.", cite: "CETS No. 225", pdfName: "CSOAI-COUNCIL-OF-EUROPE-AI-CONVENTION-CROSSWALK.pdf" },

  // Phase 4 — Declarations
  { slug: "asilomar-ai-principles", name: "Asilomar AI Principles", region: "FLI", binding: false, effective: "2017", phase: 4, phaseLabel: "Declarations", description: "23 principles (Future of Life Institute).", cite: "FLI 2017", pdfName: "CSOAI-ASILOMAR-AI-PRINCIPLES-CROSSWALK.pdf" },
  { slug: "montreal-declaration", name: "Montreal Declaration", region: "Université de Montréal", binding: false, effective: "2018", phase: 4, phaseLabel: "Declarations", description: "Responsible AI development principles — 10 principles.", cite: "UdeM 2018", pdfName: "CSOAI-MONTREAL-DECLARATION-CROSSWALK.pdf" },
  { slug: "toronto-declaration", name: "Toronto Declaration", region: "Amnesty", binding: false, effective: "2018", phase: 4, phaseLabel: "Declarations", description: "Equality and non-discrimination in ML.", cite: "AI 2018", pdfName: "CSOAI-TORONTO-DECLARATION-CROSSWALK.pdf" },
  { slug: "beijing-ai-principles", name: "Beijing AI Principles", region: "BAAI", binding: false, effective: "2019", phase: 4, phaseLabel: "Declarations", description: "Chinese AI governance principles.", cite: "BAAI 2019", pdfName: "CSOAI-BEIJING-AI-PRINCIPLES-CROSSWALK.pdf" },

  // Phase 5 — Advanced Integration
  { slug: "g7-g20-ai-principles", name: "G7 / G20 AI Principles", region: "G7/G20", binding: false, phase: 5, phaseLabel: "Advanced", description: "International cooperation frameworks — Hiroshima Process + Bletchley Declaration.", cite: "G7 2023", pdfName: "CSOAI-G7-G20-AI-PRINCIPLES-CROSSWALK.pdf" },
  { slug: "ieee-ethically-aligned-design", name: "IEEE Ethically Aligned Design", region: "IEEE", binding: false, phase: 5, phaseLabel: "Advanced", description: "EAD v2 + IEEE P7000 series standards (P7001 transparency, P7002 data privacy, P7003 bias).", cite: "IEEE 2019", pdfName: "CSOAI-IEEE-ETHICALLY-ALIGNED-DESIGN-CROSSWALK.pdf" },
  { slug: "singapore-agentic-ai", name: "Singapore Agentic AI", region: "SG", binding: false, phase: 5, phaseLabel: "Advanced", description: "Singapore MAS / IMDA agentic AI guidance.", cite: "MAS/IMDA 2024", pdfName: "CSOAI-SINGAPORE-AGENTIC-AI-CROSSWALK.pdf" },
  { slug: "master-unified-crosswalk", name: "Master Unified Crosswalk", region: "CSOAI", binding: false, phase: 5, phaseLabel: "Advanced", description: "All 22 frameworks consolidated into one PDF — single source of truth for compliance teams.", cite: "CSOAI 2026", pdfName: "CSOAI-MASTER-UNIFIED-CROSSWALK.pdf" },

  // Phase 6 — Original Research
  { slug: "maritime-law-parallel", name: "Maritime Law → AI Law Parallel", region: "CSOAI Original", binding: false, phase: 6, phaseLabel: "Original Research", description: "Centuries of shipping regulation as precedent for AI governance — original CSOAI research.", cite: "CSOAI 2026", pdfName: "MARITIME-LAW-TO-AI-LAW-PARALLEL.pdf" },
  { slug: "essential-ai-law", name: "Creating Essential AI Law", region: "CSOAI Original", binding: false, phase: 6, phaseLabel: "Original Research", description: "What AI law must include to be effective — analysis of legislative essentials.", cite: "CSOAI 2026", pdfName: "CSOAI-CREATING-ESSENTIAL-AI-LAW.pdf" },
];

// Map a framework to the MCP-registry framework tag (where live MCP tools exist)
export function mcpTagForFramework(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("eu ai act")) return "EU AI Act";
  if (n.includes("nist")) return "NIST AI RMF";
  if (n.includes("42001")) return "ISO 42001";
  if (n.includes("dora")) return "DORA";
  if (n.includes("nis2")) return "NIS2";
  if (n.includes("gdpr")) return "GDPR";
  if (n.includes("hipaa")) return "HIPAA";
  return null;
}
