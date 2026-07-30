# CSOAI Dashboard - Comprehensive Test Plan for Kime

**Date:** January 2, 2026  
**Project:** CSOAI (Council of Standards for AI) Dashboard  
**Prepared for:** Kime (Quality Assurance & Testing)  
**Prepared by:** Manus AI  
**Document Version:** 1.0

---

## Executive Summary

This comprehensive test plan covers the entire CSOAI Dashboard platform, a production-ready AI safety governance and compliance system. The platform serves as **the Western answer to China's TC260**, providing unified compliance across EU AI Act, NIST AI RMF, ISO 42001, and other frameworks while creating jobs through the Watchdog Analyst program.

**Project Context:**
- **Legal Entity:** Loop Factory AI Limited (UK registered)
- **Dual Brand Strategy:** CSOAI (regulatory body) + CEASAI (certification body)
- **Mission:** Address the shortage of 250,000 AI Safety Analysts needed by EU AI Act deadline (February 2, 2026)
- **Current Status:** 95% production-ready, 157 pages, 111 components, 37 API routers, 59 database tables

**Testing Scope:**
- 4 Core Pipelines: Government, Enterprise, Watchdog, Training & Certification
- Legal & Compliance Requirements: GDPR, CCPA, PCI DSS, EU AI Act, NIST AI RMF, TC260
- Payment Processing: Stripe integration with GBP pricing
- 33-Agent Byzantine Council: Multi-LLM voting system
- Multi-language Support: 13 languages with real-time translation

---

## 1. Project Context & Architecture

### 1.1 The Four Core Pipelines

The CSOAI platform operates through four interconnected pipelines, each serving distinct user groups:

**Pipeline 1: Government Portal**
- **Target Users:** Regulatory bodies, government agencies, policy makers
- **Purpose:** White-label compliance monitoring, national AI registry, regulatory oversight
- **Key Features:** Government-specific authentication, national AI system registry, policy proposal voting, regulatory reporting
- **Pricing:** Custom enterprise pricing (£50,000+/year per agency)

**Pipeline 2: Enterprise Dashboard**
- **Target Users:** Companies deploying AI systems (B2B)
- **Purpose:** Automated compliance assessment, risk management, audit trail
- **Key Features:** Multi-framework compliance (EU AI Act, NIST, TC260), 33-Agent Council voting, PDCA cycle management, API/SDK integration
- **Pricing:** Startup (£474/mo), Growth (£1,899/mo), Enterprise (£9,499/mo)

**Pipeline 3: Watchdog Portal**
- **Target Users:** General public, AI safety advocates
- **Purpose:** Public incident reporting, transparency, accountability
- **Key Features:** Anonymous incident submission, public incident database, upvote/comment system, real-time incident feed
- **Pricing:** Free (public good)

**Pipeline 4: Training & Certification (CEASAI)**
- **Target Users:** Individuals seeking AI safety careers (B2C)
- **Purpose:** Professional training, certification, job placement
- **Key Features:** 33 courses (Foundation, Regional, Industry, Advanced), certification exams, certificate verification, analyst work assignments
- **Pricing:** Founding Analyst (£49 one-time), Professional (£474-564), Expert (£2,849-3,324)

### 1.2 The 33-Agent Byzantine Council

The platform's core innovation is a **Byzantine fault-tolerant (BFT) voting system** using 33 independent AI agents:

| Agent Type | Count | Role | Providers |
|------------|-------|------|-----------|
| Guardian Agents | 11 | Safety, Security, Privacy | OpenAI (4), Anthropic (4), Google (3) |
| Arbiter Agents | 11 | Fairness, Transparency, Accountability | OpenAI (4), Anthropic (4), Google (3) |
| Scribe Agents | 11 | Documentation, Compliance, Reporting | OpenAI (4), Anthropic (4), Google (3) |

**Consensus Mechanism:**
- **Threshold:** 22/33 votes (67% majority) required for automated decisions
- **Escalation:** Cases without consensus escalate to human Watchdog Analysts
- **Transparency:** All votes, reasoning, and confidence scores are recorded and auditable

### 1.3 SOAI-PDCA Framework

The platform integrates the **SOAI-PDCA continuous improvement loop** into all compliance workflows:

- **Plan:** Define AI system requirements, identify compliance frameworks, set risk thresholds
- **Do:** Implement AI system, deploy monitoring, collect operational data
- **Check:** Run 33-Agent Council assessment, analyze Watchdog reports, measure compliance gaps
- **Act:** Generate remediation roadmap, implement fixes, update documentation

### 1.4 Legal & Compliance Framework

The platform operates under strict legal compliance requirements across multiple jurisdictions:

**Data Protection:**
- UK GDPR compliance (primary jurisdiction)
- EU GDPR compliance (operational region)
- CCPA compliance (California users)
- Data retention policies, right to erasure, data portability

**Payment Processing:**
- PCI DSS Level 1 compliance via Stripe
- AML/KYC compliance via Stripe
- Consumer Rights Directive (14-day cooling-off period)
- Transparent pricing, refund policies

**AI Safety Governance:**
- EU AI Act compliance (low-risk classification for training platform)
- NIST AI RMF alignment (GOVERN, MAP, MEASURE, MANAGE)
- ISO 42001 AI Management System
- TC260 alignment (China AI safety standards)

**Intellectual Property:**
- CSOAI, CEASAI, Loop Factory AI trademarks registered
- Byzantine Council voting system (patent-pending)
- SOAI-PDCA framework (patent-pending)
- Creative Commons Attribution 4.0 for course content

---

## 2. Testing Methodology

### 2.1 Test Categories

This test plan is organized into the following categories:

| Category | Priority | Scope |
|----------|----------|-------|
| **Functional Testing** | Critical | All features work as specified |
| **Integration Testing** | Critical | APIs, databases, third-party services |
| **Security Testing** | Critical | Authentication, authorization, data protection |
| **Payment Testing** | Critical | Stripe integration, billing, refunds |
| **Compliance Testing** | High | GDPR, EU AI Act, legal requirements |
| **Performance Testing** | High | Load testing, response times, scalability |
| **Usability Testing** | Medium | User experience, accessibility, mobile |
| **Content Testing** | Medium | Legal documents, course content, translations |

### 2.2 Test Environment

**Staging Environment:**
- URL: `https://coai-dash-k34vnbtb.manus.space`
- Database: MySQL/TiDB (staging instance)
- Payment: Stripe test mode
- LLM: Gemini API (test keys)

**Production Environment:**
- URL: `https://coai.safetyof.ai` (to be configured)
- Database: MySQL/TiDB (production instance)
- Payment: Stripe live mode (configured with webhook)
- LLM: Gemini API (production keys)

### 2.3 Test Data Requirements

**User Accounts:**
- Admin user (full permissions)
- Enterprise user (company dashboard access)
- Government user (government portal access)
- Analyst user (certified Watchdog Analyst)
- Student user (enrolled in training)
- Public user (no authentication)

**Test AI Systems:**
- High-risk AI system (facial recognition)
- Medium-risk AI system (chatbot)
- Low-risk AI system (recommendation engine)
- Prohibited AI system (social scoring)

**Test Incidents:**
- Privacy violation report
- Bias/discrimination report
- Safety failure report
- Transparency issue report

---

## 3. Functional Testing - Pipeline 1: Government Portal

### 3.1 Government Authentication

**Test Case GOV-AUTH-001: Government Login**
- **Objective:** Verify government-specific authentication flow
- **Preconditions:** Government account created by admin
- **Steps:**
  1. Navigate to `/government-login`
  2. Enter government credentials
  3. Complete multi-factor authentication (if enabled)
  4. Verify redirect to government dashboard
- **Expected Result:** Successful login, government dashboard displayed
- **Test Data:** Government user account with verified email

**Test Case GOV-AUTH-002: Government Session Management**
- **Objective:** Verify government session timeout and renewal
- **Steps:**
  1. Login as government user
  2. Wait for 30 minutes of inactivity
  3. Attempt to access protected government resource
  4. Verify session timeout and re-authentication prompt
- **Expected Result:** Session expires after 30 minutes, user prompted to re-authenticate

### 3.2 National AI Registry

**Test Case GOV-REG-001: View National AI Systems**
- **Objective:** Verify government can view all AI systems registered in their jurisdiction
- **Steps:**
  1. Login as government user (e.g., UK regulator)
  2. Navigate to "National AI Registry"
  3. Verify list displays all UK-registered AI systems
  4. Apply filters (risk level, industry, compliance status)
  5. Export registry to CSV/PDF
- **Expected Result:** Complete list of AI systems, accurate filtering, successful export

**Test Case GOV-REG-002: AI System Risk Classification Review**
- **Objective:** Verify government can review and override AI system risk classifications
- **Steps:**
  1. Select AI system from registry
  2. Review 33-Agent Council risk assessment
  3. Submit government override (e.g., upgrade from medium to high risk)
  4. Add justification for override
  5. Verify system risk level updated
- **Expected Result:** Risk classification updated, audit trail recorded, company notified

### 3.3 Policy Proposal Voting

**Test Case GOV-POL-001: Submit Policy Proposal**
- **Objective:** Verify government can submit policy proposals for council review
- **Steps:**
  1. Navigate to "Policy Proposals"
  2. Click "Submit New Proposal"
  3. Enter proposal details (title, description, affected frameworks)
  4. Submit for 33-Agent Council review
  5. Verify council voting session created
