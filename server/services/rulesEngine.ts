/**
 * Rules Engine Service
 * Manages compliance rules across jurisdictions
 * Note: Using in-memory storage until complianceRules/ruleUpdates tables are added
 */

export interface ComplianceRule {
  jurisdiction: string;
  framework: string;
  ruleCode: string;
  title: string;
  description?: string;
  requirement: string;
  severity: "info" | "warning" | "critical";
  category: string;
  applicableToRiskLevel: "minimal" | "low" | "medium" | "high" | "prohibited";
  implementationGuidance?: string;
  evidenceRequired?: Record<string, any>;
}

interface StoredRule extends ComplianceRule {
  id: number;
  version: number;
  isActive: boolean;
  deprecatedDate?: string;
  createdAt: Date;
}

interface RuleUpdate {
  id: number;
  ruleId: number;
  changeType: 'created' | 'updated' | 'deprecated';
  previousValue?: any;
  newValue?: any;
  changeReason: string;
  notificationSent: boolean;
  createdAt: Date;
}

// In-memory storage
const rulesStore: StoredRule[] = [];
const updatesStore: RuleUpdate[] = [];
let ruleIdCounter = 1;
let updateIdCounter = 1;

export class RulesEngine {
  /**
   * Create or update a compliance rule
   */
  static async upsertRule(rule: ComplianceRule) {
    const existing = rulesStore.find(
      r => r.jurisdiction === rule.jurisdiction &&
           r.framework === rule.framework &&
           r.ruleCode === rule.ruleCode
    );

    if (existing) {
      // Update existing rule
      const previousValue = { ...existing };
      Object.assign(existing, rule);
      existing.version = (existing.version || 0) + 1;

      // Log the update
      updatesStore.push({
        id: updateIdCounter++,
        ruleId: existing.id,
        changeType: 'updated',
        previousValue,
        newValue: rule,
        changeReason: 'Rule updated',
        notificationSent: false,
        createdAt: new Date(),
      });

      return existing;
    } else {
      // Create new rule
      const newRule: StoredRule = {
        id: ruleIdCounter++,
        ...rule,
        version: 1,
        isActive: true,
        createdAt: new Date(),
      };
      rulesStore.push(newRule);

      // Log the creation
      updatesStore.push({
        id: updateIdCounter++,
        ruleId: newRule.id,
        changeType: 'created',
        newValue: rule,
        changeReason: 'New rule created',
        notificationSent: false,
        createdAt: new Date(),
      });

      return newRule;
    }
  }

  /**
   * Get rules for a specific jurisdiction and framework
   */
  static async getRulesByJurisdiction(
    jurisdiction: string,
    framework?: string,
    riskLevel?: string
  ) {
    let results = rulesStore.filter(
      r => r.jurisdiction === jurisdiction && r.isActive
    );

    if (framework) {
      results = results.filter(r => r.framework === framework);
    }

    if (riskLevel) {
      results = results.filter(r => r.applicableToRiskLevel === riskLevel);
    }

    return results;
  }

  /**
   * Get all active rules
   */
  static async getAllActiveRules() {
    return rulesStore
      .filter(r => r.isActive)
      .sort((a, b) => {
        const jurisdictionCompare = a.jurisdiction.localeCompare(b.jurisdiction);
        if (jurisdictionCompare !== 0) return jurisdictionCompare;
        return a.framework.localeCompare(b.framework);
      });
  }

  /**
   * Deprecate a rule
   */
  static async deprecateRule(ruleId: number, reason: string) {
    const rule = rulesStore.find(r => r.id === ruleId);
    if (!rule) throw new Error("Rule not found");

    const previousValue = { ...rule };
    rule.isActive = false;
    rule.deprecatedDate = new Date().toISOString();

    // Log the deprecation
    updatesStore.push({
      id: updateIdCounter++,
      ruleId,
      changeType: 'deprecated',
      previousValue,
      changeReason: reason,
      notificationSent: false,
      createdAt: new Date(),
    });

    return rule;
  }

