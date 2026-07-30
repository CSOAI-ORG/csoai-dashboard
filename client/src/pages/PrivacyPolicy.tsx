import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy - CSOAI';
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: December 28, 2024
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <motion.div {...fadeInUp} className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                CSOAI ("we," "our," or "us") platform and services are operated by CEASAI Limited (Company Number: [PENDING]), a UK-registered company committed to protecting your privacy. CSOAI standards and frameworks are maintained as an independent Standards Body. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including our CEASAI certification program, training courses, and Watchdog incident reporting platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="text-gray-600 mb-4">We may collect information about you in a variety of ways:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li><strong>Personal Data:</strong> Name, email address, phone number, date of birth, and other contact information you provide when registering or using our services.</li>
                <li><strong>Account Information:</strong> Information related to your account, including credentials, preferences, usage history, and communication preferences.</li>
                <li><strong>Certification Data:</strong> Information about your training progress, exam results, certification status, and professional credentials.</li>
                <li><strong>Watchdog Reports:</strong> Information submitted through incident reports, including descriptions, supporting evidence, and metadata about reported AI systems.</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely through third-party providers), and transaction history.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, operating system, device identifiers, and usage analytics.</li>
                <li><strong>Communication Data:</strong> Records of your communications with CSOAI support, including emails and chat logs.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Legal Basis for Processing</h2>
              <p className="text-gray-600 mb-4">
                Under GDPR and other data protection laws, we process your personal data based on the following legal bases:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li><strong>Contract Performance:</strong> Processing necessary to provide training, certification, and platform services you've requested.</li>
                <li><strong>Legal Obligation:</strong> Compliance with regulatory requirements, tax obligations, and law enforcement requests.</li>
                <li><strong>Legitimate Interests:</strong> Improving our services, preventing fraud, and maintaining platform security.</li>
                <li><strong>Consent:</strong> Marketing communications and optional analytics (with your explicit consent).</li>
                <li><strong>Public Interest:</strong> Advancing AI safety through transparent incident reporting and standards development.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">We use the information we collect for various purposes:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>To provide, maintain, and improve our services</li>
                <li>To process your account registration and authentication</li>
                <li>To deliver training courses and certification exams (including CEASAI certification)</li>
                <li>To process and analyze Watchdog incident reports for AI safety improvements</li>
                <li>To send administrative and transactional communications</li>
                <li>To send promotional communications (only with your consent)</li>
                <li>To analyze usage patterns and improve user experience</li>
                <li>To comply with legal obligations and enforce our terms</li>
                <li>To prevent fraud, abuse, and security incidents</li>
                <li>To conduct research on AI safety and compliance trends</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-600 mb-4">
                We do not sell your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li><strong>Service Providers:</strong> Third parties who assist us in operating our website and providing services (e.g., payment processors, email providers, hosting providers). These providers are contractually bound to protect your data.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request to protect our rights and safety.</li>
                <li><strong>Public Watchdog Reports:</strong> Incident reports may be made public to promote transparency in AI safety (unless marked confidential by the reporter).</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred as part of that transaction.</li>
                <li><strong>Regulatory Authorities:</strong> We may disclose information to regulatory bodies, law enforcement, or government agencies as required by law.</li>
                <li><strong>CEASAI Verification:</strong> Employers or educational institutions may verify your CEASAI certification status with your consent.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. International Data Transfers</h2>
              <p className="text-gray-600 mb-4">
                CSOAI is based in the United Kingdom and operates in compliance with UK GDPR and international data protection standards. If you are located outside the UK, your personal data may be transferred to, stored in, and processed in the UK or other countries where we operate. By using our services, you consent to such transfers. We implement appropriate safeguards, including Standard Contractual Clauses, to protect your data during international transfers.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Secure authentication mechanisms including multi-factor authentication</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls limiting data access to authorized personnel only</li>
                <li>ISO 27001 certification for information security management</li>
                <li>Regular backup and disaster recovery procedures</li>
              </ul>
              <p className="text-gray-600 mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-600 mb-4">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Specific retention periods include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li><strong>Account Data:</strong> Retained for the duration of your account and 3 years after deletion for legal compliance</li>
                <li><strong>CEASAI Certification Records:</strong> Retained for 7 years to support credential verification and regulatory compliance</li>
                <li><strong>Watchdog Reports:</strong> Retained indefinitely to maintain transparency and support ongoing AI safety research</li>
                <li><strong>Transaction Records:</strong> Retained for 7 years for tax and financial compliance</li>
                <li><strong>Marketing Data:</strong> Retained until you unsubscribe or withdraw consent</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Your Privacy Rights</h2>
              <p className="text-gray-600 mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li><strong>Access:</strong> The right to access your personal information and receive a copy of the data we hold about you</li>
                <li><strong>Correction:</strong> The right to correct inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> The right to request deletion of your information (subject to legal retention requirements)</li>
                <li><strong>Portability:</strong> The right to receive your data in a portable, machine-readable format</li>
                <li><strong>Opt-out:</strong> The right to opt out of marketing communications and non-essential processing</li>
                <li><strong>Restriction:</strong> The right to restrict processing of your data in certain circumstances</li>
                <li><strong>Objection:</strong> The right to object to processing based on legitimate interests</li>
              </ul>
              <p className="text-gray-600 mt-4">
                To exercise these rights, please contact us at privacy@csoai.org. We will respond to your request within 30 days (or as required by applicable law).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website. Cookies help us remember your preferences, understand how you use our services, and improve functionality. You can control cookie settings through your browser preferences. For more information, please see our Cookie Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Children's Privacy</h2>
              <p className="text-gray-600 mb-4">
                Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it immediately. Parents or guardians who believe their child's information has been collected should contact us at privacy@csoai.org.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Third-Party Links</h2>
              <p className="text-gray-600 mb-4">
                Our website may contain links to third-party websites and services. This Privacy Policy applies only to CSOAI services. We are not responsible for the privacy practices of third-party sites. We encourage you to review the privacy policies of any third-party services before providing your information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to This Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any significant changes by posting the updated policy on our website, updating the "Last updated" date, and sending you an email notification. Your continued use of our services after such changes constitutes your acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Data Protection Officer</h2>
              <p className="text-gray-600 mb-4">
                CSOAI has appointed a Data Protection Officer (DPO) to oversee our privacy practices and ensure compliance with data protection laws. You can contact our DPO at dpo@csoai.org.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> privacy@csoai.org<br />
                <strong>Data Protection Officer:</strong> dpo@csoai.org<br />
                <strong>Address:</strong> CSOAI, United Kingdom<br />
                <strong>Website:</strong> www.csoai.org
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Regulatory Complaints</h2>
              <p className="text-gray-600 mb-4">
                If you believe we have violated your privacy rights, you have the right to lodge a complaint with your local data protection authority. In the UK, this is the Information Commissioner's Office (ICO). You can file a complaint at www.ico.org.uk.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
