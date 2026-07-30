/**
 * Compliance Marketplace & Third-Party Integration Service
 * Manage marketplace add-ons and SIEM/SOAR platform integrations
 */

export interface MarketplaceAddon {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'monitoring' | 'automation' | 'reporting' | 'integration';
  provider: string;
  version: string;
  rating: number; // 1-5
  reviews: number;
  price: number; // in cents, 0 for free
  features: string[];
  documentation: string;
  supportLevel: 'community' | 'standard' | 'premium';
  integrationUrl: string;
  webhookEvents: string[];
  requiredScopes: string[];
  isActive: boolean;
  installedCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IntegrationConnection {
  id: string;
  userId: string;
  addonId: string;
  addonName: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  apiKey: string; // encrypted
  apiSecret: string; // encrypted
  webhookUrl: string;
  webhookSecret: string; // encrypted
  lastSyncTime: string | Date | null;
  lastErrorMessage: string | null;
  configuration: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RemediationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    addonId: string;
    eventType: string;
    condition: string; // e.g., "severity >= high"
  };
  actions: Array<{
    order: number;
    type: 'notification' | 'automation' | 'escalation' | 'remediation';
    target: string; // addon ID or system
    payload: Record<string, any>;
  }>;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SIEMIntegration {
  platform: 'splunk' | 'elastic' | 'sumologic' | 'datadog' | 'crowdstrike' | 'other';
  endpoint: string;
  apiKey: string; // encrypted
  logFormat: 'json' | 'syslog' | 'cef';
  eventTypes: string[];
  isConnected: boolean;
  lastEventTime: string | Date | null;
}

export interface SOARIntegration {
  platform: 'paloalto' | 'ibm' | 'splunk' | 'microsoft' | 'other';
  endpoint: string;
  apiKey: string; // encrypted
  playbooks: Array<{
    id: string;
    name: string;
    trigger: string;
    enabled: boolean;
  }>;
  isConnected: boolean;
  lastExecutionTime: Date | null;
}

/**
 * Compliance Marketplace Service
 */
export class ComplianceMarketplaceService {
  /**
   * Get all marketplace addons
   */
  static getMarketplaceAddons(
    category?: string,
    sortBy: 'rating' | 'popularity' | 'newest' = 'rating'
  ): MarketplaceAddon[] {
    // Mock marketplace addons
    const addons: MarketplaceAddon[] = [
      {
        id: 'addon-splunk',
        name: 'Splunk Integration',
        description: 'Send compliance events to Splunk for centralized monitoring',
        category: 'monitoring',
        provider: 'Splunk',
        version: '2.1.0',
        rating: 4.8,
        reviews: 342,
        price: 0,
        features: [
          'Real-time event streaming',
          'Custom dashboards',
          'Alert integration',
          'Log aggregation',
        ],
        documentation: 'https://docs.splunk.com/coai-integration',
        supportLevel: 'premium',
        integrationUrl: 'https://api.splunk.com/v1/coai',
        webhookEvents: ['compliance.updated', 'assessment.completed', 'violation.detected'],
        requiredScopes: ['events:write', 'logs:write'],
        isActive: true,
        installedCount: 1247,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-01'),
      },
      {
        id: 'addon-paloalto',
        name: 'Palo Alto Networks SOAR',
        description: 'Automate incident response and remediation workflows',
        category: 'automation',
        provider: 'Palo Alto Networks',
        version: '1.8.5',
        rating: 4.7,
        reviews: 289,
        price: 0,
        features: [
          'Automated playbooks',
          'Incident orchestration',
          'Threat intelligence',
          'Case management',
        ],
        documentation: 'https://docs.paloaltonetworks.com/coai',
        supportLevel: 'premium',
        integrationUrl: 'https://api.paloaltonetworks.com/v2/coai',
        webhookEvents: ['violation.detected', 'risk.escalated'],
        requiredScopes: ['playbooks:execute', 'incidents:write'],
        isActive: true,
        installedCount: 856,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-11-28'),
      },
      {
        id: 'addon-datadog',
        name: 'Datadog Monitoring',
        description: 'Monitor compliance metrics and system health in Datadog',
        category: 'monitoring',
        provider: 'Datadog',
        version: '3.2.1',
        rating: 4.6,
        reviews: 198,
        price: 0,
        features: [
          'Metrics collection',
          'Custom dashboards',
          'APM integration',
          'Alert correlation',
        ],
        documentation: 'https://docs.datadoghq.com/coai',
        supportLevel: 'standard',
        integrationUrl: 'https://api.datadoghq.com/v1/coai',
        webhookEvents: ['compliance.score.updated', 'system.health.changed'],
        requiredScopes: ['metrics:write', 'dashboards:write'],
        isActive: true,
        installedCount: 734,
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-12-02'),
      },
      {
        id: 'addon-slack',
        name: 'Slack Notifications',
        description: 'Get compliance alerts and updates in Slack',
        category: 'integration',
        provider: 'Slack',
        version: '1.4.2',
        rating: 4.9,
        reviews: 521,
        price: 0,
        features: [
          'Real-time alerts',
          'Custom channels',
          'Interactive buttons',
          'Workflow integration',
        ],
        documentation: 'https://api.slack.com/coai',
        supportLevel: 'community',
        integrationUrl: 'https://hooks.slack.com/services/coai',
        webhookEvents: ['all'],
        requiredScopes: ['chat:write'],
        isActive: true,
        installedCount: 3421,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-12-01'),
      },
      {
        id: 'addon-jira',
        name: 'Jira Issue Tracking',
        description: 'Automatically create Jira tickets for compliance violations',
        category: 'automation',
        provider: 'Atlassian',
        version: '2.1.0',
        rating: 4.5,
        reviews: 267,
        price: 0,
        features: [
          'Auto-ticket creation',
          'Custom fields',
          'Workflow automation',
          'Issue linking',
        ],
        documentation: 'https://developer.atlassian.com/coai',
        supportLevel: 'standard',
        integrationUrl: 'https://api.atlassian.com/v3/coai',
        webhookEvents: ['violation.detected', 'assessment.failed'],
        requiredScopes: ['issues:write', 'projects:read'],
        isActive: true,
        installedCount: 892,
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-11-30'),
      },
    ];

    let filtered = addons;
    if (category) {
      filtered = filtered.filter((a: any) => a.category === category);
    }

    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => b.installedCount - a.installedCount);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }

