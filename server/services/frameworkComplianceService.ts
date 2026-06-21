/**
 * Multi-Framework Compliance Registry
 *
 * Provides a unified view of AI governance frameworks so CSOAI can assess
 * systems against EU AI Act, NIST AI RMF, ISO 42001, GDPR, DORA and NIS2.
 * This is intentionally a v1 mapping; each framework can be expanded
 * independently as the platform matures.
 */

export type RiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal' | 'general';

export interface FrameworkRequirement {
  id: string;
  framework: string;
  frameworkSlug: string;
  section: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  applicableSystems: string[];
  controls: string[];
  evidenceRequired: string[];
  complianceIndicators: string[];
  references: string[];
}

export interface ComplianceFramework {
  slug: string;
  name: string;
  region: string;
  status: 'primary' | 'active' | 'upcoming';
  description: string;
  effectiveDate?: string;
  penalties?: string;
  version: string;
  requirementCount: number;
}

const FRAMEWORKS: ComplianceFramework[] = [
  {
    slug: 'eu-ai-act',
    name: 'EU AI Act',
    region: 'EU',
    status: 'primary',
    description: 'The European Union Artificial Intelligence Act (Regulation 2024/1689). Risk-based regulation for AI systems placed on the EU market.',
    effectiveDate: '2026-08-02',
    penalties: '€35M or 7% of global turnover',
    version: '2024/1689',
    requirementCount: 0, // populated from requirements
  },
  {
    slug: 'nist-rmf',
    name: 'NIST AI Risk Management Framework',
    region: 'US',
    status: 'active',
    description: 'Voluntary US framework for managing risks to individuals, organisations and society associated with AI.',
    effectiveDate: '2023-01-26',
    penalties: 'n/a (voluntary)',
    version: '1.0',
    requirementCount: 0,
  },
  {
    slug: 'iso-42001',
    name: 'ISO/IEC 42001',
    region: 'Global',
    status: 'active',
    description: 'International management system standard for AI, providing an AIMS (AI Management System) structure.',
    effectiveDate: '2023-12-18',
    penalties: 'cert withdrawal',
    version: '2023',
    requirementCount: 0,
  },
  {
    slug: 'gdpr',
    name: 'GDPR',
    region: 'EU',
    status: 'active',
    description: 'General Data Protection Regulation — applies whenever AI processes personal data of EU data subjects.',
    effectiveDate: '2018-05-25',
    penalties: '€20M or 4% of global turnover',
    version: '2016/679',
    requirementCount: 0,
  },
  {
    slug: 'dora',
    name: 'Digital Operational Resilience Act',
    region: 'EU',
    status: 'active',
    description: 'EU regulation on digital operational resilience for the financial sector, including ICT risk management and incident reporting.',
    effectiveDate: '2025-01-17',
    penalties: '1% daily turnover',
    version: '2022/2554',
    requirementCount: 0,
  },
  {
    slug: 'nis2',
    name: 'NIS2',
    region: 'EU',
    status: 'active',
    description: 'EU Directive on measures for a high common level of cybersecurity across the Union.',
    effectiveDate: '2024-10-17',
    penalties: '€10M or 2% of global turnover',
    version: '2022/2555',
    requirementCount: 0,
  },
];

