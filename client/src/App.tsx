import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SkipNavigation } from "./components/SkipNavigation";

// Consent-aware analytics - only loads when user consents
import { initializeAnalytics, setupConsentListener } from './lib/analytics';

// Initialize analytics based on existing consent
if (typeof window !== 'undefined') {
  initializeAnalytics();
  setupConsentListener();
}
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import MembersDashboard from "./pages/MembersDashboard";
import TabsTest from "./pages/TabsTest";
import SimpleReactTabsTest from "./pages/SimpleReactTabsTest";
import AISystems from "./pages/AISystems";
import RiskAssessment from "./pages/RiskAssessment";
import Compliance from "./pages/Compliance";
import AgentCouncil from "./pages/AgentCouncil";
import Watchdog from "./pages/Watchdog";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import WatchdogSignup from "./pages/WatchdogSignup";
import Training from "./pages/Training";
import TrainingV2 from "./pages/Training-v2";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import MyCourses from "./pages/MyCourses";
import CoursePlayer from "./pages/CoursePlayer";
import ProgressDashboard from "./pages/ProgressDashboard";
import Leaderboard from "./pages/Leaderboard";
import Certification from "./pages/Certification";
import CertificationV2 from "./pages/Certification-v2";
import CertificationExam from "./pages/CertificationExam";
import CertificationResults from "./pages/CertificationResults";
import MyCertificates from "./pages/MyCertificates";
import ExamAnalytics from "./pages/ExamAnalytics";
import TrainingCourses from "./pages/TrainingCourses";
import PaidCourses from "./pages/PaidCourses";
import PaidCoursesDashboard from "./pages/PaidCoursesDashboard";
import Checkout from "./pages/Checkout";
import BundleCheckout from "./pages/BundleCheckout";
import TrainingCourseDetail from "./pages/TrainingCourseDetail";
import LessonViewer from "./pages/LessonViewer";
import MyTrainingCourses from "./pages/MyTrainingCourses";
import ExamReview from "./pages/ExamReview";
import ExamDebug from "./pages/ExamDebug";
import Workbench from "./pages/Workbench";
import PublicHome from "./pages/PublicHome";
import Admin from "./pages/Admin";
import AdminCMS from "./pages/admin/AdminCMS";
import CourseManagement from "./pages/admin/CourseManagement";
import CertificateDesigner from "./pages/admin/CertificateDesigner";
import AdminIncidents from "./pages/AdminIncidents";
import AdminAnalytics from "./pages/AdminAnalytics";
import ForumAnalytics from "./pages/ForumAnalytics";
import StudentAnalytics from "./pages/StudentAnalytics";
import CohortAnalysis from "./pages/CohortAnalysis";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import ApiDocs from "./pages/ApiDocs";
import ApiKeys from "./pages/ApiKeys";
import PDCACycles from "./pages/PDCACycles";
import Billing from "./pages/Billing";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import PublicDashboard from "./pages/PublicDashboard";
import ComplianceScorecard from "./pages/ComplianceScorecard";
import KnowledgeBase from "./pages/KnowledgeBase";
import EnterpriseOnboarding from "./pages/EnterpriseOnboarding";
import Pricing from "./pages/Pricing";
import WatchdogLeaderboard from "./pages/WatchdogLeaderboard";
import RegulatorDashboard from "./pages/RegulatorDashboard";
import Blog from "./pages/Blog";
import Recommendations from "./pages/Recommendations";
import MarketingHome from "./pages/MarketingHome";
import Standards from "./pages/Standards";
import WatchdogPublic from "./pages/WatchdogPublic";
import PublicWatchdogHub from "./pages/PublicWatchdogHub";
import CouncilDetail from "./pages/CouncilDetail";
import Resources from "./pages/Resources";
import About from "./pages/About";
import AboutCEASAI from "./pages/AboutCEASAI";
import HowItWorks from "./pages/HowItWorks";
import CookieConsent from "./components/CookieConsent";
import FAQ from "./pages/FAQ";
import CEASAITraining from "./pages/CEASAITraining";
import NewHomeV2 from "./pages/NewHome-v2";
import HomepageMaster from "./pages/HomepageMaster";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StripeSetup from "./pages/StripeSetup";
import EnrollmentTest from "./pages/EnrollmentTest";
import PromoCodeManagement from "./pages/PromoCodeManagement";
import FoundingMembers from "./pages/FoundingMembers";
import ComplianceMonitoring from "./pages/ComplianceMonitoring";
import BulkAISystemImport from "./pages/BulkAISystemImport";
import Jobs from "./pages/Jobs";
import ReferralLandingPage from "./pages/ReferralLandingPage";
import NotificationSettings from "./pages/NotificationSettings";
import PayoutHistory from "./pages/PayoutHistory";
import MyApplications from "./pages/MyApplications";
import VerifyCertificate from "./pages/VerifyCertificate";
import PublicCertificateVerify from "./pages/PublicCertificateVerify";
import AgentCouncilFeature from "./pages/features/AgentCouncilFeature";
import PDCAFrameworkFeature from "./pages/features/PDCAFrameworkFeature";
import TrainingCertificationFeature from "./pages/features/TrainingCertificationFeature";
import WatchdogJobsFeature from "./pages/features/WatchdogJobsFeature";
import StudentProgress from "./pages/StudentProgress";
import Accreditation from "./pages/Accreditation";
import Status from "./pages/Status";
import PublicStatus from "./pages/PublicStatus";
import Security from "./pages/Security";
import Documentation from "./pages/Documentation";
import SOAIPDCAFramework from "./pages/SOAIPDCAFramework";
import PDCASimulator from "./pages/PDCASimulator";
import CertificateVerification from "./pages/CertificateVerification";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import Enterprise from "./pages/Enterprise";
import RegulatoryAuthority from "./pages/RegulatoryAuthority";
import GovernmentPortal from "./pages/GovernmentPortal";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import RegionalAnalytics from "./pages/RegionalAnalytics";
import EmailPreferences from "./pages/EmailPreferences";
import StudentEmailPreferences from "./pages/StudentEmailPreferences";
import InstructorDashboard from "./pages/InstructorDashboard";
import ABTesting from "./pages/ABTesting";
import EnterpriseIntegration from "./pages/EnterpriseIntegration";
import ISO17065 from "./pages/ISO17065";
import EUNotifiedBody from "./pages/EUNotifiedBody";
import NISTRecognition from "./pages/NISTRecognition";
import TC260Alignment from "./pages/TC260Alignment";
import APIKeyManagement from "./pages/APIKeyManagement";
import WebhookMonitoring from "./pages/WebhookMonitoring";
import GovernmentAdminDashboard from "./pages/GovernmentAdminDashboard";
import NotificationPreferences from "./pages/NotificationPreferences";
import RegionSettings from "./pages/RegionSettings";
import { DashboardIntegrated } from "./pages/DashboardIntegrated";
import { ComplianceRoadmapPage } from "./pages/ComplianceRoadmapPage";
import { AlertManagementPage } from "./pages/AlertManagementPage";
import { WebhookManagementPage } from "./pages/WebhookManagementPage";
import { AlertToastProvider } from "./components/AlertToastProvider";
import Community from "./pages/Community";
import HelpCenter from "./pages/HelpCenter";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Accessibility from "./pages/Accessibility";
import EarlyAccessLanding from "./pages/EarlyAccessLanding";
import EnterprisePlansLanding from "./pages/EnterprisePlansLanding";
import CouncilLicensingLanding from "./pages/CouncilLicensingLanding";
import UKAIBill from "./pages/UKAIBill";
import AustraliaAIGovernance from "./pages/AustraliaAIGovernance";
import CanadaAIAct from "./pages/CanadaAIAct";
import WatchdogIncidentReport from "./pages/WatchdogIncidentReport";
import DashboardHowItWorks from "./pages/DashboardHowItWorks";
import TrainingHowItWorks from "./pages/TrainingHowItWorks";
import CertificationHowItWorks from "./pages/CertificationHowItWorks";
import WatchdogHelpProtectHumanity from "./pages/WatchdogHelpProtectHumanity";
import ComplianceHowItWorks from "./pages/ComplianceHowItWorks";
import EnterpriseHowItWorks from "./pages/EnterpriseHowItWorks";
import EUAIActCompliance from "./pages/EUAIActCompliance";
import NISTAIRMFCompliance from "./pages/NISTAIRMFCompliance";
import TC260Compliance from "./pages/TC260Compliance";
import UKAIBillCompliance from "./pages/UKAIBillCompliance";
import CanadaAIActCompliance from "./pages/CanadaAIActCompliance";
import AustraliaAIGovernanceCompliance from "./pages/AustraliaAIGovernanceCompliance";
import GovernmentLinks from "./pages/GovernmentLinks";
import RegulatoryCompliance from "./pages/RegulatoryCompliance";
import GlobalAISafetyInitiative from "./pages/GlobalAISafetyInitiative";
import BlogIndex from "./pages/BlogIndex";
import GovernmentCRM from "./pages/GovernmentCRM";
import EmailAutomation from "./pages/EmailAutomation";
import EmailSchedules from "./pages/admin/EmailSchedules";
import StudentsManagement from "./pages/admin/StudentsManagement";
import CohortsManagement from "./pages/admin/CohortsManagement";
import EmailTemplateEditor from "./pages/admin/EmailTemplateEditor";
import WorkflowBuilder from "./pages/admin/WorkflowBuilder";
import WorkflowExecutionLogs from "./pages/WorkflowExecutionLogs";
import WorkflowTemplates from "./pages/WorkflowTemplates";
import WorkflowAnalytics from "./pages/WorkflowAnalytics";
import StudentImportExport from "./pages/admin/StudentImportExport";
import AnalyticsDashboardPage from "./pages/admin/AnalyticsDashboard";
import Teams from "./pages/Teams";
import ByzantineConsensus from "./pages/ByzantineConsensus";
import CompetitorComparison from "./pages/CompetitorComparison";
import EUAIActUrgency from "./pages/EUAIActUrgency";
import Charter from "./pages/Charter";
import EI3 from "./pages/EI3";
import Crosswalks from "./pages/Crosswalks";
import MCPRegistry from "./pages/MCPRegistry";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <AuthProvider>
          <AlertToastProvider>
            <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <SkipNavigation />
              <ScrollToTop />
              <Header />
              <main id="main-content" className="flex-1">
                <Switch>
                  {/* Main routes */}
                  <Route path="/" component={HomepageMaster} />
                  <Route path="/login" component={Login} />
                  <Route path="/signup" component={Signup} />
                  <Route path="/forgot-password" component={ForgotPassword} />
                  <Route path="/reset-password" component={ResetPassword} />
                  {/* <Route path="/referral" component={ReferralLandingPage} /> */}
                  <Route path="/marketing" component={MarketingHome} />
                  <Route path="/standards" component={Standards} />
                  <Route path="/resources" component={Resources} />
                  <Route path="/security" component={Security} />
                  <Route path="/docs" component={Documentation} />
                  <Route path="/global-ai-safety-initiative" component={GlobalAISafetyInitiative} />
                  <Route path="/about" component={About} />
                  <Route path="/about-ceasai" component={AboutCEASAI} />
                  <Route path="/how-it-works" component={HowItWorks} />
                  <Route path="/how-it-works/dashboard" component={DashboardHowItWorks} />
                  <Route path="/how-it-works/training" component={TrainingHowItWorks} />
                  <Route path="/how-it-works/certification" component={CertificationHowItWorks} />
                  <Route path="/how-it-works/compliance" component={ComplianceHowItWorks} />
                  <Route path="/how-it-works/enterprise" component={EnterpriseHowItWorks} />
                  <Route path="/watchdog/help-protect-humanity" component={WatchdogHelpProtectHumanity} />
                  <Route path="/compare" component={CompetitorComparison} />
                  <Route path="/eu-ai-act-urgency" component={EUAIActUrgency} />
                  <Route path="/compliance/eu-ai-act" component={EUAIActCompliance} />
                  <Route path="/compliance/nist-ai-rmf" component={NISTAIRMFCompliance} />
                  <Route path="/compliance/tc260" component={TC260Compliance} />
                  <Route path="/compliance/uk-ai-bill" component={UKAIBillCompliance} />
                  <Route path="/compliance/canada-ai-act" component={CanadaAIActCompliance} />
                  <Route path="/compliance/australia-ai-governance" component={AustraliaAIGovernanceCompliance} />
                  <Route path="/faq" component={FAQ} />
                  <Route path="/ceasai-training" component={CEASAITraining} />
                  <Route path="/old-home" component={Home} />
                  <Route path="/landing" component={Landing} />
                  <Route path="/dashboard" component={MembersDashboard} />
                  <Route path="/tabs-test" component={TabsTest} />
                  <Route path="/simple-react-tabs-test" component={SimpleReactTabsTest} />
                  <Route path="/dashboard/executive" component={DashboardIntegrated} />
                  <Route path="/dashboard/roadmap" component={ComplianceRoadmapPage} />
                  <Route path="/dashboard/alerts" component={AlertManagementPage} />
                  <Route path="/settings/webhooks" component={WebhookManagementPage} />
                  <Route path="/ai-systems" component={AISystems} />
                  <Route path="/risk-assessment" component={RiskAssessment} />
                  <Route path="/compliance" component={Compliance} />
                  <Route path="/agent-council" component={AgentCouncil} />
                  <Route path="/council-detail" component={CouncilDetail} />
                  <Route path="/byzantine-consensus" component={ByzantineConsensus} />
                  <Route path="/watchdog" component={Watchdog} />
                  <Route path="/public-watchdog" component={PublicWatchdogHub} />
                  <Route path="/reports" component={Reports} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/settings/billing" component={Billing} />
                  <Route path="/payment" component={Payment} />
                  <Route path="/payment/success" component={PaymentSuccess} />
                  <Route path="/payment/cancel" component={PaymentCancel} />
                  <Route path="/settings/notifications" component={NotificationSettings} />
                  <Route path="/settings/student-email-preferences" component={StudentEmailPreferences} />
                  <Route path="/instructor/dashboard" component={InstructorDashboard} />
                  <Route path="/ab-testing" component={ABTesting} />
                  <Route path="/settings/payouts" component={PayoutHistory} />
                  <Route path="/analytics" component={AnalyticsDashboard} />
                  <Route path="/regional-analytics" component={RegionalAnalytics} />
                  <Route path="/email-preferences" component={EmailPreferences} />
                  <Route path="/watchdog-signup" component={WatchdogSignup} />
      <Route path="/watchdog/report" component={PublicWatchdogHub} />
                  <Route path="/watchdog-hub" component={PublicWatchdogHub} />
                  <Route path="/training" component={TrainingV2} />
                  <Route path="/courses" component={Courses} />
                  <Route path="/my-courses" component={MyCourses} />
                  <Route path="/progress" component={ProgressDashboard} />
                  <Route path="/leaderboard" component={Leaderboard} />
                  <Route path="/teams" component={Teams} />
                  <Route path="/paid-courses" component={PaidCourses} />
                  {/* Redirect old training routes to new unified route */}
                  <Route path="/dashboard/training"><Redirect to="/training" /></Route>
                  <Route path="/training-catalog"><Redirect to="/courses" /></Route>
                  <Route path="/training-courses"><Redirect to="/courses" /></Route>
                  <Route path="/training-courses/:id"><Redirect to="/courses/:id" /></Route>
                  <Route path="/training-courses/:id/learn"><Redirect to="/courses/:id/learn" /></Route>
                  <Route path="/my-training-courses"><Redirect to="/my-courses" /></Route>
                  <Route path="/dashboard/progress"><Redirect to="/progress" /></Route>
                  <Route path="/home"><Redirect to="/" /></Route>
                  <Route path="/apply"><Redirect to="/jobs" /></Route>
                  <Route path="/report"><Redirect to="/watchdog/report" /></Route>
                  <Route path="/pdca-cycles"><Redirect to="/pdca" /></Route>
                  <Route path="/public-dashboard"><Redirect to="/dashboard" /></Route>
                  <Route path="/training/catalog"><Redirect to="/courses" /></Route>
                  <Route path="/regulatory/roadmap"><Redirect to="/dashboard/roadmap" /></Route>
                  <Route path="/courses/:id" component={CourseDetail} />
                  <Route path="/courses/:id/learn" component={CoursePlayer} />
                  <Route path="/paid-courses-dashboard" component={PaidCoursesDashboard} />
                  <Route path="/founding-members" component={FoundingMembers} />
                  <Route path="/checkout" component={Checkout} />
                  <Route path="/bundle-checkout/:bundleId" component={BundleCheckout} />
                  <Route path="/forum-analytics" component={ForumAnalytics} />
                  <Route path="/verify-certificate/:id" component={VerifyCertificate} />
                  <Route path="/verify/:certificateNumber" component={VerifyCertificate} />
                  <Route path="/features/33-agent-council" component={AgentCouncilFeature} />
                  <Route path="/features/pdca-framework" component={PDCAFrameworkFeature} />
                  <Route path="/features/training-certification" component={TrainingCertificationFeature} />
                  <Route path="/features/watchdog-jobs" component={WatchdogJobsFeature} />
                  <Route path="/certification" component={CertificationV2} />
                  <Route path="/exam" component={CertificationExam} />
                  <Route path="/certification/exam" component={CertificationExam} />
                  <Route path="/exam/debug" component={ExamDebug} />
                  <Route path="/certification/results" component={CertificationResults} />
                  <Route path="/certificates" component={MyCertificates} />
                  <Route path="/certification/review" component={ExamReview} />
                  <Route path="/admin/exam-analytics" component={ExamAnalytics} />
                  <Route path="/workbench" component={Workbench} />
                  <Route path="/jobs" component={Jobs} />
                  <Route path="/careers">
                    <Redirect to="/jobs" />
                  </Route>
                  <Route path="/my-applications" component={MyApplications} />
                  <Route path="/public" component={PublicHome} />
                  <Route path="/admin" component={Admin} />
                  <Route path="/admin/cms" component={AdminCMS} />
                  <Route path="/admin/cms/courses/:id" component={CourseManagement} />
                  <Route path="/admin/certificate-designer" component={CertificateDesigner} />
                  <Route path="/admin/incidents" component={AdminIncidents} />
                  <Route path="/admin/analytics" component={AdminAnalytics} />
                  <Route path="/admin/student-analytics" component={StudentAnalytics} />
                  <Route path="/admin/cohort-analysis" component={CohortAnalysis} />
                  <Route path="/admin/predictive-analytics" component={PredictiveAnalytics} />
                  <Route path="/admin/email-schedules" component={EmailSchedules} />
                  <Route path="/admin/students" component={StudentsManagement} />
                  <Route path="/admin/cohorts" component={CohortsManagement} />
                  <Route path="/admin/email-templates" component={EmailTemplateEditor} />
                  <Route path="/admin/workflow-builder" component={WorkflowBuilder} />
                  <Route path="/admin/workflow-logs" component={WorkflowExecutionLogs} />
                  <Route path="/admin/workflow-analytics" component={WorkflowAnalytics} />
                  <Route path="/admin/workflow-templates" component={WorkflowTemplates} />
                  <Route path="/admin/import-export" component={StudentImportExport} />
                  <Route path="/admin/analytics-dashboard" component={AnalyticsDashboardPage} />
                  <Route path="/admin/stripe-setup" component={StripeSetup} />
                  <Route path="/admin/promo-codes" component={PromoCodeManagement} />
                  <Route path="/admin/enrollment-test" component={EnrollmentTest} />
                  <Route path="/api-docs" component={ApiDocs} />
                  <Route path="/api-keys" component={ApiKeys} />
                  <Route path="/pdca" component={PDCACycles} />
                  <Route path="/transparency" component={PublicDashboard} />
                  <Route path="/scorecard/:systemId" component={ComplianceScorecard} />
                  <Route path="/knowledge-base" component={KnowledgeBase} />
                  <Route path="/enterprise-onboarding" component={EnterpriseOnboarding} />
                  <Route path="/pricing" component={Pricing} />
             <Route path="/watchdog-leaderboard" component={WatchdogLeaderboard} />
      <Route path="/public-watchdog" component={WatchdogPublic} />               <Route path="/regulator" component={RegulatorDashboard} />
                  <Route path="/blog" component={Blog} />
                  <Route path="/recommendations" component={Recommendations} />
                  <Route path="/accreditation" component={Accreditation} />
                  <Route path="/status" component={PublicStatus} />
                  <Route path="/system-status" component={Status} />
                  <Route path="/soai-pdca" component={SOAIPDCAFramework} />
                  <Route path="/soai-pdca/government" component={GovernmentPortal} />
                  <Route path="/pdca-simulator" component={PDCASimulator} />
                  <Route path="/verify-certificate" component={PublicCertificateVerify} />
                  <Route path="/certificate-verification" component={CertificateVerification} />
                  <Route path="/enterprise" component={Enterprise} />
                  <Route path="/enterprise-dashboard" component={EnterpriseDashboard} />
                  <Route path="/compliance-monitoring" component={ComplianceMonitoring} />
                  <Route path="/bulk-import" component={BulkAISystemImport} />
                  <Route path="/regulatory-authority" component={RegulatoryAuthority} />
                  <Route path="/regulatory/iso-17065" component={ISO17065} />
                  <Route path="/regulatory/eu-notified-body" component={EUNotifiedBody} />
                  <Route path="/regulatory/nist-recognition" component={NISTRecognition} />
                  <Route path="/regulatory/tc260-alignment" component={TC260Alignment} />
                  <Route path="/government-portal" component={GovernmentPortal} />
                  <Route path="/enterprise-integration" component={EnterpriseIntegration} />
                  <Route path="/admin/api-keys" component={APIKeyManagement} />
                  <Route path="/admin/webhooks" component={WebhookMonitoring} />
                  <Route path="/admin/government" component={GovernmentAdminDashboard} />
                  <Route path="/notification-preferences" component={NotificationPreferences} />
                  <Route path="/region-settings" component={RegionSettings} />
                  <Route path="/community" component={Community} />
                  <Route path="/help-center" component={HelpCenter} />
                  <Route path="/help" component={HelpCenter} />
                  <Route path="/contact" component={Contact} />
                  <Route path="/privacy" component={PrivacyPolicy} />
                  <Route path="/terms" component={TermsOfService} />
                  <Route path="/cookies" component={CookiePolicy} />
                  <Route path="/accessibility" component={Accessibility} />
                  <Route path="/early-access" component={EarlyAccessLanding} />
                  <Route path="/enterprise-plans" component={EnterprisePlansLanding} />
                  <Route path="/council-licensing" component={CouncilLicensingLanding} />
                  {/* Charter / EI3 / Crosswalks (MEOK ONE substrate) */}
                  <Route path="/charter" component={Charter} />
                  <Route path="/ei3" component={EI3} />
                  <Route path="/crosswalks" component={Crosswalks} />
                  <Route path="/mcp" component={MCPRegistry} />
                  <Route path="/mcps" component={MCPRegistry} />
                  <Route path="/tools" component={MCPRegistry} />
                  {/* Framework Landing Pages */}
                  <Route path="/frameworks/uk-ai-bill" component={UKAIBill} />
                  <Route path="/frameworks/australia-ai" component={AustraliaAIGovernance} />
                  <Route path="/frameworks/canada-ai-act" component={CanadaAIAct} />
                  {/* Watchdog Incident Reporting */}
                  <Route path="/watchdog/incident" component={WatchdogIncidentReport} />
                  {/* Blog and CRM Pages */}
                  <Route path="/blog" component={BlogIndex} />
                  <Route path="/admin/government-crm" component={GovernmentCRM} />
                  <Route path="/admin/email-automation" component={EmailAutomation} />
                  {/* Government & Regulatory Pages */}
                  <Route path="/government-links" component={GovernmentLinks} />
                  <Route path="/regulatory-compliance" component={RegulatoryCompliance} />
                  {/* Redirect routes for common paths */}
                  <Route path="/billing">{() => <Redirect to="/settings/billing" />}</Route>
                  <Route path="/support" component={Support} />
                  <Route path="/council">{() => <Redirect to="/agent-council" />}</Route>
                  <Route path="/loi">{() => <Redirect to="/enterprise" />}</Route>
                  <Route path="/get-started">{() => <Redirect to="/signup" />}</Route>
                  <Route path="/signin">{() => <Redirect to="/login" />}</Route>
                  <Route path="/sign-in">{() => <Redirect to="/login" />}</Route>
                  <Route path="/sign-up">{() => <Redirect to="/signup" />}</Route>
                  <Route path="/register">{() => <Redirect to="/signup" />}</Route>
                  <Route path="/404" component={NotFound} />
                  {/* Final fallback route */}
                  <Route component={NotFound} />
                </Switch>
              </main>
              <Footer />
            </div>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                },
              }}
            />
            <CookieConsent />
            </TooltipProvider>
          </AlertToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