- **Expected Result:** Proposal submitted, council session initiated, voting in progress

**Test Case GOV-POL-002: Review Council Voting Results**
- **Objective:** Verify government can view detailed council voting results
- **Steps:**
  1. Navigate to completed policy proposal
  2. View voting breakdown (Guardian, Arbiter, Scribe votes)
  3. Review individual agent reasoning
  4. Download voting report (PDF)
- **Expected Result:** Complete voting transparency, all agent reasoning visible, PDF generated

### 3.4 Regulatory Reporting

**Test Case GOV-REP-001: Generate Compliance Report**
- **Objective:** Verify government can generate national compliance reports
- **Steps:**
  1. Navigate to "Reports"
  2. Select "National Compliance Report"
  3. Choose date range (e.g., Q4 2025)
  4. Select frameworks (EU AI Act, NIST RMF)
  5. Generate and download report
- **Expected Result:** Comprehensive report with compliance statistics, trends, incidents

**Test Case GOV-REP-002: Export Incident Data**
- **Objective:** Verify government can export Watchdog incident data for analysis
- **Steps:**
  1. Navigate to "Watchdog Incidents"
  2. Apply filters (date range, severity, AI system type)
  3. Export to CSV with all incident details
  4. Verify data integrity and completeness
- **Expected Result:** CSV export contains all filtered incidents with complete metadata

---

## 4. Functional Testing - Pipeline 2: Enterprise Dashboard

### 4.1 Enterprise Onboarding

**Test Case ENT-ONB-001: Enterprise Signup**
- **Objective:** Verify enterprise can create account and select plan
- **Steps:**
  1. Navigate to `/enterprise`
  2. Click "Get Started"
  3. Enter company details (name, industry, size, country)
  4. Select plan (Startup, Growth, or Enterprise)
  5. Enter payment details (Stripe test card)
  6. Complete signup
- **Expected Result:** Account created, payment processed, dashboard accessible

**Test Case ENT-ONB-002: Enterprise Onboarding Wizard**
- **Objective:** Verify guided onboarding process for new enterprises
- **Steps:**
  1. Login as new enterprise user
  2. Complete onboarding wizard:
     - Step 1: Company profile
     - Step 2: Select compliance frameworks
     - Step 3: Add first AI system
     - Step 4: Invite team members
     - Step 5: Configure notifications
  3. Verify wizard completion and dashboard access
- **Expected Result:** All onboarding steps completed, enterprise ready to use platform

### 4.2 AI System Management

**Test Case ENT-AIS-001: Register AI System**
- **Objective:** Verify enterprise can register new AI system
- **Steps:**
  1. Navigate to "AI Systems"
  2. Click "Add AI System"
  3. Enter system details:
     - Name: "Customer Support Chatbot"
     - Type: "Conversational AI"
     - Description: "AI-powered customer support"
     - Deployment: "Production"
     - Data sources: "Customer tickets, knowledge base"
  4. Submit for 33-Agent Council risk assessment
  5. Verify assessment initiated
- **Expected Result:** AI system registered, council assessment in progress

**Test Case ENT-AIS-002: Bulk AI System Import**
- **Objective:** Verify enterprise can import multiple AI systems via CSV
- **Steps:**
  1. Navigate to "AI Systems" > "Bulk Import"
  2. Download CSV template
  3. Fill template with 10 AI systems
  4. Upload CSV file
  5. Review import preview
  6. Confirm import
  7. Verify all 10 systems created
- **Expected Result:** All systems imported successfully, validation errors highlighted

**Test Case ENT-AIS-003: AI System Risk Assessment**
- **Objective:** Verify 33-Agent Council risk assessment process
- **Steps:**
  1. Wait for council assessment to complete (or trigger manually)
  2. View assessment results:
     - Risk level (Low, Medium, High, Prohibited)
     - Voting breakdown (Guardian, Arbiter, Scribe)
     - Individual agent reasoning
     - Confidence scores
  3. Review compliance recommendations
  4. Download assessment report (PDF)
- **Expected Result:** Risk assessment completed, detailed voting results, actionable recommendations

### 4.3 Compliance Assessment

**Test Case ENT-COMP-001: Run EU AI Act Assessment**
- **Objective:** Verify enterprise can run EU AI Act compliance assessment
- **Steps:**
  1. Navigate to "Compliance"
  2. Select AI system
  3. Click "Run Assessment" > "EU AI Act"
  4. Answer assessment questions (risk category, transparency, human oversight, etc.)
  5. Submit assessment
  6. Wait for 33-Agent Council evaluation
  7. Review compliance score and gaps
- **Expected Result:** Assessment completed, compliance score calculated, gap analysis provided

**Test Case ENT-COMP-002: Multi-Framework Assessment**
- **Objective:** Verify enterprise can assess compliance across multiple frameworks simultaneously
- **Steps:**
  1. Select AI system
  2. Run assessment for:
     - EU AI Act
     - NIST AI RMF
     - ISO 42001
     - TC260
  3. View unified compliance dashboard
  4. Compare framework requirements
  5. Generate cross-framework compliance report
- **Expected Result:** All frameworks assessed, unified view, cross-framework comparison

**Test Case ENT-COMP-003: Compliance Roadmap Generation**
- **Objective:** Verify automated compliance roadmap generation
- **Steps:**
  1. View AI system with compliance gaps
  2. Click "Generate Roadmap"
  3. Review automated roadmap:
     - Prioritized action items
     - Estimated effort and timeline
     - Responsible teams
     - Success criteria
  4. Export roadmap to PDF/Excel
  5. Assign tasks to team members
- **Expected Result:** Actionable roadmap generated, tasks assignable, progress trackable

### 4.4 PDCA Cycle Management

**Test Case ENT-PDCA-001: Create PDCA Cycle**
- **Objective:** Verify enterprise can create and manage PDCA cycles
- **Steps:**
  1. Navigate to "PDCA Cycles"
  2. Click "Create Cycle"
  3. Enter cycle details:
     - Name: "Q1 2026 Compliance Improvement"
     - AI System: "Customer Support Chatbot"
     - Framework: "EU AI Act"
     - Start Date: January 1, 2026
  4. Define Plan phase objectives
  5. Submit cycle
- **Expected Result:** PDCA cycle created, Plan phase active

**Test Case ENT-PDCA-002: Progress Through PDCA Phases**
- **Objective:** Verify PDCA phase progression (Plan → Do → Check → Act)
- **Steps:**
  1. Complete Plan phase:
     - Define objectives
     - Identify requirements
     - Set success metrics
  2. Move to Do phase:
     - Implement changes
     - Document actions
     - Upload evidence
  3. Move to Check phase:
     - Run 33-Agent Council assessment
     - Analyze Watchdog reports
     - Measure compliance gaps
  4. Move to Act phase:
     - Review results
     - Plan next cycle
     - Close cycle
- **Expected Result:** All phases completed, cycle closed, next cycle planned

**Test Case ENT-PDCA-003: PDCA Report Generation**
- **Objective:** Verify PDCA cycle report generation
- **Steps:**
  1. Select completed PDCA cycle
  2. Click "Generate Report"
  3. Review report contents:
     - Cycle summary
     - Phase details
     - Assessment results
     - Improvements made
     - Next cycle recommendations
  4. Download report (PDF)
- **Expected Result:** Comprehensive report generated, suitable for audit

### 4.5 API & SDK Integration

**Test Case ENT-API-001: Generate API Key**
- **Objective:** Verify enterprise can generate and manage API keys
- **Steps:**
  1. Navigate to "Settings" > "API Keys"
  2. Click "Generate New Key"
  3. Enter key details:
     - Name: "Production Integration"
     - Permissions: Read/Write
     - Rate limit: 1000 req/hour
  4. Copy API key (shown once)
  5. Verify key listed in dashboard
- **Expected Result:** API key generated, permissions set, rate limit configured

**Test Case ENT-API-002: Test API Endpoints**
- **Objective:** Verify API endpoints work with generated key
- **Steps:**
  1. Use API key to call endpoints:
     - `GET /api/ai-systems` (list AI systems)
     - `POST /api/ai-systems` (create AI system)
     - `GET /api/assessments/:id` (get assessment)
     - `POST /api/council-sessions` (trigger council vote)
  2. Verify responses and status codes
  3. Test rate limiting (exceed limit, verify 429 error)
  4. Test invalid key (verify 401 error)
- **Expected Result:** All endpoints functional, rate limiting works, authentication enforced

**Test Case ENT-API-003: Webhook Configuration**
- **Objective:** Verify enterprise can configure webhooks for real-time notifications
- **Steps:**
  1. Navigate to "Settings" > "Webhooks"
  2. Click "Add Webhook"
  3. Enter webhook details:
     - URL: `https://example.com/webhook`
     - Events: Assessment completed, Incident reported, Council vote finished
     - Secret: (auto-generated)
  4. Test webhook (send test payload)
  5. Verify webhook receives event
- **Expected Result:** Webhook configured, test successful, events delivered

### 4.6 Team Management

**Test Case ENT-TEAM-001: Invite Team Members**
- **Objective:** Verify enterprise can invite team members with role-based access
- **Steps:**
  1. Navigate to "Settings" > "Team"
  2. Click "Invite Member"
  3. Enter email and role:
     - Admin (full access)
     - Compliance Officer (compliance features only)
     - Analyst (read-only)
  4. Send invitation
  5. Verify invitation email sent
  6. Accept invitation (as invited user)
  7. Verify role-based access enforced
