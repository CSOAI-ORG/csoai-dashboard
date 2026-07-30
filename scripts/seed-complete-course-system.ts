import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL!);

console.log('🚀 Starting complete course system seeding...\n');

// Step 1: Create training modules for each course
console.log('Step 1: Creating training modules for courses...\n');

const [courses] = await connection.execute<any[]>(
  'SELECT id, title FROM courses'
);

console.log(`Found ${courses.length} courses\n`);

for (const course of courses) {
  // Check if module already exists
  const [existingModules] = await connection.execute<any[]>(
    'SELECT id FROM training_modules WHERE courseId = ?',
    [course.id]
  );
  
  if (existingModules.length > 0) {
    console.log(`✓ Module already exists for: ${course.title}`);
  } else {
    await connection.execute(
      `INSERT INTO training_modules (courseId, code, title, description, content, orderIndex, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        course.id,
        `module-${course.id}-core`,
        `${course.title} - Core Module`,
        `Comprehensive training module covering all aspects of ${course.title}`,
        `This module provides comprehensive coverage of ${course.title}, including all essential concepts, requirements, and implementation guidance.`,
        0
      ]
    );
    console.log(`✓ Created module for: ${course.title}`);
  }
}

console.log('\n✅ Training modules created!\n');

// Step 2: Now populate comprehensive lesson content
console.log('Step 2: Populating comprehensive lesson content...\n');

// Comprehensive content mapping
const frameworkContent: Record<string, {
  lessons: Array<{
    lessonKey: string;
    title: string;
    type: string;
    duration: string;
    videoUrl?: string;
    content: string;
    quizzes: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>;
  }>;
}> = {
  'EU AI Act': {
    lessons: [
      {
        lessonKey: 'lesson1',
        title: 'Introduction to the EU AI Act',
        type: 'video',
        duration: '20 min',
        videoUrl: 'https://www.youtube.com/watch?v=kXa9Th4N8fY',
        content: `# Introduction to the EU AI Act

## Overview

The **EU Artificial Intelligence Act** represents the world's first comprehensive legal framework specifically designed to regulate artificial intelligence systems. Adopted by the European Parliament in 2024, this landmark legislation establishes a risk-based approach to AI governance that balances innovation with fundamental rights protection.

## Key Objectives

The EU AI Act aims to achieve three primary objectives:

1. **Ensure AI systems placed on the EU market are safe** and respect existing law on fundamental rights and Union values
2. **Ensure legal certainty** to facilitate investment and innovation in AI
3. **Enhance governance and effective enforcement** of existing law on fundamental rights and safety requirements applicable to AI systems

## Risk-Based Classification

The Act categorizes AI systems into four risk levels:

### Unacceptable Risk
AI systems that pose a clear threat to safety, livelihoods, and rights of people. These are **prohibited** entirely. Examples include:
- Social scoring by governments
- Real-time remote biometric identification in public spaces (with limited exceptions)
- AI that manipulates human behavior to circumvent free will
- AI that exploits vulnerabilities of specific groups

### High Risk
AI systems that significantly impact health, safety, or fundamental rights. These require:
- Conformity assessments before market placement
- Registration in an EU database
- Ongoing monitoring and reporting
- Human oversight mechanisms

Examples include AI used in:
- Critical infrastructure
- Educational or vocational training
- Employment and worker management
- Essential private and public services
- Law enforcement
- Migration and border control
- Administration of justice

### Limited Risk
AI systems with specific transparency obligations, such as:
- Chatbots (must disclose they are AI)
- Emotion recognition systems
- Biometric categorization systems
- AI-generated content (must be labeled)

### Minimal Risk
The vast majority of AI systems fall into this category and face no additional obligations beyond existing legislation.

## Timeline and Enforcement

The EU AI Act follows a phased implementation:

- **6 months**: Prohibitions on unacceptable risk AI take effect
- **12 months**: Codes of practice for general-purpose AI
- **24 months**: High-risk AI system requirements apply
- **36 months**: Full enforcement for all provisions

## Penalties

Non-compliance can result in substantial fines:
- Up to **€35 million** or **7% of global annual turnover** for prohibited AI
- Up to **€15 million** or **3% of turnover** for other violations
- Up to **€7.5 million** or **1.5% of turnover** for incorrect information

## Global Impact

While the EU AI Act directly applies only within the European Union, its extraterritorial reach and "Brussels Effect" mean that:
- Non-EU companies serving EU customers must comply
- Global AI standards are likely to converge toward EU requirements
- Other jurisdictions are already modeling legislation on the EU approach

## Conclusion

The EU AI Act establishes a comprehensive, risk-proportionate framework for AI governance. Organizations developing or deploying AI systems must understand their obligations under this regulation to ensure compliance and maintain market access in the European Union.`,
        quizzes: [
          {
            question: 'What is the primary approach used by the EU AI Act to regulate artificial intelligence?',
            options: [
              'Technology-based classification',
              'Risk-based classification',
              'Industry-based classification',
              'Size-based classification'
            ],
            correctAnswer: 1,
            explanation: 'The EU AI Act uses a risk-based approach, categorizing AI systems into four risk levels: unacceptable, high, limited, and minimal risk.'
          },
          {
            question: 'Which of the following AI systems is considered "unacceptable risk" and prohibited under the EU AI Act?',
            options: [
              'Chatbots that assist with customer service',
              'AI-powered resume screening tools',
              'Social scoring systems by governments',
              'Recommendation algorithms for e-commerce'
            ],
            correctAnswer: 2,
            explanation: 'Social scoring by governments is explicitly prohibited as it poses unacceptable risks to fundamental rights and freedoms.'
          },
          {
            question: 'What is the maximum fine for deploying prohibited AI systems under the EU AI Act?',
            options: [
              '€7.5 million or 1.5% of global turnover',
              '€15 million or 3% of global turnover',
              '€35 million or 7% of global turnover',
              '€50 million or 10% of global turnover'
            ],
            correctAnswer: 2,
            explanation: 'The most severe penalties—up to €35 million or 7% of global annual turnover—apply to prohibited AI systems.'
          }
        ]
      },
      {
        lessonKey: 'lesson2',
        title: 'High-Risk AI Systems Requirements',
        type: 'reading',
        duration: '25 min',
        content: `# High-Risk AI Systems Requirements

## Defining High-Risk AI

Under the EU AI Act, high-risk AI systems are those that pose significant risks to health, safety, or fundamental rights. The Act provides two pathways for classification:

### Annex II: AI Systems as Safety Components
AI systems that are safety components of products covered by existing EU harmonization legislation (e.g., machinery, medical devices, toys).

### Annex III: Standalone High-Risk AI Systems
AI systems used in specific areas including:
1. Biometric identification and categorization
2. Management and operation of critical infrastructure
3. Education and vocational training
4. Employment, worker management, and self-employment
5. Access to essential private and public services
6. Law enforcement
7. Migration, asylum, and border control
8. Administration of justice and democratic processes

## Core Requirements for High-Risk AI

Organizations deploying high-risk AI systems must meet eight key requirements:

### 1. Risk Management System

Establish and maintain a continuous, iterative risk management process throughout the AI system's lifecycle:

- **Identification and analysis** of known and foreseeable risks
- **Estimation and evaluation** of risks that may emerge during use
- **Evaluation of other risks** based on post-market monitoring data
- **Adoption of risk management measures** to address identified risks

The risk management system must be documented and regularly updated.

### 2. Data and Data Governance

Training, validation, and testing datasets must meet quality criteria:

- **Relevance, representativeness, and accuracy**: Data must be appropriate for the intended purpose
- **Free from errors and complete**: Data quality directly impacts AI performance
- **Statistical properties considered**: Account for biases and ensure diversity
- **Data governance**: Establish processes for data collection, analysis, labeling, storage, and aggregation

Special attention must be paid to:
- Potential biases in datasets
- Gaps or shortcomings that could lead to discrimination
- Privacy and data protection compliance (GDPR)

### 3. Technical Documentation

Comprehensive technical documentation must be prepared and maintained, including:

- General description of the AI system
- Detailed design specifications
- Information about training methodologies and techniques
- Validation and testing procedures
- Risk management documentation
- Description of changes made throughout the lifecycle

Documentation must demonstrate compliance with all requirements and be kept up-to-date.

### 4. Record-Keeping and Logging

High-risk AI systems must have automatic recording capabilities:

- **Logging of events**: Record system operations and decisions
- **Traceability**: Enable identification of how decisions were made
- **Duration**: Logs must be kept for a period appropriate to the intended purpose
- **Protection**: Ensure logs are tamper-proof and secure

Logging must respect data protection rules and privacy rights.

### 5. Transparency and Information Provision

Users must receive clear, comprehensive information:

- **Identity and contact details** of the provider
- **Characteristics, capabilities, and limitations** of the AI system
- **Level of accuracy, robustness, and cybersecurity**
- **Known and foreseeable circumstances** that may lead to risks
- **Human oversight measures** required
- **Expected lifetime and maintenance needs**

Information must be concise, complete, correct, and clear, provided in an appropriate digital or non-digital format.

### 6. Human Oversight

High-risk AI systems must be designed to enable effective human oversight:

- **Understand capabilities and limitations**: Humans must be able to properly interpret outputs
- **Remain aware of automation bias**: Recognize the tendency to over-rely on AI
- **Interpret outputs correctly**: Understand the context and limitations of AI decisions
- **Intervene or interrupt**: Ability to override or stop the AI system
- **Disregard, override, or reverse**: Authority to change AI decisions

Oversight measures must be appropriate to the risks and level of autonomy.

### 7. Accuracy, Robustness, and Cybersecurity

AI systems must achieve appropriate levels of:

**Accuracy**: 
- Consistent correct results
- Acceptable levels of errors
- Metrics clearly defined and measured

**Robustness**:
- Resilience to errors, faults, and inconsistencies
- Performance under various conditions
- Handling of unexpected inputs

**Cybersecurity**:
- Protection against unauthorized access
- Resilience to attacks and manipulation
- Secure data handling and storage

### 8. Quality Management System

Providers must establish a quality management system ensuring compliance:

- **Strategy for regulatory compliance**: Policies and procedures
- **Design and development techniques**: Quality assurance in creation
- **Examination, testing, and validation**: Pre and post-market procedures
- **Technical specifications**: Standards and benchmarks
- **System for record-keeping**: Documentation management
- **Resource management**: Adequate personnel and infrastructure
- **Accountability framework**: Clear responsibilities

## Conformity Assessment

Before placing high-risk AI on the market, providers must:

1. **Conduct conformity assessment**: Verify compliance with all requirements
2. **Draw up EU declaration of conformity**: Formal statement of compliance
3. **Affix CE marking**: Visible marking indicating conformity
4. **Register in EU database**: Public registration of high-risk AI systems

For certain high-risk AI systems, third-party conformity assessment by notified bodies is required.

## Post-Market Monitoring

Ongoing obligations include:

- **Monitoring plan**: Systematic collection and analysis of data
- **Reporting serious incidents**: Notify authorities of failures or malfunctions
- **Corrective actions**: Address issues and update systems as needed
- **Cooperation with authorities**: Respond to requests and investigations

## Conclusion

Compliance with high-risk AI requirements demands substantial investment in governance, documentation, and technical measures. Organizations must integrate these requirements into their AI development lifecycle from the earliest stages to ensure successful market placement and ongoing compliance.`,
        quizzes: [
          {
            question: 'How many core requirements must high-risk AI systems meet under the EU AI Act?',
            options: ['4', '6', '8', '10'],
            correctAnswer: 2,
            explanation: 'High-risk AI systems must meet 8 core requirements including risk management, data governance, technical documentation, logging, transparency, human oversight, accuracy/robustness/cybersecurity, and quality management.'
          },
          {
            question: 'What must be done before placing a high-risk AI system on the EU market?',
            options: [
              'Only register in the EU database',
              'Conduct conformity assessment and affix CE marking',
              'Submit to government approval process',
              'Complete a 6-month trial period'
            ],
            correctAnswer: 1,
            explanation: 'Providers must conduct a conformity assessment, draw up an EU declaration of conformity, affix CE marking, and register in the EU database before market placement.'
          }
        ]
      },
      {
        lessonKey: 'lesson3',
        title: 'Implementing Compliance Programs',
        type: 'reading',
        duration: '30 min',
        content: `# Implementing EU AI Act Compliance Programs

## Strategic Approach to Compliance

Implementing an effective EU AI Act compliance program requires a structured, organization-wide approach. This lesson provides a practical framework for building compliance capabilities.

## Phase 1: Assessment and Gap Analysis

### AI System Inventory

Begin by creating a comprehensive inventory of all AI systems:

1. **Identify all AI systems** currently in use or development
2. **Classify each system** according to risk level
3. **Document ownership and stakeholders** for each system
4. **Map data flows and dependencies**

### Gap Analysis

For each high-risk AI system, assess current state against requirements:

- Risk management processes
- Data governance practices
- Documentation completeness
- Logging and monitoring capabilities
- Transparency measures
- Human oversight mechanisms
- Technical robustness
- Quality management systems

### Priority Setting

Not all gaps are equally critical. Prioritize based on:

- **Regulatory deadlines**: Focus on systems that must comply soonest
- **Risk exposure**: Address highest-risk systems first
- **Resource requirements**: Balance quick wins with long-term investments
- **Business impact**: Consider strategic importance of each system

## Phase 2: Governance and Organization

### Establish AI Governance Structure

Create clear accountability and decision-making frameworks:

**AI Governance Board**
- Executive oversight and strategic direction
- Resource allocation decisions
- Risk acceptance authority

**AI Compliance Team**
- Day-to-day compliance management
- Policy development and implementation
- Training and awareness programs

**AI Ethics Committee**
- Review of ethical implications
- Assessment of societal impacts
- Guidance on controversial use cases

### Define Roles and Responsibilities

Key roles in AI compliance:

**AI Product Owner**
- Overall accountability for specific AI system
- Ensures compliance throughout lifecycle
- Coordinates across functions

**Data Governance Lead**
- Oversees data quality and governance
- Ensures dataset compliance
- Manages data documentation

**Risk Manager**
- Maintains risk management system
- Conducts risk assessments
- Tracks mitigation measures

**Technical Lead**
- Implements technical requirements
- Ensures robustness and security
- Manages testing and validation

**Compliance Officer**
- Monitors regulatory developments
- Ensures policy alignment
- Manages audits and assessments

### Develop Policies and Procedures

Create comprehensive policy framework:

1. **AI Development Policy**: Standards for building compliant AI
2. **Data Governance Policy**: Rules for data collection and use
3. **Risk Management Policy**: Framework for identifying and mitigating risks
4. **Documentation Standards**: Requirements for technical documentation
5. **Human Oversight Policy**: Guidelines for human-AI interaction
6. **Incident Response Policy**: Procedures for handling AI failures

## Phase 3: Technical Implementation

### Risk Management System

Implement systematic risk management:

1. **Risk identification workshops**: Engage cross-functional teams
2. **Risk assessment methodology**: Quantify likelihood and impact
3. **Risk register**: Centralized tracking of all identified risks
4. **Mitigation planning**: Define controls and countermeasures
5. **Monitoring and review**: Regular reassessment of risks

### Data Governance Framework

Establish robust data management:

1. **Data quality standards**: Define metrics and acceptance criteria
2. **Bias detection and mitigation**: Tools and processes to identify bias
3. **Data lineage tracking**: Document data sources and transformations
4. **Privacy compliance**: Ensure GDPR and data protection compliance
5. **Data documentation**: Comprehensive metadata and data sheets

### Technical Documentation

Create and maintain required documentation:

1. **System architecture documentation**: Design and components
2. **Training data documentation**: Datasets, preprocessing, and characteristics
3. **Model documentation**: Algorithms, parameters, and performance
4. **Testing and validation reports**: Results of accuracy and robustness testing
5. **Change management records**: Version control and update history

### Logging and Monitoring

Implement comprehensive logging:

1. **Event logging infrastructure**: Capture all relevant system events
2. **Log retention policies**: Define storage duration and access controls
3. **Audit trail capabilities**: Enable investigation and accountability
4. **Monitoring dashboards**: Real-time visibility into system performance
5. **Alerting mechanisms**: Automated notifications of anomalies

## Phase 4: Ongoing Compliance

### Post-Market Monitoring

Establish continuous monitoring:

1. **Performance monitoring**: Track accuracy and reliability in production
2. **User feedback collection**: Gather input from system users
3. **Incident tracking**: Document and analyze failures or issues
4. **Trend analysis**: Identify patterns and emerging risks
5. **Reporting to authorities**: Fulfill regulatory reporting obligations

### Continuous Improvement

Foster culture of ongoing enhancement:

1. **Regular audits**: Internal and external compliance reviews
2. **Lessons learned**: Capture insights from incidents and issues
3. **Regulatory monitoring**: Stay informed of legislative developments
4. **Best practice adoption**: Incorporate industry standards and guidance
5. **Training and awareness**: Keep teams updated on compliance requirements

## Conclusion

Successful EU AI Act compliance requires a holistic approach combining governance, technical implementation, and ongoing management. Organizations that invest in robust compliance programs will not only meet regulatory requirements but also build more trustworthy and reliable AI systems that deliver sustainable business value.`,
        quizzes: [
          {
            question: 'What is the first phase in implementing an EU AI Act compliance program?',
            options: [
              'Technical implementation',
              'Assessment and gap analysis',
              'Ongoing compliance monitoring',
              'Policy development'
            ],
            correctAnswer: 1,
            explanation: 'The first phase is assessment and gap analysis, which includes creating an AI system inventory and identifying compliance gaps.'
          },
          {
            question: 'Which role is responsible for maintaining the risk management system?',
            options: [
              'AI Product Owner',
              'Data Governance Lead',
              'Risk Manager',
              'Compliance Officer'
            ],
            correctAnswer: 2,
            explanation: 'The Risk Manager is responsible for maintaining the risk management system, conducting risk assessments, and tracking mitigation measures.'
          }
        ]
      }
    ]
  },
  'NIST': {
    lessons: [
      {
        lessonKey: 'lesson1',
        title: 'Introduction to NIST AI Risk Management Framework',
        type: 'video',
        duration: '22 min',
        videoUrl: 'https://www.youtube.com/watch?v=example-nist',
        content: `# Introduction to NIST AI Risk Management Framework

## Overview

The **NIST AI Risk Management Framework (AI RMF)** provides a comprehensive, voluntary framework for managing risks associated with artificial intelligence systems. Developed by the National Institute of Standards and Technology, this framework helps organizations design, develop, deploy, and use AI systems in ways that are trustworthy and responsible.

## Core Principles

The NIST AI RMF is built on four core principles:

### 1. Valid and Reliable
AI systems should be accurate, robust, and resilient across their intended operating conditions.

### 2. Safe
AI systems should not pose unacceptable risks to safety, including physical safety and cybersecurity.

### 3. Secure and Resilient
AI systems should be protected against threats and adversarial attacks, and able to recover from failures.

### 4. Accountable and Transparent
AI systems should be explainable, interpretable, and subject to appropriate oversight and governance.

## Framework Structure

The AI RMF is organized around four core functions:

### GOVERN
Establish and nurture a culture of risk management throughout the organization. This includes:
- Leadership commitment to responsible AI
- Organizational policies and procedures
- Risk management culture and awareness
- Accountability mechanisms
- Diversity and inclusion in AI teams

### MAP
Understand the context in which AI systems operate. This involves:
- Identifying stakeholders and their concerns
- Mapping potential impacts and harms
- Understanding legal and regulatory requirements
- Assessing organizational risk tolerance
- Documenting AI system context and purpose

### MEASURE
Assess and benchmark AI system performance and risks. This includes:
- Defining metrics for trustworthiness
- Testing and evaluation procedures
- Validation of AI system outputs
- Monitoring for bias and fairness
- Tracking performance over time

### MANAGE
Allocate resources and implement practices to address identified risks. This involves:
- Prioritizing risks based on severity and likelihood
- Implementing risk mitigation strategies
- Documenting risk management decisions
- Communicating risks to stakeholders
- Continuously improving risk management practices

## Key Characteristics of Trustworthy AI

The framework identifies seven characteristics that trustworthy AI systems should demonstrate:

1. **Valid and Reliable**: Consistent, accurate performance
2. **Safe**: No unacceptable risks to people or systems
3. **Secure and Resilient**: Protected against threats
4. **Accountable and Transparent**: Clear responsibility and explainability
5. **Explainable and Interpretable**: Understandable outputs and decisions
6. **Privacy-Enhanced**: Protects personal information
7. **Fair with Harmful Bias Managed**: Equitable treatment across groups

## Risk Management Approach

The NIST AI RMF takes a comprehensive approach to risk:

### Negative Risks
Traditional risks that may cause harm:
- Safety incidents
- Privacy violations
- Discriminatory outcomes
- Security breaches
- Loss of accountability

### Positive Opportunities
Benefits and value creation:
- Improved efficiency
- Enhanced decision-making
- New capabilities and services
- Societal benefits
- Economic value

## Application Across the AI Lifecycle

The framework applies throughout the entire AI lifecycle:

1. **Planning and Design**: Consider risks from the earliest stages
2. **Development**: Build in trustworthiness characteristics
3. **Deployment**: Validate performance in real-world conditions
4. **Operation and Monitoring**: Continuously assess and manage risks
5. **Retirement**: Responsibly decommission AI systems

## Voluntary and Flexible

The NIST AI RMF is:
- **Voluntary**: Not a regulatory requirement
- **Flexible**: Adaptable to different contexts and use cases
- **Sector-agnostic**: Applicable across industries
- **Technology-neutral**: Not tied to specific AI techniques
- **Risk-based**: Scalable to different risk levels

## Integration with Other Frameworks

The AI RMF is designed to complement and integrate with:
- ISO standards for AI and risk management
- Industry-specific frameworks and guidelines
- International AI governance initiatives
- Existing organizational risk management processes
- Cybersecurity and privacy frameworks

## Benefits of Adoption

Organizations that adopt the NIST AI RMF can:
- Build more trustworthy AI systems
- Reduce risks and potential harms
- Enhance stakeholder confidence
- Improve decision-making processes
- Demonstrate responsible AI practices
- Prepare for future regulations

## Conclusion

The NIST AI Risk Management Framework provides a practical, flexible approach to managing AI risks. By adopting this framework, organizations can build AI systems that are not only technically capable but also trustworthy, responsible, and aligned with societal values.`,
        quizzes: [
          {
            question: 'How many core functions does the NIST AI RMF have?',
            options: ['2', '4', '6', '8'],
            correctAnswer: 1,
            explanation: 'The NIST AI RMF has four core functions: GOVERN, MAP, MEASURE, and MANAGE.'
          },
          {
            question: 'Which characteristic is NOT one of the seven characteristics of trustworthy AI in the NIST framework?',
            options: [
              'Valid and Reliable',
              'Cost-Effective',
              'Privacy-Enhanced',
              'Fair with Harmful Bias Managed'
            ],
            correctAnswer: 1,
            explanation: 'Cost-effectiveness is not one of the seven characteristics of trustworthy AI. The seven characteristics focus on technical and ethical aspects rather than economic considerations.'
          },
          {
            question: 'Is the NIST AI RMF a mandatory regulatory requirement?',
            options: [
              'Yes, for all US organizations',
              'Yes, but only for federal agencies',
              'No, it is voluntary',
              'Yes, for organizations with over 500 employees'
            ],
            correctAnswer: 2,
            explanation: 'The NIST AI RMF is a voluntary framework, not a mandatory regulatory requirement, though it may inform future regulations.'
          }
        ]
      },
      {
        lessonKey: 'lesson2',
        title: 'The GOVERN Function',
        type: 'reading',
        duration: '28 min',
        content: `# The GOVERN Function

## Overview

The GOVERN function establishes and nurtures a culture of risk management throughout the organization. It provides the foundation for all other AI risk management activities by ensuring that appropriate structures, policies, and processes are in place.

## Purpose and Importance

Effective governance is essential because:
- It sets the tone from the top for responsible AI
- It ensures accountability for AI-related decisions
- It allocates resources for risk management
- It establishes clear roles and responsibilities
- It creates mechanisms for oversight and review

## Key Categories

The GOVERN function is organized into several key categories:

### GV.1: Policies, Processes, and Procedures

Organizations should establish comprehensive policies that:
- Define acceptable AI use cases and applications
- Set standards for AI development and deployment
- Establish approval processes for AI systems
- Create guidelines for ethical AI development
- Define escalation procedures for AI-related issues

**Implementation Practices:**
- Document all AI-related policies in accessible formats
- Ensure policies are reviewed and updated regularly
- Communicate policies clearly to all stakeholders
- Provide training on policy requirements
- Monitor compliance with established policies

### GV.2: Accountability Structures

Clear accountability is essential for responsible AI:
- **Board-level oversight**: Executive responsibility for AI strategy
- **AI governance committee**: Cross-functional oversight body
- **AI risk owner**: Individual accountable for specific AI systems
- **Ethics review board**: Assessment of ethical implications
- **Audit function**: Independent review of AI practices

**Key Responsibilities:**
- Define decision-making authority for AI systems
- Establish escalation paths for AI-related issues
- Create mechanisms for stakeholder input
- Ensure adequate resources for risk management
- Monitor and report on AI risk management effectiveness

### GV.3: Legal and Regulatory Requirements

Organizations must understand and comply with:
- Applicable laws and regulations
- Industry-specific requirements
- International standards and guidelines
- Contractual obligations
- Ethical guidelines and principles

**Compliance Activities:**
- Conduct regular legal and regulatory reviews
- Map AI systems to applicable requirements
- Implement controls to ensure compliance
- Document compliance efforts and evidence
- Engage with regulators and policymakers

### GV.4: Organizational Risk Tolerance

Define acceptable levels of AI-related risk:
- **Risk appetite**: Overall willingness to take AI-related risks
- **Risk thresholds**: Specific limits for different risk types
- **Risk criteria**: Standards for evaluating risk severity
- **Risk acceptance**: Process for approving residual risks
- **Risk communication**: How risks are reported and discussed

**Risk Tolerance Factors:**
- Organizational mission and values
- Stakeholder expectations and concerns
- Legal and regulatory requirements
- Industry norms and best practices
- Past experiences with AI systems

### GV.5: Diversity, Equity, Inclusion, and Accessibility (DEIA)

Promote DEIA throughout AI development and deployment:
- **Diverse teams**: Include varied perspectives in AI development
- **Inclusive design**: Consider needs of all user groups
- **Equitable outcomes**: Ensure fair treatment across populations
- **Accessible systems**: Design for users with disabilities
- **Cultural sensitivity**: Respect different cultural contexts

**DEIA Practices:**
- Recruit diverse AI development teams
- Include diverse stakeholders in requirements gathering
- Test AI systems with diverse user groups
- Monitor for disparate impacts across populations
- Provide accommodations for accessibility needs

### GV.6: AI Risk Management Culture

Foster an organizational culture that values responsible AI:
- **Leadership commitment**: Visible support from executives
- **Risk awareness**: Understanding of AI-related risks
- **Open communication**: Willingness to discuss AI concerns
- **Continuous learning**: Ongoing education about AI risks
- **Ethical mindset**: Consideration of broader societal impacts

**Cultural Elements:**
- Reward responsible AI practices
- Encourage reporting of AI-related concerns
- Provide resources for AI risk management
- Celebrate successes in trustworthy AI
- Learn from AI-related incidents and near-misses

## Integration with Organizational Governance

AI governance should integrate with existing governance structures:
- **Enterprise risk management**: Align with overall risk framework
- **Information security**: Coordinate with cybersecurity governance
- **Privacy governance**: Ensure consistency with privacy programs
- **Ethics programs**: Connect with organizational ethics initiatives
- **Compliance functions**: Coordinate with regulatory compliance efforts

## Governance Maturity Levels

Organizations can assess their AI governance maturity:

**Level 1: Ad Hoc**
- No formal AI governance structures
- Reactive approach to AI risks
- Limited awareness of AI-related issues

**Level 2: Developing**
- Basic AI policies and procedures
- Some accountability structures in place
- Growing awareness of AI risks

**Level 3: Defined**
- Comprehensive AI governance framework
- Clear roles and responsibilities
- Proactive risk management approach

**Level 4: Managed**
- Integrated AI governance across organization
- Metrics and monitoring in place
- Continuous improvement processes

**Level 5: Optimizing**
- AI governance as competitive advantage
- Industry-leading practices
- Innovation in responsible AI

## Common Governance Challenges

Organizations often face challenges such as:
- **Siloed responsibilities**: AI governance fragmented across departments
- **Lack of expertise**: Insufficient knowledge of AI risks
- **Resource constraints**: Limited budget for AI risk management
- **Rapid change**: Difficulty keeping pace with AI developments
- **Cultural resistance**: Pushback against governance requirements

## Best Practices

Successful AI governance requires:
1. **Start early**: Establish governance before deploying AI systems
2. **Engage stakeholders**: Include diverse perspectives in governance
3. **Be flexible**: Adapt governance to different AI use cases
4. **Measure effectiveness**: Track governance outcomes and impacts
5. **Communicate clearly**: Ensure all stakeholders understand governance requirements
6. **Provide resources**: Invest adequately in governance capabilities
7. **Lead by example**: Demonstrate commitment from the top

## Conclusion

The GOVERN function provides the essential foundation for effective AI risk management. By establishing clear policies, accountability structures, and a strong risk management culture, organizations can ensure that AI systems are developed and deployed responsibly, with appropriate oversight and governance throughout their lifecycle.`,
        quizzes: [
          {
            question: 'Which of the following is NOT a key category of the GOVERN function?',
            options: [
              'Policies, Processes, and Procedures',
              'Accountability Structures',
              'Technical Implementation',
              'Organizational Risk Tolerance'
            ],
            correctAnswer: 2,
            explanation: 'Technical Implementation is not a category of the GOVERN function. GOVERN focuses on governance, policies, accountability, and organizational culture rather than technical implementation details.'
          },
          {
            question: 'What does DEIA stand for in the context of AI governance?',
            options: [
              'Data, Ethics, Implementation, Assessment',
              'Diversity, Equity, Inclusion, and Accessibility',
              'Development, Evaluation, Integration, Analysis',
              'Design, Engineering, Innovation, Accountability'
            ],
            correctAnswer: 1,
            explanation: 'DEIA stands for Diversity, Equity, Inclusion, and Accessibility, which are important considerations in AI governance to ensure fair and inclusive AI systems.'
          }
        ]
      },
      {
        lessonKey: 'lesson3',
        title: 'MAP, MEASURE, and MANAGE Functions',
        type: 'reading',
        duration: '32 min',
        content: `# MAP, MEASURE, and MANAGE Functions

## The MAP Function

### Purpose

The MAP function helps organizations understand the context in which AI systems operate and identify potential risks and impacts. It provides the foundation for effective risk assessment and management.

### Key Activities

#### Context Understanding

Thoroughly understand the environment in which AI will operate:
- **Intended use**: What is the AI system designed to do?
- **Operating environment**: Where and how will it be deployed?
- **User characteristics**: Who will interact with the system?
- **Stakeholder landscape**: Who is affected by the system?
- **Dependencies**: What other systems or processes does it rely on?

#### Stakeholder Identification and Engagement

Identify all parties affected by the AI system:
- **Direct users**: People who interact with the system
- **Indirect users**: People affected by system outputs
- **Developers and operators**: Teams building and maintaining the system
- **Oversight bodies**: Regulators, auditors, and governance committees
- **Affected communities**: Groups impacted by system deployment

**Engagement Practices:**
- Conduct stakeholder interviews and surveys
- Hold focus groups with affected communities
- Establish advisory boards with diverse representation
- Create feedback mechanisms for ongoing input
- Document stakeholder concerns and expectations

#### Impact Assessment

Systematically assess potential impacts:
- **Beneficial impacts**: Positive outcomes and value creation
- **Harmful impacts**: Potential negative consequences
- **Distributional effects**: Who benefits and who may be harmed
- **Magnitude and likelihood**: Severity and probability of impacts
- **Temporal factors**: Short-term vs. long-term effects

**Impact Categories:**
- Individual rights and freedoms
- Safety and security
- Privacy and data protection
- Fairness and non-discrimination
- Environmental sustainability
- Societal and cultural impacts

#### Legal and Regulatory Mapping

Identify applicable requirements:
- Federal, state, and local laws
- Industry-specific regulations
- International standards and guidelines
- Contractual obligations
- Voluntary commitments and certifications

### MAP Outcomes

The MAP function should produce:
- Comprehensive context documentation
- Stakeholder analysis and engagement plan
- Impact assessment report
- Legal and regulatory requirements matrix
- Risk landscape overview

## The MEASURE Function

### Purpose

The MEASURE function involves assessing, analyzing, and tracking AI system performance and trustworthiness characteristics. It provides the data needed for informed risk management decisions.

### Key Activities

#### Metric Definition

Define appropriate metrics for trustworthiness:
- **Validity and reliability**: Accuracy, precision, recall, F1 score
- **Safety**: Failure rates, safety incidents, near-misses
- **Security**: Vulnerability counts, attack success rates
- **Fairness**: Demographic parity, equalized odds, disparate impact
- **Explainability**: Interpretability scores, explanation quality
- **Privacy**: Data minimization, re-identification risk
- **Robustness**: Performance under adversarial conditions

#### Testing and Evaluation

Conduct comprehensive testing:
- **Unit testing**: Individual components and functions
- **Integration testing**: System-level interactions
- **Performance testing**: Accuracy and reliability metrics
- **Stress testing**: Behavior under extreme conditions
- **Adversarial testing**: Resilience to attacks
- **Fairness testing**: Outcomes across demographic groups
- **User acceptance testing**: Real-world usability

**Testing Environments:**
- Development and staging environments
- Controlled test environments
- Pilot deployments with limited scope
- Production monitoring and evaluation

#### Validation

Validate AI system outputs and decisions:
- **Ground truth comparison**: Compare outputs to known correct answers
- **Expert review**: Subject matter expert assessment of outputs
- **Cross-validation**: Multiple evaluation approaches
- **External validation**: Independent third-party assessment
- **Ongoing validation**: Continuous monitoring in production

#### Bias and Fairness Assessment

Systematically evaluate fairness:
- **Dataset analysis**: Examine training data for biases
- **Model analysis**: Assess model behavior across groups
- **Output analysis**: Evaluate decisions for disparate impacts
- **Intersectional analysis**: Consider multiple demographic factors
- **Feedback loop analysis**: Identify potential bias amplification

#### Performance Monitoring

Track AI system performance over time:
- **Real-time monitoring**: Continuous performance tracking
- **Drift detection**: Identify changes in data or model behavior
- **Anomaly detection**: Flag unusual patterns or outputs
- **Incident tracking**: Document and analyze failures
- **Trend analysis**: Identify long-term performance patterns

### MEASURE Outcomes

The MEASURE function should produce:
- Comprehensive metrics framework
- Testing and evaluation reports
- Validation documentation
- Bias and fairness assessment results
- Performance monitoring dashboards

## The MANAGE Function

### Purpose

The MANAGE function involves prioritizing and responding to AI risks based on the insights gained from MAP and MEASURE activities. It ensures that appropriate actions are taken to address identified risks.

### Key Activities

#### Risk Prioritization

Determine which risks require immediate attention:
- **Severity assessment**: Potential magnitude of harm
- **Likelihood assessment**: Probability of occurrence
- **Risk scoring**: Combine severity and likelihood
- **Risk ranking**: Order risks by priority
- **Resource allocation**: Assign resources based on priority

**Prioritization Factors:**
- Potential for serious harm
- Number of people affected
- Difficulty of mitigation
- Regulatory requirements
- Stakeholder concerns

#### Risk Treatment

Select appropriate risk response strategies:
- **Avoidance**: Don't deploy AI in high-risk scenarios
- **Mitigation**: Implement controls to reduce risk
- **Transfer**: Share risk through insurance or contracts
- **Acceptance**: Acknowledge and accept residual risk

**Mitigation Strategies:**
- Technical controls (e.g., bias mitigation algorithms)
- Operational controls (e.g., human oversight)
- Administrative controls (e.g., policies and training)
- Monitoring and alerting systems
- Incident response procedures

#### Risk Communication

Effectively communicate risks to stakeholders:
- **Internal communication**: Keep teams informed of risks
- **Executive reporting**: Provide leadership with risk insights
- **User communication**: Inform users of system limitations
- **Public disclosure**: Transparently share appropriate risk information
- **Regulatory reporting**: Fulfill compliance obligations

**Communication Principles:**
- Be clear and understandable
- Provide appropriate level of detail
- Use accessible language and formats
- Be timely and proactive
- Enable two-way dialogue

#### Continuous Improvement

Regularly review and enhance risk management:
- **Lessons learned**: Capture insights from incidents
- **Process improvements**: Refine risk management practices
- **Capability building**: Develop organizational expertise
- **Tool and technology updates**: Adopt new risk management tools
- **Stakeholder feedback integration**: Incorporate external input

#### Documentation and Reporting

Maintain comprehensive records:
- Risk management decisions and rationale
- Mitigation measures implemented
- Monitoring and evaluation results
- Incidents and responses
- Changes and updates to AI systems

### MANAGE Outcomes

The MANAGE function should produce:
- Risk treatment plans
- Mitigation implementation documentation
- Risk communication materials
- Continuous improvement initiatives
- Comprehensive risk management records

## Integration Across Functions

The four functions work together in an iterative cycle:
1. **GOVERN** establishes the foundation and culture
2. **MAP** identifies context, stakeholders, and risks
3. **MEASURE** assesses performance and trustworthiness
4. **MANAGE** responds to risks and drives improvement
5. Return to **MAP** as context changes and new information emerges

## Practical Implementation

### Getting Started

Organizations new to the NIST AI RMF should:
1. Start with high-priority or high-risk AI systems
2. Adapt the framework to organizational context
3. Leverage existing risk management processes
4. Build capabilities incrementally
5. Engage stakeholders throughout

### Common Challenges

Organizations may face:
- **Resource constraints**: Limited budget and personnel
- **Technical complexity**: Difficulty measuring some characteristics
- **Organizational silos**: Fragmented responsibilities
- **Rapid change**: Fast-evolving AI landscape
- **Stakeholder engagement**: Difficulty reaching all affected parties

### Success Factors

Successful implementation requires:
- Executive commitment and support
- Cross-functional collaboration
- Adequate resources and expertise
- Clear processes and documentation
- Continuous learning and adaptation

## Conclusion

The MAP, MEASURE, and MANAGE functions provide a comprehensive approach to understanding, assessing, and addressing AI risks. By systematically applying these functions throughout the AI lifecycle, organizations can build and deploy AI systems that are trustworthy, responsible, and aligned with stakeholder expectations and societal values.`,
        quizzes: [
          {
            question: 'What is the primary purpose of the MAP function?',
            options: [
              'To measure AI system performance',
              'To understand the context and identify potential risks',
              'To implement risk mitigation strategies',
              'To establish governance structures'
            ],
            correctAnswer: 1,
            explanation: 'The MAP function helps organizations understand the context in which AI systems operate and identify potential risks and impacts.'
          },
          {
            question: 'Which of the following is NOT a risk treatment strategy in the MANAGE function?',
            options: [
              'Avoidance',
              'Mitigation',
              'Elimination',
              'Acceptance'
            ],
            correctAnswer: 2,
            explanation: 'The four risk treatment strategies are Avoidance, Mitigation, Transfer, and Acceptance. Elimination is not a standard risk treatment strategy in the NIST AI RMF.'
          }
        ]
      }
    ]
  }
};

// Add abbreviated content for remaining frameworks (TC260, ISO 42001, UK, Singapore, Japan)
// Using the same pattern but with shorter content for brevity

const abbreviatedFrameworks = {
  'TC260': 'China TC260',
  'ISO': 'ISO 42001',
  'UK': 'UK AI',
  'Singapore': 'Singapore',
  'Japan': 'Japan',
  'Canada': 'Canada',
  'Australia': 'Australia'
};

// For each abbreviated framework, create 3 basic lessons
for (const [key, searchTerm] of Object.entries(abbreviatedFrameworks)) {
  frameworkContent[searchTerm] = {
    lessons: [
      {
        lessonKey: 'lesson1',
        title: `Introduction to ${searchTerm} Framework`,
        type: 'video',
        duration: '20 min',
        content: `# Introduction to ${searchTerm} Framework

## Overview

This lesson provides a comprehensive introduction to the ${searchTerm} AI governance framework, covering its key principles, requirements, and implementation approaches.

## Key Principles

The ${searchTerm} framework is built on several core principles that guide responsible AI development and deployment:

1. **Safety and Security**: Ensuring AI systems operate safely and securely
2. **Transparency**: Providing clear information about AI system operation
3. **Accountability**: Establishing clear responsibility for AI systems
4. **Fairness**: Preventing discrimination and bias in AI systems
5. **Privacy**: Protecting personal data and privacy rights

## Framework Structure

The framework is organized into several key components:

- Governance and organizational requirements
- Technical requirements for AI systems
- Risk management and assessment procedures
- Documentation and reporting obligations
- Monitoring and compliance mechanisms

## Implementation Approach

Organizations should follow a systematic approach to implementing this framework:

1. **Assessment**: Understand current AI systems and practices
2. **Planning**: Develop implementation roadmap
3. **Execution**: Deploy required controls and processes
4. **Monitoring**: Track compliance and effectiveness
5. **Improvement**: Continuously enhance AI governance

## Benefits

Adopting this framework provides several benefits:

- Enhanced trust in AI systems
- Reduced risks and potential harms
- Improved compliance with regulations
- Better stakeholder relationships
- Competitive advantage in AI markets

## Conclusion

The ${searchTerm} framework provides a practical approach to responsible AI governance that organizations can adapt to their specific contexts and needs.`,
        quizzes: [
          {
            question: `What is a key principle of the ${searchTerm} framework?`,
            options: [
              'Cost minimization',
              'Safety and Security',
              'Market dominance',
              'Speed of deployment'
            ],
            correctAnswer: 1,
            explanation: 'Safety and Security is a core principle of the framework, ensuring AI systems operate safely and securely.'
          }
        ]
      },
      {
        lessonKey: 'lesson2',
        title: `${searchTerm} Requirements and Standards`,
        type: 'reading',
        duration: '25 min',
        content: `# ${searchTerm} Requirements and Standards

## Core Requirements

Organizations must meet several core requirements under the ${searchTerm} framework:

### Governance Requirements

- Establish AI governance structures
- Define roles and responsibilities
- Create policies and procedures
- Ensure executive oversight

### Technical Requirements

- Implement appropriate security controls
- Ensure system robustness and reliability
- Enable transparency and explainability
- Manage bias and fairness

### Documentation Requirements

- Maintain comprehensive technical documentation
- Document risk assessments and mitigation measures
- Keep records of system performance and incidents
- Provide user-facing documentation

### Risk Management Requirements

- Conduct regular risk assessments
- Implement risk mitigation measures
- Monitor and report on risks
- Continuously improve risk management

## Standards and Guidelines

The framework references several relevant standards:

- International AI standards (ISO, IEC)
- Industry-specific guidelines
- Technical specifications
- Best practice recommendations

## Compliance Obligations

Organizations must fulfill various compliance obligations:

- Regular reporting to authorities
- Incident notification requirements
- Audit and inspection cooperation
- Stakeholder communication

## Implementation Guidance

Practical guidance for meeting requirements:

1. Start with high-priority AI systems
2. Leverage existing management systems
3. Engage relevant stakeholders
4. Document all compliance activities
5. Seek expert advice when needed

## Conclusion

Meeting the requirements of the ${searchTerm} framework requires systematic effort across governance, technical, and operational dimensions.`,
        quizzes: [
          {
            question: `What is a core requirement category in the ${searchTerm} framework?`,
            options: [
              'Marketing requirements',
              'Governance requirements',
              'Sales requirements',
              'Branding requirements'
            ],
            correctAnswer: 1,
            explanation: 'Governance requirements are a core category, covering AI governance structures, roles, policies, and oversight.'
          }
        ]
      },
      {
        lessonKey: 'lesson3',
        title: `Implementing ${searchTerm} Compliance`,
        type: 'reading',
        duration: '28 min',
        content: `# Implementing ${searchTerm} Compliance

## Implementation Roadmap

### Phase 1: Preparation

- Secure management commitment
- Form implementation team
- Conduct gap analysis
- Develop implementation plan

### Phase 2: Design

- Define compliance scope
- Design processes and controls
- Create documentation framework
- Establish metrics and KPIs

### Phase 3: Implementation

- Deploy compliance processes
- Train personnel
- Implement technical controls
- Begin monitoring

### Phase 4: Verification

- Conduct internal audits
- Perform management reviews
- Address non-conformities
- Refine compliance approach

### Phase 5: Maintenance

- Maintain ongoing compliance
- Respond to changes
- Continuously improve
- Engage with regulators

## Best Practices

- Start early in AI development lifecycle
- Integrate with existing management systems
- Engage diverse stakeholders
- Document everything thoroughly
- Build compliance culture
- Stay informed of updates

## Common Challenges

- Resource constraints
- Technical complexity
- Organizational resistance
- Rapidly evolving requirements
- Limited expertise

## Success Factors

- Executive support
- Adequate resources
- Clear communication
- Stakeholder engagement
- Continuous learning

## Conclusion

Successful implementation of ${searchTerm} compliance requires systematic planning, execution, and ongoing management.`,
        quizzes: [
          {
            question: `What is the first phase in implementing ${searchTerm} compliance?`,
            options: [
              'Implementation',
              'Preparation',
              'Verification',
              'Maintenance'
            ],
            correctAnswer: 1,
            explanation: 'Preparation is the first phase, involving securing commitment, forming teams, conducting gap analysis, and planning.'
          }
        ]
      }
    ]
  };
}

// Now insert all content
let totalLessons = 0;
let totalQuizzes = 0;

for (const course of courses) {
  const courseTitle = course.title;
  console.log(`\n📚 Processing course: ${courseTitle}`);
  
  // Find matching framework content
  let frameworkKey = null;
  for (const key of Object.keys(frameworkContent)) {
    if (courseTitle.includes(key)) {
      frameworkKey = key;
      break;
    }
  }
  
  if (!frameworkKey) {
    console.log(`  ⚠️  No content defined for course: ${courseTitle}`);
    continue;
  }
  
  const content = frameworkContent[frameworkKey];
  
  // Get the module for this course
  const [modules] = await connection.execute<any[]>(
    'SELECT id FROM training_modules WHERE courseId = ? LIMIT 1',
    [course.id]
  );
  
  if (modules.length === 0) {
    console.log(`  ⚠️  No modules found for course: ${courseTitle}`);
    continue;
  }
  
  const moduleId = modules[0].id;
  
  // Insert lessons
  for (let i = 0; i < content.lessons.length; i++) {
    const lesson = content.lessons[i];
    
    // Check if lesson already exists
    const [existing] = await connection.execute<any[]>(
      'SELECT id FROM course_lessons WHERE courseId = ? AND lessonKey = ?',
      [course.id, lesson.lessonKey]
    );
    
    let lessonId;
    if (existing.length > 0) {
      lessonId = existing[0].id;
      console.log(`  ✓ Lesson already exists: ${lesson.title}`);
    } else {
      const [result] = await connection.execute<any>(
        `INSERT INTO course_lessons 
        (courseId, moduleId, lessonKey, title, type, duration, videoUrl, content, orderIndex, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          course.id,
          moduleId,
          lesson.lessonKey,
          lesson.title,
          lesson.type,
          lesson.duration,
          lesson.videoUrl || null,
          lesson.content,
          i
        ]
      );
      lessonId = (result as any).insertId;
      totalLessons++;
      console.log(`  ✓ Created lesson: ${lesson.title}`);
    }
    
    // Insert quizzes for this lesson
    for (let j = 0; j < lesson.quizzes.length; j++) {
      const quiz = lesson.quizzes[j];
      
      // Check if quiz already exists
      const [existingQuiz] = await connection.execute<any[]>(
        'SELECT id FROM lesson_quizzes WHERE lessonId = ? AND orderIndex = ?',
        [lessonId, j]
      );
      
      if (existingQuiz.length > 0) {
        console.log(`    ✓ Quiz already exists`);
      } else {
        await connection.execute(
          `INSERT INTO lesson_quizzes 
          (lessonId, question, options, correctAnswer, explanation, orderIndex, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            lessonId,
            quiz.question,
            JSON.stringify(quiz.options),
            quiz.correctAnswer,
            quiz.explanation,
            j
          ]
        );
        totalQuizzes++;
        console.log(`    ✓ Created quiz`);
      }
    }
  }
}

await connection.end();

console.log(`\n✅ Complete course system seeding finished!`);
console.log(`Total lessons created: ${totalLessons}`);
console.log(`Total quizzes created: ${totalQuizzes}`);
