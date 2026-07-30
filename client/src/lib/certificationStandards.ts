/**
 * CSOAI Certification Standards and Legal Accreditation Framework
 * 
 * This module defines the legal certification standards for AI Safety Analysts
 * certified by the Civil Society Organisation for AI (CSOAI).
 * 
 * Aligned with ISO 17024:2012 - Conformity assessment — General requirements
 * for bodies operating certification of persons
 */

export const CSOAI_ACCREDITATION = {
  organizationName: "Civil Society Organisation for AI (CSOAI)",
  registrationNumber: "CSOAI-2024-UK",
  jurisdiction: "United Kingdom",
  accreditationType: "Professional Certification Body for AI Safety",
  
  // ISO 17024 Alignment
  iso17024Alignment: {
    standard: "ISO/IEC 17024:2012",
    scope: "Certification of persons in AI Safety and Governance",
    competenceAreas: [
      "AI Regulatory Compliance",
      "AI Risk Assessment",
      "AI Ethics and Governance",
      "AI Incident Analysis",
      "AI Safety Evaluation"
    ]
  },
  
  // Legal Authority Statement
  legalAuthority: `
    CSOAI operates as an independent professional certification body for AI Safety Analysts.
    Certification is granted based on demonstrated competence in AI safety, governance, and
    regulatory compliance as assessed through standardized examinations and practical assessments.
    
    CSOAI certification does not constitute government licensure but represents professional
    recognition of competence in AI safety analysis aligned with international standards
    including the EU AI Act, NIST AI RMF, ISO 42001, and other recognized frameworks.
  `
};

export const CERTIFICATION_LEVELS = {
  fundamentals: {
    code: "CSOAI-F",
    title: "CSOAI Certified AI Safety Analyst - Fundamentals",
    abbreviation: "CASA-F",
    requirements: {
      examPassingScore: 70,
      examDuration: 90, // minutes
      questionsCount: 50,
      prerequisiteExperience: "None required",
      validityPeriod: 24, // months
      cpdRequirement: 20, // hours per year
    },
    competencies: [
      "Understanding of AI risk classification frameworks",
      "Knowledge of major AI regulatory frameworks (EU AI Act, NIST AI RMF)",
      "Basic AI ethics principles and governance concepts",
      "Incident identification and initial assessment",
      "Documentation and reporting requirements"
    ],
    scope: "Entry-level AI safety analysis and compliance monitoring"
  },
  
  advanced: {
    code: "CSOAI-A",
    title: "CSOAI Certified AI Safety Analyst - Advanced",
    abbreviation: "CASA-A",
    requirements: {
      examPassingScore: 75,
      examDuration: 120, // minutes
      questionsCount: 75,
      prerequisiteExperience: "CASA-F certification or 2 years relevant experience",
      validityPeriod: 36, // months
      cpdRequirement: 30, // hours per year
    },
    competencies: [
      "Comprehensive AI risk assessment methodology",
      "Multi-framework compliance analysis",
      "AI impact assessment and mitigation strategies",
      "Incident investigation and root cause analysis",
      "Stakeholder communication and reporting",
      "Cross-border regulatory compliance"
    ],
    scope: "Independent AI safety analysis and compliance advisory"
  },
  
  specialist: {
    code: "CSOAI-S",
    title: "CSOAI Certified AI Safety Specialist",
    abbreviation: "CASS",
    requirements: {
      examPassingScore: 80,
      examDuration: 180, // minutes
      questionsCount: 100,
      prerequisiteExperience: "CASA-A certification and 3 years relevant experience",
      validityPeriod: 36, // months
      cpdRequirement: 40, // hours per year
      practicalAssessment: true
    },
    competencies: [
      "Expert-level regulatory interpretation and application",
      "AI governance framework design and implementation",
      "Complex incident investigation and remediation",
      "Policy development and advisory",
      "Training and mentoring of junior analysts",
      "International regulatory coordination",
      "Emerging technology risk assessment"
    ],
    scope: "Senior AI safety leadership and strategic advisory"
  }
};