- **Expected Result:** Team member invited, role assigned, access restricted appropriately

---

## 5. Functional Testing - Pipeline 3: Watchdog Portal

### 5.1 Public Incident Reporting

**Test Case WATCH-INC-001: Submit Anonymous Incident Report**
- **Objective:** Verify public can submit incident reports without authentication
- **Steps:**
  1. Navigate to `/watchdog` (not logged in)
  2. Click "Report Incident"
  3. Fill incident form:
     - Title: "Facial recognition misidentified person"
     - Description: "Airport facial recognition system incorrectly flagged me as security threat"
     - AI System: "Airport Security AI"
     - Company: "Airport Authority"
     - Severity: "High"
     - Evidence: Upload photo (optional)
  4. Submit report
  5. Verify report appears in public feed
- **Expected Result:** Report submitted anonymously, visible in public feed, council assessment triggered

**Test Case WATCH-INC-002: Incident Upvoting/Downvoting**
- **Objective:** Verify public can upvote/downvote incidents to signal importance
- **Steps:**
  1. View incident in public feed
  2. Click upvote button
  3. Verify upvote count incremented
  4. Click downvote button
  5. Verify vote changed to downvote
  6. Verify vote count updated
- **Expected Result:** Voting works, counts accurate, one vote per user (tracked by IP if not logged in)

**Test Case WATCH-INC-003: Incident Comments**
- **Objective:** Verify public can comment on incidents
- **Steps:**
  1. View incident detail page
  2. Scroll to comments section
  3. Enter comment (as anonymous or logged-in user)
  4. Submit comment
  5. Verify comment appears
  6. Reply to comment (nested thread)
  7. Verify reply appears
- **Expected Result:** Comments posted, nested threads work, moderation queue (if enabled)

### 5.2 Incident Search & Filtering

**Test Case WATCH-SEARCH-001: Search Incidents**
- **Objective:** Verify public can search incidents by keyword
- **Steps:**
  1. Navigate to Watchdog portal
  2. Enter search query: "facial recognition"
  3. Verify results show relevant incidents
  4. Try different queries (company name, AI type, severity)
  5. Verify search results accurate
- **Expected Result:** Search works, results relevant, fast response time

**Test Case WATCH-FILTER-001: Filter Incidents**
- **Objective:** Verify public can filter incidents by multiple criteria
- **Steps:**
  1. Apply filters:
     - Severity: High
     - AI Type: Computer Vision
     - Date Range: Last 30 days
     - Status: Under Review
  2. Verify filtered results
  3. Clear filters
  4. Apply different filter combination
- **Expected Result:** Filters work, results accurate, clear filters resets view

### 5.3 Incident Detail & Council Voting

**Test Case WATCH-DETAIL-001: View Incident Detail**
- **Objective:** Verify incident detail page shows complete information
- **Steps:**
  1. Click on incident from feed
  2. Verify detail page shows:
     - Full description
     - Evidence (images, documents)
     - Company response (if any)
     - 33-Agent Council voting status
     - Public comments
     - Related incidents
  3. Verify all elements render correctly
- **Expected Result:** Complete incident information displayed, no missing data

**Test Case WATCH-COUNCIL-001: View Council Voting Results**
- **Objective:** Verify public can view 33-Agent Council voting results for incidents
- **Steps:**
  1. View incident with completed council assessment
  2. Scroll to "Council Assessment" section
  3. Verify voting breakdown:
     - Guardian votes (11 agents)
     - Arbiter votes (11 agents)
     - Scribe votes (11 agents)
     - Consensus status (reached/escalated)
  4. Click "View Detailed Votes"
  5. Review individual agent reasoning
  6. Verify transparency and auditability
- **Expected Result:** Full voting transparency, all agent reasoning visible, consensus clear

### 5.4 Watchdog Analyst Signup

**Test Case WATCH-SIGNUP-001: Analyst Letter of Interest (LOI)**
- **Objective:** Verify public can submit LOI to become Watchdog Analyst
- **Steps:**
  1. Navigate to `/watchdog-signup`
  2. Fill LOI form:
     - Name
     - Email
     - Country
     - Why interested in AI safety
     - Relevant experience (optional)
  3. Submit LOI
  4. Verify confirmation message
  5. Verify email confirmation sent
- **Expected Result:** LOI submitted, confirmation email received, LOI counter incremented

**Test Case WATCH-SIGNUP-002: LOI Counter Display**
- **Objective:** Verify LOI counter displays on homepage and dashboard
- **Steps:**
  1. Navigate to homepage
  2. Verify LOI counter shows current count (e.g., "500 analysts signed up")
  3. Submit new LOI
  4. Verify counter increments in real-time
  5. Check dashboard LOI counter
- **Expected Result:** Counter accurate, updates in real-time, consistent across pages

### 5.5 Watchdog Leaderboard

**Test Case WATCH-LEAD-001: View Analyst Leaderboard**
- **Objective:** Verify public can view Watchdog Analyst leaderboard
- **Steps:**
  1. Navigate to `/watchdog-leaderboard`
  2. Verify leaderboard displays:
     - Analyst rank
     - Analyst name (or anonymous ID)
     - Cases reviewed
     - Accuracy score
     - Community upvotes
  3. Sort by different criteria (cases, accuracy, upvotes)
  4. Filter by time period (all-time, monthly, weekly)
- **Expected Result:** Leaderboard accurate, sortable, filterable, gamification works

---

## 6. Functional Testing - Pipeline 4: Training & Certification (CEASAI)

### 6.1 Course Enrollment

**Test Case TRAIN-ENR-001: Browse Course Catalog**
- **Objective:** Verify users can browse and filter training courses
- **Steps:**
  1. Navigate to `/training`
  2. View course catalog (33 courses total)
  3. Apply filters:
     - Tier: Foundation, Regional, Industry, Advanced
     - Framework: EU AI Act, NIST RMF, TC260, ISO 42001
     - Price: Free, Paid
  4. Sort by: Popularity, Price, Duration
  5. Verify course cards show:
     - Course name
     - Duration
     - Price
     - Difficulty level
     - Enrollment count
- **Expected Result:** Catalog browsable, filters work, course information complete

**Test Case TRAIN-ENR-002: Enroll in Free Course**
- **Objective:** Verify users can enroll in free Foundation courses
- **Steps:**
  1. Select "AI Safety Fundamentals" (free course)
  2. Click "Enroll Now"
  3. Create account (if not logged in)
  4. Verify enrollment confirmation
  5. Navigate to "My Courses"
  6. Verify course appears in enrolled courses
- **Expected Result:** Free enrollment successful, course accessible immediately

**Test Case TRAIN-ENR-003: Purchase Paid Course**
- **Objective:** Verify users can purchase paid courses via Stripe
- **Steps:**
  1. Select "EU AI Act Compliance" (£149)
  2. Click "Enroll Now"
  3. Review pricing (one-time payment)
  4. Enter payment details (Stripe test card: 4242 4242 4242 4242)
  5. Complete payment
  6. Verify enrollment confirmation
  7. Verify payment receipt email
  8. Verify course accessible
- **Expected Result:** Payment processed, enrollment confirmed, course accessible

**Test Case TRAIN-ENR-004: Purchase Course Bundle**
- **Objective:** Verify users can purchase course bundles (Founding Analyst, Professional, Expert)
- **Steps:**
  1. Navigate to `/pricing`
  2. Select "Professional Analyst" tier (£474)
  3. Review included courses:
     - Foundation Bundle (3 courses)
     - ALL 5 Regional certifications
     - 3 Industry specializations
  4. Choose payment plan (Pay in Full, 3-month, 6-month, 12-month)
  5. Complete payment
  6. Verify all courses unlocked
  7. Verify subscription created (for monthly plans)
- **Expected Result:** Bundle purchased, all courses accessible, subscription active

### 6.2 Course Content & Progress

**Test Case TRAIN-CONT-001: View Course Content**
- **Objective:** Verify course content displays correctly
- **Steps:**
  1. Open enrolled course
  2. Navigate to "Course Outline"
  3. Verify modules listed:
     - Module 1: Introduction
     - Module 2: Core Concepts
     - Module 3: Practical Application
     - Module 4: Case Studies
     - Module 5: Final Assessment
  4. Click on Module 1
  5. Verify lesson content:
     - Video player (if video lessons)
     - Text content (markdown rendered)
     - Images/diagrams
     - Code examples (syntax highlighted)
     - Quiz questions
- **Expected Result:** All content renders correctly, media playable, interactive elements work

**Test Case TRAIN-PROG-001: Track Course Progress**
- **Objective:** Verify course progress tracking
- **Steps:**
  1. Start course from beginning
  2. Complete Module 1 lessons
  3. Verify progress bar updates (20% complete)
  4. Complete Module 1 quiz
  5. Verify module marked complete
  6. Navigate to "My Courses"
  7. Verify course progress displayed (20%)
  8. Continue to Module 2
  9. Verify progress continues tracking
- **Expected Result:** Progress tracked accurately, persists across sessions, visible in dashboard

**Test Case TRAIN-QUIZ-001: Complete Module Quiz**
- **Objective:** Verify module quiz functionality
- **Steps:**
  1. Complete module lessons
  2. Click "Take Quiz"
  3. Answer 10 multiple-choice questions
  4. Submit quiz
  5. View results:
     - Score (e.g., 8/10 = 80%)
     - Correct/incorrect answers highlighted
     - Explanations for incorrect answers
  6. Retry quiz (if score < 70%)
  7. Verify improved score recorded