const REQUIREMENTS: FrameworkRequirement[] = [
  // EU AI Act
  {
    id: 'euai-art5-subliminal',
    framework: 'EU AI Act',
    frameworkSlug: 'eu-ai-act',
    section: 'Article 5 — Prohibited AI practices',
    title: 'No subliminal or manipulative techniques',
    description: 'AI systems must not deploy subliminal techniques beyond consciousness to materially distort behaviour in a way that causes harm.',
    riskLevel: 'prohibited',
    applicableSystems: ['all'],
    controls: ['Prohibited-practice review', 'UX transparency audit'],
    evidenceRequired: ['System design doc', 'UX screenshots', 'Legal review'],
    complianceIndicators: ['No hidden persuasion', 'Clear AI disclosure'],
    references: ['EU AI Act Art 5(1)'],
  },
  {
    id: 'euai-art6-risk-class',
    framework: 'EU AI Act',
    frameworkSlug: 'eu-ai-act',
    section: 'Article 6 — Classification of high-risk AI',
    title: 'Risk classification documented',
    description: 'Document whether the AI system is high-risk according to Annex III and why.',
    riskLevel: 'high',
    applicableSystems: ['all'],
    controls: ['Risk classification worksheet', 'Annex III checklist'],
    evidenceRequired: ['Risk classification record', 'System purpose statement'],
    complianceIndicators: ['Risk level assigned', 'Annex III rationale recorded'],
    references: ['EU AI Act Art 6, Annex III'],
  },
  {
    id: 'euai-art9-risk-mgmt',
    framework: 'EU AI Act',
    frameworkSlug: 'eu-ai-act',
    section: 'Article 9 — Risk management system',
    title: 'Risk management system',
    description: 'Establish, implement, document and maintain a risk management system for high-risk AI.',
    riskLevel: 'high',
    applicableSystems: ['high-risk'],
    controls: ['Risk management plan', 'Residual risk register', 'Mitigation owners'],
    evidenceRequired: ['Risk management system documentation', 'Risk register'],
    complianceIndicators: ['Risks identified', 'Mitigations implemented', 'Residual risk accepted'],
    references: ['EU AI Act Art 9'],
  },
  {
    id: 'euai-art10-data-gov',
    framework: 'EU AI Act',
    frameworkSlug: 'eu-ai-act',
    section: 'Article 10 — Data and data governance',
    title: 'Training, validation and testing data governance',
    description: 'Data sets meet quality criteria including relevance, representativeness and freedom from errors.',
    riskLevel: 'high',
    applicableSystems: ['high-risk'],
    controls: ['Data governance policy', 'Bias testing', 'Data quality report'],
    evidenceRequired: ['Data governance documentation', 'Bias test results'],
    complianceIndicators: ['Data quality checks passed', 'Bias within acceptable limits'],
    references: ['EU AI Act Art 10'],
  },
  {
    id: 'euai-art13-transparency',
    framework: 'EU AI Act',
    frameworkSlug: 'eu-ai-act',
    section: 'Article 13 — Transparency',
    title: 'Technical documentation and transparency',
    description: 'High-risk AI systems must be designed and developed to enable interpretability and be accompanied by clear instructions.',
    riskLevel: 'high',
    applicableSystems: ['high-risk'],
    controls: ['Technical documentation', 'Model cards', 'Instructions for use'],
    evidenceRequired: ['Technical documentation file', 'Model card'],
    complianceIndicators: ['Documentation complete', 'Instructions provided to deployers'],
    references: ['EU AI Act Art 13'],
  },
  {
    id: 'euai-art14-oversight',
    framework: 'EU AI Act',
    frameworkSlug: 'eu-ai-act',
    section: 'Article 14 — Human oversight',
    title: 'Human oversight measures',
    description: 'High-risk AI systems must be designed so natural persons can effectively oversee them.',
    riskLevel: 'high',
    applicableSystems: ['high-risk'],
    controls: ['Human-in-the-loop design', 'Override mechanism', 'Operator training'],
    evidenceRequired: ['Oversight procedure', 'Training records'],
    complianceIndicators: ['Override tested', 'Operators trained'],
    references: ['EU AI Act Art 14'],
  },
  {
    id: 'euai-art50-transparency',
    framework: 'EU AI Act',
    frameworkSlug: 'eu-ai-act',
    section: 'Article 50 — Transparency obligations for GPAI and chatbots',
    title: 'Transparency for general-purpose and chatbot AI',
    description: 'Disclose AI-generated content, watermark synthetic outputs, and label deep fakes.',
    riskLevel: 'limited',
    applicableSystems: ['chatbot', 'generation'],
    controls: ['AI disclosure label', 'Watermarking', 'Synthetic content metadata'],
    evidenceRequired: ['Disclosure screenshots', 'Watermarking implementation doc'],
    complianceIndicators: ['Users informed they interact with AI', 'Outputs watermarked'],
    references: ['EU AI Act Art 50'],
  },
  // NIST AI RMF
  {
    id: 'nist-govern-1',
    framework: 'NIST AI RMF',
    frameworkSlug: 'nist-rmf',
    section: 'GOVERN',
    title: 'Policies, processes and procedures',
    description: 'Organisational policies, processes and procedures are in place to manage AI risk.',
    riskLevel: 'general',
    applicableSystems: ['all'],
    controls: ['AI governance policy', 'Roles and responsibilities', 'Risk tolerance statement'],
    evidenceRequired: ['AI governance policy', 'Risk appetite statement'],
    complianceIndicators: ['Policy approved', 'Accountability assigned'],
    references: ['NIST AI RMF GOVERN 1-4'],
  },
  {
    id: 'nist-map-1',
    framework: 'NIST AI RMF',
    frameworkSlug: 'nist-rmf',
    section: 'MAP',
    title: 'Context and AI system categorisation',
    description: 'Identify the context for which an AI system is intended and categorise the system.',
    riskLevel: 'general',
    applicableSystems: ['all'],
    controls: ['System inventory', 'Context-of-use documentation', 'Stakeholder mapping'],
    evidenceRequired: ['AI system inventory', 'Context-of-use record'],
    complianceIndicators: ['System categorised', 'Stakeholders identified'],
    references: ['NIST AI RMF MAP 1-2'],
  },
  {
    id: 'nist-measure-1',
    framework: 'NIST AI RMF',
    frameworkSlug: 'nist-rmf',
    section: 'MEASURE',
    title: 'Test, evaluate and verify AI systems',
    description: 'Employ qualitative and quantitative techniques to test, evaluate and verify AI system performance.',
    riskLevel: 'general',
    applicableSystems: ['all'],
    controls: ['Test plan', 'Evaluation metrics', 'Independent review'],
    evidenceRequired: ['Test reports', 'Evaluation results'],
    complianceIndicators: ['Tests executed', 'Performance acceptable'],
    references: ['NIST AI RMF MEASURE 1-3'],
  },
  {
    id: 'nist-manage-1',
    framework: 'NIST AI RMF',
    frameworkSlug: 'nist-rmf',
    section: 'MANAGE',
    title: 'Risk treatment and response',
    description: 'Manage AI risks based on assessments and allocate resources to respond to risks.',
    riskLevel: 'general',
    applicableSystems: ['all'],
    controls: ['Risk treatment plan', 'Incident response', 'Monitoring'],
    evidenceRequired: ['Risk treatment plan', 'Incident response playbook'],
    complianceIndicators: ['Treatments assigned', 'Response tested'],
    references: ['NIST AI RMF MANAGE 1-3'],
  },
  // ISO 42001
  {
    id: 'iso42001-4',
    framework: 'ISO/IEC 42001',
    frameworkSlug: 'iso-42001',
    section: 'Clause 4 — Context of the organisation',
    title: 'AI management system scope',
    description: 'Determine internal and external issues and define the scope of the AIMS.',
    riskLevel: 'general',
    applicableSystems: ['all'],
    controls: ['AIMS scope statement', 'Interested parties register'],
    evidenceRequired: ['Scope statement', 'Issue register'],
    complianceIndicators: ['Scope defined', 'Issues tracked'],
    references: ['ISO 42001 Clauses 4.1-4.4'],
  },
  {
    id: 'iso42001-6',
    framework: 'ISO/IEC 42001',
    frameworkSlug: 'iso-42001',
    section: 'Clause 6 — Planning',
    title: 'AI risk and opportunity actions',
    description: 'Plan actions to address AI risks and opportunities and establish AI objectives.',
    riskLevel: 'general',
    applicableSystems: ['all'],
    controls: ['Risk register', 'AI objectives', 'Action plans'],
    evidenceRequired: ['Risk and opportunity register', 'AI objectives document'],
    complianceIndicators: ['Objectives set', 'Actions planned'],
    references: ['ISO 42001 Clauses 6.1-6.3'],
  },
  {
    id: 'iso42001-9',
    framework: 'ISO/IEC 42001',
    frameworkSlug: 'iso-42001',
    section: 'Clause 9 — Performance evaluation',
    title: 'Monitoring, measurement, analysis and evaluation',
    description: 'Evaluate AI system performance and the performance of the AIMS.',
    riskLevel: 'general',
    applicableSystems: ['all'],
    controls: ['KPIs', 'Internal audit programme', 'Management review'],
    evidenceRequired: ['KPI dashboard', 'Internal audit report'],
    complianceIndicators: ['Metrics tracked', 'Audits completed'],
    references: ['ISO 42001 Clauses 9.1-9.3'],
  },
  // GDPR
  {
    id: 'gdpr-5',
    framework: 'GDPR',
    frameworkSlug: 'gdpr',
    section: 'Article 5 — Principles',
    title: 'Lawfulness, fairness and transparency',
    description: 'Personal data must be processed lawfully, fairly and transparently.',
    riskLevel: 'high',
    applicableSystems: ['all'],
    controls: ['Lawful basis assessment', 'Privacy notice', 'Records of processing'],
    evidenceRequired: ['Lawful basis record', 'Privacy notice'],
    complianceIndicators: ['Lawful basis documented', 'Notice provided'],
    references: ['GDPR Art 5, 6, 13, 14'],
  },
  {
    id: 'gdpr-25',
    framework: 'GDPR',
    frameworkSlug: 'gdpr',
    section: 'Article 25 — Data protection by design and default',
    title: 'Data protection by design and default',
    description: 'Implement data protection principles and safeguards by design and by default.',
    riskLevel: 'high',
    applicableSystems: ['all'],
    controls: ['Dpia trigger checklist', 'Privacy-by-design review', 'Default settings audit'],
    evidenceRequired: ['DPIA', 'Design review minutes'],
    complianceIndicators: ['DPIA completed where required', 'Defaults minimise data'],
    references: ['GDPR Art 25, 35'],
  },
  // DORA
  {
    id: 'dora-6',
    framework: 'DORA',
    frameworkSlug: 'dora',
    section: 'Article 6 — ICT risk management framework',
    title: 'ICT risk management framework',
    description: 'Financial entities must have a sound, comprehensive and well-documented ICT risk management framework.',
    riskLevel: 'high',
    applicableSystems: ['all'],
    controls: ['ICT risk framework', 'Asset inventory', 'Risk tolerance'],
    evidenceRequired: ['ICT risk framework document', 'Asset inventory'],
    complianceIndicators: ['Framework approved', 'Assets inventoried'],
    references: ['DORA Art 6'],
  },
  {
    id: 'dora-10',
    framework: 'DORA',
    frameworkSlug: 'dora',
    section: 'Article 10 — ICT-related incident management',
    title: 'ICT-related incident reporting',
    description: 'Detect, manage and report major ICT-related incidents to competent authorities.',
    riskLevel: 'high',
    applicableSystems: ['all'],
    controls: ['Incident response plan', 'Reporting workflow', 'Classification matrix'],
    evidenceRequired: ['Incident response plan', 'Major incident reports'],
    complianceIndicators: ['Incidents classified', 'Reports submitted on time'],
    references: ['DORA Art 10'],
  },
  // NIS2
  {
    id: 'nis2-20',
    framework: 'NIS2',
    frameworkSlug: 'nis2',
    section: 'Article 20 — Governance',
    title: 'Cybersecurity risk management measures',
    description: 'Entities must take appropriate technical and organisational measures to manage cybersecurity risks.',
    riskLevel: 'high',
    applicableSystems: ['all'],
    controls: ['Risk management policy', 'Supply chain security', 'Access control'],
    evidenceRequired: ['Cybersecurity policy', 'Access control review'],
    complianceIndicators: ['Policy approved', 'Access controls effective'],
    references: ['NIS2 Art 20'],
  },
  {
    id: 'nis2-23',
    framework: 'NIS2',
    frameworkSlug: 'nis2',
    section: 'Article 23 — Incident reporting',
    title: 'Reporting of significant incidents',
    description: 'Report significant incidents without undue delay and within 24 hours or 72 hours as applicable.',
    riskLevel: 'high',
    applicableSystems: ['all'],
    controls: ['Incident reporting procedure', 'Escalation matrix'],
    evidenceRequired: ['Reporting procedure', 'Incident logs'],
    complianceIndicators: ['Reports filed within deadlines'],
    references: ['NIS2 Art 23'],
  },
];