export const PROFESSIONAL_CONDUCT = {
  title: "CSOAI Code of Professional Conduct",
  version: "1.0",
  effectiveDate: "2024-01-01",
  
  principles: [
    {
      id: 1,
      title: "Integrity",
      description: "Act with honesty and integrity in all professional activities. Avoid conflicts of interest and disclose any potential conflicts promptly."
    },
    {
      id: 2,
      title: "Objectivity",
      description: "Maintain objectivity and independence in assessments. Base conclusions on evidence and established methodologies."
    },
    {
      id: 3,
      title: "Competence",
      description: "Maintain and develop professional competence. Only undertake work within areas of expertise and seek guidance when needed."
    },
    {
      id: 4,
      title: "Confidentiality",
      description: "Protect confidential information obtained during professional activities. Only disclose information when legally required or with proper authorization."
    },
    {
      id: 5,
      title: "Public Interest",
      description: "Act in the public interest when performing AI safety analysis. Prioritize safety and ethical considerations in all assessments."
    },
    {
      id: 6,
      title: "Professional Behavior",
      description: "Comply with relevant laws and regulations. Avoid actions that discredit the profession or CSOAI."
    }
  ],
  
  disciplinaryProcess: {
    stages: [
      "Complaint receipt and initial review",
      "Investigation by Ethics Committee",
      "Hearing and determination",
      "Appeal process (if applicable)",
      "Sanction implementation"
    ],
    sanctions: [
      "Written warning",
      "Mandatory additional training",
      "Suspension of certification",
      "Revocation of certification",
      "Public censure"
    ]
  }
};

export const CONTINUING_PROFESSIONAL_DEVELOPMENT = {
  title: "CSOAI Continuing Professional Development (CPD) Requirements",
  
  categories: [
    {
      category: "Formal Learning",
      description: "Structured educational activities",
      examples: [
        "CSOAI-approved courses and workshops",
        "University courses in AI, law, or ethics",
        "Professional conferences and seminars"
      ],
      maxCredits: 20
    },
    {
      category: "Professional Practice",
      description: "Practical application of AI safety skills",
      examples: [
        "AI safety assessments and audits",
        "Incident investigations",
        "Policy development and review"
      ],
      maxCredits: 15
    },
    {
      category: "Knowledge Sharing",
      description: "Contributing to professional knowledge",
      examples: [
        "Publishing articles or research",
        "Presenting at conferences",
        "Mentoring junior analysts"
      ],
      maxCredits: 10
    },
    {
      category: "Self-Directed Learning",
      description: "Independent professional development",
      examples: [
        "Reading professional literature",
        "Online courses and webinars",
        "Research and study"
      ],
      maxCredits: 10
    }
  ],
  
  recordKeeping: {
    requirement: "Maintain detailed records of all CPD activities",
    retention: "5 years minimum",
    auditFrequency: "Random audit of 10% of certificate holders annually"
  }
};

export const CERTIFICATE_TEMPLATE = {
  header: "Civil Society Organisation for AI",
  subheader: "Professional Certification",
  
  bodyTemplate: (name: string, level: string, certNumber: string, date: string) => `
This is to certify that

${name}

has successfully completed the requirements for

${CERTIFICATION_LEVELS[level as keyof typeof CERTIFICATION_LEVELS]?.title || level}

and is hereby authorized to use the designation

${CERTIFICATION_LEVELS[level as keyof typeof CERTIFICATION_LEVELS]?.abbreviation || 'CASA'}

Certificate Number: ${certNumber}
Date of Issue: ${date}
Valid Until: ${calculateExpiryDate(date, level)}

This certification is granted in accordance with CSOAI certification standards
aligned with ISO/IEC 17024:2012 requirements for certification of persons.
  `,
  
  footer: `
CSOAI - Civil Society Organisation for AI
Registered in the United Kingdom
www.csoai.org | certifications@csoai.org
  `,
  
  verificationUrl: "https://csoai.org/verify"
};