- **Expected Result:** Quiz functional, results accurate, explanations helpful, retries allowed

### 6.3 Certification Exam

**Test Case CERT-EXAM-001: Start Certification Exam**
- **Objective:** Verify certification exam initiation
- **Steps:**
  1. Complete all course modules (100% progress)
  2. Navigate to "Certification Exam"
  3. Review exam instructions:
     - 50 multiple-choice questions
     - 90-minute time limit
     - 70% passing score
     - No retries for 7 days if failed
  4. Click "Start Exam"
  5. Verify exam timer starts
  6. Verify questions display
- **Expected Result:** Exam starts, timer active, questions accessible

**Test Case CERT-EXAM-002: Complete Certification Exam**
- **Objective:** Verify exam completion and grading
- **Steps:**
  1. Answer all 50 questions
  2. Review flagged questions (if any)
  3. Click "Submit Exam"
  4. Confirm submission
  5. Wait for grading (should be instant)
  6. View results:
     - Score (e.g., 42/50 = 84%)
     - Pass/Fail status
     - Correct answers (if failed)
     - Certificate generation (if passed)
- **Expected Result:** Exam graded instantly, results accurate, certificate generated if passed

**Test Case CERT-EXAM-003: Exam Timer & Auto-Submit**
- **Objective:** Verify exam auto-submits when time expires
- **Steps:**
  1. Start exam
  2. Answer some questions (not all)
  3. Wait for timer to reach 0:00
  4. Verify exam auto-submits
  5. Verify warning shown before auto-submit (e.g., "1 minute remaining")
  6. View results (partial answers graded)
- **Expected Result:** Timer accurate, warnings shown, auto-submit works, partial answers graded

**Test Case CERT-EXAM-004: Exam Proctoring (if enabled)**
- **Objective:** Verify exam proctoring features (webcam, screen recording)
- **Steps:**
  1. Start exam
  2. Grant webcam permission (if required)
  3. Verify webcam recording indicator
  4. Attempt to switch tabs/windows
  5. Verify warning shown ("Tab switching detected")
  6. Verify proctoring data recorded
  7. Admin review: Check proctoring logs
- **Expected Result:** Proctoring active, violations detected, logs complete

### 6.4 Certificate Generation & Verification

**Test Case CERT-GEN-001: Generate Certificate**
- **Objective:** Verify certificate generation after passing exam
- **Steps:**
  1. Pass certification exam (score ≥ 70%)
  2. Verify certificate generation message
  3. Click "View Certificate"
  4. Verify certificate displays:
     - CEASAI branding
     - Certificate number (unique)
     - Holder name
     - Course name
     - Issue date
     - Expiration date (3 years)
     - QR code (for verification)
  5. Download certificate (PDF)
  6. Verify PDF quality and branding
- **Expected Result:** Certificate generated, professional design, downloadable PDF

**Test Case CERT-VER-001: Verify Certificate**
- **Objective:** Verify public can verify certificate authenticity
- **Steps:**
  1. Navigate to `/verify-certificate`
  2. Enter certificate number (or scan QR code)
  3. Click "Verify"
  4. Verify certificate details displayed:
     - Holder name
     - Course name
     - Issue date
     - Expiration date
     - Verification status (Valid/Expired/Revoked)
  5. Test with invalid certificate number
  6. Verify "Certificate not found" message
- **Expected Result:** Valid certificates verified, invalid certificates rejected, clear status

**Test Case CERT-SHARE-001: Share Certificate on LinkedIn**
- **Objective:** Verify certificate sharing on social media
- **Steps:**
  1. View certificate
  2. Click "Share on LinkedIn"
  3. Verify LinkedIn share dialog opens
  4. Verify certificate image and details pre-filled
  5. Post to LinkedIn
  6. Verify post appears on LinkedIn profile
- **Expected Result:** LinkedIn sharing works, certificate displays correctly, link to verification page

### 6.5 Analyst Work Assignments

**Test Case ANALYST-WORK-001: View Available Cases**
- **Objective:** Verify certified analysts can view available work assignments
- **Steps:**
  1. Login as certified analyst
  2. Navigate to "Workbench"
  3. Verify available cases listed:
     - Case ID
     - Case type (Watchdog incident, Compliance assessment)
     - Severity
     - Estimated time
     - Payment (£45/hour)
  4. Filter cases by type, severity, framework
  5. Sort by payment, urgency
- **Expected Result:** Cases listed, filters work, payment displayed

**Test Case ANALYST-WORK-002: Accept and Review Case**
- **Objective:** Verify analyst can accept and review cases
- **Steps:**
  1. Select case from available list
  2. Click "Accept Case"
  3. Verify case assigned to analyst
  4. Review case details:
     - Incident description
     - 33-Agent Council votes (if available)
     - Evidence (documents, images)
     - Compliance framework requirements
  5. Conduct analysis (use PDCA framework)
  6. Submit decision:
     - Approve/Reject/Escalate
     - Reasoning (required)
     - Confidence score (0-100%)
  7. Verify decision recorded
- **Expected Result:** Case accepted, analysis tools available, decision submitted

**Test Case ANALYST-WORK-003: Track Analyst Performance**
- **Objective:** Verify analyst performance metrics tracked
- **Steps:**
  1. Navigate to "Analyst Dashboard"
  2. Verify metrics displayed:
     - Cases reviewed (total count)
     - Accuracy score (agreement with consensus)
     - Average review time
     - Earnings (total, this month, this week)
     - Leaderboard rank
  3. View detailed performance history
  4. Download performance report (PDF)
- **Expected Result:** Metrics accurate, history complete, report generated

**Test Case ANALYST-PAY-001: Analyst Payment Processing**
- **Objective:** Verify analyst payments processed via Stripe Connect
- **Steps:**
  1. Complete 10 case reviews (10 hours @ £45/hour = £450)
  2. Navigate to "Earnings"
  3. Verify earnings balance: £450
  4. Click "Request Payout"
  5. Enter Stripe Connect bank details (test mode)
  6. Submit payout request
  7. Verify payout initiated
  8. Check Stripe Connect dashboard (admin)
  9. Verify payout processed
- **Expected Result:** Earnings tracked, payout requested, Stripe Connect processes payment

---

## 7. Integration Testing

### 7.1 Database Integration

**Test Case INT-DB-001: Database Connection Pooling**
- **Objective:** Verify database connection pooling handles concurrent requests
- **Steps:**
  1. Simulate 100 concurrent API requests
  2. Monitor database connection pool
  3. Verify connections reused (not exhausted)
  4. Verify no connection leaks
  5. Monitor query performance
- **Expected Result:** Connection pool stable, no leaks, performance acceptable

**Test Case INT-DB-002: Database Transactions**
- **Objective:** Verify database transactions maintain data integrity
- **Steps:**
  1. Trigger complex transaction (e.g., enrollment with payment)
  2. Simulate transaction failure (e.g., payment declined)
  3. Verify rollback occurs (no partial data)
  4. Retry transaction with valid payment
  5. Verify commit successful
- **Expected Result:** Transactions atomic, rollback works, data consistent

**Test Case INT-DB-003: Database Migrations**
- **Objective:** Verify database schema migrations work correctly
- **Steps:**
  1. Run `pnpm db:push` to apply migrations
  2. Verify all tables created/updated
  3. Verify no data loss
  4. Verify foreign key constraints enforced
  5. Run seed scripts
  6. Verify sample data inserted
- **Expected Result:** Migrations successful, schema correct, data intact

### 7.2 Stripe Payment Integration

**Test Case INT-STRIPE-001: Stripe Checkout**
- **Objective:** Verify Stripe checkout flow
- **Steps:**
  1. Purchase course (£149)
  2. Verify Stripe checkout session created
  3. Enter test card: 4242 4242 4242 4242
  4. Complete payment
  5. Verify webhook received (`checkout.session.completed`)
  6. Verify enrollment created in database
  7. Verify user granted access
- **Expected Result:** Payment processed, webhook received, enrollment granted

**Test Case INT-STRIPE-002: Stripe Subscription**
- **Objective:** Verify Stripe subscription for monthly plans
- **Steps:**
  1. Purchase Professional Analyst plan (6-month, £89/month)
  2. Verify Stripe subscription created
  3. Verify first payment processed
  4. Wait for webhook (`invoice.payment_succeeded`)
  5. Verify subscription status: active
  6. Simulate subscription renewal (next month)
  7. Verify renewal payment processed
- **Expected Result:** Subscription created, recurring payments work, webhooks received

**Test Case INT-STRIPE-003: Stripe Refund**
- **Objective:** Verify refund processing (14-day money-back guarantee)
- **Steps:**
  1. Purchase course
  2. Request refund within 14 days
  3. Admin: Process refund via Stripe dashboard
  4. Verify webhook received (`charge.refunded`)
  5. Verify user access revoked
  6. Verify refund email sent
- **Expected Result:** Refund processed, access revoked, user notified

**Test Case INT-STRIPE-004: Stripe Connect (Analyst Payouts)**
- **Objective:** Verify Stripe Connect for analyst payouts
- **Steps:**
  1. Analyst: Complete onboarding (provide bank details)
  2. Analyst: Earn £450 from case reviews
  3. Analyst: Request payout
  4. Admin: Approve payout
  5. Verify Stripe Connect transfer initiated
  6. Verify webhook received (`transfer.created`)
  7. Verify analyst receives funds (test mode)