  /**
   * Get rule update history
   */
  static async getRuleUpdateHistory(ruleId: number, limit = 50) {
    return updatesStore
      .filter(u => u.ruleId === ruleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get recent rule updates across all rules
   */
  static async getRecentUpdates(limit = 100) {
    return updatesStore
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Seed initial compliance rules for major frameworks
   */
  static async seedInitialRules() {
    const euAiActRules: ComplianceRule[] = [
      {
        jurisdiction: "EU",
        framework: "EU AI Act",
        ruleCode: "EUAI-001",
        title: "Prohibited AI Practices",
        description: "Prohibition of certain AI practices that violate fundamental rights",
        requirement: "Organizations must not deploy AI systems that use subliminal techniques or exploit vulnerabilities to manipulate behavior",
        severity: "critical",
        category: "Fundamental Rights",
        applicableToRiskLevel: "prohibited",
        implementationGuidance: "Implement technical and organizational measures to prevent prohibited AI practices",
        evidenceRequired: {
          technicalMeasures: "Documentation of safeguards",
          auditTrail: "Evidence of compliance checks",
        },
      },
      {
        jurisdiction: "EU",
        framework: "EU AI Act",
        ruleCode: "EUAI-002",
        title: "High-Risk AI Systems",
        description: "Requirements for high-risk AI systems",
        requirement: "High-risk AI systems must undergo conformity assessment before deployment",
        severity: "critical",
        category: "Risk Assessment",
        applicableToRiskLevel: "high",
        implementationGuidance: "Conduct risk assessment and implement mitigation measures",
        evidenceRequired: {
          riskAssessment: "Documented risk analysis",
          mitigationPlan: "Risk mitigation strategy",
        },
      },
      {
        jurisdiction: "EU",
        framework: "EU AI Act",
        ruleCode: "EUAI-003",
        title: "Transparency Requirements",
        description: "Transparency obligations for AI systems",
        requirement: "Organizations must provide clear information about AI system capabilities and limitations",
        severity: "warning",
        category: "Transparency",
        applicableToRiskLevel: "medium",
        implementationGuidance: "Create clear documentation of AI system behavior",
      },
    ];

    const nistRmfRules: ComplianceRule[] = [
      {
        jurisdiction: "US",
        framework: "NIST RMF",
        ruleCode: "NIST-001",
        title: "Risk Assessment",
        description: "Conduct comprehensive AI risk assessment",
        requirement: "Organizations must conduct risk assessments for AI systems before deployment",
        severity: "critical",
        category: "Risk Management",
        applicableToRiskLevel: "high",
        implementationGuidance: "Use NIST AI RMF categories for assessment",
      },
      {
        jurisdiction: "US",
        framework: "NIST RMF",
        ruleCode: "NIST-002",
        title: "Governance Structure",
        description: "Establish AI governance framework",
        requirement: "Organizations must establish clear governance structures for AI system oversight",
        severity: "warning",
        category: "Governance",
        applicableToRiskLevel: "medium",
        implementationGuidance: "Document governance roles and responsibilities",
      },
    ];

    const chinaRules: ComplianceRule[] = [
      {
        jurisdiction: "China",
        framework: "CAC AI Regulations",
        ruleCode: "CHINA-001",
        title: "Content Security",
        description: "AI content security requirements",
        requirement: "AI systems must not generate content that violates Chinese regulations",
        severity: "critical",
        category: "Content Control",
        applicableToRiskLevel: "high",
        implementationGuidance: "Implement content filtering and monitoring",
      },
      {
        jurisdiction: "China",
        framework: "CAC AI Regulations",
        ruleCode: "CHINA-002",
        title: "Data Localization",
        description: "Data must be stored within China",
        requirement: "Personal data collected by AI systems must be stored in China",
        severity: "critical",
        category: "Data Protection",
        applicableToRiskLevel: "high",
        implementationGuidance: "Implement data localization infrastructure",
      },
    ];

    const ukRules: ComplianceRule[] = [
      {
        jurisdiction: "UK",
        framework: "UK AI Principles",
        ruleCode: "UK-001",
        title: "Transparency and Accountability",
        description: "AI systems must be transparent and accountable",
        requirement: "Organizations must be able to explain AI system decisions",
        severity: "warning",
        category: "Accountability",
        applicableToRiskLevel: "medium",
        implementationGuidance: "Document AI decision-making processes",
      },
    ];

    const allRules = [...euAiActRules, ...nistRmfRules, ...chinaRules, ...ukRules];

    for (const rule of allRules) {
      try {
        await this.upsertRule(rule);
      } catch (error) {
        console.error(`Failed to seed rule ${rule.ruleCode}:`, error);
      }
    }

    console.log(`✅ Seeded ${allRules.length} compliance rules`);
  }
}
