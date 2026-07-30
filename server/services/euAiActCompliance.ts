/**
 * EU AI Act Compliance Service
 * Comprehensive mapping of EU AI Act requirements to COAI controls
 */

export interface EUAiActRequirement {
  id: string;
  article: number;
  section: string;
  title: string;
  description: string;
  riskLevel: 'prohibited' | 'high' | 'limited' | 'minimal';
  applicableSystems: string[];
  controls: string[];
  evidenceRequired: string[];
  complianceIndicators: string[];
  references: string[];
  version: string;
  lastUpdated: Date;
}

export interface ComplianceCertification {
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  name: string;
  description: string;
  requirementsCovered: number;
  minScore: number;
  maxScore: number;
  validityPeriod: number; // months
  auditRequired: boolean;
}

/**
 * EU AI Act Compliance Service
 * Provides comprehensive compliance mapping and certification logic
 */
export class EUAiActComplianceService {
  /**
   * Complete EU AI Act requirement mapping
   */
  static readonly EU_AI_ACT_REQUIREMENTS: EUAiActRequirement[] = [
    // ARTICLE 5: PROHIBITED AI PRACTICES
    {
      id: 'art5-1',
      article: 5,
      section: 'Prohibited Practices',
      title: 'Subliminal Manipulation',
      description:
        'Prohibited: AI systems that deploy subliminal techniques beyond a person\'s consciousness to distort behavior',
      riskLevel: 'prohibited',
      applicableSystems: ['all'],
      controls: [
        'No subliminal messaging',
        'Transparent AI decision-making',
        'User awareness mechanisms',
      ],
      evidenceRequired: [
        'System design documentation',
        'User interface screenshots',
        'Testing reports',
      ],
      complianceIndicators: [
        'No hidden persuasion techniques',
        'Clear disclosure of AI involvement',
        'User control mechanisms',
      ],
      references: ['EU AI Act Article 5(1)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
    {
      id: 'art5-2',
      article: 5,
      section: 'Prohibited Practices',
      title: 'Exploitation of Vulnerabilities',
      description:
        'Prohibited: AI systems that exploit vulnerabilities of specific groups (children, elderly, disabled)',
      riskLevel: 'prohibited',
      applicableSystems: ['all'],
      controls: [
        'Vulnerability assessment',
        'Protected group safeguards',
        'Age verification mechanisms',
      ],
      evidenceRequired: [
        'Risk assessment documentation',
        'Safeguard implementation details',
        'Testing with vulnerable groups',
      ],
      complianceIndicators: [
        'No exploitation of vulnerabilities',
        'Specific protections for vulnerable groups',
        'Regular vulnerability assessments',
      ],
      references: ['EU AI Act Article 5(2)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
    {
      id: 'art5-3',
      article: 5,
      section: 'Prohibited Practices',
      title: 'Social Credit Scoring',
      description:
        'Prohibited: AI systems for social credit scoring based on social behavior or personal characteristics',
      riskLevel: 'prohibited',
      applicableSystems: ['scoring', 'classification'],
      controls: [
        'No social behavior scoring',
        'No personal characteristic scoring',
        'Transparent scoring criteria',
      ],
      evidenceRequired: [
        'System design documentation',
        'Scoring algorithm documentation',
        'Legal compliance review',
      ],
      complianceIndicators: [
        'No social credit systems',
        'Transparent scoring methodology',
        'Appeal mechanisms in place',
      ],
      references: ['EU AI Act Article 5(3)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
    {
      id: 'art5-4',
      article: 5,
      section: 'Prohibited Practices',
      title: 'Biometric Categorization',
      description:
        'Prohibited: AI systems that infer sensitive personal data from biometric data without explicit consent',
      riskLevel: 'prohibited',
      applicableSystems: ['biometric', 'classification'],
      controls: [
        'Explicit consent for biometric processing',
        'No sensitive data inference without consent',
        'Data minimization',
      ],
      evidenceRequired: [
        'Consent management system documentation',
        'Data processing documentation',
        'Privacy impact assessment',
      ],
      complianceIndicators: [
        'Explicit consent obtained',
        'No unauthorized sensitive data inference',
        'Data minimization implemented',
      ],
      references: ['EU AI Act Article 5(4)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },

    // ARTICLE 6: HIGH-RISK AI SYSTEMS
    {
      id: 'art6-1',
      article: 6,
      section: 'High-Risk Systems',
      title: 'Biometric Identification',
      description:
        'High-risk: Real-time biometric identification systems in public spaces for law enforcement',
      riskLevel: 'high',
      applicableSystems: ['biometric', 'identification'],
      controls: [
        'Strict necessity assessment',
        'Proportionality analysis',
        'Judicial authorization',
        'Human oversight',
      ],
      evidenceRequired: [
        'Necessity and proportionality documentation',
        'Judicial authorization records',
        'Oversight procedures',
      ],
      complianceIndicators: [
        'Necessity documented',
        'Proportionality assessed',
        'Judicial oversight in place',
        'Human review of decisions',
      ],
      references: ['EU AI Act Article 6(1)(a)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
    {
      id: 'art6-2',
      article: 6,
      section: 'High-Risk Systems',
      title: 'Critical Infrastructure',
      description:
        'High-risk: AI systems for operation of critical infrastructure (energy, transport, water)',
      riskLevel: 'high',
      applicableSystems: ['infrastructure', 'control'],
      controls: [
        'Risk assessment',
        'Safety measures',
        'Monitoring systems',
        'Incident response',
      ],
      evidenceRequired: [
        'Risk assessment reports',
        'Safety documentation',
        'Monitoring logs',
        'Incident response procedures',
      ],
      complianceIndicators: [
        'Risk assessment completed',
        'Safety measures implemented',
        'Continuous monitoring',
        'Incident response plan',
      ],
      references: ['EU AI Act Article 6(1)(b)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
    {
      id: 'art6-3',
      article: 6,
      section: 'High-Risk Systems',
      title: 'Education & Vocational Training',
      description:
        'High-risk: AI systems for education and vocational training that determine access or outcomes',
      riskLevel: 'high',
      applicableSystems: ['education', 'assessment'],
      controls: [
        'Fairness assessment',
        'Bias testing',
        'Human oversight',
        'Appeal mechanisms',
      ],
      evidenceRequired: [
        'Fairness assessment reports',
        'Bias testing results',
        'Oversight procedures',
        'Appeal process documentation',
      ],
      complianceIndicators: [
        'Fairness assessed',
        'Bias testing completed',
        'Human review in place',
        'Appeal mechanism available',
      ],
      references: ['EU AI Act Article 6(1)(c)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
    {
      id: 'art6-4',
      article: 6,
      section: 'High-Risk Systems',
      title: 'Employment & Labor',
      description:
        'High-risk: AI systems for recruitment, promotion, termination, or work monitoring',
      riskLevel: 'high',
      applicableSystems: ['recruitment', 'monitoring', 'hr'],
      controls: [
        'Fairness assessment',
        'Transparency',
        'Human oversight',
        'Worker notification',
      ],
      evidenceRequired: [
        'Fairness documentation',
        'Transparency statements',
        'Oversight procedures',
        'Worker notification records',
      ],
      complianceIndicators: [
        'Fairness assessed',
        'Transparent to workers',
        'Human review in place',
        'Workers notified',
      ],
      references: ['EU AI Act Article 6(1)(d)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
    {
      id: 'art6-5',
      article: 6,
      section: 'High-Risk Systems',
      title: 'Essential Services',
      description:
        'High-risk: AI systems for determining access to essential services (healthcare, housing, utilities)',
      riskLevel: 'high',
      applicableSystems: ['services', 'access'],
      controls: [
        'Fairness assessment',
        'Non-discrimination testing',
        'Human oversight',
        'Appeal mechanisms',
      ],
      evidenceRequired: [
        'Fairness reports',
        'Non-discrimination testing',
        'Oversight procedures',
        'Appeal process documentation',
      ],
      complianceIndicators: [
        'Fairness assessed',
        'Non-discrimination verified',
        'Human review in place',
        'Appeal mechanism available',
      ],
      references: ['EU AI Act Article 6(1)(e)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
    {
      id: 'art6-6',
      article: 6,
      section: 'High-Risk Systems',
      title: 'Law Enforcement',
      description:
        'High-risk: AI systems for law enforcement purposes (investigation, prosecution, risk assessment)',
      riskLevel: 'high',
      applicableSystems: ['law_enforcement', 'investigation'],
      controls: [
        'Accuracy assessment',
        'Bias testing',
        'Human oversight',
        'Logging and monitoring',
      ],
      evidenceRequired: [
        'Accuracy reports',
        'Bias testing results',
        'Oversight procedures',
        'Audit logs',
      ],
      complianceIndicators: [
        'Accuracy verified',
        'Bias testing completed',
        'Human review in place',
        'Audit trail maintained',
      ],
      references: ['EU AI Act Article 6(1)(f)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
    {
      id: 'art6-7',
      article: 6,
      section: 'High-Risk Systems',
      title: 'Migration & Border Control',
      description:
        'High-risk: AI systems for migration, asylum, or border control decisions',
      riskLevel: 'high',
      applicableSystems: ['immigration', 'border'],
      controls: [
        'Accuracy assessment',
        'Human oversight',
        'Appeal mechanisms',
        'Monitoring',
      ],
      evidenceRequired: [
        'Accuracy documentation',
        'Oversight procedures',
        'Appeal process',
        'Monitoring logs',
      ],
      complianceIndicators: [
        'Accuracy verified',
        'Human review in place',
        'Appeal mechanism available',
        'Continuous monitoring',
      ],
      references: ['EU AI Act Article 6(1)(g)'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },

    // ARTICLE 8: TRANSPARENCY REQUIREMENTS
    {
      id: 'art8-1',
      article: 8,
      section: 'Transparency',
      title: 'Disclosure of AI Use',
      description: 'Requirement: Inform users when they interact with AI systems',
      riskLevel: 'limited',
      applicableSystems: ['all'],
      controls: [
        'Clear AI disclosure',
        'User notification',
        'Transparency statements',
      ],
      evidenceRequired: [
        'Disclosure statements',
        'User interface screenshots',
        'Documentation',
      ],
      complianceIndicators: [
        'Users informed of AI involvement',
        'Clear disclosure visible',
        'Documentation available',
      ],
      references: ['EU AI Act Article 8'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },

    // ARTICLE 10: DOCUMENTATION & RECORD-KEEPING
    {
      id: 'art10-1',
      article: 10,
      section: 'Documentation',
      title: 'Technical Documentation',
      description:
        'Requirement: Maintain technical documentation of AI system design and performance',
      riskLevel: 'limited',
      applicableSystems: ['high-risk'],
      controls: [
        'Design documentation',
        'Performance documentation',
        'Testing records',
        'Version control',
      ],
      evidenceRequired: [
        'Technical documentation',
        'Design specifications',
        'Test reports',
        'Version history',
      ],
      complianceIndicators: [
        'Documentation complete',
        'Up-to-date specifications',
        'Test results available',
        'Version control maintained',
      ],
      references: ['EU AI Act Article 10'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },

    // ARTICLE 13: MONITORING & LOGGING
    {
      id: 'art13-1',
      article: 13,
      section: 'Monitoring',
      title: 'Continuous Monitoring',
      description: 'Requirement: Monitor AI system performance and detect anomalies',
      riskLevel: 'high',
      applicableSystems: ['high-risk'],
      controls: [
        'Performance monitoring',
        'Anomaly detection',
        'Logging system',
        'Alert mechanisms',
      ],
      evidenceRequired: [
        'Monitoring procedures',
        'Log records',
        'Alert configuration',
        'Incident reports',
      ],
      complianceIndicators: [
        'Monitoring system in place',
        'Logs maintained',
        'Anomalies detected',
        'Alerts configured',
      ],
      references: ['EU AI Act Article 13'],
      version: '1.0',
      lastUpdated: new Date('2024-01-01'),
    },
  ];

  /**
   * Certification levels and requirements
   */
  static readonly CERTIFICATION_LEVELS: Record<string, ComplianceCertification> = {
    bronze: {
      level: 'bronze',
      name: 'Bronze Certification',
      description: 'Basic compliance with EU AI Act prohibited practices',
      requirementsCovered: 4,
      minScore: 0,
      maxScore: 40,
      validityPeriod: 12,
      auditRequired: false,
    },
    silver: {
      level: 'silver',
      name: 'Silver Certification',
      description: 'Intermediate compliance with transparency and documentation requirements',
      requirementsCovered: 8,
      minScore: 40,
      maxScore: 70,
      validityPeriod: 12,
      auditRequired: false,
    },
    gold: {
      level: 'gold',
      name: 'Gold Certification',
      description: 'Advanced compliance with high-risk system controls',
      requirementsCovered: 12,
      minScore: 70,
      maxScore: 90,
      validityPeriod: 12,
      auditRequired: true,
    },
    platinum: {
      level: 'platinum',
      name: 'Platinum Certification',
      description: 'Comprehensive compliance across all EU AI Act requirements',
      requirementsCovered: 15,
      minScore: 90,
      maxScore: 100,
      validityPeriod: 24,
      auditRequired: true,
    },
  };

  /**
   * Get all requirements
   */
  static getRequirements(): EUAiActRequirement[] {
    return this.EU_AI_ACT_REQUIREMENTS;
  }

  /**
   * Get requirements by risk level
   */
  static getRequirementsByRiskLevel(riskLevel: string): EUAiActRequirement[] {
    return this.EU_AI_ACT_REQUIREMENTS.filter((r: any) => r.riskLevel === riskLevel);
  }

  /**
   * Get requirements by article
   */
  static getRequirementsByArticle(article: number): EUAiActRequirement[] {
    return this.EU_AI_ACT_REQUIREMENTS.filter((r: any) => r.article === article);
  }

  /**
   * Get requirements applicable to system type
   */
  static getRequirementsBySystemType(systemType: string): EUAiActRequirement[] {
    return this.EU_AI_ACT_REQUIREMENTS.filter((r: any) =>
      r.applicableSystems.includes(systemType) || r.applicableSystems.includes('all')
    );
  }

  /**
   * Calculate compliance score based on controls implemented
   */
  static calculateComplianceScore(
    implementedControls: string[],
    applicableRequirements: EUAiActRequirement[]
  ): number {
    if (applicableRequirements.length === 0) return 0;

    const totalControls = applicableRequirements.reduce(
      (sum, req) => sum + req.controls.length,
      0
    );
    if (totalControls === 0) return 0;

    const implementedCount = implementedControls.length;
    return Math.round((implementedCount / totalControls) * 100);
  }

  /**
   * Get certification level based on score
   */
  static getCertificationLevel(score: number): string {
    if (score >= 90) return 'platinum';
    if (score >= 70) return 'gold';
    if (score >= 40) return 'silver';
    return 'bronze';
  }

  /**
   * Get certification details
   */
  static getCertificationDetails(level: string): ComplianceCertification | null {
    return this.CERTIFICATION_LEVELS[level] || null;
  }

  /**
   * Generate compliance gap analysis
   */
  static generateGapAnalysis(
    implementedControls: string[],
    applicableRequirements: EUAiActRequirement[]
  ): {
    implemented: string[];
    missing: string[];
    coverage: number;
  } {
    const allControls = new Set<string>();
    applicableRequirements.forEach((req) => {
      req.controls.forEach((control) => allControls.add(control));
    });

    const implemented = Array.from(allControls).filter((control) =>
      implementedControls.includes(control)
    );
    const missing = Array.from(allControls).filter(
      (control) => !implementedControls.includes(control)
    );

    return {
      implemented,
      missing,
      coverage: Math.round((implemented.length / allControls.size) * 100),
    };
  }

  /**
   * Get evidence checklist for requirement
   */
  static getEvidenceChecklist(requirementId: string): string[] {
    const requirement = this.EU_AI_ACT_REQUIREMENTS.find((r: any) => r.id === requirementId);
    return requirement?.evidenceRequired || [];
  }

  /**
   * Get compliance indicators for requirement
   */
  static getComplianceIndicators(requirementId: string): string[] {
    const requirement = this.EU_AI_ACT_REQUIREMENTS.find((r: any) => r.id === requirementId);
    return requirement?.complianceIndicators || [];
  }
}