- **Expected Result:** Stripe Connect configured, payouts processed, webhooks received

### 7.3 LLM Integration (Gemini API)

**Test Case INT-LLM-001: 33-Agent Council Voting**
- **Objective:** Verify 33 agents vote via Gemini API
- **Steps:**
  1. Trigger council session (e.g., new Watchdog incident)
  2. Verify 33 API calls made (one per agent)
  3. Monitor API response times
  4. Verify all agents return valid JSON:
     ```json
     {
       "vote": "approve|reject|escalate",
       "confidence": 0.85,
       "reasoning": "This incident represents a clear privacy violation..."
     }
     ```
  5. Verify votes stored in database
  6. Verify consensus calculated (22/33 threshold)
- **Expected Result:** All 33 agents vote, responses valid, consensus calculated

**Test Case INT-LLM-002: LLM Error Handling**
- **Objective:** Verify graceful handling of LLM API failures
- **Steps:**
  1. Simulate LLM API failure (network error, timeout, rate limit)
  2. Verify retry logic (3 attempts with exponential backoff)
  3. Verify fallback behavior (escalate to human if all retries fail)
  4. Verify error logged
  5. Verify user notified
- **Expected Result:** Errors handled gracefully, fallback works, user informed

**Test Case INT-LLM-003: LLM Response Validation**
- **Objective:** Verify LLM responses validated before use
- **Steps:**
  1. Trigger council voting
  2. Inject invalid LLM response (malformed JSON, missing fields)
  3. Verify validation catches error
  4. Verify fallback vote recorded ("escalate" with 0.5 confidence)
  5. Verify error logged
- **Expected Result:** Invalid responses rejected, fallback applied, system stable

### 7.4 Email Integration (Resend)

**Test Case INT-EMAIL-001: Welcome Email**
- **Objective:** Verify welcome email sent on signup
- **Steps:**
  1. Create new user account
  2. Verify welcome email sent
  3. Check email content:
     - Personalized greeting
     - Getting started guide
     - Links to training courses
     - Support contact
  4. Verify email deliverability (not spam)
- **Expected Result:** Email sent, content correct, deliverability high

**Test Case INT-EMAIL-002: Certificate Email**
- **Objective:** Verify certificate email sent after passing exam
- **Steps:**
  1. Pass certification exam
  2. Verify certificate email sent
  3. Check email content:
     - Congratulations message
     - Certificate attached (PDF)
     - Verification link
     - Share on LinkedIn link
  4. Verify PDF attachment valid
- **Expected Result:** Email sent, PDF attached, links work

**Test Case INT-EMAIL-003: Notification Emails**
- **Objective:** Verify notification emails for key events
- **Steps:**
  1. Trigger events:
     - Watchdog incident assigned to analyst
     - Compliance assessment completed
     - PDCA cycle phase completed
     - Payment receipt
     - Refund processed
  2. Verify emails sent for each event
  3. Verify email content accurate
  4. Verify unsubscribe link works
- **Expected Result:** All notification emails sent, content accurate, unsubscribe works

### 7.5 WebSocket Real-Time Integration

**Test Case INT-WS-001: Real-Time Incident Feed**
- **Objective:** Verify real-time updates for Watchdog incident feed
- **Steps:**
  1. Open Watchdog portal in browser
  2. Open second browser (incognito)
  3. Submit new incident in second browser
  4. Verify incident appears in first browser (without refresh)
  5. Verify WebSocket connection stable
  6. Verify reconnection logic if connection drops
- **Expected Result:** Real-time updates work, no refresh needed, reconnection automatic

**Test Case INT-WS-002: Real-Time Council Voting**
- **Objective:** Verify real-time updates for council voting progress
- **Steps:**
  1. View incident detail page
  2. Trigger council voting
  3. Verify voting progress updates in real-time:
     - Votes received (1/33, 2/33, ..., 33/33)
     - Consensus status
     - Final decision
  4. Verify no page refresh needed
- **Expected Result:** Real-time voting updates, smooth UX, no refresh

---

## 8. Security Testing

### 8.1 Authentication & Authorization

**Test Case SEC-AUTH-001: OAuth Authentication**
- **Objective:** Verify OAuth authentication flow secure
- **Steps:**
  1. Click "Sign In"
  2. Verify redirect to OAuth provider (Manus OAuth)
  3. Verify HTTPS used for all requests
  4. Verify state parameter prevents CSRF
  5. Complete OAuth flow
  6. Verify JWT token issued
  7. Verify token stored securely (httpOnly cookie)
- **Expected Result:** OAuth flow secure, CSRF protection, secure token storage

**Test Case SEC-AUTH-002: Session Management**
- **Objective:** Verify session security
- **Steps:**
  1. Login and obtain session token
  2. Verify token expiration (30 minutes inactivity)
  3. Attempt to use expired token
  4. Verify 401 Unauthorized response
  5. Attempt to reuse token after logout
  6. Verify token invalidated
- **Expected Result:** Sessions expire, tokens invalidated on logout, secure

**Test Case SEC-AUTH-003: Role-Based Access Control (RBAC)**
- **Objective:** Verify RBAC enforced
- **Steps:**
  1. Login as regular user
  2. Attempt to access admin endpoints:
     - `GET /api/admin/users`
     - `POST /api/admin/approve-analyst`
  3. Verify 403 Forbidden response
  4. Login as admin
  5. Verify admin endpoints accessible
  6. Verify audit log records access attempts
- **Expected Result:** RBAC enforced, unauthorized access blocked, audit logged

### 8.2 Data Protection