// Populate requirement counts on first use.
FRAMEWORKS.forEach((fw) => {
  fw.requirementCount = REQUIREMENTS.filter((r) => r.frameworkSlug === fw.slug).length;
});

export class FrameworkComplianceService {
  static getFrameworks(): ComplianceFramework[] {
    return FRAMEWORKS.map((fw) => ({ ...fw }));
  }

  static getFramework(slug: string): ComplianceFramework | undefined {
    return FRAMEWORKS.find((fw) => fw.slug === slug);
  }

  static getRequirements(filters?: {
    frameworkSlug?: string;
    riskLevel?: RiskLevel;
    systemType?: string;
  }): FrameworkRequirement[] {
    let list = REQUIREMENTS;
    if (filters?.frameworkSlug) {
      list = list.filter((r) => r.frameworkSlug === filters.frameworkSlug);
    }
    if (filters?.riskLevel) {
      list = list.filter((r) => r.riskLevel === filters.riskLevel);
    }
    if (filters?.systemType) {
      list = list.filter(
        (r) =>
          r.applicableSystems.includes('all') ||
          r.applicableSystems.includes(filters.systemType!)
      );
    }
    return list;
  }

  static calculateScore(implementedControls: string[], frameworkSlug?: string): number {
    const requirements = this.getRequirements({ frameworkSlug });
    if (!requirements.length) return 0;
    const covered = requirements.filter((req) =>
      req.controls.some((c) =>
        implementedControls.some((ic) => ic.toLowerCase().includes(c.toLowerCase()))
      )
    ).length;
    return Math.round((covered / requirements.length) * 100);
  }

  static gapAnalysis(
    implementedControls: string[],
    frameworkSlug?: string
  ): { met: FrameworkRequirement[]; missing: FrameworkRequirement[] } {
    const requirements = this.getRequirements({ frameworkSlug });
    const met: FrameworkRequirement[] = [];
    const missing: FrameworkRequirement[] = [];
    for (const req of requirements) {
      const isMet = req.controls.some((c) =>
        implementedControls.some((ic) => ic.toLowerCase().includes(c.toLowerCase()))
      );
      (isMet ? met : missing).push(req);
    }
    return { met, missing };
  }
}
