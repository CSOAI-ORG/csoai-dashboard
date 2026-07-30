/**
 * SOAI-PDCA Template Generator
 * Generates professional PDF templates for all PDCA phases
 */

import PDFDocument from 'pdfkit';
import type { Response } from 'express';

interface TemplateConfig {
  title: string;
  phase: 'PLAN' | 'DO' | 'CHECK' | 'ACT';
  sections: Array<{
    heading: string;
    content: string[];
    hasTable?: boolean;
    tableHeaders?: string[];
    tableRows?: string[][];
  }>;
}

const TEMPLATES: Record<string, TemplateConfig> = {
  'risk-assessment-matrix': {
    title: 'AI System Risk Assessment Matrix',
    phase: 'PLAN',
    sections: [
      {
        heading: 'Purpose',
        content: [
          'This template helps identify, assess, and prioritize risks associated with your AI system.',
          'Use this during the PLAN phase to establish baseline risk levels and inform your safety strategy.',
        ],
      },
      {
        heading: 'Risk Assessment Matrix',
        content: ['Rate each risk on likelihood (1-5) and impact (1-5). Risk Score = Likelihood × Impact'],
        hasTable: true,
        tableHeaders: ['Risk Category', 'Description', 'Likelihood (1-5)', 'Impact (1-5)', 'Risk Score', 'Mitigation Strategy'],
        tableRows: [
          ['Data Privacy', '', '', '', '', ''],
          ['Algorithmic Bias', '', '', '', '', ''],
          ['Model Drift', '', '', '', '', ''],
          ['Security Vulnerabilities', '', '', '', '', ''],
          ['Regulatory Non-Compliance', '', '', '', '', ''],
          ['Ethical Concerns', '', '', '', '', ''],
        ],
      },
      {
        heading: 'Risk Prioritization',
        content: [
          'Critical (20-25): Immediate action required',
          'High (15-19): Address within 30 days',
          'Medium (10-14): Address within 90 days',
          'Low (1-9): Monitor and review quarterly',
        ],
      },
    ],
  },
  'compliance-checklist': {
    title: 'AI Compliance Requirements Checklist',
    phase: 'PLAN',
    sections: [
      {
        heading: 'Purpose',
        content: [
          'This checklist helps ensure your AI system meets all applicable regulatory requirements.',
          'Check applicable frameworks and document compliance status for each requirement.',
        ],
      },
      {
        heading: 'Framework Selection',
        content: ['☐ EU AI Act (European Union)', '☐ NIST AI RMF (United States)', '☐ TC260 GB/T 42459-2023 (China)', '☐ ISO/IEC 42001 (International)'],
      },
      {
        heading: 'EU AI Act Requirements',
        content: [
          '☐ Risk classification completed (Unacceptable/High/Limited/Minimal)',
          '☐ Conformity assessment performed',
          '☐ Technical documentation prepared',
          '☐ Risk management system established',
          '☐ Data governance measures implemented',
          '☐ Transparency obligations met',
          '☐ Human oversight mechanisms in place',
          '☐ Accuracy and robustness requirements met',
        ],
      },
      {
        heading: 'NIST AI RMF Requirements',
        content: [
          '☐ GOVERN: Organizational AI governance established',
          '☐ MAP: Context and risks mapped',
          '☐ MEASURE: AI system performance measured',
          '☐ MANAGE: Risks managed and documented',
        ],
      },
    ],
  },
  'implementation-roadmap': {
    title: 'SOAI-PDCA Implementation Roadmap',
    phase: 'PLAN',
    sections: [
      {
        heading: 'Purpose',
        content: ['This roadmap template helps plan your SOAI-PDCA implementation with clear milestones and timelines.'],
      },
      {
        heading: 'Phase 1: PLAN (Weeks 1-4)',
        content: [
          'Week 1: AI system scoping and documentation',
          'Week 2: Risk assessment and framework mapping',
          'Week 3: Stakeholder analysis and resource allocation',
          'Week 4: Finalize implementation plan and get approval',
        ],
      },
      {
        heading: 'Phase 2: DO (Weeks 5-12)',
        content: [
          'Weeks 5-6: Deploy technical safety controls',
          'Weeks 7-8: Implement governance policies',
          'Weeks 9-10: Configure monitoring and logging',
          'Weeks 11-12: Training and documentation',
        ],
      },
      {
        heading: 'Phase 3: CHECK (Weeks 13-16)',
        content: [
          'Week 13: Collect performance metrics',
          'Week 14: Review incident reports',
          'Week 15: Conduct compliance audit',
          'Week 16: Analyze results and identify gaps',
        ],
      },
      {
        heading: 'Phase 4: ACT (Weeks 17-20)',
        content: [
          'Week 17: Root cause analysis',
          'Week 18: Implement corrective actions',
          'Week 19: Update policies and procedures',
          'Week 20: Plan next PDCA cycle',
        ],
      },
    ],
  },
  'safety-control-guide': {
    title: 'AI Safety Control Implementation Guide',
    phase: 'DO',
    sections: [
      {
        heading: 'Purpose',
        content: ['This guide provides a structured approach to implementing technical and organizational safety controls for your AI system.'],
      },
      {
        heading: 'Technical Controls',
        content: [
          '☐ Input validation and sanitization',
          '☐ Output filtering and content moderation',
          '☐ Rate limiting and abuse prevention',
          '☐ Model versioning and rollback capability',
          '☐ Bias detection and mitigation',
          '☐ Explainability and interpretability tools',
          '☐ Monitoring and alerting systems',
          '☐ Audit logging and traceability',
        ],
      },
      {
        heading: 'Organizational Controls',
        content: [
          '☐ AI governance committee established',
          '☐ Roles and responsibilities defined',
          '☐ Incident response procedures documented',
          '☐ Escalation paths defined',
          '☐ Training programs implemented',
          '☐ Third-party risk management',
          '☐ Regular review and update schedule',
        ],
      },
    ],
  },
  'incident-response-playbook': {
    title: 'AI Incident Response Playbook',
    phase: 'DO',
    sections: [
      {
        heading: 'Purpose',
        content: ['This playbook provides step-by-step procedures for responding to AI safety incidents.'],
      },
      {
        heading: 'Incident Classification',
        content: [
          'Severity 1 (Critical): System-wide failure, major harm, regulatory violation',
          'Severity 2 (High): Significant degradation, potential harm, compliance risk',
          'Severity 3 (Medium): Localized issue, minor impact, no immediate risk',
          'Severity 4 (Low): Cosmetic issue, no user impact',
        ],
      },
      {
        heading: 'Response Procedures',
        content: [
          '1. DETECT: Incident identified via monitoring or report',
          '2. ASSESS: Determine severity and impact',
          '3. CONTAIN: Isolate affected systems, prevent spread',
          '4. NOTIFY: Alert stakeholders per escalation matrix',
          '5. INVESTIGATE: Root cause analysis',
          '6. REMEDIATE: Implement fix and verify',
          '7. DOCUMENT: Record incident details and lessons learned',
          '8. REVIEW: Post-incident review and process improvement',
        ],
      },
    ],
  },
  'monitoring-configuration': {
    title: 'AI System Monitoring Configuration Template',
    phase: 'DO',
    sections: [
      {
        heading: 'Purpose',
        content: ['This template helps configure comprehensive monitoring for your AI system to detect issues early.'],
      },
      {
        heading: 'Performance Metrics',
        content: [
          '☐ Model accuracy/precision/recall',
          '☐ Response time and latency',
          '☐ Throughput and capacity',
          '☐ Error rates and failure modes',
          '☐ Resource utilization (CPU/memory/GPU)',
        ],
      },
      {
        heading: 'Safety Metrics',
        content: [
          '☐ Bias detection scores',
          '☐ Fairness metrics across demographics',
          '☐ Harmful content detection rate',
          '☐ Policy violation frequency',
          '☐ User feedback sentiment',
        ],
      },
      {
        heading: 'Alert Thresholds',
        content: [
          'Critical: Accuracy drops below 85%, immediate page',
          'Warning: Accuracy drops below 90%, email alert',
          'Info: Unusual pattern detected, log for review',
        ],
      },
    ],
  },
  'performance-metrics-dashboard': {
    title: 'AI Performance Metrics Dashboard Template',
    phase: 'CHECK',
    sections: [
      {
        heading: 'Purpose',
        content: ['This template helps track and visualize key performance indicators for your AI system during the CHECK phase.'],
      },
      {
        heading: 'Key Performance Indicators (KPIs)',
        hasTable: true,
        content: [],
        tableHeaders: ['Metric', 'Target', 'Current', 'Trend', 'Status'],
        tableRows: [
          ['Model Accuracy', '≥95%', '', '↑↓→', '🟢🟡🔴'],
          ['Response Time', '<200ms', '', '↑↓→', '🟢🟡🔴'],
          ['Bias Score', '<0.1', '', '↑↓→', '🟢🟡🔴'],
          ['User Satisfaction', '≥4.5/5', '', '↑↓→', '🟢🟡🔴'],
          ['Incident Rate', '<5/month', '', '↑↓→', '🟢🟡🔴'],
        ],
      },
    ],
  },
  'incident-report-form': {
    title: 'AI Safety Incident Report Form',
    phase: 'CHECK',
    sections: [
      {
        heading: 'Incident Details',
        content: [
          'Report ID: _________________',
          'Date/Time: _________________',
          'Reported By: _________________',
          'AI System: _________________',
          'Severity: ☐ Critical ☐ High ☐ Medium ☐ Low',
        ],
      },
      {
        heading: 'Incident Description',
        content: ['What happened? (Describe the incident in detail)', '', '', 'What was the impact? (Users affected, harm caused)', '', ''],
      },
      {
        heading: 'Root Cause Analysis',
        content: ['What caused the incident?', '', 'Contributing factors:', '', 'Could this have been prevented? How?', ''],
      },
    ],
  },
  'audit-checklist': {
    title: 'AI Compliance Audit Checklist',
    phase: 'CHECK',
    sections: [
      {
        heading: 'Purpose',
        content: ['This checklist guides a comprehensive compliance audit of your AI system during the CHECK phase.'],
      },
      {
        heading: 'Documentation Review',
        content: [
          '☐ System documentation is current and complete',
          '☐ Risk assessments are up to date',
          '☐ Compliance mappings are accurate',
          '☐ Incident reports are properly documented',
          '☐ Change logs are maintained',
        ],
      },
      {
        heading: 'Technical Audit',
        content: [
          '☐ Safety controls are functioning as designed',
          '☐ Monitoring systems are operational',
          '☐ Logging is comprehensive and retained',
          '☐ Access controls are properly configured',
          '☐ Data governance policies are enforced',
        ],
      },
    ],
  },
  'root-cause-analysis': {
    title: 'Root Cause Analysis Template',
    phase: 'ACT',
    sections: [
      {
        heading: 'Purpose',
        content: ['This template uses the "5 Whys" technique to identify root causes of issues discovered during the CHECK phase.'],
      },
      {
        heading: 'Problem Statement',
        content: ['Clearly describe the problem:', '', ''],
      },
      {
        heading: '5 Whys Analysis',
        content: [
          'Why did this problem occur? (1st Why)',
          '',
          'Why did that happen? (2nd Why)',
          '',
          'Why did that happen? (3rd Why)',
          '',
          'Why did that happen? (4th Why)',
          '',
          'Why did that happen? (5th Why - Root Cause)',
          '',
        ],
      },
    ],
  },
  'corrective-action-plan': {
    title: 'Corrective Action Plan',
    phase: 'ACT',
    sections: [
      {
        heading: 'Purpose',
        content: ['This template documents corrective actions to address issues identified during the CHECK phase.'],
      },
      {
        heading: 'Action Items',
        hasTable: true,
        content: [],
        tableHeaders: ['Action', 'Owner', 'Due Date', 'Priority', 'Status'],
        tableRows: [
          ['', '', '', 'Critical/High/Medium/Low', 'Not Started/In Progress/Complete'],
          ['', '', '', '', ''],
          ['', '', '', '', ''],
        ],
      },
    ],
  },
  'lessons-learned': {
    title: 'Lessons Learned Document',
    phase: 'ACT',
    sections: [
      {
        heading: 'Purpose',
        content: ['This template captures lessons learned from the completed PDCA cycle to improve future iterations.'],
      },
      {
        heading: 'What Went Well',
        content: ['List successes and positive outcomes:', '', '', ''],
      },
      {
        heading: 'What Could Be Improved',
        content: ['List challenges and areas for improvement:', '', '', ''],
      },
      {
        heading: 'Key Takeaways',
        content: ['What did we learn that will help in the next cycle?', '', '', ''],
      },
    ],
  },
};