function calculateExpiryDate(issueDate: string, level: string): string {
  const date = new Date(issueDate);
  const months = CERTIFICATION_LEVELS[level as keyof typeof CERTIFICATION_LEVELS]?.requirements.validityPeriod || 24;
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

export const REGULATORY_FRAMEWORKS = {
  euAiAct: {
    code: "EU_AI_ACT",
    name: "EU AI Act (Regulation 2024/1689)",
    jurisdiction: "European Union",
    status: "In Force",
    effectiveDate: "2024-08-01",
    keyArticles: [
      "Article 5 - Prohibited AI Practices",
      "Articles 6-7 - High-Risk Classification",
      "Articles 8-15 - Requirements for High-Risk AI",
      "Articles 50-52 - Transparency Obligations",
      "Articles 99-101 - Penalties"
    ],
    competencyAreas: [
      "Risk classification and assessment",
      "Conformity assessment procedures",
      "Technical documentation requirements",
      "Human oversight implementation",
      "Market surveillance compliance"
    ]
  },
  
  nistAiRmf: {
    code: "NIST_AI_RMF",
    name: "NIST AI Risk Management Framework",
    jurisdiction: "United States",
    status: "Published",
    effectiveDate: "2023-01-26",
    keyComponents: [
      "GOVERN - Governance and accountability",
      "MAP - Risk identification and context",
      "MEASURE - Risk assessment and metrics",
      "MANAGE - Risk treatment and response"
    ],
    competencyAreas: [
      "Organizational governance structures",
      "AI risk identification methodology",
      "Trustworthy AI characteristics",
      "Risk measurement and monitoring",
      "Playbook implementation"
    ]
  },
  
  iso42001: {
    code: "ISO_42001",
    name: "ISO/IEC 42001:2023",
    jurisdiction: "International",
    status: "Published",
    effectiveDate: "2023-12-18",
    keyClauses: [
      "Clause 4 - Context of the Organization",
      "Clause 5 - Leadership",
      "Clause 6 - Planning",
      "Clause 7 - Support",
      "Clause 8 - Operation",
      "Clause 9 - Performance Evaluation",
      "Clause 10 - Improvement"
    ],
    competencyAreas: [
      "AI management system implementation",
      "AI risk assessment methodology",
      "AI impact assessment",
      "Internal audit procedures",
      "Continual improvement"
    ]
  },
  
  ukAiBill: {
    code: "UK_AI_BILL",
    name: "UK AI Bill & AI Safety Institute Framework",
    jurisdiction: "United Kingdom",
    status: "Proposed/In Development",
    keyComponents: [
      "AI Safety Institute mandate",
      "Foundation model testing requirements",
      "Sector regulators' AI duties",
      "Transparency requirements",
      "Incident reporting procedures"
    ],
    competencyAreas: [
      "Pro-innovation regulatory approach",
      "Frontier AI safety evaluation",
      "Cross-sector coordination",
      "International cooperation",
      "AI sandbox participation"
    ]
  },
  
  canadaAida: {
    code: "CANADA_AIDA",
    name: "Canada Artificial Intelligence and Data Act (AIDA)",
    jurisdiction: "Canada",
    status: "Proposed",
    keyComponents: [
      "High-impact AI systems definition",
      "Risk assessment requirements",
      "Transparency obligations",
      "Algorithmic impact assessments",
      "Enforcement mechanisms"
    ],
    competencyAreas: [
      "High-impact system classification",
      "Canadian privacy law integration",
      "Algorithmic accountability",
      "Minister's powers and duties",
      "Penalty framework"
    ]
  },
  
  australiaAi: {
    code: "AUSTRALIA_AI",
    name: "Australia AI Ethics Framework",
    jurisdiction: "Australia",
    status: "Voluntary/Proposed Mandatory",
    keyPrinciples: [
      "Human-centred values",
      "Fairness",
      "Privacy protection and security",
      "Reliability and safety",
      "Transparency and explainability",
      "Contestability",
      "Accountability",
      "Human oversight"
    ],
    competencyAreas: [
      "Eight AI Ethics Principles application",
      "Voluntary safety standard implementation",
      "Indigenous data sovereignty",
      "Cross-border data governance",
      "Sector-specific guidance"
    ]
  },
  
  tc260: {
    code: "TC260",
    name: "TC260 China AI Standards",
    jurisdiction: "China",
    status: "In Force",
    keyRegulations: [
      "Personal Information Protection Law",
      "Data Security Law",
      "Algorithm Recommendation Regulations",
      "Deep Synthesis Regulations",
      "Generative AI Regulations"
    ],
    competencyAreas: [
      "Multi-layered governance approach",
      "Algorithm registration requirements",
      "Content moderation compliance",
      "Cross-border data transfer",
      "Generative AI obligations"
    ]
  }
};

export const AI_TUTOR_INTEGRATION = {
  enabled: true,
  features: {
    adaptiveLearning: {
      description: "AI-powered adaptive learning that adjusts difficulty based on performance",
      enabled: true
    },
    weaknessDetection: {
      description: "Identifies knowledge gaps and recommends targeted study materials",
      enabled: true
    },
    realTimeQuestions: {
      description: "Generates additional practice questions based on areas needing improvement",
      enabled: true
    },
    progressTracking: {
      description: "Tracks learning progress across all modules and frameworks",
      enabled: true
    },
    examPreparation: {
      description: "Provides personalized exam preparation recommendations",
      enabled: true
    }
  },
  
  tutorPromptTemplate: `
You are an AI Safety Analyst tutor helping students prepare for CSOAI certification.
The student is studying: {framework}
Their current competency level: {level}
Areas needing improvement: {weakAreas}

Provide guidance that:
1. Explains concepts clearly with regulatory references
2. Uses practical examples and scenarios
3. Connects to real-world AI safety incidents
4. Prepares them for certification exam questions
5. Encourages critical thinking about AI governance
  `
};