**Test Case SEC-DATA-001: Encryption in Transit**
- **Objective:** Verify all data encrypted in transit (TLS/SSL)
- **Steps:**
  1. Verify HTTPS enforced (HTTP redirects to HTTPS)
  2. Verify TLS 1.2+ used (no older protocols)
  3. Verify strong cipher suites
  4. Run SSL Labs test (https://www.ssllabs.com/ssltest/)
  5. Verify A+ rating
- **Expected Result:** HTTPS enforced, TLS 1.2+, strong ciphers, A+ rating

**Test Case SEC-DATA-002: Encryption at Rest**
- **Objective:** Verify sensitive data encrypted at rest
- **Steps:**
  1. Verify database encryption enabled (MySQL/TiDB)
  2. Verify API keys hashed (bcrypt)
  3. Verify passwords hashed (bcrypt)
  4. Verify payment data NOT stored (Stripe handles)
  5. Verify PII encrypted (if stored)
- **Expected Result:** Database encrypted, credentials hashed, no plaintext secrets

**Test Case SEC-DATA-003: Data Sanitization**
- **Objective:** Verify user input sanitized to prevent XSS/SQL injection
- **Steps:**
  1. Submit incident report with XSS payload:
     - `<script>alert('XSS')</script>`
  2. Verify payload escaped/sanitized
  3. Submit SQL injection payload:
     - `' OR '1'='1`
  4. Verify query parameterized (no injection)
  5. Submit file upload with malicious content
  6. Verify file scanned/rejected
- **Expected Result:** XSS prevented, SQL injection prevented, malicious files rejected

### 8.3 API Security

**Test Case SEC-API-001: Rate Limiting**
- **Objective:** Verify API rate limiting prevents abuse
- **Steps:**
  1. Make 100 API requests in 1 minute
  2. Verify rate limit enforced (e.g., 100 req/min per IP)
  3. Verify 429 Too Many Requests response
  4. Verify Retry-After header provided
  5. Wait for rate limit reset
  6. Verify requests allowed again
- **Expected Result:** Rate limiting works, abuse prevented, clear error messages

**Test Case SEC-API-002: API Key Security**
- **Objective:** Verify API keys secure
- **Steps:**
  1. Generate API key
  2. Verify key shown only once (not retrievable later)
  3. Verify key hashed in database
  4. Attempt to use invalid key
  5. Verify 401 Unauthorized response
  6. Revoke API key
  7. Verify revoked key rejected
- **Expected Result:** Keys secure, one-time display, revocation works

**Test Case SEC-API-003: CORS Configuration**
- **Objective:** Verify CORS configured securely
- **Steps:**
  1. Make API request from unauthorized origin
  2. Verify CORS error (blocked)
  3. Make API request from authorized origin (e.g., coai.safetyof.ai)
  4. Verify request allowed
  5. Verify CORS headers correct:
     - `Access-Control-Allow-Origin`
     - `Access-Control-Allow-Methods`
     - `Access-Control-Allow-Headers`
- **Expected Result:** CORS enforced, unauthorized origins blocked, authorized allowed

### 8.4 Payment Security

**Test Case SEC-PAY-001: PCI DSS Compliance**
- **Objective:** Verify PCI DSS compliance (via Stripe)
- **Steps:**
  1. Verify NO credit card data stored on CSOAI servers
  2. Verify Stripe handles all payment processing
  3. Verify Stripe.js used (client-side tokenization)
  4. Verify payment form embedded via iframe
  5. Verify no credit card data passes through CSOAI backend
- **Expected Result:** PCI DSS compliant, no credit card data stored, Stripe handles all

**Test Case SEC-PAY-002: Webhook Signature Verification**
- **Objective:** Verify Stripe webhooks verified to prevent spoofing
- **Steps:**
  1. Trigger Stripe webhook (e.g., payment succeeded)
  2. Verify webhook signature checked (Stripe-Signature header)
  3. Attempt to send fake webhook (invalid signature)
  4. Verify fake webhook rejected
  5. Verify only valid webhooks processed
- **Expected Result:** Webhook signatures verified, fake webhooks rejected, secure

---

## 9. Compliance Testing

### 9.1 GDPR Compliance

**Test Case COMP-GDPR-001: Data Access Request**
- **Objective:** Verify users can request their personal data (GDPR Article 15)
- **Steps:**
  1. Login as user
  2. Navigate to "Settings" > "Privacy"
  3. Click "Request My Data"
  4. Verify request submitted
  5. Admin: Process request
  6. Verify user receives data export (JSON/CSV)
  7. Verify export contains all personal data
- **Expected Result:** Data access request works, export complete, delivered within 30 days

**Test Case COMP-GDPR-002: Data Deletion Request**
- **Objective:** Verify users can request data deletion (GDPR Article 17 - Right to be Forgotten)
- **Steps:**
  1. Login as user
  2. Navigate to "Settings" > "Privacy"
  3. Click "Delete My Account"
  4. Confirm deletion
  5. Verify account marked for deletion
  6. Verify data deleted within 30 days
  7. Verify deletion confirmation email sent
  8. Attempt to login with deleted account
  9. Verify login fails
- **Expected Result:** Account deleted, data removed, user notified, login blocked

**Test Case COMP-GDPR-003: Data Portability**
- **Objective:** Verify users can export data in machine-readable format (GDPR Article 20)
- **Steps:**
  1. Navigate to "Settings" > "Privacy"
  2. Click "Export My Data"
  3. Select format (JSON, CSV, XML)
  4. Download export
  5. Verify export contains:
     - User profile
     - Course enrollments
     - Certificates
     - Watchdog reports
     - Compliance assessments
  6. Verify format machine-readable
- **Expected Result:** Data export works, format machine-readable, complete data

**Test Case COMP-GDPR-004: Cookie Consent**
- **Objective:** Verify cookie consent banner compliant with GDPR
- **Steps:**
  1. Visit site (first time, no cookies)
  2. Verify cookie consent banner displayed
  3. Verify options:
     - Accept All
     - Reject All
     - Customize (essential, analytics, marketing)
  4. Select "Reject All"
  5. Verify only essential cookies set
  6. Select "Accept All"
  7. Verify all cookies set
  8. Verify consent recorded
- **Expected Result:** Cookie consent banner compliant, granular control, consent recorded

### 9.2 EU AI Act Compliance

**Test Case COMP-EUAI-001: AI System Transparency**
- **Objective:** Verify platform discloses AI system usage (EU AI Act Article 52)
- **Steps:**
  1. Navigate to homepage
  2. Verify AI transparency statement displayed:
     - "This platform uses AI systems for compliance assessment"
     - "You have the right to human review of AI decisions"
     - "AI systems are continuously monitored for safety"
  3. Verify link to full AI transparency page
  4. Verify transparency page explains:
     - Which AI systems are used
     - How AI systems work
     - How to request human review
- **Expected Result:** AI usage disclosed, transparency statement clear, human review available

**Test Case COMP-EUAI-002: Human Oversight**
- **Objective:** Verify human oversight of AI decisions (EU AI Act Article 14)
- **Steps:**
  1. Trigger 33-Agent Council assessment
  2. Verify human escalation if consensus not reached (<22/33 votes)
  3. Request human review of AI decision
  4. Verify human analyst assigned
  5. Verify human decision recorded
  6. Verify human decision overrides AI decision (if different)
- **Expected Result:** Human oversight works, escalation automatic, human decisions respected

**Test Case COMP-EUAI-003: Bias Monitoring**
- **Objective:** Verify AI systems monitored for bias (EU AI Act Article 10)
- **Steps:**
  1. Admin: Navigate to "AI Monitoring"
  2. Verify bias metrics tracked:
     - Demographic parity
     - Equal opportunity
     - Predictive parity
  3. Verify bias alerts triggered if thresholds exceeded
  4. Verify bias mitigation actions logged
  5. Verify bias reports generated (quarterly)
- **Expected Result:** Bias monitoring active, alerts work, mitigation documented

### 9.3 Accessibility Compliance (WCAG 2.1 AA)

**Test Case COMP-A11Y-001: Keyboard Navigation**
- **Objective:** Verify all functionality accessible via keyboard
- **Steps:**
  1. Navigate site using only keyboard (Tab, Enter, Arrow keys)
  2. Verify all interactive elements reachable
  3. Verify focus indicators visible
  4. Verify no keyboard traps
  5. Verify logical tab order
- **Expected Result:** Full keyboard accessibility, no traps, logical order

**Test Case COMP-A11Y-002: Screen Reader Compatibility**
- **Objective:** Verify site compatible with screen readers (NVDA, JAWS)
- **Steps:**
  1. Enable screen reader (NVDA)
  2. Navigate site
  3. Verify all content announced
  4. Verify images have alt text
  5. Verify form labels associated
  6. Verify ARIA landmarks used
  7. Verify heading hierarchy logical
- **Expected Result:** Screen reader compatible, all content accessible, ARIA correct

**Test Case COMP-A11Y-003: Color Contrast**
- **Objective:** Verify color contrast meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- **Steps:**
  1. Use color contrast checker (e.g., WebAIM)
  2. Test text/background combinations
  3. Verify all text meets contrast requirements
  4. Test interactive elements (buttons, links)
  5. Verify focus indicators have sufficient contrast
- **Expected Result:** All color contrast meets WCAG 2.1 AA, no violations

---

## 10. Performance Testing

### 10.1 Load Testing

**Test Case PERF-LOAD-001: Concurrent Users**
- **Objective:** Verify platform handles 100+ concurrent users
- **Steps:**
  1. Use load testing tool (e.g., k6, Artillery)
  2. Simulate 100 concurrent users:
     - Browsing courses
     - Submitting incidents
     - Taking exams
     - Viewing dashboards
  3. Monitor server metrics:
     - CPU usage
     - Memory usage
     - Response times
     - Error rate
  4. Verify response times < 500ms (p95)
  5. Verify error rate < 1%
- **Expected Result:** Platform stable, response times acceptable, no errors

**Test Case PERF-LOAD-002: Database Query Performance**
- **Objective:** Verify database queries optimized
- **Steps:**
  1. Enable query logging
  2. Simulate typical user workflows
  3. Analyze slow queries (> 100ms)
  4. Verify indexes used
  5. Verify N+1 queries avoided
  6. Optimize slow queries
  7. Re-test and verify improvement
- **Expected Result:** Queries optimized, indexes used, no N+1 queries

**Test Case PERF-LOAD-003: API Rate Limiting Under Load**
- **Objective:** Verify rate limiting works under high load
- **Steps:**
  1. Simulate 1000 API requests/second
  2. Verify rate limiting enforced
  3. Verify legitimate users not blocked
  4. Verify abusive users blocked
  5. Verify rate limit counters accurate
- **Expected Result:** Rate limiting effective, legitimate users unaffected, abuse blocked

### 10.2 Scalability Testing

**Test Case PERF-SCALE-001: Database Connection Pooling**
- **Objective:** Verify database connection pool scales
- **Steps:**
  1. Configure connection pool (e.g., 20 connections)
  2. Simulate 100 concurrent database queries
  3. Verify connections reused
  4. Verify no connection exhaustion
  5. Verify queue time acceptable (< 50ms)
- **Expected Result:** Connection pool scales, no exhaustion, acceptable queue time

**Test Case PERF-SCALE-002: Horizontal Scaling**
- **Objective:** Verify platform can scale horizontally (multiple instances)
- **Steps:**
  1. Deploy 2 instances behind load balancer
  2. Simulate traffic
  3. Verify load distributed evenly
  4. Verify session persistence (sticky sessions or shared session store)
  5. Verify no single point of failure
- **Expected Result:** Horizontal scaling works, load balanced, session persistence

### 10.3 Caching & Optimization

**Test Case PERF-CACHE-001: Static Asset Caching**
- **Objective:** Verify static assets cached (images, CSS, JS)
- **Steps:**
  1. Load homepage
  2. Verify Cache-Control headers set:
     - `Cache-Control: public, max-age=31536000` (1 year for hashed assets)
     - `Cache-Control: no-cache` (for HTML)
  3. Reload page
  4. Verify assets loaded from cache (304 Not Modified)
  5. Verify page load time reduced
- **Expected Result:** Static assets cached, page load faster, cache headers correct

**Test Case PERF-CACHE-002: API Response Caching**
- **Objective:** Verify API responses cached where appropriate
- **Steps:**
  1. Call API endpoint (e.g., `GET /api/courses`)
  2. Verify response cached (Redis or in-memory)
  3. Call same endpoint again
  4. Verify response served from cache (faster)
  5. Verify cache invalidated on data change
- **Expected Result:** API responses cached, cache invalidation works, performance improved

---

## 11. Usability Testing

### 11.1 User Experience

**Test Case UX-001: Homepage First Impression**
- **Objective:** Evaluate homepage clarity and call-to-action effectiveness
- **Steps:**
  1. Show homepage to 5 test users (no prior knowledge)
  2. Ask: "What is this platform for?"
  3. Ask: "What would you do first?"
  4. Observe where users click
  5. Gather feedback on clarity
- **Expected Result:** Users understand purpose, clear CTA, intuitive navigation

**Test Case UX-002: Course Enrollment Flow**
- **Objective:** Evaluate ease of course enrollment
- **Steps:**
  1. Ask user to enroll in a course
  2. Observe steps taken
  3. Note any confusion or hesitation
  4. Time to completion
  5. Gather feedback on process
- **Expected Result:** Enrollment intuitive, < 3 minutes, minimal confusion

**Test Case UX-003: Certification Exam Experience**
- **Objective:** Evaluate exam-taking experience
- **Steps:**
  1. Ask user to take certification exam
  2. Observe exam interface usage
  3. Note any usability issues:
     - Timer visibility
     - Question navigation
     - Answer selection
     - Submit process
  4. Gather feedback
- **Expected Result:** Exam interface clear, no usability issues, positive feedback

### 11.2 Mobile Responsiveness

**Test Case UX-MOBILE-001: Mobile Navigation**
- **Objective:** Verify mobile navigation works
- **Steps:**
  1. Open site on mobile device (iPhone, Android)
  2. Verify hamburger menu works
  3. Verify all pages accessible
  4. Verify touch targets large enough (44x44px)
  5. Verify no horizontal scrolling
- **Expected Result:** Mobile navigation smooth, touch targets adequate, no scrolling issues

**Test Case UX-MOBILE-002: Mobile Forms**
- **Objective:** Verify forms usable on mobile
- **Steps:**
  1. Fill out incident report form on mobile
  2. Verify keyboard opens correctly
  3. Verify input fields large enough
  4. Verify validation messages visible
  5. Verify submit button accessible
- **Expected Result:** Forms usable on mobile, no keyboard issues, validation clear

**Test Case UX-MOBILE-003: Mobile Performance**
- **Objective:** Verify mobile performance acceptable
- **Steps:**
  1. Use Google Lighthouse (mobile)
  2. Run performance audit
  3. Verify scores:
     - Performance: > 80
     - Accessibility: > 90
     - Best Practices: > 90
     - SEO: > 90
  4. Optimize if needed
- **Expected Result:** Mobile performance scores meet targets, fast load times

---

## 12. Content Testing

### 12.1 Legal Documents

**Test Case CONTENT-LEGAL-001: Terms of Service**
- **Objective:** Verify Terms of Service complete and legally sound
- **Steps:**
  1. Review Terms of Service (`/terms-of-service`)
  2. Verify sections present:
     - Acceptance of Terms
     - AI Systems & Safety
     - User Responsibilities
     - Data Protection & Privacy
     - Courses & Certification
     - Payment & Billing
     - Intellectual Property
     - Liability & Disclaimers
     - Dispute Resolution
     - Termination
  3. Verify legal language clear
  4. Verify no false claims
  5. Verify effective date current
- **Expected Result:** Terms complete, legally sound, clear language

**Test Case CONTENT-LEGAL-002: Privacy Policy**
- **Objective:** Verify Privacy Policy GDPR compliant
- **Steps:**
  1. Review Privacy Policy (`/privacy-policy`)
  2. Verify GDPR requirements met:
     - Data collected (explicit list)
     - Purpose of collection
     - Legal basis for processing
     - Data retention periods
     - User rights (access, deletion, portability)
     - Contact information (DPO)
  3. Verify CCPA disclosures (if applicable)
  4. Verify cookie policy linked
- **Expected Result:** Privacy Policy GDPR compliant, complete disclosures

**Test Case CONTENT-LEGAL-003: Cookie Policy**
- **Objective:** Verify Cookie Policy accurate
- **Steps:**
  1. Review Cookie Policy (`/cookie-policy`)
  2. Verify all cookies listed:
     - Essential cookies
     - Analytics cookies
     - Marketing cookies
  3. Verify cookie purposes explained
  4. Verify opt-out instructions provided
  5. Verify third-party cookies disclosed
- **Expected Result:** Cookie Policy accurate, complete list, opt-out clear

### 12.2 Course Content

**Test Case CONTENT-COURSE-001: Course Accuracy**
- **Objective:** Verify course content accurate and up-to-date
- **Steps:**
  1. Review course content (sample: EU AI Act Compliance)
  2. Verify facts accurate (cross-reference official EU AI Act text)
  3. Verify dates current (e.g., enforcement date: February 2, 2026)
  4. Verify no outdated information
  5. Verify references cited
- **Expected Result:** Course content accurate, up-to-date, well-referenced

**Test Case CONTENT-COURSE-002: Course Completeness**
- **Objective:** Verify courses cover all required topics
- **Steps:**
  1. Review course outline (e.g., NIST AI RMF)
  2. Verify all NIST AI RMF functions covered:
     - GOVERN
     - MAP
     - MEASURE
     - MANAGE
  3. Verify practical examples included
  4. Verify case studies relevant
  5. Verify quizzes comprehensive
- **Expected Result:** Courses complete, all topics covered, practical examples

**Test Case CONTENT-COURSE-003: Course Translations**
- **Objective:** Verify course translations accurate (13 languages)
- **Steps:**
  1. Select course in English
  2. Switch to another language (e.g., French)
  3. Verify translation accurate (no machine translation errors)
  4. Verify technical terms translated correctly
  5. Verify formatting preserved
  6. Test all 13 languages (sample check)
- **Expected Result:** Translations accurate, technical terms correct, formatting preserved

### 12.3 Exam Questions

**Test Case CONTENT-EXAM-001: Question Quality**
- **Objective:** Verify exam questions high quality
- **Steps:**
  1. Review exam questions (sample: 50 questions from EU AI Act exam)
  2. Verify questions clear and unambiguous
  3. Verify correct answers verified
  4. Verify distractors plausible (not obviously wrong)
  5. Verify explanations provided for incorrect answers
  6. Verify no typos or grammatical errors
- **Expected Result:** Questions high quality, clear, correct answers verified

**Test Case CONTENT-EXAM-002: Question Coverage**
- **Objective:** Verify exam questions cover all course topics
- **Steps:**
  1. Map exam questions to course modules
  2. Verify all modules represented
  3. Verify question distribution balanced (no overemphasis on one topic)
  4. Verify difficulty levels varied (easy, medium, hard)
  5. Verify no duplicate questions
- **Expected Result:** Questions cover all topics, balanced distribution, varied difficulty

---

## 13. Regression Testing

### 13.1 Critical User Flows

**Test Case REG-FLOW-001: End-to-End User Journey**
- **Objective:** Verify complete user journey works (signup → training → certification → work)
- **Steps:**
  1. Signup as new user
  2. Browse courses
  3. Enroll in Foundation course (free)
  4. Complete all modules
  5. Take certification exam
  6. Pass exam (score ≥ 70%)
  7. Receive certificate
  8. Navigate to Workbench
  9. Accept case assignment
  10. Submit case review
  11. Verify earnings tracked
- **Expected Result:** Complete journey works, no broken steps, smooth experience

**Test Case REG-FLOW-002: Enterprise Onboarding to Assessment**
- **Objective:** Verify enterprise flow works (signup → add AI system → run assessment → view report)
- **Steps:**
  1. Signup as enterprise
  2. Complete onboarding wizard
  3. Add AI system
  4. Run compliance assessment (EU AI Act)
  5. Wait for 33-Agent Council evaluation
  6. View assessment results
  7. Download report (PDF)
  8. Verify report complete
- **Expected Result:** Enterprise flow works, assessment complete, report generated

**Test Case REG-FLOW-003: Watchdog Incident to Resolution**
- **Objective:** Verify Watchdog flow works (submit incident → council vote → analyst review → resolution)
- **Steps:**
  1. Submit Watchdog incident (anonymous)
  2. Verify incident appears in public feed
  3. Wait for 33-Agent Council voting
  4. Verify voting results displayed
  5. If escalated, verify analyst assigned
  6. Analyst reviews and submits decision
  7. Verify incident status updated
  8. Verify public notified
- **Expected Result:** Watchdog flow works, transparency maintained, resolution clear

### 13.2 Bug Regression

**Test Case REG-BUG-001: Previously Fixed Bugs**
- **Objective:** Verify previously fixed bugs do not reappear
- **Steps:**
  1. Review bug tracker (GitHub Issues, Jira, etc.)
  2. Identify critical bugs fixed in past
  3. Re-test each fixed bug
  4. Verify bug still fixed
  5. Document any regressions
- **Expected Result:** No bug regressions, all fixes persistent

---

## 14. Deployment & Production Readiness

### 14.1 Pre-Deployment Checklist

**Test Case DEPLOY-001: Environment Configuration**
- **Objective:** Verify production environment configured correctly
- **Steps:**
  1. Verify environment variables set:
     - `DATABASE_URL` (production database)
     - `STRIPE_SECRET_KEY` (live mode)
     - `GEMINI_API_KEY` (production key)
     - `RESEND_API_KEY` (production key)
  2. Verify secrets not exposed (no .env in repo)
  3. Verify HTTPS enforced
  4. Verify domain configured (coai.safetyof.ai)
  5. Verify DNS records correct
- **Expected Result:** Environment configured, secrets secure, domain ready

**Test Case DEPLOY-002: Database Backup**
- **Objective:** Verify database backup configured
- **Steps:**
  1. Verify automated backups enabled (daily)
  2. Verify backup retention policy (30 days)
  3. Test database restore from backup
  4. Verify restore successful
  5. Verify backup monitoring/alerts
- **Expected Result:** Backups configured, restore tested, monitoring active

**Test Case DEPLOY-003: Monitoring & Logging**
- **Objective:** Verify monitoring and logging configured
- **Steps:**
  1. Verify error logging (Sentry or similar)
  2. Verify performance monitoring (New Relic, Datadog, or similar)
  3. Verify uptime monitoring (Pingdom, UptimeRobot)
  4. Verify log aggregation (CloudWatch, Loggly)
  5. Verify alerts configured (email, Slack)
- **Expected Result:** Monitoring comprehensive, alerts configured, logs aggregated

### 14.2 Production Smoke Tests

**Test Case PROD-SMOKE-001: Homepage Loads**
- **Objective:** Verify homepage loads in production
- **Steps:**
  1. Navigate to `https://coai.safetyof.ai`
  2. Verify page loads (< 3 seconds)
  3. Verify no errors in console
  4. Verify HTTPS certificate valid
  5. Verify all assets load (images, CSS, JS)
- **Expected Result:** Homepage loads, no errors, HTTPS valid

**Test Case PROD-SMOKE-002: Authentication Works**
- **Objective:** Verify authentication works in production
- **Steps:**
  1. Click "Sign In"
  2. Complete OAuth flow
  3. Verify redirect to dashboard
  4. Verify user session active
  5. Logout
  6. Verify logout successful
- **Expected Result:** Authentication works, session management correct

**Test Case PROD-SMOKE-003: Payment Works**
- **Objective:** Verify payment processing works in production (Stripe live mode)
- **Steps:**
  1. Purchase course (use real card or test card if live mode allows)
  2. Verify payment processed
  3. Verify webhook received
  4. Verify enrollment granted
  5. Verify receipt email sent
- **Expected Result:** Payment works, webhook received, enrollment granted

**Test Case PROD-SMOKE-004: API Endpoints Work**
- **Objective:** Verify API endpoints accessible in production
- **Steps:**
  1. Generate API key
  2. Call API endpoints:
     - `GET /api/courses`
     - `GET /api/ai-systems`
     - `POST /api/watchdog-incidents`
  3. Verify responses correct
  4. Verify rate limiting works
  5. Verify authentication enforced
- **Expected Result:** API works, rate limiting active, authentication enforced

---

## 15. Test Execution & Reporting

### 15.1 Test Execution Plan

**Phase 1: Functional Testing (Week 1)**
- Execute all functional tests (Pipelines 1-4)
- Priority: Critical user flows
- Log all defects in bug tracker
- Daily standup to review progress

**Phase 2: Integration & Security Testing (Week 2)**
- Execute integration tests (database, Stripe, LLM, email, WebSocket)
- Execute security tests (authentication, data protection, API security)
- Penetration testing (if budget allows)
- Daily security review

**Phase 3: Performance & Compliance Testing (Week 3)**
- Execute performance tests (load, scalability, caching)
- Execute compliance tests (GDPR, EU AI Act, accessibility)
- Optimize based on results
- Daily performance review

**Phase 4: Usability & Content Testing (Week 4)**
- Execute usability tests (UX, mobile, accessibility)
- Execute content tests (legal documents, courses, exams)
- Gather user feedback
- Daily content review

**Phase 5: Regression & Production Readiness (Week 5)**
- Execute regression tests (critical flows, bug fixes)
- Execute deployment tests (environment, backup, monitoring)
- Production smoke tests
- Final go/no-go decision

### 15.2 Defect Management

**Defect Severity Levels:**
- **Critical:** Blocks core functionality, data loss, security vulnerability
- **High:** Major feature broken, workaround exists
- **Medium:** Minor feature broken, cosmetic issue
- **Low:** Enhancement, nice-to-have

**Defect Workflow:**
1. Tester logs defect in bug tracker (GitHub Issues)
2. Developer triages defect (severity, priority)
3. Developer fixes defect
4. Tester verifies fix
5. Defect closed

**Acceptance Criteria:**
- Zero critical defects
- < 5 high-severity defects
- < 20 medium-severity defects
- Low-severity defects deferred to post-launch

### 15.3 Test Reporting

**Daily Test Report:**
- Tests executed today
- Tests passed/failed
- New defects found
- Defects fixed
- Blockers

**Weekly Test Summary:**
- Total tests executed
- Pass rate (%)
- Defect trends
- Risk assessment
- Recommendations

**Final Test Report:**
- Executive summary
- Test coverage (%)
- Defect summary
- Risk assessment
- Go/no-go recommendation

---

## 16. Test Data & Test Accounts

### 16.1 Test User Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@csoai.test | Test123! | Full access |
| Enterprise User | enterprise@csoai.test | Test123! | Enterprise dashboard |
| Government User | gov@csoai.test | Test123! | Government portal |
| Certified Analyst | analyst@csoai.test | Test123! | Workbench access |
| Student | student@csoai.test | Test123! | Training courses |
| Public User | (no account) | (no password) | Public pages only |

### 16.2 Test Payment Cards (Stripe Test Mode)

| Card Number | Type | Expected Result |
|-------------|------|-----------------|
| 4242 4242 4242 4242 | Visa | Success |
| 4000 0000 0000 0002 | Visa | Declined |
| 4000 0000 0000 9995 | Visa | Insufficient funds |
| 4000 0025 0000 3155 | Visa | Requires authentication (3D Secure) |

### 16.3 Test AI Systems

| System Name | Type | Risk Level | Industry |
|-------------|------|------------|----------|
| Airport Facial Recognition | Computer Vision | High | Transportation |
| Customer Support Chatbot | Conversational AI | Medium | Customer Service |
| Product Recommendation Engine | Recommendation System | Low | E-commerce |
| Social Credit Scoring | Scoring System | Prohibited | Government |

### 16.4 Test Watchdog Incidents

| Title | Severity | AI System | Status |
|-------|----------|-----------|--------|
| Facial recognition misidentified person | High | Airport Facial Recognition | Under Review |
| Chatbot provided biased response | Medium | Customer Support Chatbot | Resolved |
| Recommendation engine filter bubble | Low | Product Recommendation Engine | Open |
| Social credit system discriminates | Critical | Social Credit Scoring | Escalated |

---

## 17. Appendix: Testing Tools & Resources

### 17.1 Recommended Testing Tools

**Functional Testing:**
- Playwright (E2E testing)
- Vitest (unit testing)
- Postman (API testing)

**Performance Testing:**
- k6 (load testing)
- Lighthouse (web performance)
- WebPageTest (page speed)

**Security Testing:**
- OWASP ZAP (penetration testing)
- SSL Labs (SSL/TLS testing)
- Snyk (dependency scanning)

**Accessibility Testing:**
- axe DevTools (accessibility auditing)
- NVDA (screen reader testing)
- WAVE (accessibility evaluation)

**Monitoring & Logging:**
- Sentry (error tracking)
- Datadog (performance monitoring)
- Pingdom (uptime monitoring)

### 17.2 Compliance Resources

**GDPR:**
- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO GDPR Guidance](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)