  /**
   * Get addon details
   */
  static getAddonDetails(addonId: string): MarketplaceAddon | null {
    const addons = this.getMarketplaceAddons();
    return addons.find((a: any) => a.id === addonId) || null;
  }

  /**
   * Create integration connection
   */
  static createIntegrationConnection(
    userId: string,
    addonId: string,
    apiKey: string,
    apiSecret: string,
    configuration: Record<string, any> = {}
  ): IntegrationConnection {
    const addon = this.getAddonDetails(addonId);
    if (!addon) {
      throw new Error(`Addon ${addonId} not found`);
    }

    return {
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      addonId,
      addonName: addon.name,
      status: 'pending',
      apiKey, // Should be encrypted in production
      apiSecret, // Should be encrypted in production
      webhookUrl: `https://api.coai.io/webhooks/${addonId}/${userId}`,
      webhookSecret: this.generateWebhookSecret(),
      lastSyncTime: null,
      lastErrorMessage: null,
      configuration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Test integration connection
   */
  static testIntegrationConnection(connection: IntegrationConnection): {
    success: boolean;
    message: string;
    latency?: number;
  } {
    // Mock test - in production, would actually call the addon API
    const latency = Math.random() * 500 + 100; // 100-600ms

    if (connection.apiKey.length < 10) {
      return {
        success: false,
        message: 'Invalid API key format',
      };
    }

    return {
      success: true,
      message: `Successfully connected to ${connection.addonName}`,
      latency: Math.round(latency),
    };
  }

  /**
   * Create remediation workflow
   */
  static createRemediationWorkflow(
    name: string,
    description: string,
    trigger: {
      addonId: string;
      eventType: string;
      condition: string;
    },
    actions: Array<{
      order: number;
      type: 'notification' | 'automation' | 'escalation' | 'remediation';
      target: string;
      payload: Record<string, any>;
    }>
  ): RemediationWorkflow {
    return {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      trigger,
      actions: actions.sort((a, b) => a.order - b.order),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Execute remediation workflow
   */
  static executeRemediationWorkflow(
    workflow: RemediationWorkflow,
    eventData: Record<string, any>
  ): {
    workflowId: string;
    executionId: string;
    status: 'success' | 'partial' | 'failed';
    results: Array<{
      actionOrder: number;
      status: 'success' | 'failed';
      message: string;
    }>;
  } {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const results: Array<{
      actionOrder: number;
      status: 'success' | 'failed';
      message: string;
    }> = [];

    workflow.actions.forEach((action) => {
      // Mock execution
      const success = Math.random() > 0.1; // 90% success rate
      results.push({
        actionOrder: action.order,
        status: success ? 'success' : 'failed',
        message: success
          ? `${action.type} action executed successfully`
          : `${action.type} action failed: Connection timeout`,
      });
    });

    const allSuccessful = results.every((r) => r.status === 'success');
    const anySuccessful = results.some((r: any) => r.status === 'success');

    return {
      workflowId: workflow.id,
      executionId,
      status: allSuccessful ? 'success' : anySuccessful ? 'partial' : 'failed',
      results,
    };
  }

  /**
   * Get SIEM integration template
   */
  static getSIEMIntegrationTemplate(platform: string): Partial<SIEMIntegration> {
    const templates: Record<string, Partial<SIEMIntegration>> = {
      splunk: {
        platform: 'splunk',
        logFormat: 'json',
        eventTypes: ['compliance.score', 'assessment.completed', 'violation.detected'],
      },
      elastic: {
        platform: 'elastic',
        logFormat: 'json',
        eventTypes: ['compliance.score', 'assessment.completed', 'violation.detected'],
      },
      sumologic: {
        platform: 'sumologic',
        logFormat: 'json',
        eventTypes: ['compliance.score', 'assessment.completed', 'violation.detected'],
      },
      datadog: {
        platform: 'datadog',
        logFormat: 'json',
        eventTypes: ['compliance.score', 'assessment.completed', 'violation.detected'],
      },
      crowdstrike: {
        platform: 'crowdstrike',
        logFormat: 'json',
        eventTypes: ['violation.detected', 'risk.escalated'],
      },
    };

    return templates[platform] || { logFormat: 'json', eventTypes: [] };
  }

  /**
   * Get SOAR integration template
   */
  static getSOARIntegrationTemplate(platform: string): Partial<SOARIntegration> {
    const templates: Record<string, Partial<SOARIntegration>> = {
      paloalto: {
        platform: 'paloalto',
        playbooks: [
          { id: 'pb-1', name: 'High Risk Violation', trigger: 'violation.severity >= high', enabled: true },
          { id: 'pb-2', name: 'Compliance Failure', trigger: 'assessment.failed', enabled: true },
        ],
      },
      ibm: {
        platform: 'ibm',
        playbooks: [
          { id: 'pb-1', name: 'Incident Response', trigger: 'violation.detected', enabled: true },
        ],
      },
      splunk: {
        platform: 'splunk',
        playbooks: [
          { id: 'pb-1', name: 'Alert Escalation', trigger: 'risk.escalated', enabled: true },
        ],
      },
      microsoft: {
        platform: 'microsoft',
        playbooks: [
          { id: 'pb-1', name: 'Automated Response', trigger: 'violation.detected', enabled: true },
        ],
      },
    };

    return templates[platform] || { playbooks: [] };
  }

  /**
   * Generate webhook secret
   */
  private static generateWebhookSecret(): string {
    return `whsec_${Math.random().toString(36).substr(2, 32)}`;
  }

  /**
   * Get integration health status
   */
  static getIntegrationHealth(connection: IntegrationConnection): {
    status: 'healthy' | 'degraded' | 'offline';
    uptime: number; // percentage
    lastCheck: Date | string;
    nextCheck: Date | string;
  } {
    if (connection.status === 'error') {
      return {
        status: 'offline',
        uptime: 0,
        lastCheck: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 5 * 60 * 1000),
      };
    }

    // Mock health status
    const uptime = 99.5 + Math.random() * 0.5;
    const status = uptime >= 99 ? 'healthy' : 'degraded';

    return {
      status,
      uptime,
      lastCheck: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 60 * 1000),
    };
  }
}
