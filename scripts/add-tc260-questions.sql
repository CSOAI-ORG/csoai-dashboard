-- TC260 China AI Standards - Additional Questions
-- Module ID: 30008 | Current: 45 | Target: 55 | Need: 10 questions

INSERT INTO test_questions (testId, moduleId, questionText, questionType, options, correctAnswer, explanation, points, difficulty, isActive) VALUES

(1, 30008, 'What is the primary regulatory body overseeing AI governance in China under TC260 standards?', 'multiple_choice', 
'["A) Ministry of Industry and Information Technology (MIIT)", "B) Cyberspace Administration of China (CAC)", "C) National Development and Reform Commission", "D) State Council Information Office"]',
'B', 'The Cyberspace Administration of China (CAC) is the primary regulatory body responsible for AI governance, including the implementation of TC260 standards, algorithm regulations, and deep synthesis regulations.', 1, 'medium', 1),

(1, 30008, 'Under TC260, what is the maximum retention period for personal information collected by AI systems without explicit user consent?', 'multiple_choice',
'["A) 30 days", "B) 6 months", "C) 1 year", "D) No retention allowed without consent"]',
'D', 'TC260 and PIPL (Personal Information Protection Law) require explicit user consent before collecting personal information. Without consent, no retention is permitted, emphasizing China''s strict data protection stance.', 1, 'hard', 1),

(1, 30008, 'Which of the following is NOT a required element in TC260''s algorithm filing system?', 'multiple_choice',
'["A) Algorithm name and type", "B) Source code repository", "C) Security assessment report", "D) Public opinion risk assessment"]',
'B', 'While algorithm name, security assessment, and public opinion risk assessment are required, full source code repository disclosure is not mandated. However, algorithm logic and decision-making mechanisms must be explained.', 1, 'medium', 1),

(1, 30008, 'What is the penalty range for AI systems that violate TC260 content safety requirements in China?', 'multiple_choice',
'["A) Warning only", "B) Up to ¥100,000 RMB", "C) Up to ¥10 million RMB or 5% of annual revenue", "D) Criminal prosecution only"]',
'C', 'Violations of content safety requirements can result in fines up to ¥10 million RMB or 5% of annual revenue, whichever is higher, plus potential service suspension and criminal liability for severe cases.', 1, 'hard', 1),

(1, 30008, 'Under TC260, which AI application is classified as "high-risk" requiring the strictest oversight?', 'multiple_choice',
'["A) Recommendation algorithms for e-commerce", "B) Facial recognition for public security", "C) Chatbots for customer service", "D) Automated translation services"]',
'B', 'Facial recognition for public security is classified as high-risk under TC260 due to its impact on public safety, civil rights, and potential for mass surveillance, requiring the highest level of regulatory oversight.', 1, 'easy', 1),

(1, 30008, 'What is the mandatory labeling requirement for AI-generated content under TC260 deep synthesis regulations?', 'multiple_choice',
'["A) Watermark only", "B) Visible label stating "AI-generated"', "C) Both visible and invisible markers", "D) No labeling required"]',
'C', 'TC260 deep synthesis regulations require both visible labels (for user awareness) and invisible technical markers (for traceability and verification) on all AI-generated content to combat misinformation.', 1, 'medium', 1),

(1, 30008, 'Which data localization requirement applies to AI systems under TC260 and China''s Data Security Law?', 'multiple_choice',
'["A) All data must stay in China", "B) Only personal data must stay in China", "C) Critical information infrastructure data must stay in China", "D) No localization required"]',
'C', 'Critical information infrastructure operators must store personal information and important data collected in China within China. Cross-border transfers require security assessments and government approval.', 1, 'hard', 1),

(1, 30008, 'What is the minimum frequency for security assessments of generative AI services under TC260?', 'multiple_choice',
'["A) Monthly", "B) Quarterly", "C) Annually", "D) Only when significant changes occur"]',
'C', 'Generative AI service providers must conduct security assessments at least annually, and additionally whenever significant algorithm changes, new features, or major incidents occur.', 1, 'medium', 1),

(1, 30008, 'Under TC260, what information must be disclosed to users before deploying recommendation algorithms?', 'multiple_choice',
'["A) Algorithm source code", "B) Training data sources", "C) Basic principles and main operating mechanisms", "D) All employee information"]',
'C', 'Service providers must disclose the basic principles, purposes, and main operating mechanisms of recommendation algorithms to users, ensuring transparency without requiring full source code disclosure.', 1, 'easy', 1),

(1, 30008, 'Which of the following best describes TC260''s approach to AI ethics compared to Western frameworks?', 'multiple_choice',
'["A) Focuses solely on individual rights", "B) Emphasizes collective social harmony and national security", "C) Identical to EU AI Act principles", "D) No ethical requirements"]',
'B', 'TC260 emphasizes collective social harmony, national security, and socialist core values alongside individual rights, reflecting China''s governance philosophy that balances individual and collective interests differently from Western frameworks.', 1, 'medium', 1);