export function generatePDCATemplate(templateName: string, res: Response) {
  const template = TEMPLATES[templateName];
  if (!template) {
    res.status(404).json({ error: 'Template not found' });
    return;
  }

  // Track if client disconnected or response ended
  let clientDisconnected = false;
  let responseEnded = false;
  
  // Handle client disconnect
  res.on('close', () => {
    clientDisconnected = true;
  });
  
  res.on('finish', () => {
    responseEnded = true;
  });
  
  res.on('error', (err) => {
    console.error('Response stream error:', err);
    clientDisconnected = true;
  });

  // Create PDF document with autoFirstPage to control page creation
  const doc = new PDFDocument({ margin: 50, size: 'LETTER', autoFirstPage: true, bufferPages: true });

  // Handle PDF document errors
  doc.on('error', (err) => {
    console.error('PDF generation error:', err);
    if (!clientDisconnected && !responseEnded && !res.headersSent) {
      res.status(500).json({ error: 'PDF generation failed' });
    }
  });

  // Set response headers before piping
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${templateName}.pdf"`);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // Pipe PDF to response with error handling
  const stream = doc.pipe(res);
  stream.on('error', (err) => {
    console.error('Pipe error:', err);
  });
  stream.on('finish', () => {
    responseEnded = true;
  });

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text('CSOAI', 50, 50);
  doc.fontSize(10).font('Helvetica').text('Certified Safety Oversight AI', 50, 75);

  // Phase badge
  const phaseColors: Record<string, string> = {
    PLAN: '#3B82F6',
    DO: '#10B981',
    CHECK: '#F59E0B',
    ACT: '#8B5CF6',
  };
  doc
    .rect(450, 50, 100, 30)
    .fillAndStroke(phaseColors[template.phase], phaseColors[template.phase])
    .fillColor('white')
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(template.phase, 450, 60, { width: 100, align: 'center' });

  // Title
  doc.moveDown(3);
  doc.fillColor('black').fontSize(18).font('Helvetica-Bold').text(template.title, { align: 'center' });

  doc.moveDown(1);
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666666')
    .text(`SOAI-PDCA ${template.phase} Phase Template`, { align: 'center' });

  doc.moveDown(2);

  // Sections
  template.sections.forEach((section) => {
    // Section heading
    doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text(section.heading);
    doc.moveDown(0.5);

    if (section.hasTable && section.tableHeaders && section.tableRows) {
      // Simple table rendering
      const tableTop = doc.y;
      const colWidth = 80;

      // Table headers
      doc.fontSize(9).font('Helvetica-Bold');
      section.tableHeaders.forEach((header, i) => {
        doc.text(header, 50 + i * colWidth, tableTop, { width: colWidth - 5 });
      });

      doc.moveDown(1);

      // Table rows
      doc.font('Helvetica');
      section.tableRows.forEach((row) => {
        const rowTop = doc.y;
        row.forEach((cell, i) => {
          doc.text(cell, 50 + i * colWidth, rowTop, { width: colWidth - 5 });
        });
        doc.moveDown(1.5);
      });
    } else {
      // Regular content
      doc.fontSize(10).font('Helvetica').fillColor('#333333');
      section.content.forEach((line) => {
        doc.text(line);
        doc.moveDown(0.3);
      });
    }

    doc.moveDown(1);
  });

  // Footer - wrap in try-catch to handle any page switching errors
  try {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(
          `CSOAI SOAI-PDCA Framework | ${template.phase} Phase | Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
    }
  } catch (err) {
    console.error('Error adding footer:', err);
  }

  // Finalize the PDF - only call end() once and handle errors
  try {
    doc.end();
  } catch (err) {
    console.error('Error ending PDF document:', err);
  }
}

export function listAvailableTemplates() {
  return Object.keys(TEMPLATES).map((key) => ({
    id: key,
    title: TEMPLATES[key].title,
    phase: TEMPLATES[key].phase,
  }));
}
