/*
 * Unified Footer Component
 * Professional footer with CSOAI branding and comprehensive links
 */

import { Link } from 'wouter';
import { Twitter, Linkedin, Mail, CheckCircle, Cookie, Facebook } from 'lucide-react';
import { NewsletterSignup } from './NewsletterSignup';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Training Courses', href: '/training' },
        { name: 'Certification', href: '/certification' },
        { name: 'Watchdog Reports', href: '/watchdog' },
        { name: 'Analyst Workbench', href: '/workbench' },
        { name: 'API Documentation', href: '/api-docs' },
        { name: 'Dashboard', href: '/dashboard' },
      ],
    },
    {
      title: 'Frameworks',
      links: [
        { name: 'SOAI-PDCA Framework', href: '/soai-pdca' },
        { name: 'CSOAI Standards', href: '/standards' },
        { name: 'Accreditation', href: '/accreditation' },
        { name: 'EU AI Act', href: '/standards' },
        { name: 'NIST AI RMF', href: '/standards' },
        { name: 'China TC260', href: '/standards' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Our Mission', href: '/about' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/knowledge-base' },
        { name: 'Help Center', href: '/help-center' },
        { name: 'System Status', href: '/status' },
        { name: 'Community', href: '/community' },
        { name: 'FAQ', href: '/faq' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'API Keys', href: '/api-keys' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61586108877167' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/CsoaiLimited' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/company/110448367' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@csoai.org' },
  ];

  const certifications = [
    { name: 'ISO/IEC 27001:2022', icon: '🔒' },
    { name: 'SOC 2 Type II', icon: '✓' },
    { name: 'GDPR Compliant', icon: '✓' },
    { name: 'WCAG 2.1 AA', icon: '♿' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
              <img
                src="/csoai-icon.svg.png"
                alt="CSOAI"
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold">CSOAI</span>
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              Building the future of AI safety through independent training, certification, and transparent oversight.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-600 hover:text-green-600 text-sm transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup Section */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="max-w-md">
            <NewsletterSignup source="footer" variant="inline" />
          </div>
        </div>

        {/* Certifications & Compliance Section */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Certifications & Compliance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {certifications.map((cert) => (
              <div key={cert.name} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-600">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center mb-8">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © {currentYear} CSOAI. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
              Cookie Policy
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('csoai_cookie_consent');
                window.location.reload();
              }}
              className="text-gray-600 hover:text-green-600 text-sm transition-colors flex items-center gap-1.5"
            >
              <Cookie className="h-3.5 w-3.5" />
              Cookie Settings
            </button>
            <Link href="/accessibility" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
              Accessibility
            </Link>
          </div>
        </div>

        {/* Legal & Independence Statement */}
        <div className="border-t border-gray-200 pt-8 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              CSOAI Legal Structure
            </h4>
            <p className="text-gray-600 text-xs">
              This platform is operated by CSOAI LTD (Council Safety of Artificial Intelligence LTD), Company Number: 16939677, registered at 86-90 Paul Street, London, EC2A 4NE, United Kingdom. CSOAI standards and frameworks are maintained as an independent Standards Body. We are dedicated to advancing AI safety through independent training, certification, and transparent oversight. We maintain strict independence from all commercial AI vendors and technology companies. Our mission is to serve the public interest by developing and promoting best practices in AI safety and compliance.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              CEASAI Certification Standards
            </h4>
            <p className="text-gray-600 text-xs">
              CEASAI (Certified Expert in AI Safety) is our professional certification program administered by CSOAI. CEASAI certification represents demonstrated competency in AI safety principles, compliance frameworks, and incident analysis. Certificates are valid for three years from issuance. CSOAI reserves the right to update certification requirements and may require recertification to maintain active status.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              Independence Statement
            </h4>
            <p className="text-gray-600 text-xs">
              CSOAI is an independent organization with no financial ties to OpenAI, Anthropic, Google, Microsoft, Meta, or any AI vendor. Our only incentive is public safety and workforce development. We do not endorse, promote, or receive compensation for any commercial AI products or services.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              Data & Privacy
            </h4>
            <p className="text-gray-600 text-xs">
              Your data is protected under industry-standard security practices including encryption, secure authentication, and regular security audits. We comply with GDPR, CCPA, UK Data Protection Act 2018, and other privacy regulations. We never sell your personal information to third parties. For detailed information, please review our Privacy Policy, Cookie Policy, and Data Processing Agreement.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