**EU AI Act:**
- [EU AI Act Official Text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52021PC0206)
- [EU AI Act Compliance Guide](https://artificialintelligenceact.eu/)

**NIST AI RMF:**
- [NIST AI RMF Official Site](https://www.nist.gov/itl/ai-risk-management-framework)

**WCAG 2.1:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)

### 17.3 Contact Information

**Project Team:**
- **Project Lead:** Loop Factory AI Limited
- **QA Lead:** Kime
- **Technical Lead:** Manus AI

**Support:**
- **Email:** hello@safetyof.ai
- **Website:** https://coai.safetyof.ai
- **Documentation:** https://docs.csoai.org

---

## Conclusion

This comprehensive test plan covers all aspects of the CSOAI Dashboard platform, from functional testing of the four core pipelines (Government, Enterprise, Watchdog, Training & Certification) to integration, security, compliance, performance, and usability testing. The platform is designed to be the **Western answer to China's TC260**, providing unified AI safety governance and compliance while creating jobs through the Watchdog Analyst program.

**Key Testing Priorities:**
1. **Four Pipelines:** Ensure all four pipelines (Government, Enterprise, Watchdog, Training) work end-to-end
2. **33-Agent Council:** Verify Byzantine fault-tolerant voting system with multi-LLM integration
3. **Legal Compliance:** Ensure GDPR, EU AI Act, NIST AI RMF, and accessibility compliance
4. **Payment Processing:** Verify Stripe integration for courses, subscriptions, and analyst payouts
5. **Security:** Ensure authentication, authorization, data protection, and API security

**Success Criteria:**
- All critical user flows work end-to-end
- Zero critical defects, < 5 high-severity defects
- GDPR and EU AI Act compliant
- WCAG 2.1 AA accessible
- Performance targets met (response time < 500ms p95, uptime > 99.9%)
- Production-ready for launch

**Next Steps:**
1. Review this test plan with stakeholders
2. Prioritize test cases based on risk
3. Execute tests according to 5-week plan
4. Log defects and track resolution
5. Conduct final go/no-go review
6. Deploy to production

This test plan is a living document and should be updated as the platform evolves. Good luck with testing, Kime!

---

**Document Version History:**
- v1.0 (January 2, 2026): Initial comprehensive test plan

**Prepared by:** Manus AI  
**Approved by:** [Pending Review]
