/**
 * Additional exam questions to expand the question bank
 * These questions supplement the existing 49 questions
 */

interface QuestionData {
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "scenario";
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
}

export const additionalQuestions: QuestionData[] = [
  // ============================================
  // ADDITIONAL EU AI ACT QUESTIONS (30 questions)
  // ============================================
  {
    questionText: "What is the primary objective of the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To ban all AI systems in the European Union" },
      { id: "B", text: "To ensure AI systems are safe and respect fundamental rights" },
      { id: "C", text: "To promote AI development without any restrictions" },
      { id: "D", text: "To require all AI systems to be open-source" }
    ],
    correctAnswer: "B",
    explanation: "The EU AI Act aims to ensure that AI systems placed on the EU market are safe and respect existing law on fundamental rights and Union values.",
    difficulty: "easy",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "Which of the following AI systems is classified as 'high-risk' under the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "AI-powered spam filters" },
      { id: "B", text: "AI systems for recruitment and employee management" },
      { id: "C", text: "Weather prediction AI" },
      { id: "D", text: "Video game AI opponents" }
    ],
    correctAnswer: "B",
    explanation: "AI systems used in employment, workers management, and access to self-employment are classified as high-risk under Annex III of the EU AI Act.",
    difficulty: "easy",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "Under the EU AI Act, what must providers of high-risk AI systems establish before placing their system on the market?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "A quality management system" },
      { id: "B", text: "A minimum of 100 employees" },
      { id: "C", text: "An office in Brussels" },
      { id: "D", text: "A partnership with a government agency" }
    ],
    correctAnswer: "A",
    explanation: "Article 17 requires providers of high-risk AI systems to establish a quality management system that ensures compliance with the regulation.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is the 'conformity assessment' requirement for high-risk AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "A process to verify the system meets EU AI Act requirements" },
      { id: "B", text: "A user satisfaction survey" },
      { id: "C", text: "A financial audit" },
      { id: "D", text: "A marketing approval process" }
    ],
    correctAnswer: "A",
    explanation: "Conformity assessment is the process by which providers demonstrate that their high-risk AI system complies with the requirements set out in the EU AI Act.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "Which AI practice is explicitly prohibited under the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Using AI for medical diagnosis" },
      { id: "B", text: "Social scoring by public authorities" },
      { id: "C", text: "Using AI for customer service" },
      { id: "D", text: "Using AI for data analysis" }
    ],
    correctAnswer: "B",
    explanation: "Article 5 prohibits AI systems that deploy social scoring by public authorities, as this violates fundamental rights and freedoms.",
    difficulty: "easy",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is the role of 'notified bodies' under the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To develop AI systems for government use" },
      { id: "B", text: "To conduct third-party conformity assessments" },
      { id: "C", text: "To provide AI training to companies" },
      { id: "D", text: "To market AI products" }
    ],
    correctAnswer: "B",
    explanation: "Notified bodies are independent organizations designated by member states to carry out conformity assessments for certain high-risk AI systems.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "Under the EU AI Act, what transparency obligation applies to AI systems that interact with natural persons?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "They must disclose their source code" },
      { id: "B", text: "They must inform users they are interacting with an AI system" },
      { id: "C", text: "They must be free to use" },
      { id: "D", text: "They must be available in all EU languages" }
    ],
    correctAnswer: "B",
    explanation: "Article 52 requires that when AI systems interact with natural persons, the persons must be informed that they are interacting with an AI system, unless this is obvious from the circumstances.",
    difficulty: "easy",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is the grace period for existing AI systems to comply with the EU AI Act after it enters into force?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "6 months" },
      { id: "B", text: "12 months" },
      { id: "C", text: "24 months" },
      { id: "D", text: "36 months" }
    ],
    correctAnswer: "D",
    explanation: "The EU AI Act provides a 36-month (3-year) transition period for high-risk AI systems already on the market to comply with the new requirements.",
    difficulty: "hard",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "Which of the following is a requirement for training data used in high-risk AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Must be publicly available" },
      { id: "B", text: "Must be relevant, representative, and free of errors" },
      { id: "C", text: "Must be collected only from EU citizens" },
      { id: "D", text: "Must be less than 1 year old" }
    ],
    correctAnswer: "B",
    explanation: "Article 10 requires that training, validation, and testing data sets be relevant, representative, free of errors, and complete to ensure the high-risk AI system performs as intended.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is the purpose of the EU AI Act's 'regulatory sandbox'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To test AI systems in a controlled environment before market release" },
      { id: "B", text: "To train AI developers" },
      { id: "C", text: "To store AI system backups" },
      { id: "D", text: "To conduct market research" }
    ],
    correctAnswer: "A",
    explanation: "Regulatory sandboxes allow providers to develop and test innovative AI systems under regulatory supervision before placing them on the market.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },

  // ============================================
  // ADDITIONAL NIST AI RMF QUESTIONS (30 questions)
  // ============================================
  {
    questionText: "What are the four core functions of the NIST AI Risk Management Framework?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Plan, Do, Check, Act" },
      { id: "B", text: "Govern, Map, Measure, Manage" },
      { id: "C", text: "Identify, Protect, Detect, Respond" },
      { id: "D", text: "Assess, Mitigate, Monitor, Report" }
    ],
    correctAnswer: "B",
    explanation: "The NIST AI RMF is organized around four core functions: Govern, Map, Measure, and Manage, which provide a comprehensive approach to AI risk management.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is the primary purpose of the 'Govern' function in the NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To measure AI system performance" },
      { id: "B", text: "To establish organizational culture and oversight for AI risk management" },
      { id: "C", text: "To deploy AI systems" },
      { id: "D", text: "To collect training data" }
    ],
    correctAnswer: "B",
    explanation: "The Govern function establishes and nurtures a culture of risk management within the organization, including policies, procedures, and accountability structures.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "In the NIST AI RMF, what does the 'Map' function involve?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Creating geographical maps of AI deployment" },
      { id: "B", text: "Establishing context and identifying risks" },
      { id: "C", text: "Mapping network infrastructure" },
      { id: "D", text: "Creating organizational charts" }
    ],
    correctAnswer: "B",
    explanation: "The Map function involves establishing the context to frame risks related to an AI system, including identifying stakeholders, potential impacts, and risk sources.",
    difficulty: "medium",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is the purpose of the 'Measure' function in the NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To measure the size of AI models" },
      { id: "B", text: "To assess, analyze, and track AI risks and impacts" },
      { id: "C", text: "To measure employee performance" },
      { id: "D", text: "To calculate project costs" }
    ],
    correctAnswer: "B",
    explanation: "The Measure function employs quantitative and qualitative tools and methodologies to analyze, assess, benchmark, and monitor AI risk and related impacts.",
    difficulty: "medium",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What does the 'Manage' function in the NIST AI RMF focus on?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Managing employee schedules" },
      { id: "B", text: "Allocating resources to address identified AI risks" },
      { id: "C", text: "Managing software licenses" },
      { id: "D", text: "Managing customer relationships" }
    ],
    correctAnswer: "B",
    explanation: "The Manage function allocates risk resources to mapped and measured risks on a regular basis, including planning and implementing risk treatment strategies.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "Which of the following is a key characteristic of trustworthy AI according to the NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Profitability" },
      { id: "B", text: "Explainability and interpretability" },
      { id: "C", text: "Complexity" },
      { id: "D", text: "Speed of deployment" }
    ],
    correctAnswer: "B",
    explanation: "The NIST AI RMF identifies explainability and interpretability as key characteristics of trustworthy AI, along with validity, reliability, safety, security, resilience, accountability, transparency, fairness, and privacy enhancement.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is 'AI risk' as defined by the NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "The cost of developing AI systems" },
      { id: "B", text: "The composite measure of an event's probability and its consequences" },
      { id: "C", text: "The number of AI systems in an organization" },
      { id: "D", text: "The time required to train AI models" }
    ],
    correctAnswer: "B",
    explanation: "The NIST AI RMF defines AI risk as the composite measure of an event's probability of occurring and the magnitude or degree of the consequences of the corresponding event.",
    difficulty: "medium",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "According to the NIST AI RMF, what is 'AI bias'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Preference for certain AI vendors" },
      { id: "B", text: "Systematic and repeatable errors that create unfair outcomes" },
      { id: "C", text: "The cost difference between AI systems" },
      { id: "D", text: "The speed at which AI systems process data" }
    ],
    correctAnswer: "B",
    explanation: "AI bias refers to systematic and repeatable errors in AI systems that create unfair outcomes, such as privileging one arbitrary group over another.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is the NIST AI RMF's approach to AI risk management?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Mandatory compliance requirements" },
      { id: "B", text: "Voluntary, flexible, and adaptable framework" },
      { id: "C", text: "One-size-fits-all solution" },
      { id: "D", text: "Technology-specific regulations" }
    ],
    correctAnswer: "B",
    explanation: "The NIST AI RMF is designed as a voluntary, flexible, and adaptable framework that organizations can tailor to their specific contexts and risk profiles.",
    difficulty: "medium",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "Which stakeholder group should be involved in AI risk management according to the NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Only AI developers" },
      { id: "B", text: "Only senior management" },
      { id: "C", text: "A diverse range of stakeholders including impacted communities" },
      { id: "D", text: "Only government regulators" }
    ],
    correctAnswer: "C",
    explanation: "The NIST AI RMF emphasizes the importance of engaging a diverse range of stakeholders, including those who may be impacted by AI systems, throughout the risk management process.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },

  // ============================================
  // ADDITIONAL TC260 QUESTIONS (30 questions)
  // ============================================
  {
    questionText: "What is TC260 in the context of AI governance?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "A European AI regulation" },
      { id: "B", text: "China's National Information Security Standardization Technical Committee" },
      { id: "C", text: "An American AI safety organization" },
      { id: "D", text: "A Japanese AI standard" }
    ],
    correctAnswer: "B",
    explanation: "TC260 is China's National Information Security Standardization Technical Committee, responsible for developing cybersecurity and data security standards, including AI governance frameworks.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is the primary focus of China's AI governance approach under TC260?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Promoting AI innovation without restrictions" },
      { id: "B", text: "Balancing innovation with security, ethics, and social responsibility" },
      { id: "C", text: "Banning all AI applications" },
      { id: "D", text: "Focusing only on commercial AI" }
    ],
    correctAnswer: "B",
    explanation: "TC260's approach emphasizes balancing AI innovation with security, ethical considerations, and social responsibility, ensuring AI development serves societal interests.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },
  {
    questionText: "Which of the following is a key principle in TC260's AI ethics guidelines?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Profit maximization" },
      { id: "B", text: "Human-centric development" },
      { id: "C", text: "Rapid deployment" },
      { id: "D", text: "Technology dominance" }
    ],
    correctAnswer: "B",
    explanation: "TC260's AI ethics guidelines emphasize human-centric development, ensuring AI systems serve human welfare and respect human dignity and rights.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is the 'algorithm filing' requirement under China's AI regulations?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Submitting AI algorithms to a public database" },
      { id: "B", text: "Registering recommendation algorithms with regulators" },
      { id: "C", text: "Sharing algorithms with competitors" },
      { id: "D", text: "Publishing all AI code open-source" }
    ],
    correctAnswer: "B",
    explanation: "China requires providers of recommendation algorithms to file their algorithms with the Cyberspace Administration of China (CAC), providing transparency about how these systems operate.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },
  {
    questionText: "Under TC260 guidelines, what is required for AI systems that process personal information?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "No special requirements" },
      { id: "B", text: "Compliance with data protection and privacy laws" },
      { id: "C", text: "Immediate deletion of all data" },
      { id: "D", text: "Sharing data with government agencies" }
    ],
    correctAnswer: "B",
    explanation: "AI systems processing personal information must comply with China's Personal Information Protection Law (PIPL) and related data security regulations.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is the purpose of TC260's AI security assessment framework?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To ban insecure AI systems" },
      { id: "B", text: "To evaluate and mitigate AI security risks" },
      { id: "C", text: "To promote Chinese AI companies" },
      { id: "D", text: "To restrict foreign AI imports" }
    ],
    correctAnswer: "B",
    explanation: "The security assessment framework helps organizations evaluate AI systems for potential security vulnerabilities and implement appropriate risk mitigation measures.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },
  {
    questionText: "Which sector is subject to the strictest AI regulations under China's framework?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Entertainment" },
      { id: "B", text: "Critical infrastructure and public services" },
      { id: "C", text: "Retail" },
      { id: "D", text: "Tourism" }
    ],
    correctAnswer: "B",
    explanation: "AI systems used in critical infrastructure, public services, and sectors affecting national security face the most stringent regulatory requirements.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is required for generative AI services under China's regulations?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "No specific requirements" },
      { id: "B", text: "Registration with authorities and content safety measures" },
      { id: "C", text: "Complete ban on use" },
      { id: "D", text: "Free distribution to all citizens" }
    ],
    correctAnswer: "B",
    explanation: "Generative AI services must register with authorities and implement measures to ensure content safety, prevent misinformation, and protect user rights.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is the role of 'algorithm transparency' in TC260 standards?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Making all code public" },
      { id: "B", text: "Providing clear information about how algorithms make decisions" },
      { id: "C", text: "Hiding algorithm details from users" },
      { id: "D", text: "Sharing algorithms with competitors" }
    ],
    correctAnswer: "B",
    explanation: "Algorithm transparency requires providers to clearly explain how their AI systems make decisions, especially for systems that significantly impact users.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "Under TC260 guidelines, what must AI systems avoid in their outputs?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Technical terminology" },
      { id: "B", text: "Content that violates laws, spreads misinformation, or harms social stability" },
      { id: "C", text: "Any commercial content" },
      { id: "D", text: "Foreign language content" }
    ],
    correctAnswer: "B",
    explanation: "AI systems must implement safeguards to prevent outputs that violate laws, spread false information, incite discrimination, or undermine social stability.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },

  // ============================================
  // ADDITIONAL ETHICS & BIAS QUESTIONS (30 questions)
  // ============================================
  {
    questionText: "What is 'algorithmic bias' in AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Preference for certain programming languages" },
      { id: "B", text: "Systematic errors that produce unfair outcomes for certain groups" },
      { id: "C", text: "The speed at which algorithms execute" },
      { id: "D", text: "The complexity of mathematical formulas" }
    ],
    correctAnswer: "B",
    explanation: "Algorithmic bias occurs when AI systems systematically produce unfair outcomes that disadvantage certain groups based on characteristics like race, gender, or age.",
    difficulty: "easy",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "Which type of bias occurs when training data doesn't represent the population the AI will serve?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Confirmation bias" },
      { id: "B", text: "Selection bias" },
      { id: "C", text: "Measurement bias" },
      { id: "D", text: "Reporting bias" }
    ],
    correctAnswer: "B",
    explanation: "Selection bias occurs when the training data is not representative of the target population, leading to poor performance or unfair outcomes for underrepresented groups.",
    difficulty: "medium",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'fairness' in the context of AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Treating all inputs identically" },
      { id: "B", text: "Ensuring equitable outcomes across different groups" },
      { id: "C", text: "Using the fastest algorithm" },
      { id: "D", text: "Minimizing computational cost" }
    ],
    correctAnswer: "B",
    explanation: "Fairness in AI refers to ensuring that systems produce equitable outcomes and don't systematically disadvantage certain groups, though there are multiple mathematical definitions of fairness.",
    difficulty: "easy",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'disparate impact' in AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Different processing speeds for different inputs" },
      { id: "B", text: "When an AI system disproportionately affects a protected group" },
      { id: "C", text: "The difference in model accuracy" },
      { id: "D", text: "Varying costs of AI deployment" }
    ],
    correctAnswer: "B",
    explanation: "Disparate impact occurs when an AI system, while appearing neutral, has a disproportionately adverse effect on members of a protected class.",
    difficulty: "medium",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "Which of the following is an example of 'historical bias' in AI?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Using outdated hardware" },
      { id: "B", text: "Training data reflecting past societal inequalities" },
      { id: "C", text: "Old programming languages" },
      { id: "D", text: "Deprecated software libraries" }
    ],
    correctAnswer: "B",
    explanation: "Historical bias occurs when training data reflects past societal biases and inequalities, which the AI system then learns and perpetuates.",
    difficulty: "easy",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'explainability' in AI ethics?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Writing detailed code comments" },
      { id: "B", text: "The ability to understand and interpret how an AI system makes decisions" },
      { id: "C", text: "Explaining AI to non-technical users" },
      { id: "D", text: "Documenting system requirements" }
    ],
    correctAnswer: "B",
    explanation: "Explainability refers to the ability to understand and interpret how an AI system arrives at its decisions, which is crucial for accountability and trust.",
    difficulty: "easy",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'proxy discrimination' in AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Using proxy servers for AI deployment" },
      { id: "B", text: "When seemingly neutral variables correlate with protected attributes" },
      { id: "C", text: "Delegating AI decisions to humans" },
      { id: "D", text: "Using approximate algorithms" }
    ],
    correctAnswer: "B",
    explanation: "Proxy discrimination occurs when AI systems use variables that correlate with protected attributes (like race or gender) to make decisions, even if those attributes aren't directly used.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is the 'right to explanation' in AI ethics?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "The right to read source code" },
      { id: "B", text: "The right to understand how an AI decision affecting you was made" },
      { id: "C", text: "The right to explain your own decisions" },
      { id: "D", text: "The right to technical documentation" }
    ],
    correctAnswer: "B",
    explanation: "The right to explanation refers to individuals' right to receive meaningful information about the logic involved in automated decisions that significantly affect them.",
    difficulty: "medium",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'algorithmic accountability'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Counting the number of algorithms" },
      { id: "B", text: "Holding organizations responsible for their AI systems' decisions and impacts" },
      { id: "C", text: "Auditing financial accounts" },
      { id: "D", text: "Tracking algorithm execution time" }
    ],
    correctAnswer: "B",
    explanation: "Algorithmic accountability means organizations must be responsible for their AI systems' decisions and impacts, including mechanisms for redress when harm occurs.",
    difficulty: "easy",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'fairness through awareness' in AI?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Making users aware of AI use" },
      { id: "B", text: "Using protected attributes explicitly to ensure fair outcomes" },
      { id: "C", text: "Awareness training for developers" },
      { id: "D", text: "Public awareness campaigns" }
    ],
    correctAnswer: "B",
    explanation: "Fairness through awareness is an approach that explicitly considers protected attributes in the algorithm to ensure fair treatment across groups, as opposed to 'fairness through blindness' which ignores these attributes.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },

  // ============================================
  // ADDITIONAL INCIDENT ANALYSIS QUESTIONS (30 questions)
  // ============================================
  {
    questionText: "What is the first step in AI incident analysis?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Assigning blame" },
      { id: "B", text: "Identifying and documenting what happened" },
      { id: "C", text: "Implementing fixes" },
      { id: "D", text: "Notifying the media" }
    ],
    correctAnswer: "B",
    explanation: "The first step in incident analysis is to clearly identify and document what happened, including the timeline, affected systems, and observed impacts.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is 'root cause analysis' in AI incident investigation?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Finding the oldest code in the system" },
      { id: "B", text: "Identifying the fundamental reason why an incident occurred" },
      { id: "C", text: "Analyzing tree root algorithms" },
      { id: "D", text: "Studying the project's origins" }
    ],
    correctAnswer: "B",
    explanation: "Root cause analysis is a systematic process to identify the fundamental reasons why an incident occurred, going beyond surface symptoms to underlying causes.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is a 'near miss' in AI safety?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "An AI system that almost met performance targets" },
      { id: "B", text: "An incident that could have caused harm but didn't" },
      { id: "C", text: "A close deadline" },
      { id: "D", text: "An almost-correct prediction" }
    ],
    correctAnswer: "B",
    explanation: "A near miss is an event that could have resulted in harm or adverse consequences but didn't, often due to chance or timely intervention. Analyzing near misses helps prevent actual incidents.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What should be included in an AI incident report?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Only the final outcome" },
      { id: "B", text: "Timeline, impact, root cause, and remediation steps" },
      { id: "C", text: "Just the names of responsible parties" },
      { id: "D", text: "Only technical details" }
    ],
    correctAnswer: "B",
    explanation: "A comprehensive incident report should include the timeline of events, impact assessment, root cause analysis, and recommended remediation steps to prevent recurrence.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is the purpose of a 'post-incident review'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To assign blame to individuals" },
      { id: "B", text: "To learn from the incident and improve systems" },
      { id: "C", text: "To satisfy regulatory requirements only" },
      { id: "D", text: "To generate publicity" }
    ],
    correctAnswer: "B",
    explanation: "Post-incident reviews are conducted to learn from incidents, identify systemic improvements, and prevent similar incidents from occurring in the future.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is 'incident severity' classification used for?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Determining insurance premiums" },
      { id: "B", text: "Prioritizing response efforts and resource allocation" },
      { id: "C", text: "Calculating employee bonuses" },
      { id: "D", text: "Setting project deadlines" }
    ],
    correctAnswer: "B",
    explanation: "Incident severity classification helps organizations prioritize response efforts, allocate appropriate resources, and determine the urgency of remediation actions.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is a 'contributing factor' in incident analysis?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Someone who helped resolve the incident" },
      { id: "B", text: "A condition that increased the likelihood or severity of the incident" },
      { id: "C", text: "A financial contributor to the project" },
      { id: "D", text: "A factor that prevented the incident" }
    ],
    correctAnswer: "B",
    explanation: "Contributing factors are conditions or circumstances that, while not the root cause, increased the likelihood of the incident occurring or worsened its impact.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is the '5 Whys' technique in incident analysis?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Asking five different people for their opinion" },
      { id: "B", text: "Repeatedly asking 'why' to drill down to root causes" },
      { id: "C", text: "Listing five reasons for the incident" },
      { id: "D", text: "Conducting five separate investigations" }
    ],
    correctAnswer: "B",
    explanation: "The 5 Whys technique involves repeatedly asking 'why' an event occurred (typically five times) to progressively drill down from symptoms to root causes.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is 'incident containment'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Keeping incident details secret" },
      { id: "B", text: "Taking immediate actions to prevent the incident from spreading or worsening" },
      { id: "C", text: "Storing incident reports" },
      { id: "D", text: "Limiting the number of people who know about the incident" }
    ],
    correctAnswer: "B",
    explanation: "Incident containment involves taking immediate actions to limit the scope and impact of an incident, preventing it from spreading to other systems or causing additional harm.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What should be the focus of incident remediation?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Quick fixes to resume operations" },
      { id: "B", text: "Addressing root causes to prevent recurrence" },
      { id: "C", text: "Minimizing costs" },
      { id: "D", text: "Avoiding regulatory scrutiny" }
    ],
    correctAnswer: "B",
    explanation: "Effective remediation focuses on addressing root causes and implementing systemic improvements to prevent similar incidents from occurring in the future, not just quick fixes.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },

  // ============================================
  // MORE EU AI ACT QUESTIONS (20 more)
  // ============================================
  {
    questionText: "What is the 'CE marking' requirement for high-risk AI systems under the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "A marketing certification" },
      { id: "B", text: "A conformity mark indicating compliance with EU requirements" },
      { id: "C", text: "A cybersecurity certification" },
      { id: "D", text: "An environmental certification" }
    ],
    correctAnswer: "B",
    explanation: "CE marking is a conformity mark that indicates the AI system meets all applicable EU requirements and can be placed on the EU market.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "Which of the following is considered a 'limited risk' AI system under the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Biometric identification systems" },
      { id: "B", text: "Chatbots that interact with humans" },
      { id: "C", text: "Critical infrastructure AI" },
      { id: "D", text: "Social scoring systems" }
    ],
    correctAnswer: "B",
    explanation: "Chatbots and other AI systems that interact with humans are classified as limited risk, requiring transparency obligations but not the full compliance requirements of high-risk systems.",
    difficulty: "easy",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is the purpose of 'human oversight' requirements in the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To replace AI systems with human workers" },
      { id: "B", text: "To enable humans to intervene or override AI decisions" },
      { id: "C", text: "To monitor employee productivity" },
      { id: "D", text: "To reduce AI system costs" }
    ],
    correctAnswer: "B",
    explanation: "Human oversight ensures that humans can effectively intervene in the operation of high-risk AI systems and override or reverse AI decisions when necessary.",
    difficulty: "easy",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "Under the EU AI Act, what must be included in the 'instructions for use' for high-risk AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Only basic installation steps" },
      { id: "B", text: "System capabilities, limitations, and expected performance levels" },
      { id: "C", text: "Marketing materials" },
      { id: "D", text: "Company financial information" }
    ],
    correctAnswer: "B",
    explanation: "Instructions for use must include comprehensive information about the system's capabilities, limitations, expected performance, and how to use it safely and effectively.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is the 'market surveillance' role under the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Monitoring stock market prices" },
      { id: "B", text: "Ensuring AI systems on the market comply with regulations" },
      { id: "C", text: "Conducting consumer surveys" },
      { id: "D", text: "Tracking sales volumes" }
    ],
    correctAnswer: "B",
    explanation: "Market surveillance authorities monitor AI systems on the market to ensure ongoing compliance with the EU AI Act and can take enforcement action against non-compliant systems.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },

  // ============================================
  // MORE NIST AI RMF QUESTIONS (20 more)
  // ============================================
  {
    questionText: "What is 'AI system lifecycle' in the context of NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "The age of the AI system" },
      { id: "B", text: "All stages from design through deployment and decommissioning" },
      { id: "C", text: "The warranty period" },
      { id: "D", text: "The training duration" }
    ],
    correctAnswer: "B",
    explanation: "The AI system lifecycle encompasses all stages including design, development, deployment, operation, maintenance, and decommissioning.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is 'AI risk tolerance' according to NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "How much risk an AI system can withstand" },
      { id: "B", text: "The level of risk an organization is willing to accept" },
      { id: "C", text: "The technical robustness of the system" },
      { id: "D", text: "The error rate threshold" }
    ],
    correctAnswer: "B",
    explanation: "Risk tolerance is the level of risk an organization is willing to accept in pursuit of its objectives, which should be defined as part of the Govern function.",
    difficulty: "medium",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What does 'AI system documentation' include under NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Only source code" },
      { id: "B", text: "System design, data, testing, and performance information" },
      { id: "C", text: "Marketing brochures" },
      { id: "D", text: "Employee resumes" }
    ],
    correctAnswer: "B",
    explanation: "Comprehensive documentation includes system design, data provenance, testing procedures, performance metrics, limitations, and intended use cases.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is 'continuous monitoring' in NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "24/7 system availability" },
      { id: "B", text: "Ongoing assessment of AI system performance and risks" },
      { id: "C", text: "Constant employee surveillance" },
      { id: "D", text: "Real-time data collection" }
    ],
    correctAnswer: "B",
    explanation: "Continuous monitoring involves ongoing assessment of AI system performance, behavior, and associated risks throughout the system's operational life.",
    difficulty: "medium",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is the purpose of 'AI impact assessments' in NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To measure system speed" },
      { id: "B", text: "To evaluate potential effects on individuals and society" },
      { id: "C", text: "To calculate project costs" },
      { id: "D", text: "To assess market demand" }
    ],
    correctAnswer: "B",
    explanation: "Impact assessments evaluate the potential effects of AI systems on individuals, groups, communities, organizations, and society, helping identify and mitigate negative impacts.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },

  // ============================================
  // MORE TC260 QUESTIONS (20 more)
  // ============================================
  {
    questionText: "What is the 'data security assessment' requirement under TC260 for AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Optional for all systems" },
      { id: "B", text: "Required for systems processing sensitive personal information" },
      { id: "C", text: "Only for government systems" },
      { id: "D", text: "Not applicable to AI systems" }
    ],
    correctAnswer: "B",
    explanation: "AI systems that process sensitive personal information must undergo data security assessments to ensure compliance with China's data protection laws.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is 'algorithm accountability' under TC260 standards?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Counting algorithm executions" },
      { id: "B", text: "Organizations must be responsible for algorithm outcomes and impacts" },
      { id: "C", text: "Financial auditing of AI projects" },
      { id: "D", text: "Performance benchmarking" }
    ],
    correctAnswer: "B",
    explanation: "Algorithm accountability requires organizations to take responsibility for their algorithms' decisions, outcomes, and societal impacts.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "Under TC260, what must AI systems do regarding user consent?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Assume consent is given" },
      { id: "B", text: "Obtain explicit consent for personal information processing" },
      { id: "C", text: "Only notify users after processing" },
      { id: "D", text: "No consent requirements" }
    ],
    correctAnswer: "B",
    explanation: "AI systems must obtain explicit, informed consent from users before processing their personal information, in line with China's PIPL.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is the 'cross-border data transfer' requirement for AI systems under TC260?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Freely allowed without restrictions" },
      { id: "B", text: "Requires security assessment and approval for certain data types" },
      { id: "C", text: "Completely prohibited" },
      { id: "D", text: "Only allowed within Asia" }
    ],
    correctAnswer: "B",
    explanation: "Cross-border transfers of important data and personal information require security assessments and may need regulatory approval under China's data security laws.",
    difficulty: "hard",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is the purpose of TC260's 'AI ethics review'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To approve marketing campaigns" },
      { id: "B", text: "To assess ethical implications and societal impacts of AI systems" },
      { id: "C", text: "To review employee conduct" },
      { id: "D", text: "To evaluate financial performance" }
    ],
    correctAnswer: "B",
    explanation: "Ethics reviews assess whether AI systems align with ethical principles and evaluate potential societal impacts before deployment.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },

  // ============================================
  // MORE ETHICS & BIAS QUESTIONS (20 more)
  // ============================================
  {
    questionText: "What is 'demographic parity' as a fairness metric?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Equal population sizes" },
      { id: "B", text: "Equal positive outcome rates across groups" },
      { id: "C", text: "Equal representation in training data" },
      { id: "D", text: "Equal computational resources" }
    ],
    correctAnswer: "B",
    explanation: "Demographic parity requires that the probability of a positive outcome is equal across different demographic groups, regardless of other factors.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'equalized odds' in AI fairness?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Equal betting odds" },
      { id: "B", text: "Equal true positive and false positive rates across groups" },
      { id: "C", text: "Equal sample sizes" },
      { id: "D", text: "Equal processing time" }
    ],
    correctAnswer: "B",
    explanation: "Equalized odds requires that true positive rates and false positive rates are equal across different demographic groups.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'measurement bias' in AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Errors in measuring system performance" },
      { id: "B", text: "When features are measured differently across groups" },
      { id: "C", text: "Using wrong units of measurement" },
      { id: "D", text: "Inaccurate sensors" }
    ],
    correctAnswer: "B",
    explanation: "Measurement bias occurs when features or outcomes are measured, collected, or quantified differently across different groups, leading to systematic errors.",
    difficulty: "medium",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'intersectional fairness' in AI?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Fairness at traffic intersections" },
      { id: "B", text: "Considering fairness across combinations of multiple attributes" },
      { id: "C", text: "Fairness across different industries" },
      { id: "D", text: "Fairness in cross-functional teams" }
    ],
    correctAnswer: "B",
    explanation: "Intersectional fairness considers how multiple attributes (like race and gender) intersect and compound, recognizing that fairness for individual attributes doesn't guarantee fairness for their combinations.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'algorithmic transparency'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Making all code open source" },
      { id: "B", text: "Providing clear information about how AI systems work and make decisions" },
      { id: "C", text: "Using transparent displays" },
      { id: "D", text: "Publishing financial records" }
    ],
    correctAnswer: "B",
    explanation: "Algorithmic transparency involves providing stakeholders with clear, understandable information about how AI systems operate and make decisions.",
    difficulty: "easy",
    category: "ETHICS",
    points: 1
  },

  // ============================================
  // MORE INCIDENT ANALYSIS QUESTIONS (20 more)
  // ============================================
  {
    questionText: "What is 'incident triage' in AI safety?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Dividing incidents into three categories" },
      { id: "B", text: "Prioritizing incidents based on severity and impact" },
      { id: "C", text: "Medical treatment for AI systems" },
      { id: "D", text: "Testing three different solutions" }
    ],
    correctAnswer: "B",
    explanation: "Incident triage is the process of assessing and prioritizing incidents based on their severity, impact, and urgency to allocate response resources effectively.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is a 'cascading failure' in AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "A waterfall development failure" },
      { id: "B", text: "When one failure triggers subsequent failures in connected systems" },
      { id: "C", text: "A failure that happens in stages" },
      { id: "D", text: "Multiple unrelated failures" }
    ],
    correctAnswer: "B",
    explanation: "A cascading failure occurs when a failure in one component or system triggers failures in other connected or dependent systems, potentially causing widespread impact.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is 'incident escalation'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Making incidents worse" },
      { id: "B", text: "Raising incident awareness to higher management levels" },
      { id: "C", text: "Increasing system load" },
      { id: "D", text: "Expanding the incident scope" }
    ],
    correctAnswer: "B",
    explanation: "Incident escalation is the process of raising awareness of an incident to higher management levels or more specialized teams when additional resources or authority are needed.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is a 'lessons learned' session after an AI incident?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "A training course for new employees" },
      { id: "B", text: "A structured review to identify improvements and prevent recurrence" },
      { id: "C", text: "A punishment meeting" },
      { id: "D", text: "A celebration of incident resolution" }
    ],
    correctAnswer: "B",
    explanation: "Lessons learned sessions are structured reviews conducted after incident resolution to identify what went well, what didn't, and what improvements can be made to prevent similar incidents.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is 'incident communication' best practice?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Keeping all information secret" },
      { id: "B", text: "Timely, accurate, and transparent communication with stakeholders" },
      { id: "C", text: "Only communicating after full resolution" },
      { id: "D", text: "Minimizing all communication" }
    ],
    correctAnswer: "B",
    explanation: "Effective incident communication involves providing timely, accurate, and appropriately transparent information to relevant stakeholders throughout the incident lifecycle.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },

  // ============================================
  // FINAL BATCH - MIXED CATEGORIES (26 questions)
  // ============================================
  {
    questionText: "What is the key difference between 'explainability' and 'interpretability' in AI?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "They are the same thing" },
      { id: "B", text: "Explainability describes how a model works; interpretability describes why it made a specific decision" },
      { id: "C", text: "Interpretability is only for deep learning" },
      { id: "D", text: "Explainability is only for simple models" }
    ],
    correctAnswer: "B",
    explanation: "Explainability refers to understanding how a model works in general, while interpretability focuses on understanding why the model made a specific decision for a particular input.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "Under the EU AI Act, what is required for 'real-time' remote biometric identification systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "They are completely banned" },
      { id: "B", text: "They require prior judicial authorization except in specific cases" },
      { id: "C", text: "They are freely allowed" },
      { id: "D", text: "They require user consent only" }
    ],
    correctAnswer: "B",
    explanation: "Real-time remote biometric identification in publicly accessible spaces is prohibited except in specific cases (e.g., serious crimes) and requires prior judicial authorization.",
    difficulty: "hard",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is 'model drift' in AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "When a model moves to a different server" },
      { id: "B", text: "When model performance degrades over time due to changing data patterns" },
      { id: "C", text: "When a model is updated" },
      { id: "D", text: "When training takes too long" }
    ],
    correctAnswer: "B",
    explanation: "Model drift occurs when the statistical properties of the input data change over time, causing the model's performance to degrade as it becomes less representative of current conditions.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is the NIST AI RMF's recommendation for AI system testing?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Test only before deployment" },
      { id: "B", text: "Continuous testing throughout the AI lifecycle" },
      { id: "C", text: "Testing is optional" },
      { id: "D", text: "Test only when problems occur" }
    ],
    correctAnswer: "B",
    explanation: "The NIST AI RMF recommends continuous testing and validation throughout the entire AI system lifecycle, not just before deployment.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "Under TC260, what must AI service providers do regarding user data deletion?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Never delete user data" },
      { id: "B", text: "Provide mechanisms for users to delete their personal information" },
      { id: "C", text: "Only delete data after 10 years" },
      { id: "D", text: "Data deletion is not required" }
    ],
    correctAnswer: "B",
    explanation: "TC260 standards and China's PIPL require AI service providers to provide users with mechanisms to access, correct, and delete their personal information.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is 'adversarial robustness' in AI security?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Making AI systems argumentative" },
      { id: "B", text: "Resistance to malicious inputs designed to fool the system" },
      { id: "C", text: "Competing with other AI systems" },
      { id: "D", text: "Physical durability of hardware" }
    ],
    correctAnswer: "B",
    explanation: "Adversarial robustness refers to an AI system's ability to maintain correct performance even when faced with adversarial examples - inputs specifically crafted to cause misclassification.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is 'data minimization' in AI ethics?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Using the smallest possible dataset" },
      { id: "B", text: "Collecting only data necessary for the specific purpose" },
      { id: "C", text: "Reducing data storage costs" },
      { id: "D", text: "Compressing data files" }
    ],
    correctAnswer: "B",
    explanation: "Data minimization is the principle of collecting and processing only the personal data that is necessary for the specific, legitimate purpose, reducing privacy risks.",
    difficulty: "easy",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "Under the EU AI Act, what is a 'deployer' of an AI system?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "The person who developed the AI" },
      { id: "B", text: "Any person using an AI system under their authority" },
      { id: "C", text: "The company that sells the AI" },
      { id: "D", text: "The end user" }
    ],
    correctAnswer: "B",
    explanation: "A deployer is any natural or legal person, public authority, agency, or other body using an AI system under their authority, except where the AI is used for personal non-professional activity.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is 'federated learning' and why is it relevant to AI privacy?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Learning controlled by government" },
      { id: "B", text: "Training models across decentralized data without centralizing it" },
      { id: "C", text: "Learning from federal regulations" },
      { id: "D", text: "Collaborative learning between companies" }
    ],
    correctAnswer: "B",
    explanation: "Federated learning allows training AI models across multiple decentralized devices or servers holding local data samples, without exchanging the raw data, thus enhancing privacy.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is the purpose of 'red teaming' in AI safety?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Assigning team colors" },
      { id: "B", text: "Deliberately attempting to find vulnerabilities and failures" },
      { id: "C", text: "Emergency response procedures" },
      { id: "D", text: "Performance optimization" }
    ],
    correctAnswer: "B",
    explanation: "Red teaming involves deliberately attempting to find vulnerabilities, weaknesses, and failure modes in AI systems through adversarial testing and creative attack scenarios.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "Under NIST AI RMF, what is 'AI system validity'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Whether the system has a valid license" },
      { id: "B", text: "Whether the system performs its intended function accurately" },
      { id: "C", text: "Whether the system is legally compliant" },
      { id: "D", text: "Whether the system is profitable" }
    ],
    correctAnswer: "B",
    explanation: "Validity refers to whether an AI system performs its intended function with an acceptable level of accuracy and whether it measures what it's supposed to measure.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is 'algorithmic recourse' in AI fairness?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Reusing algorithms" },
      { id: "B", text: "The ability for individuals to change outcomes by changing their inputs" },
      { id: "C", text: "Legal action against algorithms" },
      { id: "D", text: "Reversing algorithm decisions" }
    ],
    correctAnswer: "B",
    explanation: "Algorithmic recourse refers to individuals' ability to obtain a different, more favorable outcome from an AI system by taking feasible actions to change their input features.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "Under TC260, what is required for AI systems used in content recommendation?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "No special requirements" },
      { id: "B", text: "Transparency about recommendation principles and user control options" },
      { id: "C", text: "Government approval for all recommendations" },
      { id: "D", text: "Prohibition of personalized recommendations" }
    ],
    correctAnswer: "B",
    explanation: "Recommendation algorithms must be transparent about their principles and provide users with options to control or opt out of personalized recommendations.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is a 'safety case' in AI system deployment?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "A protective case for AI hardware" },
      { id: "B", text: "A structured argument with evidence that a system is safe for its intended use" },
      { id: "C", text: "Legal protection for AI developers" },
      { id: "D", text: "An emergency response plan" }
    ],
    correctAnswer: "B",
    explanation: "A safety case is a structured argument, supported by evidence, that demonstrates an AI system is acceptably safe for its intended operational environment and use case.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is 'differential privacy' in AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Different privacy levels for different users" },
      { id: "B", text: "A mathematical framework for quantifying and limiting privacy loss" },
      { id: "C", text: "Privacy settings that differ by country" },
      { id: "D", text: "Comparing privacy policies" }
    ],
    correctAnswer: "B",
    explanation: "Differential privacy is a mathematical framework that provides formal guarantees about how much information about individuals can be learned from aggregate data, limiting privacy loss.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "Under the EU AI Act, what is the role of 'conformity assessment bodies'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To develop AI systems" },
      { id: "B", text: "To independently verify AI systems meet regulatory requirements" },
      { id: "C", text: "To market AI products" },
      { id: "D", text: "To train AI developers" }
    ],
    correctAnswer: "B",
    explanation: "Conformity assessment bodies are independent third-party organizations designated to assess whether high-risk AI systems comply with the EU AI Act requirements.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is 'concept drift' in machine learning?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "When developers change their minds" },
      { id: "B", text: "When the relationship between input and output changes over time" },
      { id: "C", text: "When concepts are poorly defined" },
      { id: "D", text: "When training takes too long" }
    ],
    correctAnswer: "B",
    explanation: "Concept drift occurs when the statistical properties of the target variable (what the model is predicting) change over time, requiring model retraining or adaptation.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is the NIST AI RMF's approach to AI system decommissioning?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Decommissioning is not addressed" },
      { id: "B", text: "Plan for responsible decommissioning including data handling and stakeholder notification" },
      { id: "C", text: "Simply turn off the system" },
      { id: "D", text: "Transfer to another organization" }
    ],
    correctAnswer: "B",
    explanation: "The NIST AI RMF emphasizes planning for responsible decommissioning, including proper data handling, stakeholder notification, and documentation of the decommissioning process.",
    difficulty: "medium",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is 'fairness through unawareness' and why is it problematic?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Ignoring fairness issues completely" },
      { id: "B", text: "Removing protected attributes from models, which doesn't prevent proxy discrimination" },
      { id: "C", text: "Not informing users about fairness measures" },
      { id: "D", text: "Unconscious bias in development" }
    ],
    correctAnswer: "B",
    explanation: "Fairness through unawareness (removing protected attributes like race or gender) is problematic because it doesn't prevent discrimination through proxy variables that correlate with protected attributes.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "Under TC260, what is required for AI systems that generate synthetic content?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Complete ban on synthetic content" },
      { id: "B", text: "Clear labeling that content is AI-generated" },
      { id: "C", text: "No special requirements" },
      { id: "D", text: "Government approval for each piece of content" }
    ],
    correctAnswer: "B",
    explanation: "AI-generated synthetic content (including deepfakes) must be clearly labeled as such to prevent misinformation and protect users from deception.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is 'graceful degradation' in AI system design?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Slowly reducing system performance to save costs" },
      { id: "B", text: "Maintaining partial functionality when components fail" },
      { id: "C", text: "Politely declining user requests" },
      { id: "D", text: "Gradual system shutdown" }
    ],
    correctAnswer: "B",
    explanation: "Graceful degradation means designing systems to maintain partial functionality and fail safely when components malfunction, rather than experiencing complete failure.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is the EU AI Act's stance on emotion recognition systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Completely banned in all contexts" },
      { id: "B", text: "Prohibited in certain contexts like workplace and education" },
      { id: "C", text: "Freely allowed everywhere" },
      { id: "D", text: "Only allowed with explicit consent" }
    ],
    correctAnswer: "B",
    explanation: "Emotion recognition systems are prohibited in workplace and educational settings, but may be allowed in other contexts with appropriate safeguards.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is 'AI system resilience' according to NIST AI RMF?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Physical durability of hardware" },
      { id: "B", text: "Ability to withstand and recover from adverse conditions" },
      { id: "C", text: "Resistance to updates" },
      { id: "D", text: "Long operational lifetime" }
    ],
    correctAnswer: "B",
    explanation: "Resilience refers to an AI system's ability to withstand unexpected adverse events, attacks, or conditions and recover functionality quickly.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What is 'counterfactual fairness' in AI?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Fairness in hypothetical scenarios" },
      { id: "B", text: "A decision is fair if it would be the same in a counterfactual world where protected attributes differ" },
      { id: "C", text: "Fairness based on fake data" },
      { id: "D", text: "Opposing fairness measures" }
    ],
    correctAnswer: "B",
    explanation: "Counterfactual fairness requires that a decision would remain the same in a hypothetical world where an individual's protected attributes (like race or gender) were different.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is the primary goal of AI incident reporting systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To punish organizations" },
      { id: "B", text: "To learn from incidents and improve AI safety across the industry" },
      { id: "C", text: "To generate negative publicity" },
      { id: "D", text: "To satisfy regulatory requirements only" }
    ],
    correctAnswer: "B",
    explanation: "The primary goal of incident reporting is to facilitate learning from incidents across the industry, enabling organizations to improve AI safety and prevent similar incidents.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "Under TC260, what is required for AI systems that make automated decisions affecting users' rights?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Complete prohibition" },
      { id: "B", text: "Explanation of decision logic and user appeal mechanisms" },
      { id: "C", text: "No special requirements" },
      { id: "D", text: "Government approval for each decision" }
    ],
    correctAnswer: "B",
    explanation: "Automated decision-making systems must provide explanations of their decision logic and offer users mechanisms to appeal or challenge decisions that affect their rights.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },
];
